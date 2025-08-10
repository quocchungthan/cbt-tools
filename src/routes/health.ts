import { Router } from 'express';

export const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */
healthRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});