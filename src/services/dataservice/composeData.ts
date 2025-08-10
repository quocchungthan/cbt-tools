import path from 'node:path';
import { appendCsvRow, readCsv } from '../../lib/csv';
import { config } from '../../config/env';

const FILE = path.join(config.dataDir, 'compose_jobs.csv');
const HEADERS = ['jobId', 'inputs(json)', 'format', 'status', 'outputPath', 'createdAt'] as const;

export type ComposeJob = {
  jobId: string;
  inputs: string[];
  format: 'side-by-side'|'paragraph-by-paragraph'|'sentence-by-sentence'|'translated-only';
  status: 'queued'|'running'|'succeeded'|'failed';
  outputPath?: string;
  createdAt: string;
};

export async function addCompose(job: ComposeJob): Promise<void> {
  await appendCsvRow(FILE, [...HEADERS], {
    jobId: job.jobId,
    'inputs(json)': JSON.stringify(job.inputs),
    format: job.format,
    status: job.status,
    outputPath: job.outputPath ?? '',
    createdAt: job.createdAt,
  } as any);
}

export async function listCompose(): Promise<ComposeJob[]> {
  const rows = await readCsv(FILE, [...HEADERS]);
  return rows.map(r => ({
    jobId: r.jobId,
    inputs: JSON.parse(r['inputs(json)'] || '[]'),
    format: r.format as ComposeJob['format'],
    status: r.status as ComposeJob['status'],
    outputPath: r.outputPath || undefined,
    createdAt: r.createdAt,
  }));
}