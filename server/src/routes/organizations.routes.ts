import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { sendMail, APP_URL } from '../services/mailer.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { Organization, OrganizationStatus } from '../types/index.js';

const router = Router();

// GET /api/organizations
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;
  let orgs = db.getOrganizations();

  // If partner user, only return their own organization
  if (req.user && (req.user.role === 'partner_admin' || req.user.role === 'partner_staff')) {
    orgs = orgs.filter(o => o.id === req.user?.organizationId);
  }

  if (status && typeof status === 'string') {
    orgs = orgs.filter(o => o.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    orgs = orgs.filter(o => 
      o.displayName.toLowerCase().includes(q) ||
      o.legalName.toLowerCase().includes(q) ||
      o.contactEmail.toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, count: orgs.length, data: orgs });
});

// GET /api/organizations/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const org = db.getOrganizationById(id);
  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  // Scoping check
  if (req.user && req.user.role.startsWith('partner') && req.user.organizationId !== org.id) {
    return res.status(403).json({ error: 'Access denied to this organization record' });
  }

  return res.json({ success: true, data: org });
});

// POST /api/organizations (Admin creation)
router.post('/', requireRole(['platform_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { legalName, displayName, type, location, contactEmail, contactPhone, website, authorizedRepresentative, representativeTitle } = req.body;

  if (!legalName || !contactEmail) {
    return res.status(400).json({ error: 'legalName and contactEmail are required' });
  }

  const newOrg: Organization = {
    id: `org-${Date.now()}`,
    legalName,
    displayName: displayName || legalName,
    type: type || 'college',
    location: location || 'California, USA',
    contactEmail,
    contactPhone: contactPhone || '',
    website: website || '',
    authorizedRepresentative: authorizedRepresentative || 'Administrator',
    representativeTitle: representativeTitle || 'Director',
    status: 'approved',
    submittedAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: req.user?.email || 'admin@sft.com',
    candidateIntakeEnabled: true
  };

  db.createOrganization(newOrg);

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'admin',
    actorRole: req.user?.role || 'platform_admin',
    action: 'ORGANIZATION_CREATED',
    entity: 'Organization',
    entityId: newOrg.id,
    organizationName: newOrg.displayName,
    details: `Platform Admin created partner organization ${newOrg.displayName}`,
    correlationId: `corr-${Date.now()}`
  });

  return res.status(201).json({ success: true, data: newOrg });
});

const handleStatusUpdate = (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { status, reason } = req.body as { status: OrganizationStatus; reason?: string };
  const org = db.getOrganizationById(id);

  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  const beforeStatus = org.status;
  const updates: Partial<Organization> = { status };

  if (status === 'approved') {
    updates.verifiedAt = new Date().toISOString();
    updates.verifiedBy = req.user?.email || 'admin@sft.com';
    updates.candidateIntakeEnabled = true;
    updates.rejectionReason = undefined;
    updates.suspensionReason = undefined;
  } else if (status === 'rejected') {
    updates.rejectionReason = reason || 'Verification documents incomplete';
    updates.candidateIntakeEnabled = false;
  } else if (status === 'suspended') {
    updates.suspensionReason = reason || 'Administrative compliance review';
    updates.candidateIntakeEnabled = false;
  }

  const updatedOrg = db.updateOrganization(org.id, updates);

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'admin',
    actorRole: req.user?.role || 'platform_admin',
    action: `ORGANIZATION_STATUS_${status.toUpperCase()}`,
    entity: 'Organization',
    entityId: org.id,
    organizationName: org.displayName,
    details: `Organization status updated from ${beforeStatus} to ${status}. Reason: ${reason || 'N/A'}`,
    beforeValue: beforeStatus,
    afterValue: status,
    correlationId: `corr-${Date.now()}`
  });

  if (['approved', 'rejected', 'suspended'].includes(status)) {
    const body = status === 'approved'
      ? `Your organization ${org.displayName} has been approved. You can now sign in and submit candidates.

${APP_URL}/partner-admin/login`
      : `Your organization ${org.displayName} has been ${status}.
Reason: ${reason || 'Not specified'}

You can correct your details and resubmit by signing in.`;
    sendMail(org.contactEmail, `Organization ${status} — School For Staffing`, body);
  }

  return res.json({ success: true, data: updatedOrg });
};

// PATCH & PUT /api/organizations/:id/status (Approve / Reject / Suspend / Reactivate)
router.patch('/:id/status', requireRole(['platform_admin']), handleStatusUpdate);
router.put('/:id/status', requireRole(['platform_admin']), handleStatusUpdate);

// PATCH /api/organizations/:id/toggle-intake
router.patch('/:id/toggle-intake', requireRole(['platform_admin']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const org = db.getOrganizationById(id);
  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  const newIntakeState = !org.candidateIntakeEnabled;
  const updatedOrg = db.updateOrganization(org.id, { candidateIntakeEnabled: newIntakeState });

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'admin',
    actorRole: req.user?.role || 'platform_admin',
    action: 'TOGGLE_INTAKE',
    entity: 'Organization',
    entityId: org.id,
    organizationName: org.displayName,
    details: `Candidate intake toggled to ${newIntakeState ? 'ENABLED' : 'DISABLED'}`,
    beforeValue: String(org.candidateIntakeEnabled),
    afterValue: String(newIntakeState),
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedOrg });
});

// PUT /api/organizations/:id
router.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const org = db.getOrganizationById(id);
  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  // Scoping check
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role === 'partner_staff') {
    return res.status(403).json({ error: 'Partner staff cannot edit organization settings' });
  }
  if (req.user.role === 'partner_admin' && req.user.organizationId !== org.id) {
    return res.status(403).json({ error: 'Tenant isolation violation: Access denied' });
  }

  // Mass assignment protection: disallow tampering with administrative verification status
  let safeUpdates: Partial<Organization>;
  if (req.user.role === 'platform_admin') {
    const { id: _ignore, ...rest } = req.body;
    safeUpdates = rest;
  } else {
    // Partner admin whitelist only
    const { location, contactEmail, contactPhone, website, authorizedRepresentative, representativeTitle, displayName } = req.body;
    safeUpdates = {
      location,
      contactEmail,
      contactPhone,
      website,
      authorizedRepresentative,
      representativeTitle,
      displayName
    };
  }

  // Omitted fields must not blank out existing values
  safeUpdates = Object.fromEntries(Object.entries(safeUpdates).filter(([, v]) => v !== undefined));
  const updatedOrg = db.updateOrganization(org.id, safeUpdates);
  return res.json({ success: true, data: updatedOrg });
});

export default router;
