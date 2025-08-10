import { promises as fs } from 'node:fs';
import path from 'node:path';
import { config } from '../config/env';

export function dataPath(...segments: string[]): string {
  return path.join(config.dataDir, ...segments);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function atomicWriteFile(filePath: string, content: string | Buffer): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  const tempPath = filePath + '.tmp';
  await fs.writeFile(tempPath, content);
  await fs.rename(tempPath, filePath);
}