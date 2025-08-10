import path from 'node:path';
import { appendCsvRow, readCsv, writeCsv } from '../../lib/csv';
import { config } from '../../config/env';

const JOB_FILE = path.join(config.dataDir, 'mail_jobs.csv');
const JOB_HEADERS = ['jobId', 'email', 'template', 'epubPath', 'status', 'createdAt'] as const;

const EMAIL_FILE = path.join(config.dataDir, 'emails.csv');
const EMAIL_HEADERS = ['email', 'lastUsedAt', 'count'] as const;

export type MailJob = { jobId: string; email: string; template: string; epubPath?: string; status: 'queued'|'running'|'succeeded'|'failed'; createdAt: string };

export type EmailIndex = { email: string; lastUsedAt: string; count: number };

export async function addMailJob(job: MailJob): Promise<void> {
  await appendCsvRow(JOB_FILE, [...JOB_HEADERS], {
    jobId: job.jobId,
    email: job.email,
    template: job.template,
    epubPath: job.epubPath ?? '',
    status: job.status,
    createdAt: job.createdAt,
  });
  const emails = await readCsv(EMAIL_FILE, [...EMAIL_HEADERS]);
  const map = new Map<string, any>();
  emails.forEach(e => map.set(e.email, e));
  const existing = map.get(job.email);
  if (existing) {
    existing.lastUsedAt = job.createdAt;
    existing.count = String((Number(existing.count || '0')) + 1);
  } else {
    map.set(job.email, { email: job.email, lastUsedAt: job.createdAt, count: '1' });
  }
  await writeCsv(EMAIL_FILE, [...EMAIL_HEADERS], Array.from(map.values()));
}

export async function listMailJobs(): Promise<MailJob[]> {
  const rows = await readCsv(JOB_FILE, [...JOB_HEADERS]);
  return rows.map(r => ({ jobId: r.jobId, email: r.email, template: r.template, epubPath: r.epubPath || undefined, status: r.status as MailJob['status'], createdAt: r.createdAt }));
}

export async function listEmails(): Promise<EmailIndex[]> {
  const rows = await readCsv(EMAIL_FILE, [...EMAIL_HEADERS]);
  return rows.map(r => ({ email: r.email, lastUsedAt: r.lastUsedAt, count: Number(r.count || 0) }));
}