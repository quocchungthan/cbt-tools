import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { addBreakdownRow, listBreakdown } from '../services/dataservice/contentBreakdownData';
import { paginate } from '../lib/paging';

export const contentBreakdownRouter = Router();

/**
 * @openapi
 * /content-breakdown/{markdownId}:
 *   post:
 *     tags: [content-breakdown]
 *     summary: Start content breakdown
 *     parameters:
 *       - in: path
 *         name: markdownId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Created
 *   get:
 *     tags: [content-breakdown]
 *     summary: List content breakdown rows
 *     parameters:
 *       - in: path
 *         name: markdownId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List
 */
const postParams = z.object({ markdownId: z.string() });

contentBreakdownRouter.post('/content-breakdown/:markdownId', validate({ params: postParams }), async (req, res, next) => {
  try {
    // Stub: create some rows
    for (let i = 1; i <= 5; i++) {
      await addBreakdownRow({
        markdownId: req.params.markdownId,
        chapterId: '1',
        paragraphId: String(i),
        sentenceId: `${i}-1`,
        text: `Sentence ${i}`,
        position: String(i),
        createdAt: new Date().toISOString(),
      });
    }
    res.status(201).json({ markdownId: req.params.markdownId, recordsCreated: 5 });
  } catch (e) { next(e); }
});

contentBreakdownRouter.get('/content-breakdown/:markdownId', validate({ params: postParams }), async (req, res, next) => {
  try {
    const all = await listBreakdown(req.params.markdownId);
    const envelope = paginate(all, req.query as any, 'position' as any);
    res.json(envelope);
  } catch (e) { next(e); }
});