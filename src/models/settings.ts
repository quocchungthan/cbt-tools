export type Settings = {
  fileSupported: string;
  openAiKey?: string;
  openAiModel?: string;
  openAiProjectId?: string;
  openAiOrgId?: string;
  sheetApiKey?: string;
  sheetName?: string;
  sheetId?: string;
  dropdownOptions?: Record<string, string[]>;
  formatOptions?: string[];
  supportedLanguages?: string[];
  translateStrategy?: string[];
};