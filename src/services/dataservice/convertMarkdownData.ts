import path from 'node:path';
import { appendCsvRow, readCsv } from '../../lib/csv';
import { config } from '../../config/env';
import { getUploadById } from './uploadsData';

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

// Helper to get the file path for an uploaded PDF by uploadId, using uploadsData
export async function getUploadFilePath(uploadId: string): Promise<string> {
  const upload = await getUploadById(uploadId);
  if (!upload) throw new Error('Upload not found for id: ' + uploadId);
  // Prefer originalPath if available, else fallback to uploads dir
  if (upload.originalPath) return upload.originalPath;
  const uploadsDir = path.join(config.dataDir, 'uploads');
  return path.join(uploadsDir, upload.filename);
}

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

// Update a job by jobId with partial fields (status, progress, error, etc)
export async function updateJob(jobId: string, updates: Partial<Omit<ConvertJob, 'jobId' | 'uploadId' | 'createdAt'>> & { error?: string }): Promise<void> {
  const jobs = await listJobs();
  const idx = jobs.findIndex(j => j.jobId === jobId);
  if (idx === -1) return;
  const job = jobs[idx];
  // Merge updates
  const updatedJob = { ...job, ...updates };
  // If error, set status to 'failed' and add error message to command
  if (updates.error) {
    updatedJob.status = 'failed';
    updatedJob.command = (job.command ? job.command + ' | ' : '') + '[ERROR] ' + updates.error;
  }
  // Rewrite all jobs
  const { writeFile } = await import('node:fs/promises');
  const csvRows = [JOB_HEADERS.join(','), ...jobs.map((j, i) => {
    const j2 = i === idx ? updatedJob : j;
    return [j2.jobId, j2.uploadId, j2.command ?? '', j2.status, String(j2.progress), j2.createdAt].join(',');
  })];
  await writeFile(JOB_FILE, csvRows.join('\n'), 'utf8');
}