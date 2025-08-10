import { createApp } from './app';
import { config } from './config/env';
import { logger } from './lib/logger';

const app = createApp();

app.listen(config.port, () => {
  logger.info({ port: config.port }, 'Server listening');
});