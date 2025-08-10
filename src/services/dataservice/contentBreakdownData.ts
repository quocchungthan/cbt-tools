import path from 'node:path';
import { appendCsvRow, readCsv } from '../../lib/csv';
import { config } from '../../config/env';

const FILE = path.join(config.dataDir, 'breakdown.csv');
const HEADERS = ['markdownId', 'chapterId', 'paragraphId', 'sentenceId', 'text', 'position', 'createdAt'] as const;

export type BreakdownRow = {
  markdownId: string;
  chapterId: string;
  paragraphId: string;
  sentenceId: string;
  text: string;
  position: string;
  createdAt: string;
};

export async function addBreakdownRow(row: BreakdownRow): Promise<void> {
  await appendCsvRow(FILE, [...HEADERS], row as any);
}

export async function listBreakdown(markdownId?: string): Promise<BreakdownRow[]> {
  const rows = await readCsv(FILE, [...HEADERS]);
  const all = rows.map(r => ({
    markdownId: r.markdownId,
    chapterId: r.chapterId,
    paragraphId: r.paragraphId,
    sentenceId: r.sentenceId,
    text: r.text,
    position: r.position,
    createdAt: r.createdAt,
  }));
  return markdownId ? all.filter(r => r.markdownId === markdownId) : all;
}