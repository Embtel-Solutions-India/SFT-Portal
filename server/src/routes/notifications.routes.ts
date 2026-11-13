import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { SystemNotification } from '../types/index.js';

const router = Router();

// GET /api/notifications
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  let notifs = db.getNotifications();

  if (req.user) {
    notifs = notifs.filter(n => {
      if (n.targetRole === 'all') return true;
      if (n.targetRole === req.user?.role) {
        if (n.targetOrgId && req.user?.organizationId) {
          return n.targetOrgId === req.user.organizationId;
        }
        return true;
      }
      return false;
    });
  }

  return res.json({ success: true, count: notifs.length, data: notifs });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const success = db.markNotificationRead(id);
  return res.json({ success });
});

// POST /api/notifications
router.post('/', requireRole(['platform_admin', 'recruiter']), (req: AuthenticatedRequest, res: Response) => {
  const { targetRole, targetOrgId, title, message, type, actionUrl } = req.body;

  const notif: SystemNotification = {
    id: `notif-${Date.now()}`,
    targetRole: targetRole || 'all',
    targetOrgId,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type: type || 'info',
    actionUrl
  };

  db.createNotification(notif);
  return res.status(201).json({ success: true, data: notif });
});

export default router;
