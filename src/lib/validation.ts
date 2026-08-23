import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from './errors.js';
export const validate = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) return next(new AppError(400, 'VALIDATION_ERROR', '입력값을 확인해주세요.', result.error.flatten()));
  const parsed = result.data as { body?: unknown; params?: Record<string, unknown>; query?: Record<string, unknown> };
  if (parsed.body !== undefined) req.body = parsed.body;
  if (parsed.params) Object.assign(req.params, parsed.params);
  if (parsed.query) Object.assign(req.query, parsed.query);
  next();
};
