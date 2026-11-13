import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import mammoth from 'mammoth';
import { db } from '../db/store.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { BatchIntakeItem } from '../types/index.js';
import { putResume, getResume, signedResumeUrl, s3Configured } from '../services/s3.js';
import { parseResume, ParsedResume } from '../services/ai.js';

const HARD_MAX_MB = 25;
const MAX_FILES = 25;
const TYPES: Record<string, { mime: string; looksValid: (b: Buffer) => boolean }> = {
  '.pdf': { mime: 'application/pdf', looksValid: b => b.subarray(0, 5).toString('latin1') === '%PDF-' },
  '.docx': {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    looksValid: b => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04
  },
  '.txt': { mime: 'text/plain', looksValid: b => !b.subarray(0, 4096).includes(0) }
};

const upload = multer({
  storage: multer.memoryStorage(), // files go straight to S3, never to local disk
  limits: { fileSize: HARD_MAX_MB * 1024 * 1024, files: MAX_FILES }
});

const router = Router();

const isPartner = (req: AuthenticatedRequest) => !!req.user?.role.startsWith('partner');

function canAccess(req: AuthenticatedRequest, item: BatchIntakeItem) {
  return !isPartner(req) || item.organizationId === req.user?.organizationId;
}

const fmtSize = (bytes: number) => {
  const kb = Math.round(bytes / 1024);
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
};

const digits = (s: string) => s.replace(/\D/g, '').slice(-10);

/** Duplicate signals: same email, or same last-10 phone digits. Flags only — never merges or overwrites (FR-02). */
function findDuplicate(parsed: ParsedResume, selfId: string) {
  const email = parsed.email;
  const phone = digits(parsed.phone);
  const hit = (e?: string, p?: string) =>
    (!!email && e?.toLowerCase() === email) || (phone.length >= 10 && !!p && digits(p) === phone);

  const cand = db.getCandidates().find(c => hit(c.email, c.phone));
  if (cand) return { isDuplicate: true, duplicateOfCandidateId: cand.id };
  const prior = db.getBatchItems().find(b => {
    if (b.id === selfId || b.status === 'failed') return false;
    const p = b.parsedData as ParsedResume | undefined;
    return !!p && hit(p.email, p.phone);
  });
  return { isDuplicate: !!prior, duplicateOfCandidateId: undefined };
}

async function extractAndParse(buffer: Buffer, ext: string) {
  if (ext === '.pdf') return parseResume({ pdf: buffer });
  const text = ext === '.docx' ? (await mammoth.extractRawText({ buffer })).value : buffer.toString('utf-8');
  if (!text.trim()) throw new Error('No readable text found in document.');
  return parseResume({ text });
}

/** Parse one stored item and record the outcome. Failures become a recoverable 'failed' status. */
async function processItem(item: BatchIntakeItem, buffer: Buffer) {
  db.updateBatchItem(item.id, { status: 'parsing', error: undefined });
  try {
    const { data, meta } = await extractAndParse(buffer, path.extname(item.fileName).toLowerCase());
    const dup = findDuplicate(data, item.id);
    return db.updateBatchItem(item.id, {
      status: dup.isDuplicate ? 'duplicate_check' : 'review_needed',
      candidateName: data.fullName || undefined,
      confidenceScore: data.parseConfidence ?? undefined,
      parsedData: data,
      parseMeta: meta,
      ...dup
    })!;
  } catch (err: any) {
    console.error(`[Batch] parse failed item=${item.id}:`, err.message);
    return db.updateBatchItem(item.id, { status: 'failed', error: 'Parsing failed. You can retry this file.' })!;
  }
}

/** Run tasks with limited concurrency. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

// GET /api/batches — partners see only their own organization's items
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const items = db.getBatchItems().filter(i => canAccess(req, i));
  return res.json({ success: true, count: items.length, data: items });
});

// POST /api/batches/upload
router.post(
  '/upload',
  requireRole(['platform_admin', 'recruiter', 'partner_admin', 'partner_staff']),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (isPartner(req)) {
      const org = db.getOrganizationById(req.user!.organizationId || '');
      if (!org || !org.candidateIntakeEnabled) {
        return res.status(403).json({ error: 'Candidate intake is disabled or pending verification for your institution.' });
      }
    }
    if (!s3Configured()) {
      return res.status(503).json({ error: 'Resume storage is not configured (S3_BUCKET).' });
    }
    upload.array('files', MAX_FILES)(req, res, err => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req: AuthenticatedRequest, res: Response) => {
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const settings = db.getSettings();
    const maxBytes = Math.min(settings.resumeMaxFileSizeMB, HARD_MAX_MB) * 1024 * 1024;
    const allowed = new Set(settings.supportedResumeFormats.map(f => `.${f.toLowerCase()}`));
    const orgId = isPartner(req) ? req.user!.organizationId : (req.body.organizationId || undefined);
    const now = new Date().toISOString();

    const results = await mapLimit(files, 4, async file => {
      const ext = path.extname(file.originalname).toLowerCase();
      const item: BatchIntakeItem = {
        id: `batch-${crypto.randomUUID()}`,
        fileName: file.originalname,
        fileSize: fmtSize(file.size),
        status: 'validating',
        organizationId: orgId,
        uploadedBy: req.user!.id,
        createdAt: now
      };

      // Per-file validation: a bad file is rejected without failing the batch.
      const type = TYPES[ext];
      const reject = !type || !allowed.has(ext) ? `Unsupported file type ${ext || '(none)'}.`
        : file.size > maxBytes ? `File exceeds ${settings.resumeMaxFileSizeMB} MB limit.`
        : !type.looksValid(file.buffer) ? 'File content does not match its extension.'
        : null;
      if (reject) {
        db.createBatchItems([{ ...item, status: 'failed', error: reject }]);
        return db.getBatchItems().find(b => b.id === item.id)!;
      }

      item.s3Key = `resumes/${orgId || 'platform'}/${item.id}${ext}`;
      item.contentType = type.mime;
      try {
        await putResume(item.s3Key, file.buffer, type.mime);
      } catch (err: any) {
        console.error(`[Batch] S3 upload failed item=${item.id}:`, err.message);
        db.createBatchItems([{ ...item, s3Key: undefined, status: 'failed', error: 'Storage upload failed. Please re-upload.' }]);
        return db.getBatchItems().find(b => b.id === item.id)!;
      }
      db.createBatchItems([item]);
      // ponytail: parsed inline (4 at a time) so the response carries final statuses; move to a job queue if batches outgrow request timeouts.
      return processItem(item, file.buffer);
    });

    const failed = results.filter(r => r.status === 'failed').length;
    db.logAudit({
      id: `audit-${crypto.randomUUID()}`,
      timestamp: now,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'RESUME_BATCH_UPLOADED',
      entity: 'BatchIntake',
      entityId: results[0]?.id || 'batch-upload',
      organizationName: req.user!.organizationName,
      details: `Uploaded ${files.length} resume(s): ${files.length - failed} processed, ${failed} failed.`,
      correlationId: `corr-${crypto.randomUUID()}`
    });

    return res.status(201).json({
      success: true,
      count: results.length,
      data: results,
      message: `${files.length - failed} of ${files.length} resume(s) processed.`
    });
  }
);

// POST /api/batches/:id/retry — re-parse from the stored S3 object; never creates a new record
router.post('/:id/retry', requireRole(['platform_admin', 'recruiter', 'partner_admin', 'partner_staff']), async (req: AuthenticatedRequest, res: Response) => {
  const item = db.getBatchItems().find(b => b.id === req.params.id);
  if (!item || !canAccess(req, item)) {
    return res.status(404).json({ error: 'Batch item not found' });
  }
  if (!item.s3Key) {
    return res.status(409).json({ error: 'This file was never stored. Please upload it again.' });
  }
  try {
    const buffer = await getResume(item.s3Key);
    return res.json({ success: true, data: await processItem(item, buffer) });
  } catch (err: any) {
    console.error(`[Batch] retry fetch failed item=${item.id}:`, err.message);
    return res.status(502).json({ error: 'Could not read the stored file. Please retry later.' });
  }
});

// GET /api/batches/:id/download — 5-minute signed S3 link
router.get('/:id/download', async (req: AuthenticatedRequest, res: Response) => {
  const item = db.getBatchItems().find(b => b.id === req.params.id);
  if (!item || !canAccess(req, item) || !item.s3Key) {
    return res.status(404).json({ error: 'File not found' });
  }
  return res.json({ success: true, url: await signedResumeUrl(item.s3Key, item.fileName) });
});

export default router;
