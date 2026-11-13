import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { AuditEvent } from '../types/index.js';

const router = Router();

// GET /api/audit (PRD API-10: Tenant-scoped immutable audit log retrieval)
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  let logs = db.getAuditEvents();

  // If partner user, only show audit logs involving their organization
  if (req.user && req.user.role.startsWith('partner')) {
    const org = db.getOrganizationById(req.user.organizationId || '');
    const orgName = org?.displayName || req.user.organizationName;
    if (orgName) {
      logs = logs.filter(l => l.organizationName === orgName || l.actorEmail === req.user?.email);
    }
  }

  const { entity, action } = req.query;
  if (entity && typeof entity === 'string') {
    logs = logs.filter(l => l.entity.toLowerCase() === entity.toLowerCase());
  }
  if (action && typeof action === 'string') {
    logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
  }

  return res.json({ success: true, count: logs.length, data: logs });
});

// POST /api/audit
router.post('/', requireRole(['platform_admin', 'recruiter']), (req: AuthenticatedRequest, res: Response) => {
  const { action, entity, entityId, details, beforeValue, afterValue } = req.body;

  const event: AuditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: action || 'CUSTOM_EVENT',
    entity: entity || 'General',
    entityId: entityId || 'gen-1',
    organizationName: req.user?.organizationName,
    details: details || '',
    correlationId: `corr-${Date.now()}`,
    beforeValue,
    afterValue
  };

  db.logAudit(event);
  return res.status(201).json({ success: true, data: event });
});

export default router;

