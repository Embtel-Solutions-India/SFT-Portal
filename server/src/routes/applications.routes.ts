import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Application, ApplicationStage } from '../types/index.js';

const router = Router();

// GET /api/applications
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { stage, jobId, candidateId, partnerId } = req.query;

  let partnerFilter: string | undefined = undefined;
  if (req.user && (req.user.role === 'partner_admin' || req.user.role === 'partner_staff')) {
    partnerFilter = req.user.organizationId;
  } else if (partnerId && typeof partnerId === 'string') {
    partnerFilter = partnerId;
  }

  let apps = db.getApplications(partnerFilter);

  if (stage && typeof stage === 'string') {
    apps = apps.filter(a => a.stage === stage);
  }

  if (jobId && typeof jobId === 'string') {
    apps = apps.filter(a => a.jobId === jobId);
  }

  if (candidateId && typeof candidateId === 'string') {
    apps = apps.filter(a => a.candidateId === candidateId);
  }

  return res.json({ success: true, count: apps.length, data: apps });
});

// GET /api/applications/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const app = db.getApplicationById(id);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Partner scoping
  if (req.user && req.user.role.startsWith('partner') && req.user.organizationId !== app.partnerId) {
    return res.status(403).json({ error: 'Access denied to this application' });
  }

  return res.json({ success: true, data: app });
});

// POST /api/applications (Create opportunity / shortlist candidate for job)
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const { candidateId, jobId, matchScore, matchFactors, missingSkills } = req.body;

  if (!candidateId || !jobId) {
    return res.status(400).json({ error: 'candidateId and jobId are required' });
  }

  const candidate = db.getCandidateById(candidateId);
  const job = db.getJobById(jobId);

  if (!candidate || !job) {
    return res.status(404).json({ error: 'Candidate or Job not found' });
  }

  // Check if candidate already has an active application for this job
  const existingApp = db.getApplications().find(
    a => a.candidateId === candidateId && a.jobId === jobId && !['placement_confirmed', 'withdrawn', 'candidate_declined', 'offer_declined'].includes(a.stage)
  );

  if (existingApp) {
    return res.status(409).json({ error: 'An active application already exists for this candidate and job requisition.' });
  }

  const newApp: Application = {
    id: `app-${Date.now()}`,
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    jobId: job.id,
    jobTitle: job.title,
    employer: job.employer,
    partnerId: candidate.partnerId,
    partnerName: candidate.partnerName,
    stage: 'shortlisted',
    matchScore: matchScore || 94,
    matchFactors: matchFactors || [
      { factor: 'Skills Alignment', score: 95, note: 'Direct match on core skills' },
      { factor: 'Experience Relevance', score: 92, note: 'Exceeds experience requirements' },
      { factor: 'Domain Fit', score: 94, note: 'Aligned target role and background' }
    ],
    missingSkills: missingSkills || [],
    lastUpdated: new Date().toISOString()
  };

  db.createApplication(newApp);

  // Update candidate status and job applicants count
  db.updateCandidate(candidate.id, { 
    status: 'in_pipeline',
    activeApplicationCount: (candidate.activeApplicationCount || 0) + 1 
  });
  db.updateJob(job.id, { applicantsCount: job.applicantsCount + 1 });

  // Log audit
  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'recruiter',
    actorRole: req.user?.role || 'recruiter',
    action: 'CANDIDATE_SHORTLISTED',
    entity: 'Application',
    entityId: newApp.id,
    organizationName: candidate.partnerName,
    details: `Shortlisted ${candidate.fullName} for '${job.title}' at ${job.employer}. Match: ${newApp.matchScore}%`,
    correlationId: `corr-${Date.now()}`
  });

  return res.status(201).json({ success: true, data: newApp });
});

const VALID_STAGES: ApplicationStage[] = [
  'new',
  'match_review',
  'shortlisted',
  'opportunity_communicated',
  'candidate_responded',
  'interviewing',
  'offer_pending',
  'offer_communicated',
  'candidate_accepted',
  'partner_approval_pending',
  'placement_confirmed',
  'candidate_declined',
  'partner_rejected',
  'employer_rejected',
  'withdrawn',
  'on_hold',
  'job_closed',
  'offer_declined'
];

// PATCH /api/applications/:id/stage (11-Stage Kanban Pipeline Transition)
router.patch('/:id/stage', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { stage } = req.body as { stage: ApplicationStage };

  if (!stage || !VALID_STAGES.includes(stage)) {
    return res.status(400).json({ 
      error: `Invalid pipeline stage: '${stage}'. Must be one of: ${VALID_STAGES.join(', ')}` 
    });
  }

  const app = db.getApplicationById(id);

  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const oldStage = app.stage;
  const updatedApp = db.updateApplication(app.id, {
    stage,
    lastUpdated: new Date().toISOString()
  });

  // If moved to placement_confirmed, update candidate status
  if (stage === 'placement_confirmed') {
    db.updateCandidate(app.candidateId, { status: 'placed' });
  }

  // Log audit
  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'recruiter',
    actorRole: req.user?.role || 'recruiter',
    action: 'APPLICATION_STAGE_CHANGED',
    entity: 'Application',
    entityId: app.id,
    organizationName: app.partnerName,
    details: `Application for ${app.candidateName} transitioned from '${oldStage}' to '${stage}'.`,
    beforeValue: oldStage,
    afterValue: stage,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedApp });
});

// POST /api/applications/:id/candidate-response (Record candidate interest: accepted / declined)
router.post('/:id/candidate-response', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { response, notes } = req.body as { response: 'accepted' | 'declined'; notes?: string };
  const app = db.getApplicationById(id);

  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const newStage: ApplicationStage = response === 'accepted' ? 'candidate_responded' : 'candidate_declined';

  const updatedApp = db.updateApplication(app.id, {
    stage: newStage,
    candidateResponse: response,
    candidateResponseNotes: notes,
    candidateResponseTimestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  });

  // Sync candidate response with linked offer if exists
  if (app.offerId) {
    db.updateOffer(app.offerId, {
      candidateResponse: response,
      status: response === 'accepted' ? 'accepted' : 'declined'
    });
  }

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'staff',
    actorRole: req.user?.role || 'partner_staff',
    action: 'CANDIDATE_RESPONSE_RECORDED',
    entity: 'Application',
    entityId: app.id,
    organizationName: app.partnerName,
    details: `Candidate response '${response}' recorded for ${app.candidateName}. Notes: ${notes || 'None'}`,
    beforeValue: app.stage,
    afterValue: newStage,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedApp });
});

// POST /api/applications/:id/partner-approval (Decide partner attribution approval per PRD API-08)
router.post('/:id/partner-approval', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { decision, reason } = req.body as { decision: 'approved' | 'rejected'; reason?: string };
  const app = db.getApplicationById(id);

  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Scoping check: Only partner_admin or platform_admin can decide partner approval
  if (req.user && req.user.role === 'partner_staff') {
    return res.status(403).json({ error: 'Partner staff cannot approve or reject partner attribution. Only Partner Admin has signoff authority.' });
  }

  // Tenant boundary guard: Partner Admin can only approve applications belonging to their own organization
  if (req.user && req.user.role === 'partner_admin' && req.user.organizationId && app.partnerId && req.user.organizationId !== app.partnerId) {
    return res.status(403).json({ error: 'Tenant boundary violation: You can only approve or dispute attribution for candidates sourced by your own institution.' });
  }

  const newStage: ApplicationStage = decision === 'approved' ? 'offer_communicated' : 'partner_rejected';

  const updatedApp = db.updateApplication(app.id, {
    stage: newStage,
    partnerApprovalStatus: decision,
    partnerApprovalReason: reason,
    partnerApprovalTimestamp: new Date().toISOString(),
    partnerApproverName: req.user?.name || 'Authorized Partner Signoff',
    lastUpdated: new Date().toISOString()
  });

  // Sync institutional approval with linked offer if exists
  if (app.offerId) {
    db.updateOffer(app.offerId, {
      partnerApprovalStatus: decision,
      partnerApprovalReason: reason,
      partnerApprovalTimestamp: new Date().toISOString()
    });
  }

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'partner_admin',
    actorRole: req.user?.role || 'partner_admin',
    action: `PARTNER_APPROVAL_${decision.toUpperCase()}`,
    entity: 'Application',
    entityId: app.id,
    organizationName: app.partnerName,
    details: `Partner attribution ${decision} for ${app.candidateName} by ${req.user?.name || 'Partner Admin'}. Reason: ${reason || 'Terms approved'}`,
    beforeValue: app.stage,
    afterValue: newStage,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedApp });
});

export default router;
