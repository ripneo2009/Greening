import crypto from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

const configured = Boolean(env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_PUBLIC_BASE_URL);
const client = configured ? new S3Client({ region: env.S3_REGION, endpoint: env.S3_ENDPOINT || undefined, forcePathStyle: Boolean(env.S3_ENDPOINT), credentials: { accessKeyId: env.S3_ACCESS_KEY_ID!, secretAccessKey: env.S3_SECRET_ACCESS_KEY! } }) : null;
export async function uploadImage(buffer: Buffer, mime: string, folder: string) {
  if (!client) throw new AppError(503, 'STORAGE_NOT_CONFIGURED', '이미지 저장소가 설정되지 않았습니다.');
  const ext = mime === 'image/png' ? 'png' : 'jpg';
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;
  await client.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: buffer, ContentType: mime, CacheControl: 'public,max-age=31536000,immutable' }));
  return `${env.S3_PUBLIC_BASE_URL!.replace(/\/$/, '')}/${key}`;
}
