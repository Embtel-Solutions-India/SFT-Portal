import { Router, Response } from 'express';
import { db } from '../db/store.js';
import { sendPasswordLink } from '../services/passwords.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { User } from '../types/index.js';

const router = Router();

// GET /api/users
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  let orgFilter: string | undefined = undefined;
  if (req.user && req.user.role.startsWith('partner')) {
    orgFilter = req.user.organizationId;
  }

  const users = db.getUsers(orgFilter);
  return res.json({ success: true, count: users.length, data: users });
});

// POST /api/users (Invite user)
router.post('/', requireRole(['platform_admin', 'partner_admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { email, name, role, organizationId, organizationName } = req.body;

  if (!email || !name || !role) {
    return res.status(400).json({ error: 'Email, name, and role are required' });
  }
  if (!['platform_admin', 'recruiter', 'partner_admin', 'partner_staff'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (db.getUserByEmail(email)) {
    return res.status(409).json({ error: 'A user with this email already exists' });
  }

  // Privilege Escalation Guard: Partner admins cannot create platform_admin or recruiter accounts
  if (req.user?.role === 'partner_admin' && (role === 'platform_admin' || role === 'recruiter')) {
    return res.status(403).json({ error: 'Privilege escalation rejected: Partner administrators cannot provision platform admin or recruiter accounts.' });
  }

  // If partner admin is creating, enforce their own organization
  const targetOrgId = req.user?.role === 'partner_admin' ? req.user.organizationId : organizationId;
  const targetOrgName = req.user?.role === 'partner_admin' ? req.user.organizationName : organizationName;

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role,
    organizationId: targetOrgId,
    organizationName: targetOrgName,
    status: 'active',
    invitedAt: new Date().toISOString()
  };

  db.createUser(newUser);

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'admin',
    actorRole: req.user?.role || 'platform_admin',
    action: 'USER_INVITED',
    entity: 'User',
    entityId: newUser.id,
    organizationName: targetOrgName,
    details: `Invited user ${newUser.email} with role ${newUser.role}`,
    correlationId: `corr-${Date.now()}`
  });

  const emailed = await sendPasswordLink(newUser, 'invite');
  return res.status(201).json({ success: true, data: newUser, inviteEmailSent: emailed });
});

// PATCH /api/users/:id/role
router.patch('/:id/role', requireRole(['platform_admin', 'partner_admin']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { role, organizationId, organizationName } = req.body;
  const user = db.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Tenant Isolation & Privilege Escalation Guards
  if (req.user?.role === 'partner_admin') {
    if (user.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Tenant violation: You can only manage users within your own institution.' });
    }
    if (user.role === 'platform_admin' || user.role === 'recruiter') {
      return res.status(403).json({ error: 'Permission denied: Cannot modify platform administrator or recruiter roles.' });
    }
    if (role === 'platform_admin' || role === 'recruiter') {
      return res.status(403).json({ error: 'Privilege escalation rejected: Partner admin cannot assign platform admin or recruiter roles.' });
    }
  }

  const updatedUser = db.updateUser(user.id, {
    role,
    organizationId: organizationId !== undefined ? organizationId : user.organizationId,
    organizationName: organizationName !== undefined ? organizationName : user.organizationName
  });

  db.logAudit({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail: req.user?.email || 'admin',
    actorRole: req.user?.role || 'platform_admin',
    action: 'USER_ROLE_CHANGED',
    entity: 'User',
    entityId: user.id,
    details: `Role updated for ${user.email} from ${user.role} to ${role}`,
    beforeValue: user.role,
    afterValue: role,
    correlationId: `corr-${Date.now()}`
  });

  return res.json({ success: true, data: updatedUser });
});

// PATCH /api/users/:id/status
router.patch('/:id/status', requireRole(['platform_admin', 'partner_admin']), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const user = db.getUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Tenant Boundary Guard
  if (req.user?.role === 'partner_admin') {
    if (user.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Tenant violation: You can only change status for users within your own institution.' });
    }
    if (user.role === 'platform_admin' || user.role === 'recruiter') {
      return res.status(403).json({ error: 'Permission denied: Cannot alter status of platform administrator or recruiter accounts.' });
    }
  }

  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  const updatedUser = db.updateUser(user.id, { status: newStatus });

  return res.json({ success: true, data: updatedUser });
});

export default router;
