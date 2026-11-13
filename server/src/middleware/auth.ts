import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';
import { User, UserRole } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

const JWT_SECRET = process.env.JWT_SECRET || '';
if (JWT_SECRET.length < 32 || JWT_SECRET.includes('your_jwt_secret')) {
  throw new Error('JWT_SECRET must be set to a random string of at least 32 characters.');
}
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];

export function signToken(user: User) {
  return jwt.sign({ sub: user.id, v: user.tokenVersion || 0 }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' });
}

/** Resolves req.user from a Bearer JWT. Identity always comes from the DB, never from client headers. */
export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7).trim(), JWT_SECRET, { algorithms: ['HS256'] }) as { sub: string; v: number };
      const user = db.getUserById(payload.sub);
      if (user && user.status !== 'inactive' && (user.tokenVersion || 0) === payload.v) {
        req.user = user;
      }
    } catch {
      // invalid/expired token → treated as anonymous
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Your role lacks permission for this operation.' });
    }
    next();
  };
}
