import { Router } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import { query, transaction } from '../database/pool.js';
import { asyncHandler } from '../lib/async-handler.js';
import { AppError } from '../lib/errors.js';
import { accessToken, hashToken, refreshToken, verifyRefresh } from '../lib/tokens.js';
import { validate } from '../lib/validation.js';
import { env } from '../config/env.js';
import type { JwtPayload } from 'jsonwebtoken';

const router = Router();
const credentials = z.object({ body:z.object({ email:z.email().transform(v=>v.toLowerCase()), password:z.string().min(10).max(128) }), params:z.object({}), query:z.object({}) });
router.post('/register', validate(credentials.extend({ body:credentials.shape.body.extend({ displayName:z.string().trim().min(2).max(40) }) })), asyncHandler(async(req,res)=>{
  const {email,password,displayName}=req.body; const hash=await argon2.hash(password,{type:argon2.argon2id});
  try { const result=await query<{id:string;email:string;display_name:string;role:string}>('INSERT INTO users(email,password_hash,display_name) VALUES($1,$2,$3) RETURNING id,email,display_name,role',[email,hash,displayName]); res.status(201).json({user:result.rows[0]}); }
  catch(e: any){ if(e.code==='23505') throw new AppError(409,'EMAIL_EXISTS','이미 가입된 이메일입니다.'); throw e; }
}));
router.post('/login', validate(credentials), asyncHandler(async(req,res)=>{
  const result=await query<{id:string;email:string;display_name:string;role:string;password_hash:string}>('SELECT id,email,display_name,role,password_hash FROM users WHERE email=$1',[req.body.email]);
  const user=result.rows[0]; if(!user || !await argon2.verify(user.password_hash,req.body.password)) throw new AppError(401,'INVALID_CREDENTIALS','이메일 또는 비밀번호가 올바르지 않습니다.');
  const access=accessToken(user), refresh=refreshToken(user); await query('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,now()+($3 * interval \'1 day\'))',[user.id,hashToken(refresh),env.REFRESH_TOKEN_TTL_DAYS]);
  res.json({accessToken:access,refreshToken:refresh,user:{id:user.id,email:user.email,displayName:user.display_name,role:user.role}});
}));
router.post('/refresh', asyncHandler(async(req,res)=>{
  const token=z.object({refreshToken:z.string()}).parse(req.body).refreshToken; let payload:JwtPayload;
  try { payload=verifyRefresh(token) as JwtPayload; } catch { throw new AppError(401,'INVALID_REFRESH_TOKEN','다시 로그인해주세요.'); }
  if(!payload.sub || payload.kind!=='refresh') throw new AppError(401,'INVALID_REFRESH_TOKEN','다시 로그인해주세요.');
  const found=await query<{role:string}>('SELECT u.role FROM refresh_tokens r JOIN users u ON u.id=r.user_id WHERE r.user_id=$1 AND r.token_hash=$2 AND r.revoked_at IS NULL AND r.expires_at>now()',[payload.sub,hashToken(token)]);
  if(!found.rows[0]) throw new AppError(401,'INVALID_REFRESH_TOKEN','다시 로그인해주세요.');
  const next=refreshToken({id:payload.sub,role:found.rows[0].role}); await transaction(async c=>{await c.query('UPDATE refresh_tokens SET revoked_at=now() WHERE token_hash=$1',[hashToken(token)]);await c.query('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,now()+($3 * interval \'1 day\'))',[payload.sub,hashToken(next),env.REFRESH_TOKEN_TTL_DAYS]);});
  res.json({accessToken:accessToken({id:payload.sub,role:found.rows[0].role}),refreshToken:next});
}));
export default router;
