import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { healthRouter } from './routes/health';
import { settingsRouter } from './routes/settings';
import { uploadRouter } from './routes/upload';
import { errorHandler } from './middleware/errorHandler';
import { mountSwagger } from './config/swagger';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (config.corsOrigins.length === 0 || config.corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }}));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(pinoHttp());

  // Rate limit mutating endpoints
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 });
  app.use(['/api/upload', '/api/settings', '/api/convert-markdown', '/api/translate', '/api/compose', '/api/convert-to-epub', '/api/send-mail', '/api/order-management', '/api/third-parites', '/api/api-powered-search-file'], limiter);

  const api = express.Router();
  mountSwagger(api);
  api.use(healthRouter);
  api.use(settingsRouter);
  api.use(uploadRouter);

  app.use('/api', api);

  app.use(errorHandler);

  return app;
}