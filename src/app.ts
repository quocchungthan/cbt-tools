import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { healthRouter } from './routes/health';
import { settingsRouter } from './routes/settings';
import { uploadRouter } from './routes/upload';
import { errorHandler } from './middleware/errorHandler';
import { csrfProtection } from './middleware/csrf';
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
import path from 'node:path';

import { toolsPasswordProtect } from './middleware/toolsPasswordProtect';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cookieParser());
  app.use(cors({ origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (config.corsOrigins.length === 0 || config.corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }}));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // View engine: Pug
  app.set('views', path.resolve(process.cwd(), 'views'));
  app.set('view engine', 'pug');

  // Static assets (theme CSS/JS)
  app.use('/assets', express.static(path.resolve(process.cwd(), 'public')));

  // Serve favicon.ico
  app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'public', 'favicon.ico'));
  });

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

  // CSRF protection for preorder ecommerce home page at root
  app.get('/', csrfProtection, (req, res) => {
    res.render('index', { csrfToken: req.csrfToken?.() });
  });

  // Password protection for all /tools routes
  app.use('/tools', toolsPasswordProtect);
  app.get(['/tools', '/tools/'], (_req, res) => res.render('tools-home'));
  app.get('/tools/health', (_req, res) => res.render('health'));
  app.get('/tools/settings', (_req, res) => res.render('settings'));
  app.get('/tools/upload', (_req, res) => res.render('upload'));
  app.get('/tools/convert-markdown', (_req, res) => res.render('convert-markdown'));
  app.get('/tools/translate', (_req, res) => res.render('translate'));
  app.get('/tools/translation-fine-tune', (_req, res) => res.render('fine-tune'));
  app.get('/tools/compose', (_req, res) => res.render('compose'));
  app.get('/tools/epub', (_req, res) => res.render('epub'));
  app.get('/tools/mail', (_req, res) => res.render('mail'));
  app.get('/tools/orders', (_req, res) => res.render('orders'));
  app.get('/tools/third-parties', (_req, res) => res.render('third-parties'));
  app.get('/tools/search', (_req, res) => res.render('search'));

  app.use(errorHandler);

  return app;
}