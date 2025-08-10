import path from 'node:path';
import { appendCsvRow, readCsv } from '../../lib/csv';
import { config } from '../../config/env';

const JOB_FILE = path.join(config.dataDir, 'convert_markdown_jobs.csv');
const JOB_HEADERS = ['jobId', 'uploadId', 'command', 'status', 'progress', 'createdAt'] as const;

const OUT_FILE = path.join(config.dataDir, 'markdown_outputs.csv');
const OUT_HEADERS = ['jobId', 'markdownId', 'path', 'createdAt'] as const;

export type ConvertJob = {
  jobId: string;
  uploadId: string;
  command?: string;
  status: 'queued'|'running'|'succeeded'|'failed';
  progress: number;
  createdAt: string;
};

export type MarkdownOutput = {
  jobId: string;
  markdownId: string;
  path: string;
  createdAt: string;
};

export async function addJob(job: ConvertJob): Promise<void> {
  await appendCsvRow(JOB_FILE, [...JOB_HEADERS], {
    jobId: job.jobId,
    uploadId: job.uploadId,
    command: job.command ?? '',
    status: job.status,
    progress: String(job.progress),
    createdAt: job.createdAt,
  });
}

export async function listJobs(): Promise<ConvertJob[]> {
  const rows = await readCsv(JOB_FILE, [...JOB_HEADERS]);
  return rows.map(r => ({
    jobId: r.jobId,
    uploadId: r.uploadId,
    command: r.command || undefined,
    status: (r.status as ConvertJob['status']) || 'queued',
    progress: Number(r.progress || 0),
    createdAt: r.createdAt,
  }));
}

export async function getJob(jobId: string): Promise<ConvertJob | undefined> {
  const all = await listJobs();
  return all.find(j => j.jobId === jobId);
}

export async function listMarkdownOutputs(): Promise<MarkdownOutput[]> {
  const rows = await readCsv(OUT_FILE, [...OUT_HEADERS]);
  return rows.map(r => ({ jobId: r.jobId, markdownId: r.markdownId, path: r.path, createdAt: r.createdAt }));
}

export async function addMarkdownOutput(row: MarkdownOutput): Promise<void> {
  await appendCsvRow(OUT_FILE, [...OUT_HEADERS], {
    jobId: row.jobId,
    markdownId: row.markdownId,
    path: row.path,
    createdAt: row.createdAt,
  });
}