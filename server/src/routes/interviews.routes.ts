import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { InterviewRound } from '../types/index.js';

const router = Router();

// GET /api/interviews
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { applicationId } = req.query;
  let interviews = db.getInterviews();

  // Tenant Boundary Scoping: Partner roles only see interviews for their own candidates
  if (req.user && req.user.role.startsWith('partner') && req.user.organizationId) {
    const partnerAppIds = new Set(
      db.getApplications(req.user.organizationId).map(a => a.id)
    );
    interviews = interviews.filter(i => partnerAppIds.has(i.applicationId));
  }

  if (applicationId && typeof applicationId === 'string') {
    interviews = interviews.filter(i => i.applicationId === applicationId);
  }

  return res.json({ success: true, count: interviews.length, data: interviews });
});

// POST /api/interviews
router.post('/', requireRole(['platform_admin', 'recruiter']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as Partial<InterviewRound>;

  if (!data.applicationId || !data.candidateName || !data.jobTitle) {
    return res.status(400).json({ error: 'applicationId, candidateName, and jobTitle are required' });
  }

  const newInterview: InterviewRound = {
    id: `int-${Date.now()}`,
    applicationId: data.applicationId,
    candidateName: data.candidateName,
    jobTitle: data.jobTitle,
    employer: data.employer || 'Partner Client',
    roundName: data.roundName || 'Technical Round',
    date: data.date || new Date().toISOString().split('T')[0],
    time: data.time || '14:00',
    timezone: data.timezone || 'EST (UTC-5)',
    modality: data.modality || 'video',
    interviewer: data.interviewer || 'Lead Assessor',
    instructions: data.instructions,
    candidateContacted: true,
    attendance: 'scheduled',
    outcome: 'pending',
    history: [
      {
        timestamp: new Date().toISOString(),
        note: `Interview scheduled by ${req.user?.name || 'Recruiter'}`
      }
    ]
  };

  db.createInterview(newInterview);

  // Update application stage to 'interviewing' if it wasn't already
  const app = db.getApplicationById(data.applicationId);
  if (app && app.stage !== 'interviewing') {
    db.updateApplication(app.id, { stage: 'interviewing' });
  }

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'recruiter',
    actorRole: req.user?.role || 'recruiter',
    action: 'INTERVIEW_SCHEDULED',
    entity: 'Interview',
    entityId: newInterview.id,
    details: `Scheduled ${newInterview.roundName} for ${newInterview.candidateName} on ${newInterview.date} ${newInterview.time} ${newInterview.timezone}`,
    correlationId: `corr-${Date.now()}`
  });

  return res.status(201).json({ success: true, data: newInterview });
});

// PATCH /api/interviews/:id/outcome
router.patch('/:id/outcome', requireRole(['platform_admin', 'recruiter']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { outcome, feedbackNotes, attendance } = req.body;
  const interview = db.getInterviewById(id);

  if (!interview) {
    return res.status(404).json({ error: 'Interview round not found' });
  }

  const history = interview.history || [];
  if (feedbackNotes) {
    history.push({
      timestamp: new Date().toISOString(),
      note: `Outcome: ${outcome}. Feedback: ${feedbackNotes}`
    });
  }

  const updatedInterview = db.updateInterview(interview.id, {
    outcome: outcome || interview.outcome,
    attendance: attendance || interview.attendance,
    feedbackNotes: feedbackNotes !== undefined ? feedbackNotes : interview.feedbackNotes,
    history
  });

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'recruiter',
    actorRole: req.user?.role || 'recruiter',
    action: 'INTERVIEW_OUTCOME_RECORDED',
    entity: 'Interview',
    entityId: interview.id,
    details: `Interview outcome recorded as '${outcome}' for candidate ${interview.candidateName}`,
    beforeValue: interview.outcome,
    afterValue: outcome,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedInterview });
});

export default router;
