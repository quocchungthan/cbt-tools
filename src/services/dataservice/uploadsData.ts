import path from 'node:path';
import { readCsv, appendCsvRow } from '../../lib/csv';
import { config } from '../../config/env';
import { UploadRecord } from '../../models/upload';

const FILE = path.join(config.dataDir, 'uploads.csv');
const HEADERS = ['id', 'filename', 'originalPath', 'mime', 'size', 'createdAt'] as const;

export async function listAllUploads(): Promise<UploadRecord[]> {
  const rows = await readCsv(FILE, [...HEADERS]);
  return rows.map(r => ({
    id: r.id,
    filename: r.filename,
    originalPath: r.originalPath,
    mime: r.mime,
    size: Number(r.size || 0),
    createdAt: r.createdAt,
  }));
}

export async function getUploadById(id: string): Promise<UploadRecord | undefined> {
  const all = await listAllUploads();
  return all.find(u => u.id === id);
}

export async function addUpload(record: UploadRecord): Promise<void> {
  await appendCsvRow(FILE, [...HEADERS], {
    id: record.id,
    filename: record.filename,
    originalPath: record.originalPath,
    mime: record.mime,
    size: String(record.size),
    createdAt: record.createdAt,
  });
}