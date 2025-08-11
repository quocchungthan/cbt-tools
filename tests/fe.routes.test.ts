import request from 'supertest';
import { createApp } from '../src/app';

describe('Frontend routes (Pug)', () => {
  const app = createApp();

  it('GET / renders home', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/CBT Tools/);
    expect(res.text).toMatch(/Swagger/);
  });

  it('GET /health renders page', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Health/);
  });

  it('GET /settings renders page', async () => {
    const res = await request(app).get('/settings');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Settings/);
  });

  it('GET /upload renders page', async () => {
    const res = await request(app).get('/upload');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Upload/);
  });
});