import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createTestApp } from './utils/testApp';

describe('API: Compose, Orders, Third Parties', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'db-'));
  const app = createTestApp(tmp);
  afterAll(() => rmSync(tmp, { recursive: true, force: true }));

  it('GET /api/compose/jobs returns 200 and empty result by default', async () => {
    const res = await request(app).get('/api/compose/jobs');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body.items) || Array.isArray(res.body)).toBe(true);
    const items = Array.isArray(res.body.items) ? res.body.items : res.body;
    expect(items.length === 0).toBe(true);
  });

  it('GET /api/order-management/orders returns 200 and empty result by default', async () => {
    const res = await request(app).get('/api/order-management/orders');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body.items) || Array.isArray(res.body)).toBe(true);
    const items = Array.isArray(res.body.items) ? res.body.items : res.body;
    expect(items.length === 0).toBe(true);
  });

  it('GET /api/third-parites/partners returns 200 and empty result by default', async () => {
    const res = await request(app).get('/api/third-parites/partners');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body.items) || Array.isArray(res.body)).toBe(true);
    const items = Array.isArray(res.body.items) ? res.body.items : res.body;
    expect(items.length === 0).toBe(true);
  });
});
