import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { validate } from '../middleware/validate';
import { addEpub, listEpub } from '../services/dataservice/epubData';
import { paginate } from '../lib/paging';

export const epubRouter = Router();

/**
 * @openapi
 * /convert-to-epub/jobs:
 *   post:
 *     tags: [convert-to-epub]
 *     summary: Create EPUB job
 *     responses:
 *       201:
 *         description: Created
 *   get:
 *     tags: [convert-to-epub]
 *     summary: List EPUB jobs
 *     responses:
 *       200:
 *         description: List
 * /convert-to-epub/jobs/{id}:
 *   get:
 *     tags: [convert-to-epub]
 *     summary: Get EPUB job
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
 * /convert-to-epub/epubs:
 *   get:
 *     tags: [convert-to-epub]
 *     summary: List EPUB outputs
 *     responses:
 *       200:
 *         description: List
 */
const postBody = z.object({ inputMarkdownIds: z.array(z.string()) });

epubRouter.post('/convert-to-epub/jobs', validate({ body: postBody }), async (req, res, next) => {
  try {
    const jobId = uuidv4();
    const dir = path.join('database', 'epubs', jobId);
    await fs.mkdir(dir, { recursive: true });
    const outputPath = path.join(dir, 'output.epub');
    await fs.writeFile(outputPath, 'EPUB content');
    const job = { jobId, inputs: req.body.inputMarkdownIds, status: 'succeeded' as const, outputPath, createdAt: new Date().toISOString() };
    await addEpub(job);
    res.status(201).json(job);
  } catch (e) { next(e); }
});

epubRouter.get('/convert-to-epub/jobs', async (req, res, next) => {
  try {
    const all = await listEpub();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

epubRouter.get('/convert-to-epub/jobs/:id', async (req, res, next) => {
  try {
    const all = await listEpub();
    const job = all.find(j => j.jobId === req.params.id);
    if (!job) return res.status(404).json({ error: 'NotFound', message: 'Epub job not found' });
    res.json(job);
  } catch (e) { next(e); }
});

epubRouter.get('/convert-to-epub/epubs', async (req, res, next) => {
  try {
    const all = await listEpub();
    const items = all.filter(j => j.status === 'succeeded' && j.outputPath).map(j => ({ jobId: j.jobId, path: j.outputPath!, createdAt: j.createdAt }));
    const envelope = paginate(items, req.query as any, 'createdAt' as any);
    res.json(envelope);
  } catch (e) { next(e); }
});