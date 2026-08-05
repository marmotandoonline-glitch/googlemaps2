import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export async function register(req: Request, res: Response) {
  const { agencyName, adminEmail, adminPassword, adminName } = req.body || {};
  if (!agencyName || !adminEmail || !adminPassword) return res.status(400).json({ error: 'agencyName, adminEmail and adminPassword are required' });

  // create agency
  const agency = await prisma.agency.create({ data: { name: agencyName } });

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const user = await prisma.user.create({ data: { email: adminEmail, name: adminName || 'Admin', passwordHash, role: 'ADMIN', agencyId: agency.id } });

  const token = jwt.sign({ userId: user.id, role: user.role, agencyId: agency.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, agencyId: user.agencyId } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id, role: user.role, agencyId: user.agencyId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, agencyId: user.agencyId } });
}

export async function me(req: Request, res: Response) {
  const userPayload = (req as any).user;
  if (!userPayload) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { id: userPayload.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, agencyId: user.agencyId });
}
