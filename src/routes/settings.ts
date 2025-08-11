import { Router } from 'express';
import { z } from 'zod';
import { getSettings, saveSettings } from '../services/dataservice/settingsData';
import { validate } from '../middleware/validate';

export const settingsRouter = Router();

/**
 * @openapi
 * /settings/:
 *   get:
 *     tags: [settings]
 *     summary: Get settings
 *     responses:
 *       200:
 *         description: Settings
 *   put:
 *     tags: [settings]
 *     summary: Update settings
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Settings
 */
settingsRouter.get('/settings/', async (_req, res, next) => {
  try {
    const data = await getSettings();
    res.json(data);
  } catch (e) { next(e); }
});

const putSchema = z.object({
  fileSupported: z.string().optional(),
  openAiKey: z.string().optional(),
  openAiModel: z.string().optional(),
  openAiProjectId: z.string().optional(),
  openAiOrgId: z.string().optional(),
  sheetApiKey: z.string().optional(),
  sheetName: z.string().optional(),
  sheetId: z.string().optional(),
  dropdownOptions: z.record(z.string(), z.array(z.string())).optional(),
});

settingsRouter.put('/settings/', validate({ body: putSchema }), async (req, res, next) => {
  try {
    const saved = await saveSettings(req.body);
    res.json(saved);
  } catch (e) { next(e); }
});