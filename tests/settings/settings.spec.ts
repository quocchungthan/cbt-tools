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

  it.skip('PUT accepts dropdownOptions keys at root and persists', async () => {
    const body = {
      formatOptions: ["pdf"],
      supportedLanguages: ["en", "vi"],
      translateStrategy: ["sentence-by-sentence", "full-book-at-once"]
    };
    const res = await request(app).put('/api/settings/').send(body);
    if (res.status !== 200) {
      // Print the error and response for debugging
      // eslint-disable-next-line no-console
      console.error('PUT /api/settings/ failed:', res.status, res.body, res.text);
    }
    expect(res.status).toBe(200);
    expect(res.body.formatOptions).toEqual(["pdf"]);
    expect(res.body.supportedLanguages).toEqual(["en", "vi"]);
    expect(res.body.translateStrategy).toEqual(["sentence-by-sentence", "full-book-at-once"]);
    // Confirm persisted
    const getRes = await request(app).get('/api/settings/');
    if (getRes.status !== 200) {
      // eslint-disable-next-line no-console
      console.error('GET /api/settings/ failed:', getRes.status, getRes.body, getRes.text);
    }
    expect(getRes.body.formatOptions).toEqual(["pdf"]);
    expect(getRes.body.supportedLanguages).toEqual(["en", "vi"]);
    expect(getRes.body.translateStrategy).toEqual(["sentence-by-sentence", "full-book-at-once"]);
  });

  it('PUT accepts dropdownOptions as nested object and persists', async () => {
    const body = {
      dropdownOptions: {
        formatOptions: ["pdf"],
        supportedLanguages: ["en", "vi"],
        translateStrategy: ["sentence-by-sentence", "full-book-at-once"]
      }
    };
    const res = await request(app).put('/api/settings/').send(body);
    if (res.status !== 200) {
      console.error('PUT /api/settings/ (dropdownOptions) failed:', res.status, res.body, res.text);
    }
    expect(res.status).toBe(200);
    expect(res.body.dropdownOptions).toBeDefined();
    expect(res.body.dropdownOptions.formatOptions).toEqual(["pdf"]);
    expect(res.body.dropdownOptions.supportedLanguages).toEqual(["en", "vi"]);
    expect(res.body.dropdownOptions.translateStrategy).toEqual(["sentence-by-sentence", "full-book-at-once"]);
    // Confirm persisted
    const getRes = await request(app).get('/api/settings/');
    if (getRes.status !== 200) {
      console.error('GET /api/settings/ (dropdownOptions) failed:', getRes.status, getRes.body, getRes.text);
    }
    expect(getRes.body.dropdownOptions).toBeDefined();
    expect(getRes.body.dropdownOptions.formatOptions).toEqual(["pdf"]);
    expect(getRes.body.dropdownOptions.supportedLanguages).toEqual(["en", "vi"]);
    expect(getRes.body.dropdownOptions.translateStrategy).toEqual(["sentence-by-sentence", "full-book-at-once"]);
  });
});
