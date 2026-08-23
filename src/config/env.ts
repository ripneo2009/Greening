import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  AI_API_KEY: z.string().optional(),
  AI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
  AI_MODEL: z.string().default('gpt-4.1-mini'),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  MAX_IMAGE_BYTES: z.coerce.number().int().positive().default(5_242_880),
  S3_ENDPOINT: z.string().url().optional().or(z.literal('')),
  S3_REGION: z.string().default('ap-northeast-2'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional().or(z.literal(''))
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`환경변수 오류: ${parsed.error.message}`);
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGINS.split(',').map((v) => v.trim()).filter(Boolean);
