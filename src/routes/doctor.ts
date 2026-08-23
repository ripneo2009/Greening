import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler.js';
import { chatWithPlantDoctor } from '../services/ai.js';

const router = Router();
const bodySchema = z.object({ messages: z.array(z.object({
  role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(1500),
})).min(1).max(12) });

router.post('/chat', asyncHandler(async (req, res) => {
  const { messages } = bodySchema.parse(req.body);
  res.json(await chatWithPlantDoctor(messages));
}));

export default router;
