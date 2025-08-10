import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { validate } from '../middleware/validate';
import { addDownload, addResult, addSearch, listDownloads, listResults, listSearches } from '../services/dataservice/apiPoweredSearchData';
import { paginate } from '../lib/paging';

export const apiSearchRouter = Router();

/**
 * @openapi
 * /api-powered-search-file/search:
 *   post:
 *     tags: [api-powered-search-file]
 *     summary: Start API-powered book file search
 *     responses:
 *       201:
 *         description: Created
 * /api-powered-search-file/searches:
 *   get:
 *     tags: [api-powered-search-file]
 *     summary: List searches
 *     responses:
 *       200:
 *         description: List
 * /api-powered-search-file/searches/{searchId}:
 *   get:
 *     tags: [api-powered-search-file]
 *     summary: Get search by id
 *     parameters:
 *       - in: path
 *         name: searchId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Search
 *       404:
 *         description: Not found
 * /api-powered-search-file/results:
 *   get:
 *     tags: [api-powered-search-file]
 *     summary: List search results
 *     parameters:
 *       - in: query
 *         name: searchId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List
 * /api-powered-search-file/downloads:
 *   get:
 *     tags: [api-powered-search-file]
 *     summary: List downloads
 *     responses:
 *       200:
 *         description: List
 *   post:
 *     tags: [api-powered-search-file]
 *     summary: Create download task
 *     responses:
 *       201:
 *         description: Created
 * /api-powered-search-file/downloads/{downloadId}/file:
 *   get:
 *     tags: [api-powered-search-file]
 *     summary: Get download file
 *     parameters:
 *       - in: path
 *         name: downloadId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: File
 *       404:
 *         description: Not found
 */
const createBody = z.object({ bookName: z.string().optional(), orderId: z.string().optional(), requestedLangs: z.array(z.enum(['en','vi'])).optional(), maxResults: z.number().int().min(1).max(50).optional() });

apiSearchRouter.post('/api-powered-search-file/search', validate({ body: createBody }), async (req, res, next) => {
  try {
    const searchId = uuidv4();
    const query = req.body.bookName || (req.body.orderId ? `Order ${req.body.orderId}` : undefined);
    if (!query) return res.status(400).json({ error: 'BadRequest', message: 'No query derivable' });
    const requestedLangs = req.body.requestedLangs ?? ['en','vi'];
    const maxResults = req.body.maxResults ?? 10;
    const search = { searchId, query, source: req.body.orderId ? 'order' as const : 'manual' as const, requestedLangs, maxResults, status: 'queued' as const, createdAt: new Date().toISOString() };
    await addSearch(search);
    // Stub discovery: add a couple of results
    for (let i = 1; i <= Math.min(3, maxResults); i++) {
      await addResult({ resultId: uuidv4(), searchId, title: `Book ${i}`, url: `https://example.com/book-${i}.pdf`, fileType: 'pdf', language: i % 2 === 0 ? 'vi' : 'en', isFree: i % 2 === 1, priceCents: i % 2 === 1 ? undefined : i * 100, rank: i, discoveredAt: new Date().toISOString() });
    }
    res.status(201).json(search);
  } catch (e) { next(e); }
});

apiSearchRouter.get('/api-powered-search-file/searches', async (req, res, next) => {
  try {
    const all = await listSearches();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

apiSearchRouter.get('/api-powered-search-file/searches/:searchId', async (req, res, next) => {
  try {
    const all = await listSearches();
    const one = all.find(s => s.searchId === req.params.searchId);
    if (!one) return res.status(404).json({ error: 'NotFound', message: 'Search not found' });
    res.json(one);
  } catch (e) { next(e); }
});

apiSearchRouter.get('/api-powered-search-file/results', async (req, res, next) => {
  try {
    const searchId = req.query.searchId;
    if (typeof searchId !== 'string' || !searchId) return res.status(400).json({ error: 'BadRequest', message: 'searchId is required' });
    const all = await listResults(searchId);
    const envelope = paginate(all, req.query as any, 'rank' as any);
    res.json(envelope);
  } catch (e) { next(e); }
});

const dlBody = z.object({ resultId: z.string() });

apiSearchRouter.post('/api-powered-search-file/downloads', validate({ body: dlBody }), async (req, res, next) => {
  try {
    const downloadId = uuidv4();
    const dir = path.join('database', 'search_downloads', downloadId);
    await fs.mkdir(dir, { recursive: true });
    const filename = `${downloadId}.pdf`;
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, 'PDF bytes');
    const record = { downloadId, resultId: req.body.resultId, filename, path: filePath, mime: 'application/pdf', size: 9, createdAt: new Date().toISOString() };
    await addDownload(record);
    res.status(201).json(record);
  } catch (e) { next(e); }
});

apiSearchRouter.get('/api-powered-search-file/downloads', async (req, res, next) => {
  try {
    const searchId = typeof req.query.searchId === 'string' ? req.query.searchId : undefined;
    const all = await listDownloads(searchId);
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

apiSearchRouter.get('/api-powered-search-file/downloads/:downloadId/file', async (req, res, next) => {
  try {
    const all = await listDownloads();
    const d = all.find(x => x.downloadId === req.params.downloadId);
    if (!d) return res.status(404).json({ error: 'NotFound', message: 'Download not found' });
    res.setHeader('Content-Disposition', `attachment; filename=\"${d.filename}\"`);
    res.sendFile(path.resolve(d.path));
  } catch (e) { next(e); }
});