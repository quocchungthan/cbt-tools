import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { validate } from '../middleware/validate';
import { addJob, getJob, listJobs, listMarkdownOutputs } from '../services/dataservice/convertMarkdownData';
import { paginate } from '../lib/paging';
import { pdf2markdownToolBaseUrl } from '../services/convertMarkdownBusiness';


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
 * /convert-markdown/ping:
 *   get:
 *     tags: [convert-markdown]
 *     summary: Health check for PDF2Markdown service
 *     description: Forwards to the PDF2Markdown tool's /ping endpoint and returns the exact response.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *       503:
 *         description: Service is starting or unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: starting
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
  options: z.record(z.string(), z.any()).optional(),
});

convertMarkdownRouter.post('/convert-markdown/jobs', validate({ body: postSchema }), async (req, res, next) => {
  try {
    const jobId = uuidv4();
    const job = { jobId, uploadId: req.body.uploadId, command: req.body.command, status: 'queued' as const, progress: 0, createdAt: new Date().toISOString() };
    await addJob(job);
    res.status(201).json(job);

    // Async processing: delegate to business service
    import('../services/convertMarkdownBusiness').then(({ processConvertMarkdownJob }) => {
      processConvertMarkdownJob({ jobId, uploadId: req.body.uploadId, command: req.body.command });
    });
  } catch (e) { next(e); }
});

// Ping route to forward to PDF2Markdown tool
convertMarkdownRouter.get('/convert-markdown/ping', async (req, res, next) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${pdf2markdownToolBaseUrl}/ping`);
    const contentType = response.headers.get('content-type') || '';
    res.status(response.status);
    if (contentType.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.type(contentType).send(text);
    }
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