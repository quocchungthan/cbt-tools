import path from 'node:path';
import { readCsv, writeCsv } from '../../lib/csv';
import { config } from '../../config/env';
import { Settings } from '../../models/settings';

const FILE = path.join(config.dataDir, 'settings.csv');
const HEADERS = ['key', 'value'] as const;

type Row = { key: string; value: string };

export async function getSettings(): Promise<Settings> {
  const rows = await readCsv(FILE, [...HEADERS]);
  const map = new Map<string, string>();
  rows.forEach(r => map.set(r.key, r.value));
  const envDefaults: Settings = {
    fileSupported: config.fileSupported,
    openAiKey: config.openAiKey,
    openAiModel: config.openAiModel,
    openAiProjectId: config.openAiProjectId,
    openAiOrgId: config.openAiOrgId,
    sheetApiKey: config.sheetApiKey,
    sheetName: config.sheetName,
    sheetId: config.sheetId,
  };
  const fromCsv: Partial<Settings> = {
    fileSupported: map.get('fileSupported'),
    openAiKey: map.get('openAiKey'),
    openAiModel: map.get('openAiModel'),
    openAiProjectId: map.get('openAiProjectId'),
    openAiOrgId: map.get('openAiOrgId'),
    sheetApiKey: map.get('sheetApiKey'),
    sheetName: map.get('sheetName'),
    sheetId: map.get('sheetId'),
  };
  return { ...envDefaults, ...Object.fromEntries(Object.entries(fromCsv).filter(([_, v]) => v != null)) } as Settings;
}

export async function saveSettings(input: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = { ...current, ...input };
  const rows: Row[] = Object.entries(next)
    .filter(([_, v]) => v !== undefined)
    .map(([key, value]) => ({ key, value: String(value) }));
  await writeCsv(FILE, [...HEADERS], rows as any);
  return next;
}