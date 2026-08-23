import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';
import { env } from '../config/env.js';
export const notFoundHandler: RequestHandler = (_req, _res, next) => next(new AppError(404, 'ROUTE_NOT_FOUND', 'API 경로를 찾을 수 없습니다.'));
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof multer.MulterError) error = new AppError(400, 'UPLOAD_ERROR', error.message);
  if (error instanceof ZodError) error = new AppError(400, 'VALIDATION_ERROR', '입력값을 확인해주세요.', error.flatten());
  const known = error instanceof AppError;
  req.log?.error({ err: error }, 'request failed');
  res.status(known ? error.status : 500).json({ error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : '서버 오류가 발생했습니다.', ...(known && error.details ? { details: error.details } : {}), ...(env.NODE_ENV === 'development' && !known ? { debug: String(error) } : {}) } });
};
