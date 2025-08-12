import swaggerJSDoc from 'swagger-jsdoc';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

const definition: any = {
  openapi: '3.0.0',
  info: { title: 'Em iu TiengViet Tools API', version: '1.0.0' },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'health' },
    { name: 'settings' },
    { name: 'upload' },
    { name: 'convert-markdown' },
    { name: 'content-breakdown' },
    { name: 'translate' },
    { name: 'translation-fine-tune' },
    { name: 'compose' },
    { name: 'convert-to-epub' },
    { name: 'send-mail' },
    { name: 'order-management' },
    { name: 'third-parites' },
    { name: 'api-powered-search-file' }
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: { error: { type: 'string' }, message: { type: 'string' }, details: { nullable: true } }
      },
      PagingEnvelope: {
        type: 'object',
        properties: { items: { type: 'array', items: { type: 'object' } }, page: { type: 'integer' }, pageSize: { type: 'integer' }, total: { type: 'integer' }, totalPages: { type: 'integer' } }
      }
    }
  },
  paths: {
    // Note: Most path docs are sourced from JSDoc in route files
    '/health': { get: { tags: ['health'], summary: 'Health check', responses: { '200': { description: 'OK' } } } }
  }
};

const options = { definition, apis: ['src/routes/*.ts'] } as const;

const swaggerSpec = swaggerJSDoc(options as any);

export function mountSwagger(router: Router) {
  router.get('/docs-json', (_req, res) => {
    res.json(swaggerSpec);
  });
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}