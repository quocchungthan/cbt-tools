import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createTestApp } from '../utils/testApp';

describe('health', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'db-'));
  const app = createTestApp(tmp);
  afterAll(() => rmSync(tmp, { recursive: true, force: true }));

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.time).toBe('string');
  });
});
