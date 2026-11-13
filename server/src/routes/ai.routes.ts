import { Router, Response } from 'express';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { db } from '../db/store.js';
import { parseResume, matchCandidate, ruleBasedMatch, AiUnavailableError } from '../services/ai.js';

const router = Router();

// POST /api/ai/parse-resume — parse pasted resume text. Output is a draft for human review (FR-03).
router.post('/parse-resume', async (req: AuthenticatedRequest, res: Response) => {
  const { resumeText } = req.body;

  if (!resumeText || typeof resumeText !== 'string') {
    return res.status(400).json({ error: 'resumeText is required.' });
  }
  if (resumeText.length > 250_000) {
    return res.status(413).json({ error: 'resumeText exceeds the 250,000 character limit.' });
  }

  try {
    const { data, meta } = await parseResume({ text: resumeText });
    return res.json({ success: true, provider: `${meta.provider}:${meta.model}`, meta, data });
  } catch (err: any) {
    const status = err instanceof AiUnavailableError ? 503 : 502;
    return res.status(status).json({ error: 'Resume parsing is temporarily unavailable. Please retry.', detail: err.message });
  }
});

// POST /api/ai/match — advisory only; never an automated decision (FR-05).
router.post('/match', requireRole(['platform_admin', 'recruiter']), async (req: AuthenticatedRequest, res: Response) => {
  const { candidateId, jobId } = req.body;

  if (!candidateId || !jobId) {
    return res.status(400).json({ error: 'candidateId and jobId are required.' });
  }

  const candidate = db.getCandidateById(candidateId);
  const job = db.getJobById(jobId);
  if (!candidate || !job) {
    return res.status(404).json({ error: 'Candidate or Job not found.' });
  }

  try {
    const { data, meta } = await matchCandidate(candidate, job);
    return res.json({ success: true, provider: `${meta.provider}:${meta.model}`, meta, data });
  } catch (err: any) {
    console.warn('[AI] match fell back to rule-based:', err.message);
    return res.json({ success: true, provider: 'rule-based', meta: { provider: 'rule-based' }, data: ruleBasedMatch(candidate, job) });
  }
});

export default router;
