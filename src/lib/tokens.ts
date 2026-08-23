import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
export function accessToken(user: { id: string; role: string }) {
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, { subject: user.id, expiresIn: env.ACCESS_TOKEN_TTL as SignOptions['expiresIn'], issuer: 'greening-api', audience: 'greening-web' });
}
export function refreshToken(user: { id: string; role: string }) {
  return jwt.sign({ role: user.role, kind: 'refresh' }, env.JWT_REFRESH_SECRET, { subject: user.id, expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`, issuer: 'greening-api', audience: 'greening-web' });
}
export function verifyAccess(token: string) { return jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: 'greening-api', audience: 'greening-web' }); }
export function verifyRefresh(token: string) { return jwt.verify(token, env.JWT_REFRESH_SECRET, { issuer: 'greening-api', audience: 'greening-web' }); }
