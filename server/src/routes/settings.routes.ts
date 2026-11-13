import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/settings
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const settings = db.getSettings();
  return res.json({ success: true, data: settings });
});

// PUT /api/settings (Platform Admin only)
router.put('/', requireRole(['platform_admin']), (req: AuthenticatedRequest, res: Response) => {
  const updatedSettings = db.updateSettings(req.body);

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'admin',
    actorRole: 'platform_admin',
    action: 'PLATFORM_SETTINGS_UPDATED',
    entity: 'Settings',
    entityId: 'global-settings',
    details: 'Platform governance settings updated by Administrator.',
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedSettings });
});

export default router;

