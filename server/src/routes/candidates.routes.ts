import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Candidate } from '../types/index.js';

const router = Router();

// GET /api/candidates
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { search, partnerId, status, skill } = req.query;

  // PRD Section 2: Partner-scoped users can only access their own attributed candidates
  let partnerFilter: string | undefined = undefined;
  if (req.user && (req.user.role === 'partner_admin' || req.user.role === 'partner_staff')) {
    partnerFilter = req.user.organizationId;
  } else if (partnerId && typeof partnerId === 'string') {
    partnerFilter = partnerId;
  }

  let candidates = db.getCandidates(partnerFilter);

  if (status && typeof status === 'string') {
    candidates = candidates.filter(c => c.status === status);
  }

  if (skill && typeof skill === 'string') {
    const s = skill.toLowerCase();
    candidates = candidates.filter(c => c.skills.some(sk => sk.toLowerCase().includes(s)));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    candidates = candidates.filter(c => 
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.targetRole.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  return res.json({ success: true, count: candidates.length, data: candidates });
});

// GET /api/candidates/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const candidate = db.getCandidateById(id);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found' });
  }

  // Scoping check
  if (req.user && (req.user.role === 'partner_admin' || req.user.role === 'partner_staff')) {
    if (candidate.partnerId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied to this candidate profile' });
    }
  }

  return res.json({ success: true, data: candidate });
});

// POST /api/candidates
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const candData = req.body as Partial<Candidate>;

  if (!candData.fullName || !candData.email || !candData.email.includes('@')) {
    return res.status(400).json({ error: 'Valid full name and email are required' });
  }

  // Sanitize candidate name against XSS
  candData.fullName = candData.fullName.replace(/<[^>]*>?/gm, '').trim();
  candData.email = candData.email.trim().toLowerCase();

  // Deduplication check: verify email uniqueness in talent pool
  const existingCand = db.getCandidates().find(
    c => c.email.toLowerCase() === candData.email!.toLowerCase()
  );
  if (existingCand) {
    return res.status(409).json({ 
      error: `A candidate with email '${candData.email}' already exists in the talent pool (Candidate ID: ${existingCand.id}).` 
    });
  }

  // If partner user is submitting, enforce their organization
  const partnerId = req.user && req.user.role.startsWith('partner')
    ? (req.user.organizationId || 'org-1')
    : (candData.partnerId || 'org-1');

  const partnerName = req.user?.organizationName || db.getOrganizationById(partnerId)?.displayName || 'Partner Academy';

  // Check if candidate intake is enabled for this organization
  const org = db.getOrganizationById(partnerId);
  if (org && !org.candidateIntakeEnabled) {
    return res.status(403).json({ error: 'Candidate intake is currently disabled for this partner organization.' });
  }

  const newCand: Candidate = {
    id: `cand-${Date.now()}`,
    fullName: candData.fullName,
    email: candData.email,
    phone: candData.phone || '',
    location: candData.location || 'Remote, USA',
    targetRole: candData.targetRole || 'Software Engineer',
    partnerId,
    partnerName,
    status: 'draft',
    consentState: candData.consentState || 'verified',
    consentTimestamp: new Date().toISOString(),
    consentPolicyVersion: 'v2.1-2026',
    skills: candData.skills || [],
    experienceYears: candData.experienceYears || 0,
    education: candData.education || '',
    resumeFileName: candData.resumeFileName || 'resume.pdf',
    submittedAt: new Date().toISOString(),
    parsedProfile: candData.parsedProfile,
    activityHistory: [
      {
        date: new Date().toISOString(),
        action: 'PROFILE_CREATED',
        actor: req.user?.email || 'system'
      }
    ]
  };

  db.createCandidate(newCand);

  // Log audit
  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'staff',
    actorRole: req.user?.role || 'partner_staff',
    action: 'CANDIDATE_CREATED',
    entity: 'Candidate',
    entityId: newCand.id,
    organizationName: partnerName,
    details: `Candidate record created for ${newCand.fullName} attributed to ${partnerName}. Consent verified: ${newCand.consentState}.`,
    correlationId: `corr-${Date.now()}`
  });

  return res.status(201).json({ success: true, data: newCand });
});

// PUT /api/candidates/:id (Correct parsed fields or update profile)
router.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const candidate = db.getCandidateById(id);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found' });
  }

  // Scoping check
  if (req.user && (req.user.role === 'partner_admin' || req.user.role === 'partner_staff')) {
    if (candidate.partnerId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied to update this candidate' });
    }
  }

  const beforeSummary = `${candidate.fullName} (${candidate.targetRole})`;
  const updatedCandidate = db.updateCandidate(candidate.id, req.body);

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'staff',
    actorRole: req.user?.role || 'recruiter',
    action: 'CANDIDATE_PROFILE_CORRECTED',
    entity: 'Candidate',
    entityId: candidate.id,
    organizationName: candidate.partnerName,
    details: `Candidate profile fields updated by ${req.user?.email || 'operator'}`,
    beforeValue: beforeSummary,
    afterValue: `${updatedCandidate?.fullName} (${updatedCandidate?.targetRole})`,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedCandidate });
});

// POST /api/candidates/:id/consent
router.post('/:id/consent', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { consentState, reason } = req.body;
  const candidate = db.getCandidateById(id);

  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found' });
  }

  // Tenant Scoping Guard
  if (req.user && (req.user.role === 'partner_admin' || req.user.role === 'partner_staff')) {
    if (candidate.partnerId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Tenant violation: You can only manage consent for candidates belonging to your institution.' });
    }
  }

  const updatedCandidate = db.updateCandidate(candidate.id, {
    consentState,
    consentTimestamp: new Date().toISOString()
  });

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'staff',
    actorRole: req.user?.role || 'recruiter',
    action: `CONSENT_${consentState.toUpperCase()}`,
    entity: 'Candidate',
    entityId: candidate.id,
    organizationName: candidate.partnerName,
    details: `Candidate consent state changed to ${consentState}. Reason: ${reason || 'User verified'}`,
    beforeValue: candidate.consentState,
    afterValue: consentState,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedCandidate });
});

export default router;
