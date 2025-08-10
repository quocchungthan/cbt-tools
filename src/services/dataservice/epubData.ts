import path from 'node:path';
import { appendCsvRow, readCsv } from '../../lib/csv';
import { config } from '../../config/env';

const FILE = path.join(config.dataDir, 'epub_jobs.csv');
const HEADERS = ['jobId', 'inputs(json)', 'status', 'outputPath', 'createdAt'] as const;

export type EpubJob = {
  jobId: string;
  inputs: string[];
  status: 'queued'|'running'|'succeeded'|'failed';
  outputPath?: string;
  createdAt: string;
};

export async function addEpub(job: EpubJob): Promise<void> {
  await appendCsvRow(FILE, [...HEADERS], {
    jobId: job.jobId,
    'inputs(json)': JSON.stringify(job.inputs),
    status: job.status,
    outputPath: job.outputPath ?? '',
    createdAt: job.createdAt,
  } as any);
}

export async function listEpub(): Promise<EpubJob[]> {
  const rows = await readCsv(FILE, [...HEADERS]);
  return rows.map(r => ({
    jobId: r.jobId,
    inputs: JSON.parse(r['inputs(json)'] || '[]'),
    status: r.status as EpubJob['status'],
    outputPath: r.outputPath || undefined,
    createdAt: r.createdAt,
  }));
}