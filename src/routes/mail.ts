import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { validate } from '../middleware/validate';
import { addMailJob, listEmails, listMailJobs } from '../services/dataservice/mailData';
import { paginate } from '../lib/paging';

export const mailRouter = Router();

/**
 * @openapi
 * /send-mail/jobs:
 *   post:
 *     tags: [send-mail]
 *     summary: Create mail job
 *     responses:
 *       201:
 *         description: Created
 *   get:
 *     tags: [send-mail]
 *     summary: List mail jobs
 *     responses:
 *       200:
 *         description: List
 * /send-mail/emails:
 *   get:
 *     tags: [send-mail]
 *     summary: List email addresses
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List
 */
const postBody = z.object({ email: z.string().email(), template: z.enum(['thank-you','delay','book-ready']), epubPath: z.string().optional() });

mailRouter.post('/send-mail/jobs', validate({ body: postBody }), async (req, res, next) => {
  try {
    const jobId = uuidv4();
    const job = { jobId, email: req.body.email, template: req.body.template, epubPath: req.body.epubPath, status: 'queued' as const, createdAt: new Date().toISOString() };
    await addMailJob(job);
    res.status(201).json(job);
  } catch (e) { next(e); }
});

mailRouter.get('/send-mail/jobs', async (req, res, next) => {
  try {
    const all = await listMailJobs();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

mailRouter.get('/send-mail/emails', async (req, res, next) => {
  try {
    const all = await listEmails();
    const q = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : undefined;
    const filtered = q ? all.filter(e => e.email.toLowerCase().startsWith(q)) : all;
    const envelope = paginate(filtered, req.query as any, 'lastUsedAt' as any);
    res.json(envelope);
  } catch (e) { next(e); }
});