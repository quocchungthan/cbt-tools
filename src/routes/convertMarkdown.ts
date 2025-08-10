import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { validate } from '../middleware/validate';
import { addJob, getJob, listJobs, addMarkdownOutput, listMarkdownOutputs } from '../services/dataservice/convertMarkdownData';
import { paginate } from '../lib/paging';

export const convertMarkdownRouter = Router();

/**
 * @openapi
 * /convert-markdown/jobs:
 *   post:
 *     tags: [convert-markdown]
 *     summary: Create convert-markdown job
 *     responses:
 *       201:
 *         description: Job created
 *   get:
 *     tags: [convert-markdown]
 *     summary: List convert-markdown jobs
 *     responses:
 *       200:
 *         description: List
 * /convert-markdown/jobs/{jobId}:
 *   get:
 *     tags: [convert-markdown]
 *     summary: Get convert-markdown job
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job
 *       404:
 *         description: Not found
 * /convert-markdown/markdowns:
 *   get:
 *     tags: [convert-markdown]
 *     summary: List converted markdowns
 *     responses:
 *       200:
 *         description: List
 */
const postSchema = z.object({
  uploadId: z.string(),
  command: z.string().optional(),
  options: z.record(z.any()).optional(),
});

convertMarkdownRouter.post('/convert-markdown/jobs', validate({ body: postSchema }), async (req, res, next) => {
  try {
    const jobId = uuidv4();
    const job = { jobId, uploadId: req.body.uploadId, command: req.body.command, status: 'queued' as const, progress: 0, createdAt: new Date().toISOString() };
    await addJob(job);
    // Stub processing: create a markdown output file
    const markdownId = uuidv4();
    const dir = path.join('database', 'markdown', jobId);
    await fs.mkdir(dir, { recursive: true });
    const outputPath = path.join(dir, 'output.md');
    await fs.writeFile(outputPath, `# Converted from upload ${req.body.uploadId} at ${new Date().toISOString()}\n`);
    await addMarkdownOutput({ jobId, markdownId, path: outputPath, createdAt: new Date().toISOString() });
    res.status(201).json(job);
  } catch (e) { next(e); }
});

convertMarkdownRouter.get('/convert-markdown/jobs', async (req, res, next) => {
  try {
    const all = await listJobs();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

convertMarkdownRouter.get('/convert-markdown/jobs/:jobId', async (req, res, next) => {
  try {
    const job = await getJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'NotFound', message: 'Job not found' });
    res.json(job);
  } catch (e) { next(e); }
});

convertMarkdownRouter.get('/convert-markdown/markdowns', async (req, res, next) => {
  try {
    const all = await listMarkdownOutputs();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});