import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { Offer } from '../types/index.js';

const router = Router();

// GET /api/offers
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  let offers = db.getOffers();

  // Scoping: partner roles only see offers attributed to their organization
  if (req.user && req.user.role.startsWith('partner') && req.user.organizationId) {
    offers = offers.filter(o => o.partnerId === req.user!.organizationId);
  }

  return res.json({ success: true, count: offers.length, data: offers });
});

// POST /api/offers (Create/Draft offer per PRD API-09)
router.post('/', requireRole(['platform_admin', 'recruiter']), (req: AuthenticatedRequest, res: Response) => {
  const { applicationId, compensation, startDate, notes } = req.body;
  if (!applicationId || !compensation) {
    return res.status(400).json({ error: 'applicationId and compensation are required' });
  }

  const app = db.getApplicationById(applicationId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const newOffer: Offer = {
    id: `offer-${Date.now()}`,
    applicationId: app.id,
    candidateId: app.candidateId,
    candidateName: app.candidateName,
    candidateEmail: app.candidateEmail,
    jobId: app.jobId,
    jobTitle: app.jobTitle,
    employer: app.employer,
    partnerId: app.partnerId,
    partnerName: app.partnerName,
    compensation,
    startDate: startDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    partnerApprovalStatus: 'pending',
    candidateResponse: 'pending',
    version: '1.0',
    createdAt: new Date().toISOString()
  };

  db.createOffer(newOffer);

  // Update application stage to offer_pending
  db.updateApplication(app.id, {
    stage: 'offer_pending',
    offerId: newOffer.id,
    lastUpdated: new Date().toISOString()
  });

  // Log audit
  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'recruiter',
    actorRole: req.user?.role || 'recruiter',
    action: 'OFFER_CREATED',
    entity: 'Offer',
    entityId: newOffer.id,
    organizationName: app.partnerName,
    details: `Drafted compensation offer for ${app.candidateName} (${app.jobTitle} at ${app.employer}): ${compensation}`,
    afterValue: newOffer.status,
    correlationId: `corr-${Date.now()}`
  });

  return res.status(201).json({ success: true, data: newOffer });
});

// POST /api/offers/:id/request-approval (Request Partner Approval per PRD Section 6)
router.post('/:id/request-approval', requireRole(['platform_admin', 'recruiter']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const offer = db.getOfferById(id);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  const updatedOffer = db.updateOffer(offer.id, {
    status: 'issued',
    partnerApprovalStatus: 'pending'
  });

  const app = db.getApplicationById(offer.applicationId);
  if (app) {
    db.updateApplication(app.id, {
      stage: 'partner_approval_pending',
      partnerApprovalStatus: 'pending'
    });
  }

  // Send notification to Partner Admin
  db.createNotification({
    id: `notif-${Date.now()}`,
    targetRole: 'partner_admin',
    targetOrgId: offer.partnerId,
    title: 'Partner Placement Approval Requested',
    message: `Placement opportunity for ${offer.candidateName} (${offer.jobTitle}) requires institutional review & signoff.`,
    timestamp: new Date().toISOString(),
    read: false,
    type: 'warning',
    actionUrl: '/partner-admin/approvals'
  });

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'recruiter',
    actorRole: req.user?.role || 'recruiter',
    action: 'PARTNER_APPROVAL_REQUESTED',
    entity: 'Offer',
    entityId: offer.id,
    organizationName: offer.partnerName,
    details: `Partner approval notification dispatched to ${offer.partnerName} for candidate ${offer.candidateName}`,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedOffer });
});

// POST /api/offers/:id/waive-approval (Admin override waiver)
router.post('/:id/waive-approval', requireRole(['platform_admin']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { waiverReason } = req.body;
  const offer = db.getOfferById(id);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  const updatedOffer = db.updateOffer(offer.id, {
    partnerApprovalStatus: 'waived',
    waiverReason: waiverReason || 'Direct institutional waiver executed',
    waiverAuthorizedBy: req.user?.email || 'Platform Admin'
  });

  const app = db.getApplicationById(offer.applicationId);
  if (app) {
    db.updateApplication(app.id, {
      stage: 'offer_communicated',
      partnerApprovalStatus: 'waived'
    });
  }

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'admin',
    actorRole: 'platform_admin',
    action: 'PARTNER_APPROVAL_WAIVED',
    entity: 'Offer',
    entityId: offer.id,
    organizationName: offer.partnerName,
    details: `Partner approval requirement waived by Platform Admin. Reason: ${waiverReason}`,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedOffer });
});

// POST /api/offers/:id/response (Candidate offer response)
router.post('/:id/response', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { response, notes } = req.body as { response: 'accepted' | 'declined'; notes?: string };
  const offer = db.getOfferById(id);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  const updatedOffer = db.updateOffer(offer.id, {
    candidateResponse: response,
    candidateResponseNotes: notes,
    status: response === 'accepted' ? 'accepted' : 'declined'
  });

  const app = db.getApplicationById(offer.applicationId);
  if (app) {
    db.updateApplication(app.id, {
      stage: response === 'accepted' ? 'candidate_accepted' : 'offer_declined',
      candidateResponse: response,
      candidateResponseNotes: notes
    });
  }

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'staff',
    actorRole: req.user?.role || 'partner_staff',
    action: `CANDIDATE_OFFER_${response.toUpperCase()}`,
    entity: 'Offer',
    entityId: offer.id,
    organizationName: offer.partnerName,
    details: `Candidate offer ${response} for ${offer.candidateName}. Notes: ${notes || 'None'}`,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedOffer });
});

// POST /api/offers/:id/partner-approval (Partner Admin Attribution Approval)
router.post('/:id/partner-approval', requireRole(['platform_admin', 'partner_admin']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { decision, reason } = req.body as { decision?: 'approved' | 'rejected'; reason?: string };
  const offer = db.getOfferById(id);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  // Tenant Boundary Check: Partner admin can only approve offers belonging to their own organization
  if (req.user && req.user.role === 'partner_admin' && req.user.organizationId && offer.partnerId && req.user.organizationId !== offer.partnerId) {
    return res.status(403).json({ error: 'Tenant boundary violation: You cannot sign off offers for other institutions.' });
  }

  const targetDecision = decision || 'approved';

  const updatedOffer = db.updateOffer(offer.id, {
    partnerApprovalStatus: targetDecision,
    partnerApprovalReason: reason || 'Approved by institution',
    partnerApprovalTimestamp: new Date().toISOString()
  });

  const app = db.getApplicationById(offer.applicationId);
  if (app) {
    db.updateApplication(app.id, {
      partnerApprovalStatus: targetDecision,
      partnerApprovalReason: reason,
      partnerApprovalTimestamp: new Date().toISOString()
    });
  }

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'partner_admin',
    actorRole: req.user?.role || 'partner_admin',
    action: `PARTNER_OFFER_APPROVAL_${targetDecision.toUpperCase()}`,
    entity: 'Offer',
    entityId: offer.id,
    organizationName: offer.partnerName,
    details: `Offer attribution ${targetDecision} for ${offer.candidateName} by ${req.user?.name || 'Partner Admin'}.`,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedOffer });
});

// POST /api/offers/:id/confirm-placement (Finalize Placement per PRD Section 7 & API-09)
router.post('/:id/confirm-placement', requireRole(['platform_admin', 'recruiter']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const offer = db.getOfferById(id);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  if (offer.status === 'confirmed') {
    return res.status(400).json({ error: 'Placement has already been confirmed.' });
  }

  // PRD Governance Guard: Candidate acceptance is required
  if (offer.candidateResponse !== 'accepted') {
    return res.status(400).json({ 
      error: `Cannot confirm placement while candidate response is '${offer.candidateResponse}'. Candidate must accept formal terms first.` 
    });
  }

  // PRD Governance Guard: Partner approval or platform waiver is required
  if (offer.partnerApprovalStatus !== 'approved' && offer.partnerApprovalStatus !== 'waived') {
    return res.status(400).json({ 
      error: `Cannot confirm placement while partner institutional signoff is '${offer.partnerApprovalStatus}'. Sourcing partner must approve attribution, or Platform Administrator must record an audited waiver.` 
    });
  }

  const updatedOffer = db.updateOffer(offer.id, {
    status: 'confirmed'
  });

  const app = db.getApplicationById(offer.applicationId);
  if (app) {
    db.updateApplication(app.id, {
      stage: 'placement_confirmed'
    });
  }

  // Update candidate status
  db.updateCandidate(offer.candidateId, {
    status: 'placed'
  });

  // Update partner organization placement counter
  const org = db.getOrganizationById(offer.partnerId);
  if (org) {
    db.updateOrganization(org.id, {
      placementCount: (org.placementCount || 0) + 1
    });
  }

  // System notification
  db.createNotification({
    id: `notif-${Date.now()}`,
    targetRole: 'all',
    title: 'Placement Confirmed!',
    message: `${offer.candidateName} confirmed placed as ${offer.jobTitle} with ${offer.employer}. Sourced by ${offer.partnerName}.`,
    timestamp: new Date().toISOString(),
    read: false,
    type: 'success',
    actionUrl: '/recruiter/pipeline'
  });

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'recruiter',
    actorRole: req.user?.role || 'recruiter',
    action: 'PLACEMENT_CONFIRMED',
    entity: 'Placement',
    entityId: offer.id,
    organizationName: offer.partnerName,
    details: `Formal placement confirmed for ${offer.candidateName} at ${offer.employer}. Attribution locked to ${offer.partnerName}.`,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedOffer });
});

export default router;
