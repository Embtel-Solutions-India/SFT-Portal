import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db/store.js';
import { User } from '../types/index.js';
import { sendMail, APP_URL } from './mailer.js';

export const MIN_PASSWORD_LENGTH = 8;
const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);

// Pre-computed so unknown-email logins cost the same as real ones (no user enumeration by timing).
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 12);
export const verifyPassword = (pw: string, hash?: string) => bcrypt.compare(pw, hash || DUMMY_HASH);

export function passwordProblem(pw: unknown): string | null {
  if (typeof pw !== 'string' || pw.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (pw.length > 128) return 'Password is too long.';
  return null;
}

/** Create a single-use reset token (only its hash is stored) and email the link. */
export async function sendPasswordLink(user: User, kind: 'reset' | 'invite') {
  const token = crypto.randomBytes(32).toString('hex');
  const hours = kind === 'invite' ? 72 : 1;
  db.updateUser(user.id, {
    resetTokenHash: sha256(token),
    resetTokenExpires: new Date(Date.now() + hours * 3600_000).toISOString()
  });
  const link = `${APP_URL}/reset-password?token=${token}`;
  const [subject, text] = kind === 'invite'
    ? ['You have been invited to School For Staffing',
       `Hello ${user.name},\n\nAn account has been created for you. Set your password here (valid ${hours} hours):\n${link}\n\nIf you did not expect this, ignore this email.`]
    : ['Reset your School For Staffing password',
       `Hello ${user.name},\n\nUse this link to reset your password (valid ${hours} hour):\n${link}\n\nIf you did not request this, ignore this email.`];
  return sendMail(user.email, subject, text);
}

export function findUserByResetToken(token: string): User | undefined {
  const hash = sha256(token);
  const user = db.getUsers().find(u => u.resetTokenHash === hash);
  if (!user || !user.resetTokenExpires || new Date(user.resetTokenExpires) < new Date()) return undefined;
  return user;
}
