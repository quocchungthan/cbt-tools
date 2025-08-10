import path from 'node:path';
import { appendCsvRow, readCsv, writeCsv } from '../../lib/csv';
import { config } from '../../config/env';

const FILE = path.join(config.dataDir, 'translations.csv');
const HEADERS = ['translationId', 'sourceMarkdownId', 'targetLang', 'strategy', 'status', 'createdAt'] as const;

const SENT_FILE = path.join(config.dataDir, 'translations_sentences.csv');
const SENT_HEADERS = ['translationId', 'sentenceId', 'translatedText', 'updatedAt'] as const;

export type TranslationJob = {
  translationId: string;
  sourceMarkdownId: string;
  targetLang: 'en'|'vi';
  strategy: 'whole-file'|'sentence-by-sentence';
  status: 'queued'|'running'|'succeeded'|'failed';
  createdAt: string;
};

export type TranslationSentence = {
  translationId: string;
  sentenceId: string;
  translatedText: string;
  updatedAt: string;
};

export async function addTranslation(job: TranslationJob): Promise<void> {
  await appendCsvRow(FILE, [...HEADERS], {
    translationId: job.translationId,
    sourceMarkdownId: job.sourceMarkdownId,
    targetLang: job.targetLang,
    strategy: job.strategy,
    status: job.status,
    createdAt: job.createdAt,
  });
}

export async function listTranslations(): Promise<TranslationJob[]> {
  const rows = await readCsv(FILE, [...HEADERS]);
  return rows.map(r => ({
    translationId: r.translationId,
    sourceMarkdownId: r.sourceMarkdownId,
    targetLang: r.targetLang as 'en'|'vi',
    strategy: r.strategy as 'whole-file'|'sentence-by-sentence',
    status: r.status as TranslationJob['status'],
    createdAt: r.createdAt,
  }));
}

export async function getTranslation(id: string): Promise<TranslationJob | undefined> {
  const all = await listTranslations();
  return all.find(t => t.translationId === id);
}

export async function initSentenceRows(translationId: string, sentenceIds: string[]): Promise<void> {
  const rows = sentenceIds.map(id => ({
    translationId,
    sentenceId: id,
    translatedText: '',
    updatedAt: new Date().toISOString(),
  }));
  const existing = await readCsv(SENT_FILE, [...SENT_HEADERS]);
  const next = [...existing, ...rows];
  await writeCsv(SENT_FILE, [...SENT_HEADERS], next);
}

export async function listSentences(translationId: string): Promise<TranslationSentence[]> {
  const rows = await readCsv(SENT_FILE, [...SENT_HEADERS]);
  return rows.filter(r => r.translationId === translationId).map(r => ({
    translationId: r.translationId,
    sentenceId: r.sentenceId,
    translatedText: r.translatedText,
    updatedAt: r.updatedAt,
  }));
}

export async function upsertSentences(translationId: string, updates: { sentenceId: string; translatedText: string }[]): Promise<number> {
  const rows = await readCsv(SENT_FILE, [...SENT_HEADERS]);
  let updated = 0;
  const map = new Map<string, any>();
  rows.forEach(r => map.set(`${r.translationId}:${r.sentenceId}`, r));
  for (const u of updates) {
    const key = `${translationId}:${u.sentenceId}`;
    const existing = map.get(key);
    if (existing) {
      existing.translatedText = u.translatedText;
      existing.updatedAt = new Date().toISOString();
      updated++;
    } else {
      map.set(key, { translationId, sentenceId: u.sentenceId, translatedText: u.translatedText, updatedAt: new Date().toISOString() });
      updated++;
    }
  }
  await writeCsv(SENT_FILE, [...SENT_HEADERS], Array.from(map.values()));
  return updated;
}