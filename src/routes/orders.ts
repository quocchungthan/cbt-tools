import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { validate } from '../middleware/validate';
import { addOrder, deleteOrder, getOrder, listOrders, updateOrder } from '../services/dataservice/ordersData';
import { paginate } from '../lib/paging';

export const ordersRouter = Router();

/**
 * @openapi
 * /order-management/orders:
 *   get:
 *     tags: [order-management]
 *     summary: List orders
 *     responses:
 *       200:
 *         description: List
 *   post:
 *     tags: [order-management]
 *     summary: Create order
 *     responses:
 *       201:
 *         description: Created
 * /order-management/orders/{orderId}:
 *   get:
 *     tags: [order-management]
 *     summary: Get order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order
 *       404:
 *         description: Not found
 *   put:
 *     tags: [order-management]
 *     summary: Update order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [order-management]
 *     summary: Delete order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
const createBody = z.object({ bookName: z.string(), author: z.string(), format: z.string(), userEmail: z.string().email().optional(), originalFileId: z.string().optional(), translatedFileId: z.string().optional() });

ordersRouter.get('/order-management/orders', async (req, res, next) => {
  try {
    const all = await listOrders();
    const envelope = paginate(all, req.query as any, 'createdAt');
    res.json(envelope);
  } catch (e) { next(e); }
});

ordersRouter.get('/order-management/orders/:orderId', async (req, res, next) => {
  try {
    const order = await getOrder(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'NotFound', message: 'Order not found' });
    res.json(order);
  } catch (e) { next(e); }
});

ordersRouter.post('/order-management/orders', validate({ body: createBody }), async (req, res, next) => {
  try {
    const orderId = uuidv4();
    const order = { orderId, ...req.body, createdAt: new Date().toISOString() };
    await addOrder(order);
    res.status(201).json(order);
  } catch (e) { next(e); }
});

ordersRouter.put('/order-management/orders/:orderId', async (req, res, next) => {
  try {
    const updated = await updateOrder(req.params.orderId, req.body);
    if (!updated) return res.status(404).json({ error: 'NotFound', message: 'Order not found' });
    res.json(updated);
  } catch (e) { next(e); }
});

ordersRouter.delete('/order-management/orders/:orderId', async (req, res, next) => {
  try {
    const ok = await deleteOrder(req.params.orderId);
    if (!ok) return res.status(404).json({ error: 'NotFound', message: 'Order not found' });
    res.json({ deleted: true });
  } catch (e) { next(e); }
});