import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { validate } from '../middleware/validate';
import { addShelf, addShipment, deletePartner, deleteShelf, listPartners, listShipments, listShelves, upsertPartner } from '../services/dataservice/thirdPartiesData';
import { paginate } from '../lib/paging';

export const thirdPartiesRouter = Router();

/**
 * @openapi
 * /third-parites/partners:
 *   get:
 *     tags: [third-parites]
 *     summary: List partners
 *     responses:
 *       200:
 *         description: List
 *   post:
 *     tags: [third-parites]
 *     summary: Create partner
 *     responses:
 *       201:
 *         description: Created
 * /third-parites/partners/{partnerId}:
 *   put:
 *     tags: [third-parites]
 *     summary: Update partner
 *     parameters:
 *       - in: path
 *         name: partnerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [third-parites]
 *     summary: Delete partner
 *     parameters:
 *       - in: path
 *         name: partnerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 * /third-parites/bookshelf:
 *   get:
 *     tags: [third-parites]
 *     summary: List bookshelf entries
 *     responses:
 *       200:
 *         description: List
 *   post:
 *     tags: [third-parites]
 *     summary: Create bookshelf entry
 *     responses:
 *       201:
 *         description: Created
 * /third-parites/bookshelf/{shelfId}:
 *   delete:
 *     tags: [third-parites]
 *     summary: Delete bookshelf entry
 *     parameters:
 *       - in: path
 *         name: shelfId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 * /third-parites/shipments:
 *   get:
 *     tags: [third-parites]
 *     summary: List shipments
 *     responses:
 *       200:
 *         description: List
 *   post:
 *     tags: [third-parites]
 *     summary: Create shipment
 *     responses:
 *       201:
 *         description: Created
 */
thirdPartiesRouter.get('/third-parites/partners', async (req, res, next) => {
  try {
    const all = await listPartners();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

const partnerBody = z.object({ type: z.enum(['print','ads','bookshelf','shipping']), name: z.string(), endpoint: z.string().optional(), config: z.record(z.string(), z.any()).optional(), contact: z.string().optional() });

thirdPartiesRouter.post('/third-parites/partners', validate({ body: partnerBody }), async (req, res, next) => {
  try {
    const partner = { partnerId: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
    await upsertPartner(partner);
    res.status(201).json(partner);
  } catch (e) { next(e); }
});

thirdPartiesRouter.put('/third-parites/partners/:partnerId', validate({ body: partnerBody.partial() }), async (req, res, next) => {
  try {
    const existing = (await listPartners()).find(p => p.partnerId === req.params.partnerId);
    if (!existing) return res.status(404).json({ error: 'NotFound', message: 'Partner not found' });
    const updated = { ...existing, ...req.body };
    await upsertPartner(updated);
    res.json(updated);
  } catch (e) { next(e); }
});

thirdPartiesRouter.delete('/third-parites/partners/:partnerId', async (req, res, next) => {
  try {
    const ok = await deletePartner(req.params.partnerId);
    if (!ok) return res.status(404).json({ error: 'NotFound', message: 'Partner not found' });
    res.json({ deleted: true });
  } catch (e) { next(e); }
});

thirdPartiesRouter.get('/third-parites/bookshelf', async (req, res, next) => {
  try {
    const all = await listShelves();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

const shelfBody = z.object({ title: z.string(), composedMarkdownPath: z.string(), epubPath: z.string().optional(), orderId: z.string().optional() });

thirdPartiesRouter.post('/third-parites/bookshelf', validate({ body: shelfBody }), async (req, res, next) => {
  try {
    const shelf = { shelfId: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
    await addShelf(shelf);
    res.status(201).json(shelf);
  } catch (e) { next(e); }
});

thirdPartiesRouter.delete('/third-parites/bookshelf/:shelfId', async (req, res, next) => {
  try {
    const ok = await deleteShelf(req.params.shelfId);
    if (!ok) return res.status(404).json({ error: 'NotFound', message: 'Shelf not found' });
    res.json({ deleted: true });
  } catch (e) { next(e); }
});

thirdPartiesRouter.get('/third-parites/shipments', async (req, res, next) => {
  try {
    const all = await listShipments();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

const shipBody = z.object({ orderId: z.string(), partnerId: z.string() });

thirdPartiesRouter.post('/third-parites/shipments', validate({ body: shipBody }), async (req, res, next) => {
  try {
    const shipment = { shipmentId: uuidv4(), status: 'created', createdAt: new Date().toISOString(), trackingNumber: undefined, ...req.body };
    await addShipment(shipment);
    res.status(201).json(shipment);
  } catch (e) { next(e); }
});