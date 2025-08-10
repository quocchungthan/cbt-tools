import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { validate } from '../middleware/validate';
import { addCompose, listCompose } from '../services/dataservice/composeData';
import { paginate } from '../lib/paging';

export const composeRouter = Router();

/**
 * @openapi
 * /compose/jobs:
 *   post:
 *     tags: [compose]
 *     summary: Create compose job
 *     responses:
 *       201:
 *         description: Created
 *   get:
 *     tags: [compose]
 *     summary: List compose jobs
 *     responses:
 *       200:
 *         description: List
 * /compose/jobs/{id}:
 *   get:
 *     tags: [compose]
 *     summary: Get compose job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job
 *       404:
 *         description: Not found
 * /compose/markdowns:
 *   get:
 *     tags: [compose]
 *     summary: List composed markdowns
 *     responses:
 *       200:
 *         description: List
 */
const postBody = z.object({
  inputMarkdownIds: z.array(z.string()),
  format: z.enum(['side-by-side','paragraph-by-paragraph','sentence-by-sentence','translated-only']),
});

composeRouter.post('/compose/jobs', validate({ body: postBody }), async (req, res, next) => {
  try {
    const jobId = uuidv4();
    const dir = path.join('database', 'markdown_composed', jobId);
    await fs.mkdir(dir, { recursive: true });
    const outputPath = path.join(dir, 'output.md');
    await fs.writeFile(outputPath, `# Composed ${req.body.inputMarkdownIds.join(', ')}\n`);
    const job = { jobId, inputs: req.body.inputMarkdownIds, format: req.body.format, status: 'succeeded' as const, outputPath, createdAt: new Date().toISOString() };
    await addCompose(job);
    res.status(201).json(job);
  } catch (e) { next(e); }
});

composeRouter.get('/compose/jobs', async (req, res, next) => {
  try {
    const all = await listCompose();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

composeRouter.get('/compose/jobs/:id', async (req, res, next) => {
  try {
    const all = await listCompose();
    const job = all.find(j => j.jobId === req.params.id);
    if (!job) return res.status(404).json({ error: 'NotFound', message: 'Compose job not found' });
    res.json(job);
  } catch (e) { next(e); }
});

composeRouter.get('/compose/markdowns', async (req, res, next) => {
  try {
    const all = await listCompose();
    const succeeded = all.filter(j => j.status === 'succeeded' && j.outputPath);
    const items = succeeded.map(j => ({ jobId: j.jobId, path: j.outputPath!, createdAt: j.createdAt }));
    const envelope = paginate(items, req.query as any, 'createdAt' as any);
    res.json(envelope);
  } catch (e) { next(e); }
});