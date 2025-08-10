import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { atomicWriteFile, ensureDir, pathExists } from './fsutils';

export type CsvRow = Record<string, string>;

async function ensureFileWithHeader(filePath: string, headers: string[]) {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  if (!(await pathExists(filePath))) {
    const headerLine = stringify([headers], { header: false });
    await atomicWriteFile(filePath, headerLine);
  }
}

export async function readCsv(filePath: string, headers: string[]): Promise<CsvRow[]> {
  await ensureFileWithHeader(filePath, headers);
  const content = await fs.readFile(filePath, 'utf8');
  if (!content.trim()) return [];
  const records: string[][] = parse(content, { relaxColumnCount: true });
  // skip header
  const dataRows = records.slice(1);
  return dataRows.filter(r => r.length > 0).map(cols => {
    const row: CsvRow = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  });
}

export async function writeCsv(filePath: string, headers: string[], rows: CsvRow[]): Promise<void> {
  const data: string[][] = [headers, ...rows.map(r => headers.map(h => r[h] ?? ''))];
  const content = stringify(data, { header: false });
  await atomicWriteFile(filePath, content);
}

export async function appendCsvRow(filePath: string, headers: string[], row: CsvRow): Promise<void> {
  await ensureFileWithHeader(filePath, headers);
  const line = stringify([[...headers.map(h => row[h] ?? '')]], { header: false });
  await fs.appendFile(filePath, line);
}