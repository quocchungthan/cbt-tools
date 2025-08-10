import swaggerJSDoc from 'swagger-jsdoc';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CBT Tools API',
      version: '1.0.0',
    },
    servers: [{ url: '/api' }],
    tags: [
      { name: 'health' },
      { name: 'settings' },
      { name: 'upload' },
    ],
  },
  apis: [],
} as const;

const swaggerSpec = swaggerJSDoc(options as any);

export function mountSwagger(router: Router) {
  router.get('/docs-json', (_req, res) => {
    res.json(swaggerSpec);
  });
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}