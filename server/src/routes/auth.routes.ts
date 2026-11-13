import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/store.js';
import { AuthenticatedRequest, signToken } from '../middleware/auth.js';
import { User, UserRole, Organization } from '../types/index.js';
import { hashPassword, verifyPassword, passwordProblem, sendPasswordLink, findUserByResetToken } from '../services/passwords.js';
import { sendMail } from '../services/mailer.js';

const router = Router();

const ROLE_LABELS: Record<UserRole, string> = {
  platform_admin: 'Platform Administrator',
  recruiter: 'Placement Operations / Recruiter',
  partner_admin: 'Partner Organization Admin',
  partner_staff: 'Partner Staff / Placement Officer'
};

const audit = (user: Pick<User, 'email' | 'role' | 'organizationName'>, action: string, entityId: string, details: string, entity = 'User') =>
  db.logAudit({
    id: `audit-${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    actorEmail: user.email,
    actorRole: user.role,
    action,
    entity,
    entityId,
    organizationName: user.organizationName,
    details,
    correlationId: `corr-${crypto.randomUUID()}`
  });

// POST /api/auth/login
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, requiredRole } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  const ok = await verifyPassword(password, user?.passwordHash);
  if (!user || !ok || user.status === 'inactive') {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (requiredRole && user.role !== requiredRole) {
    return res.status(403).json({
      error: `This account belongs to the ${ROLE_LABELS[user.role]} portal. Please sign in via that portal.`
    });
  }

  db.updateUser(user.id, { lastLogin: new Date().toISOString() });
  audit(user, 'USER_LOGIN', user.id, `User ${user.email} signed in.`);

  return res.json({ success: true, user, token: signToken(user) });
});

// GET /api/auth/me
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ authenticated: false, user: null });
  return res.json({ authenticated: true, user: req.user });
});

// POST /api/auth/logout-all — revoke every token issued to this user
router.post('/logout-all', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  db.updateUser(req.user.id, { tokenVersion: (req.user.tokenVersion || 0) + 1 });
  return res.json({ success: true });
});

// POST /api/auth/forgot-password — always 200 so it can't be used to discover accounts
router.post('/forgot-password', async (req: AuthenticatedRequest, res: Response) => {
  const user = typeof req.body.email === 'string' ? db.getUserByEmail(req.body.email) : undefined;
  if (user && user.status !== 'inactive') {
    await sendPasswordLink(user, 'reset');
    audit(user, 'PASSWORD_RESET_REQUESTED', user.id, 'Password reset link emailed.');
  }
  return res.json({ success: true, message: 'If that account exists, a reset link has been emailed.' });
});

// POST /api/auth/reset-password — consumes a reset or invite token
router.post('/reset-password', async (req: AuthenticatedRequest, res: Response) => {
  const { token, password } = req.body;
  const problem = passwordProblem(password);
  if (problem) return res.status(400).json({ error: problem });

  const user = typeof token === 'string' ? findUserByResetToken(token) : undefined;
  if (!user) return res.status(400).json({ error: 'This link is invalid or has expired. Request a new one.' });

  db.updateUser(user.id, {
    passwordHash: await hashPassword(password),
    resetTokenHash: undefined,
    resetTokenExpires: undefined,
    tokenVersion: (user.tokenVersion || 0) + 1 // sign out existing sessions
  });
  audit(user, 'PASSWORD_RESET_COMPLETED', user.id, 'Password set via emailed link.');
  return res.json({ success: true, message: 'Password updated. You can now sign in.' });
});

// POST /api/auth/register — organization self-registration (FR-01)
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  const {
    legalName, displayName, type, location, contactEmail, contactPhone,
    website, authorizedRepresentative, representativeTitle, password
  } = req.body;

  if (!legalName || !contactEmail || !authorizedRepresentative) {
    return res.status(400).json({ error: 'Legal name, contact email, and authorized representative are required.' });
  }
  if (typeof contactEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return res.status(400).json({ error: 'A valid contact email is required.' });
  }
  const problem = passwordProblem(password);
  if (problem) return res.status(400).json({ error: problem });
  if (db.getUserByEmail(contactEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists. Sign in or reset your password.' });
  }

  // Flag (never merge) likely duplicates by normalized name or email domain
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const domain = contactEmail.split('@')[1].toLowerCase();
  const existingOrg = db.getOrganizations().find(o =>
    norm(o.legalName) === norm(legalName) || o.contactEmail.toLowerCase().split('@')[1] === domain
  );

  const orgId = `org-${crypto.randomUUID()}`;
  const newOrg: Organization = {
    id: orgId,
    legalName,
    displayName: displayName || legalName,
    type: type || 'college',
    location: location || '',
    contactEmail,
    contactPhone: contactPhone || '',
    website: website || '',
    authorizedRepresentative,
    representativeTitle: representativeTitle || '',
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    candidateIntakeEnabled: false,
    isDuplicateFlagged: !!existingOrg
  };
  db.createOrganization(newOrg);

  const adminUser: User = {
    id: `user-${crypto.randomUUID()}`,
    email: contactEmail.trim().toLowerCase(),
    name: authorizedRepresentative,
    role: 'partner_admin',
    organizationId: orgId,
    organizationName: newOrg.displayName,
    status: 'active',
    invitedAt: new Date().toISOString(),
    passwordHash: await hashPassword(password)
  };
  db.createUser(adminUser);

  db.createNotification({
    id: `notif-${crypto.randomUUID()}`,
    targetRole: 'platform_admin',
    title: 'New Partner Registration',
    message: `${newOrg.displayName} (${newOrg.type}) has submitted an onboarding application.`,
    timestamp: new Date().toISOString(),
    read: false,
    type: 'info',
    actionUrl: '/admin/organizations'
  });

  audit(adminUser, 'ORGANIZATION_REGISTERED', orgId, `Organization registered with status 'submitted'.`, 'Organization');

  sendMail(contactEmail, 'Registration received — School For Staffing',
    `Hello ${authorizedRepresentative},\n\nWe received the registration for ${newOrg.displayName}. Our team will verify it and email you once a decision is made.`);

  return res.status(201).json({
    success: true,
    organization: newOrg,
    user: adminUser,
    isDuplicateFlagged: !!existingOrg,
    message: 'Registration submitted successfully. Pending administrative verification.'
  });
});

export default router;
