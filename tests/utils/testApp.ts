import path from 'node:path';
import { createApp } from '../../src/app';

export function createTestApp(tmpDir: string) {
  process.env.DATA_DIR = path.resolve(tmpDir);
  process.env.NODE_ENV = 'test';
  const app = createApp();
  return app;
}
