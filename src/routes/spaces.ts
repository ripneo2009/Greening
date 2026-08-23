import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { z } from 'zod';
import { env } from '../config/env.js';
import { query } from '../database/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/async-handler.js';
import { AppError, notFound } from '../lib/errors.js';
import { analyzeRoom } from '../services/ai.js';
import { uploadImage } from '../services/storage.js';

const router=Router(); router.use(requireAuth);
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:env.MAX_IMAGE_BYTES,files:1},fileFilter:(_r,f,cb)=>cb(null,['image/jpeg','image/png','image/webp'].includes(f.mimetype))});
router.post('/',asyncHandler(async(req,res)=>{const b=z.object({name:z.string().min(1).max(80),temperatureC:z.number().min(-10).max(60).optional(),humidityPercent:z.number().min(0).max(100).optional(),lightLux:z.number().int().min(0).optional(),windowDirection:z.enum(['N','NE','E','SE','S','SW','W','NW']).optional(),lifestyle:z.record(z.string(),z.unknown()).default({})}).parse(req.body);const r=await query('INSERT INTO spaces(user_id,name,temperature_c,humidity_percent,light_lux,window_direction,lifestyle) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[req.user!.id,b.name,b.temperatureC,b.humidityPercent,b.lightLux,b.windowDirection,b.lifestyle]);res.status(201).json(r.rows[0]);}));
router.get('/',asyncHandler(async(req,res)=>{const r=await query('SELECT * FROM spaces WHERE user_id=$1 ORDER BY created_at DESC',[req.user!.id]);res.json({items:r.rows});}));
router.post('/:id/analyze',upload.single('image'),asyncHandler(async(req,res)=>{
  const id=z.uuid().parse(req.params.id); if(!req.file) throw new AppError(400,'IMAGE_REQUIRED','방 사진을 첨부해주세요.');
  const owned=await query('SELECT id FROM spaces WHERE id=$1 AND user_id=$2',[id,req.user!.id]); if(!owned.rowCount) throw notFound('공간을 찾을 수 없습니다.');
  const optimized=await sharp(req.file.buffer).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).jpeg({quality:82}).toBuffer();
  const [analysis,imageUrl]=await Promise.all([analyzeRoom(optimized,'image/jpeg'),uploadImage(optimized,'image/jpeg',`spaces/${req.user!.id}`)]);
  const r=await query('UPDATE spaces SET image_url=$1,ai_analysis=$2,analyzed_at=now() WHERE id=$3 RETURNING *',[imageUrl,analysis,id]);res.json(r.rows[0]);
}));
router.post('/:id/recommendations',asyncHandler(async(req,res)=>{
  const id=z.uuid().parse(req.params.id); const space=(await query<any>('SELECT * FROM spaces WHERE id=$1 AND user_id=$2',[id,req.user!.id])).rows[0]; if(!space) throw notFound('공간을 찾을 수 없습니다.');
  const light=space.light_lux ?? ({low:500,medium:3000,high:10000}[space.ai_analysis?.lightLevel as 'low'|'medium'|'high'] ?? null);
  const r=await query<any>(`SELECT p.*, LEAST(100, GREATEST(0, 100 - (CASE WHEN $1::numeric IS NULL OR $1 BETWEEN p.min_light_lux AND p.max_light_lux THEN 0 ELSE 30 END) - (CASE WHEN $2::numeric IS NULL OR $2 BETWEEN p.min_temperature_c AND p.max_temperature_c THEN 0 ELSE 25 END) - (p.difficulty-1)*5)) score FROM plants p WHERE active=true ORDER BY score DESC, difficulty ASC LIMIT 10`,[light,space.temperature_c]);
  await Promise.all(r.rows.map((p:any)=>query('INSERT INTO recommendations(user_id,space_id,plant_id,score,reasons) VALUES($1,$2,$3,$4,$5::jsonb) ON CONFLICT(space_id,plant_id) DO UPDATE SET score=excluded.score,reasons=excluded.reasons,created_at=now()',[req.user!.id,id,p.id,p.score,JSON.stringify([`공간 적합도 ${p.score}점`,...(space.ai_analysis?.plantTraits??[]).slice(0,2)])])));
  res.json({items:r.rows});
}));
export default router;
