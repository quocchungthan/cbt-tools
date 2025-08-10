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
import { convertMarkdownRouter } from './routes/convertMarkdown';
import { contentBreakdownRouter } from './routes/contentBreakdown';
import { translateRouter } from './routes/translate';
import { composeRouter } from './routes/compose';
import { epubRouter } from './routes/epub';
import { mailRouter } from './routes/mail';
import { ordersRouter } from './routes/orders';
import { thirdPartiesRouter } from './routes/thirdParties';
import { apiSearchRouter } from './routes/apiPoweredSearch';

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
  api.use(convertMarkdownRouter);
  api.use(contentBreakdownRouter);
  api.use(translateRouter);
  api.use(composeRouter);
  api.use(epubRouter);
  api.use(mailRouter);
  api.use(ordersRouter);
  api.use(thirdPartiesRouter);
  api.use(apiSearchRouter);

  app.use('/api', api);

  app.use(errorHandler);

  return app;
}