import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { config } from '../config/env';
import { addUpload, getUploadById, listAllUploads } from '../services/dataservice/uploadsData';
import { paginate } from '../lib/paging';
import { ApiError } from '../lib/errors';
import mime from 'mime-types';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadRouter = Router();

/**
 * @openapi
 * /upload/:
 *   post:
 *     tags: [upload]
 *     summary: Upload file
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 *   get:
 *     tags: [upload]
 *     summary: List uploads
 *     responses:
 *       200:
 *         description: List
 * /upload/{id}:
 *   get:
 *     tags: [upload]
 *     summary: Get upload by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upload
 *       404:
 *         description: Not found
 */
uploadRouter.post('/upload/', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) throw new ApiError(400, 'No file provided');
    const supported = config.fileSupported;
    const originalExt = path.extname(file.originalname).toLowerCase();
    if (supported && originalExt !== supported) {
      throw new ApiError(400, `Unsupported file type. Only ${supported} is allowed.`);
    }
    const id = uuidv4();
    const dir = path.join(config.dataDir, 'uploads', id);
    await fs.mkdir(dir, { recursive: true });
    const destPath = path.join(dir, file.originalname);
    await fs.writeFile(destPath, file.buffer);
    const record = {
      id,
      filename: file.originalname,
      originalPath: destPath,
      mime: file.mimetype || (mime.lookup(file.originalname) || 'application/octet-stream'),
      size: file.size,
      createdAt: new Date().toISOString(),
    };
    await addUpload(record);
    res.status(201).json(record);
  } catch (e) { next(e); }
});

uploadRouter.get('/upload/', async (req, res, next) => {
  try {
    const all = await listAllUploads();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

uploadRouter.get('/upload/:id', async (req, res, next) => {
  try {
    const rec = await getUploadById(req.params.id);
    if (!rec) throw new ApiError(404, 'Upload not found');
    res.json(rec);
  } catch (e) { next(e); }
});