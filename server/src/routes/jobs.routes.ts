import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { Job } from '../types/index.js';

const router = Router();

// GET /api/jobs
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;
  let jobs = db.getJobs();

  if (status && typeof status === 'string') {
    jobs = jobs.filter(j => j.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    jobs = jobs.filter(j => 
      j.title.toLowerCase().includes(q) ||
      j.employer.toLowerCase().includes(q) ||
      j.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  }

  return res.json({ success: true, count: jobs.length, data: jobs });
});

// GET /api/jobs/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const job = db.getJobById(id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  return res.json({ success: true, data: job });
});

// POST /api/jobs
router.post('/', requireRole(['platform_admin', 'recruiter']), (req: AuthenticatedRequest, res: Response) => {
  const jobData = req.body as Partial<Job>;

  if (!jobData.title || !jobData.employer) {
    return res.status(400).json({ error: 'Job title and employer are required' });
  }

  const newJob: Job = {
    id: `job-${Date.now()}`,
    title: jobData.title,
    employer: jobData.employer,
    department: jobData.department || 'Engineering',
    location: jobData.location || 'Remote, USA',
    workMode: jobData.workMode || 'remote',
    employmentType: jobData.employmentType || 'full_time',
    experienceRange: jobData.experienceRange || '3-5 years',
    salaryRange: jobData.salaryRange || '$120,000 - $145,000',
    description: jobData.description || '',
    requiredSkills: jobData.requiredSkills || [],
    preferredSkills: jobData.preferredSkills || [],
    status: jobData.status || 'active',
    createdAt: new Date().toISOString(),
    applicantsCount: 0,
    matchesCount: 0
  };

  db.createJob(newJob);

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'recruiter',
    actorRole: req.user?.role || 'recruiter',
    action: 'JOB_CREATED',
    entity: 'Job',
    entityId: newJob.id,
    details: `Created job requisition: ${newJob.title} at ${newJob.employer}`,
    correlationId: `corr-${Date.now()}`
  });

  return res.status(201).json({ success: true, data: newJob });
});

// PATCH /api/jobs/:id/status
router.patch('/:id/status', requireRole(['platform_admin', 'recruiter']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  const job = db.getJobById(id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const updatedJob = db.updateJob(job.id, { status });

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'recruiter',
    actorRole: req.user?.role || 'recruiter',
    action: 'JOB_STATUS_UPDATED',
    entity: 'Job',
    entityId: job.id,
    details: `Job status changed from ${job.status} to ${status}`,
    beforeValue: job.status,
    afterValue: status,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedJob });
});

// PUT /api/jobs/:id
router.put('/:id', requireRole(['platform_admin', 'recruiter']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const job = db.getJobById(id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const updatedJob = db.updateJob(job.id, req.body);
  return res.json({ success: true, data: updatedJob });
});

export default router;
