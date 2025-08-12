import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  fileSupported: process.env.FILE_SUPPORTED || '.pdf',
  openAiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL,
  openAiProjectId: process.env.OPENAI_PROJECT_ID,
  openAiOrgId: process.env.OPENAI_ORG_ID,
  sheetApiKey: process.env.SHEET_API_KEY,
  sheetName: process.env.SHEET_NAME,
  sheetId: process.env.SHEET_ID,
  dataDir: process.env.DATA_DIR || path.resolve(process.cwd(), 'database'),
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  toolsPassword: process.env.TOOLS_PASSWORD,
};

export type AppConfig = typeof config;
