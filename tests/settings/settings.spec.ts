import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createTestApp } from '../utils/testApp';

describe('settings', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'db-'));
  const app = createTestApp(tmp);
  afterAll(() => rmSync(tmp, { recursive: true, force: true }));

  it('GET returns defaults then PUT persists', async () => {
    let res = await request(app).get('/api/settings/');
    expect(res.status).toBe(200);
    expect(res.body.fileSupported).toBeDefined();
    res = await request(app).put('/api/settings/').send({ fileSupported: '.pdf', openAiModel: 'gpt-4.1' });
    expect(res.status).toBe(200);
    expect(res.body.openAiModel).toBe('gpt-4.1');
    res = await request(app).get('/api/settings/');
    expect(res.body.openAiModel).toBe('gpt-4.1');
  });
});
