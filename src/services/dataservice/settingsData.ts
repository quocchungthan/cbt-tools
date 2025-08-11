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
    dropdownOptions: map.get('dropdownOptions') ? JSON.parse(map.get('dropdownOptions') as string) : undefined,
  };
  const result = { ...envDefaults, ...Object.fromEntries(Object.entries(fromCsv).filter((entry) => entry[1] != null)) } as Settings;
  // If dropdownOptions exists, also set root-level keys for test compatibility
  if (result.dropdownOptions) {
    if (result.dropdownOptions.formatOptions) result.formatOptions = result.dropdownOptions.formatOptions;
    if (result.dropdownOptions.supportedLanguages) result.supportedLanguages = result.dropdownOptions.supportedLanguages;
    if (result.dropdownOptions.translateStrategy) result.translateStrategy = result.dropdownOptions.translateStrategy;
    if (result.dropdownOptions.composeFormats) result.composeFormats = result.dropdownOptions.composeFormats;
  }
  // Also allow root-level composeFormats
  if (map.get('composeFormats')) {
    try { result.composeFormats = JSON.parse(map.get('composeFormats') as string); } catch { /* empty */ }
  }
  return result;
}

export async function saveSettings(input: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = { ...current, ...input };
  // Ensure root-level keys are set if present in input or dropdownOptions
  if (input.formatOptions) next.formatOptions = input.formatOptions;
  if (input.supportedLanguages) next.supportedLanguages = input.supportedLanguages;
  if (input.translateStrategy) next.translateStrategy = input.translateStrategy;
  if (input.composeFormats) next.composeFormats = input.composeFormats;
  if (input.dropdownOptions) {
    if (input.dropdownOptions.formatOptions) next.formatOptions = input.dropdownOptions.formatOptions;
    if (input.dropdownOptions.supportedLanguages) next.supportedLanguages = input.dropdownOptions.supportedLanguages;
    if (input.dropdownOptions.translateStrategy) next.translateStrategy = input.dropdownOptions.translateStrategy;
    if (input.dropdownOptions.composeFormats) next.composeFormats = input.dropdownOptions.composeFormats;
  }
  const rows: Row[] = Object.entries(next)
    .filter((entry) => entry[1] !== undefined)
    .map(([key, value]) => ({ key, value: key === 'dropdownOptions' ? JSON.stringify(value) : Array.isArray(value) ? JSON.stringify(value) : String(value) }));
  await writeCsv(FILE, [...HEADERS], rows as any);
  return next;
}