import path from 'node:path';
import { readCsv } from '../../lib/csv';
import { config } from '../../config/env';

const FILE = path.join(config.dataDir, 'markdown_outputs.csv');
const HEADERS = ['jobId', 'markdownId', 'path', 'createdAt'] as const;

export type MarkdownRecord = {
  jobId: string;
  markdownId: string;
  path: string;
  createdAt: string;
};

export async function listAllMarkdowns(): Promise<MarkdownRecord[]> {
  const rows = await readCsv(FILE, [...HEADERS]);
  return rows.map(r => ({
    jobId: r.jobId,
    markdownId: r.markdownId,
    path: r.path,
    createdAt: r.createdAt,
  }));
}

export async function getMarkdownById(markdownId: string): Promise<MarkdownRecord | undefined> {
  const all = await listAllMarkdowns();
  return all.find(m => m.markdownId === markdownId);
}
