import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = String(auth).split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid Authorization header format' });
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: 'Invalid Authorization header schema' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // attach user info
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    (req as any).user = { userId: user.id, role: user.role, agencyId: user.agencyId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(role: 'ADMIN' | 'OPERATOR') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== role && user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
