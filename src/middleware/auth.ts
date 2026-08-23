import type { RequestHandler } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../lib/errors.js';
import { verifyAccess } from '../lib/tokens.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const value = req.headers.authorization;
  if (!value?.startsWith('Bearer ')) return next(new AppError(401, 'UNAUTHORIZED', '로그인이 필요합니다.'));
  try {
    const payload = verifyAccess(value.slice(7)) as JwtPayload;
    if (!payload.sub || !payload.role) throw new Error();
    req.user = { id: payload.sub, role: payload.role }; next();
  } catch { next(new AppError(401, 'INVALID_TOKEN', '유효하지 않은 인증 토큰입니다.')); }
};
export const requireRole = (...roles: Array<'customer'|'partner'|'admin'>): RequestHandler => (req, _res, next) =>
  req.user && roles.includes(req.user.role) ? next() : next(new AppError(403, 'FORBIDDEN', '권한이 없습니다.'));
