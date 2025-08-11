import { Router } from 'express';
import { z } from 'zod';

import { v4 as uuidv4 } from 'uuid';
import { validate } from '../middleware/validate';
import { addTranslation, getTranslation, listSentences, listTranslations, initSentenceRows, upsertSentences } from '../services/dataservice/translateData';
import { paginate } from '../lib/paging';
import { getSettings } from '../services/dataservice/settingsData';

export const translateRouter = Router();

/**
 * @openapi
 * /translate/jobs:
 *   post:
 *     tags: [translate]
 *     summary: Create translation job
 *     responses:
 *       201:
 *         description: Created
 *   get:
 *     tags: [translate]
 *     summary: List translation jobs
 *     responses:
 *       200:
 *         description: List
 * /translate/jobs/{id}:
 *   get:
 *     tags: [translate]
 *     summary: Get translation job
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
 * /translate/markdowns:
 *   get:
 *     tags: [translate]
 *     summary: List translated markdowns
 *     responses:
 *       200:
 *         description: List
 * /translation-fine-tune/{translationId}:
 *   get:
 *     tags: [translation-fine-tune]
 *     summary: List sentence pairs
 *     parameters:
 *       - in: path
 *         name: translationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List
 *   put:
 *     tags: [translation-fine-tune]
 *     summary: Update sentence pairs
 *     parameters:
 *       - in: path
 *         name: translationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Updated
 */

// Dynamic validation using user settings
translateRouter.post('/translate/jobs', async (req, res, next) => {
  try {
    const settings = await getSettings();
    const langs = Array.isArray(settings.supportedLanguages) && settings.supportedLanguages.length > 0
      ? settings.supportedLanguages
      : ['en', 'vi'];
    const strategies = Array.isArray(settings.translateStrategy) && settings.translateStrategy.length > 0
      ? settings.translateStrategy
      : ['whole-file', 'sentence-by-sentence'];
    const postJob = z.object({
      sourceMarkdownId: z.string(),
      targetLang: z.enum(langs as [string, ...string[]]),
      strategy: z.enum(strategies as [string, ...string[]]),
    });
    postJob.parse(req.body);
    const translationId = uuidv4();
    const job = { translationId, sourceMarkdownId: req.body.sourceMarkdownId, targetLang: req.body.targetLang, strategy: req.body.strategy, status: 'queued' as const, createdAt: new Date().toISOString() };
    await addTranslation(job);
    if (job.strategy === 'sentence-by-sentence') {
      await initSentenceRows(translationId, Array.from({ length: 5 }, (_, i) => String(i + 1)));
    }
    res.status(201).json(job);
  } catch (e) { next(e); }
});

translateRouter.get('/translate/jobs', async (req, res, next) => {
  try {
    const all = await listTranslations();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

translateRouter.get('/translate/jobs/:id', async (req, res, next) => {
  try {
    const job = await getTranslation(req.params.id);
    if (!job) return res.status(404).json({ error: 'NotFound', message: 'Translation not found' });
    res.json(job);
  } catch (e) { next(e); }
});

translateRouter.get('/translate/markdowns', async (_req, res, next) => {
  try {
    const all = await listTranslations();
    const items = all.map(t => ({ translationId: t.translationId, sourceMarkdownId: t.sourceMarkdownId, targetLang: t.targetLang, path: `database/markdown_translated/${t.translationId}/output.md`, createdAt: t.createdAt }));
    res.json({ items, page: 1, pageSize: items.length, total: items.length, totalPages: 1 });
  } catch (e) { next(e); }
});

const tuneParams = z.object({ translationId: z.string() });
const tuneBody = z.array(z.object({ sentenceId: z.string(), translatedText: z.string() }));

translateRouter.get('/translation-fine-tune/:translationId', async (req, res, next) => {
  try {
    const rows = await listSentences(req.params.translationId);
    const envelope = { items: rows, page: 1, pageSize: rows.length, total: rows.length, totalPages: 1 };
    res.json(envelope);
  } catch (e) { next(e); }
});

translateRouter.put('/translation-fine-tune/:translationId', validate({ params: tuneParams, body: tuneBody }), async (req, res, next) => {
  try {
    const updated = await upsertSentences(req.params.translationId, req.body);
    res.json({ translationId: req.params.translationId, updated });
  } catch (e) { next(e); }
});