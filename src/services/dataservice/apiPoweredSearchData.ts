import path from 'node:path';
import { appendCsvRow, readCsv } from '../../lib/csv';
import { config } from '../../config/env';

const SEARCH_FILE = path.join(config.dataDir, 'api_searches.csv');
const SEARCH_HEADERS = ['searchId', 'query', 'source', 'requestedLangs(json)', 'maxResults', 'status', 'createdAt'] as const;

const RESULT_FILE = path.join(config.dataDir, 'api_search_results.csv');
const RESULT_HEADERS = ['resultId', 'searchId', 'title', 'url', 'fileType', 'language', 'isFree', 'priceCents', 'rank', 'discoveredAt'] as const;

const DL_FILE = path.join(config.dataDir, 'api_search_downloads.csv');
const DL_HEADERS = ['downloadId', 'resultId', 'filename', 'path', 'mime', 'size', 'createdAt'] as const;

export type Search = { searchId: string; query: string; source: 'order'|'manual'; requestedLangs: string[]; maxResults: number; status: 'queued'|'running'|'succeeded'|'failed'; createdAt: string };
export type Result = { resultId: string; searchId: string; title: string; url: string; fileType: 'pdf'|'unknown'; language: 'en'|'vi'|'unknown'; isFree: boolean; priceCents?: number; rank: number; discoveredAt: string };
export type Download = { downloadId: string; resultId: string; filename: string; path: string; mime: string; size: number; createdAt: string };

export async function addSearch(s: Search): Promise<void> {
  await appendCsvRow(SEARCH_FILE, [...SEARCH_HEADERS], { searchId: s.searchId, query: s.query, source: s.source, 'requestedLangs(json)': JSON.stringify(s.requestedLangs), maxResults: String(s.maxResults), status: s.status, createdAt: s.createdAt } as any);
}

export async function listSearches(): Promise<Search[]> {
  const rows = await readCsv(SEARCH_FILE, [...SEARCH_HEADERS]);
  return rows.map(r => ({ searchId: r.searchId, query: r.query, source: r.source as 'order'|'manual', requestedLangs: JSON.parse(r['requestedLangs(json)'] || '[]'), maxResults: Number(r.maxResults || 10), status: r.status as Search['status'], createdAt: r.createdAt }));
}

export async function addResult(r: Result): Promise<void> {
  await appendCsvRow(RESULT_FILE, [...RESULT_HEADERS], { resultId: r.resultId, searchId: r.searchId, title: r.title, url: r.url, fileType: r.fileType, language: r.language, isFree: String(r.isFree), priceCents: r.priceCents != null ? String(r.priceCents) : '', rank: String(r.rank), discoveredAt: r.discoveredAt });
}

export async function listResults(searchId?: string): Promise<Result[]> {
  const rows = await readCsv(RESULT_FILE, [...RESULT_HEADERS]);
  const all = rows.map(r => ({ resultId: r.resultId, searchId: r.searchId, title: r.title, url: r.url, fileType: (r.fileType as any) || 'unknown', language: (r.language as any) || 'unknown', isFree: r.isFree === 'true', priceCents: r.priceCents ? Number(r.priceCents) : undefined, rank: Number(r.rank || 0), discoveredAt: r.discoveredAt }));
  return searchId ? all.filter(r => r.searchId === searchId) : all;
}

export async function addDownload(d: Download): Promise<void> {
  await appendCsvRow(DL_FILE, [...DL_HEADERS], { downloadId: d.downloadId, resultId: d.resultId, filename: d.filename, path: d.path, mime: d.mime, size: String(d.size), createdAt: d.createdAt });
}

export async function listDownloads(searchId?: string): Promise<Download[]> {
  const rows = await readCsv(DL_FILE, [...DL_HEADERS]);
  const all = rows.map(r => ({ downloadId: r.downloadId, resultId: r.resultId, filename: r.filename, path: r.path, mime: r.mime, size: Number(r.size || 0), createdAt: r.createdAt }));
  if (!searchId) return all;
  const results = await listResults(searchId);
  const validIds = new Set(results.map(r => r.resultId));
  return all.filter(d => validIds.has(d.resultId));
}