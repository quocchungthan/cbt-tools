import swaggerJSDoc from 'swagger-jsdoc';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

const definition: any = {
  openapi: '3.0.0',
  info: { title: 'CBT Tools API', version: '1.0.0' },
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
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          details: { nullable: true }
        }
      },
      PagingEnvelope: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'object' } },
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' }
        }
      },
      Settings: {
        type: 'object',
        properties: {
          fileSupported: { type: 'string' },
          openAiKey: { type: 'string', nullable: true },
          openAiModel: { type: 'string', nullable: true },
          openAiProjectId: { type: 'string', nullable: true },
          openAiOrgId: { type: 'string', nullable: true },
          sheetApiKey: { type: 'string', nullable: true },
          sheetName: { type: 'string', nullable: true },
          sheetId: { type: 'string', nullable: true }
        }
      },
      Upload: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          filename: { type: 'string' },
          originalPath: { type: 'string' },
          mime: { type: 'string' },
          size: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      ConvertJob: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
          uploadId: { type: 'string' },
          command: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['queued','running','succeeded','failed'] },
          progress: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      MarkdownOutput: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
          markdownId: { type: 'string' },
          path: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      BreakdownRow: {
        type: 'object',
        properties: {
          markdownId: { type: 'string' },
          chapterId: { type: 'string' },
          paragraphId: { type: 'string' },
          sentenceId: { type: 'string' },
          text: { type: 'string' },
          position: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      TranslationJob: {
        type: 'object',
        properties: {
          translationId: { type: 'string' },
          sourceMarkdownId: { type: 'string' },
          targetLang: { type: 'string', enum: ['en','vi'] },
          strategy: { type: 'string', enum: ['whole-file','sentence-by-sentence'] },
          status: { type: 'string', enum: ['queued','running','succeeded','failed'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      TranslationSentence: {
        type: 'object',
        properties: {
          translationId: { type: 'string' },
          sentenceId: { type: 'string' },
          translatedText: { type: 'string' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ComposeJob: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
          inputs: { type: 'array', items: { type: 'string' } },
          format: { type: 'string' },
          status: { type: 'string' },
          outputPath: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      EpubJob: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
          inputs: { type: 'array', items: { type: 'string' } },
          status: { type: 'string' },
          outputPath: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      MailJob: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
          email: { type: 'string' },
          template: { type: 'string' },
          epubPath: { type: 'string', nullable: true },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      EmailIndex: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          lastUsedAt: { type: 'string', format: 'date-time' },
          count: { type: 'integer' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          orderId: { type: 'string' },
          bookName: { type: 'string' },
          author: { type: 'string' },
          format: { type: 'string' },
          userEmail: { type: 'string', nullable: true },
          originalFileId: { type: 'string', nullable: true },
          translatedFileId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      Partner: {
        type: 'object',
        properties: {
          partnerId: { type: 'string' },
          type: { type: 'string', enum: ['print','ads','bookshelf','shipping'] },
          name: { type: 'string' },
          endpoint: { type: 'string', nullable: true },
          config: { type: 'object', nullable: true },
          contact: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Shelf: {
        type: 'object',
        properties: {
          shelfId: { type: 'string' },
          title: { type: 'string' },
          composedMarkdownPath: { type: 'string' },
          epubPath: { type: 'string', nullable: true },
          orderId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Shipment: {
        type: 'object',
        properties: {
          shipmentId: { type: 'string' },
          orderId: { type: 'string' },
          partnerId: { type: 'string' },
          status: { type: 'string' },
          trackingNumber: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Search: {
        type: 'object',
        properties: {
          searchId: { type: 'string' },
          query: { type: 'string' },
          source: { type: 'string', enum: ['order','manual'] },
          requestedLangs: { type: 'array', items: { type: 'string', enum: ['en','vi'] } },
          maxResults: { type: 'integer' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Result: {
        type: 'object',
        properties: {
          resultId: { type: 'string' },
          searchId: { type: 'string' },
          title: { type: 'string' },
          url: { type: 'string' },
          fileType: { type: 'string' },
          language: { type: 'string' },
          isFree: { type: 'boolean' },
          priceCents: { type: 'integer', nullable: true },
          rank: { type: 'integer' },
          discoveredAt: { type: 'string', format: 'date-time' }
        }
      },
      Download: {
        type: 'object',
        properties: {
          downloadId: { type: 'string' },
          resultId: { type: 'string' },
          filename: { type: 'string' },
          path: { type: 'string' },
          mime: { type: 'string' },
          size: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: { tags: ['health'], summary: 'Health check', responses: { '200': { description: 'OK' } } }
    },
    '/settings/': {
      get: { tags: ['settings'], summary: 'Get settings', responses: { '200': { description: 'Settings', content: { 'application/json': { schema: { $ref: '#/components/schemas/Settings' } } } } },
      put: { tags: ['settings'], summary: 'Update settings', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Settings' } } } }, responses: { '200': { description: 'Settings' } } }
    },
    '/upload/': {
      post: { tags: ['upload'], summary: 'Upload file', requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Upload' } } } } } },
      get: { tags: ['upload'], summary: 'List uploads', responses: { '200': { description: 'List', content: { 'application/json': { schema: { $ref: '#/components/schemas/PagingEnvelope' } } } } } }
    },
    '/upload/{id}': {
      get: { tags: ['upload'], summary: 'Get upload by id', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Upload' }, '404': { description: 'Not found' } } }
    },
    '/convert-markdown/jobs': {
      post: { tags: ['convert-markdown'], summary: 'Create convert job', responses: { '201': { description: 'Job', content: { 'application/json': { schema: { $ref: '#/components/schemas/ConvertJob' } } } } } },
      get: { tags: ['convert-markdown'], summary: 'List convert jobs', responses: { '200': { description: 'List', content: { 'application/json': { schema: { $ref: '#/components/schemas/PagingEnvelope' } } } } } }
    },
    '/convert-markdown/jobs/{jobId}': {
      get: { tags: ['convert-markdown'], summary: 'Get convert job', parameters: [{ in: 'path', name: 'jobId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Job' }, '404': { description: 'Not found' } } }
    },
    '/convert-markdown/markdowns': {
      get: { tags: ['convert-markdown'], summary: 'List markdown outputs', responses: { '200': { description: 'List', content: { 'application/json': { schema: { $ref: '#/components/schemas/PagingEnvelope' } } } } } }
    },
    '/content-breakdown/{markdownId}': {
      post: { tags: ['content-breakdown'], summary: 'Start breakdown', parameters: [{ in: 'path', name: 'markdownId', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Created' } } },
      get: { tags: ['content-breakdown'], summary: 'List breakdown rows', parameters: [{ in: 'path', name: 'markdownId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'List', content: { 'application/json': { schema: { $ref: '#/components/schemas/PagingEnvelope' } } } } } }
    },
    '/translate/jobs': {
      post: { tags: ['translate'], summary: 'Create translation job', responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/TranslationJob' } } } } } },
      get: { tags: ['translate'], summary: 'List translation jobs', responses: { '200': { description: 'List', content: { 'application/json': { schema: { $ref: '#/components/schemas/PagingEnvelope' } } } } } }
    },
    '/translate/jobs/{id}': {
      get: { tags: ['translate'], summary: 'Get translation job', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Job' }, '404': { description: 'Not found' } } }
    },
    '/translate/markdowns': {
      get: { tags: ['translate'], summary: 'List translated markdowns', responses: { '200': { description: 'List' } } }
    },
    '/translation-fine-tune/{translationId}': {
      get: { tags: ['translation-fine-tune'], summary: 'List sentence pairs', parameters: [{ in: 'path', name: 'translationId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'List' } } },
      put: { tags: ['translation-fine-tune'], summary: 'Update sentence pairs', parameters: [{ in: 'path', name: 'translationId', required: true, schema: { type: 'string' } }], requestBody: { required: true }, responses: { '200': { description: 'Updated' } } }
    },
    '/compose/jobs': {
      post: { tags: ['compose'], summary: 'Create compose job', responses: { '201': { description: 'Created' } } },
      get: { tags: ['compose'], summary: 'List compose jobs', responses: { '200': { description: 'List' } } }
    },
    '/compose/jobs/{id}': {
      get: { tags: ['compose'], summary: 'Get compose job', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Job' }, '404': { description: 'Not found' } } }
    },
    '/compose/markdowns': {
      get: { tags: ['compose'], summary: 'List composed markdowns', responses: { '200': { description: 'List' } } }
    },
    '/convert-to-epub/jobs': {
      post: { tags: ['convert-to-epub'], summary: 'Create epub job', responses: { '201': { description: 'Created' } } },
      get: { tags: ['convert-to-epub'], summary: 'List epub jobs', responses: { '200': { description: 'List' } } }
    },
    '/convert-to-epub/jobs/{id}': {
      get: { tags: ['convert-to-epub'], summary: 'Get epub job', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Job' }, '404': { description: 'Not found' } } }
    },
    '/convert-to-epub/epubs': {
      get: { tags: ['convert-to-epub'], summary: 'List epubs', responses: { '200': { description: 'List' } } }
    },
    '/send-mail/jobs': {
      post: { tags: ['send-mail'], summary: 'Create mail job', responses: { '201': { description: 'Created' } } },
      get: { tags: ['send-mail'], summary: 'List mail jobs', responses: { '200': { description: 'List' } } }
    },
    '/send-mail/emails': {
      get: { tags: ['send-mail'], summary: 'List emails', responses: { '200': { description: 'List' } } }
    },
    '/order-management/orders': {
      get: { tags: ['order-management'], summary: 'List orders', responses: { '200': { description: 'List' } } },
      post: { tags: ['order-management'], summary: 'Create order', responses: { '201': { description: 'Created' } } }
    },
    '/order-management/orders/{orderId}': {
      get: { tags: ['order-management'], summary: 'Get order', parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Order' }, '404': { description: 'Not found' } } },
      put: { tags: ['order-management'], summary: 'Update order', parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' }, '404': { description: 'Not found' } } },
      delete: { tags: ['order-management'], summary: 'Delete order', parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' } } }
    },
    '/third-parites/partners': {
      get: { tags: ['third-parites'], summary: 'List partners', responses: { '200': { description: 'List' } } },
      post: { tags: ['third-parites'], summary: 'Create partner', responses: { '201': { description: 'Created' } } }
    },
    '/third-parites/partners/{partnerId}': {
      put: { tags: ['third-parites'], summary: 'Update partner', parameters: [{ in: 'path', name: 'partnerId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' }, '404': { description: 'Not found' } } },
      delete: { tags: ['third-parites'], summary: 'Delete partner', parameters: [{ in: 'path', name: 'partnerId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' } } }
    },
    '/third-parites/bookshelf': {
      get: { tags: ['third-parites'], summary: 'List bookshelf', responses: { '200': { description: 'List' } } },
      post: { tags: ['third-parites'], summary: 'Create shelf', responses: { '201': { description: 'Created' } } }
    },
    '/third-parites/bookshelf/{shelfId}': {
      delete: { tags: ['third-parites'], summary: 'Delete shelf', parameters: [{ in: 'path', name: 'shelfId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' } } }
    },
    '/third-parites/shipments': {
      get: { tags: ['third-parites'], summary: 'List shipments', responses: { '200': { description: 'List' } } },
      post: { tags: ['third-parites'], summary: 'Create shipment', responses: { '201': { description: 'Created' } } }
    },
    '/api-powered-search-file/search': {
      post: { tags: ['api-powered-search-file'], summary: 'Start API-powered search', responses: { '201': { description: 'Created' } } }
    },
    '/api-powered-search-file/searches': {
      get: { tags: ['api-powered-search-file'], summary: 'List searches', responses: { '200': { description: 'List' } } }
    },
    '/api-powered-search-file/searches/{searchId}': {
      get: { tags: ['api-powered-search-file'], summary: 'Get search', parameters: [{ in: 'path', name: 'searchId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Search' }, '404': { description: 'Not found' } } }
    },
    '/api-powered-search-file/results': {
      get: { tags: ['api-powered-search-file'], summary: 'List results', parameters: [{ in: 'query', name: 'searchId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'List' } } }
    },
    '/api-powered-search-file/downloads': {
      get: { tags: ['api-powered-search-file'], summary: 'List downloads', responses: { '200': { description: 'List' } } },
      post: { tags: ['api-powered-search-file'], summary: 'Create download', responses: { '201': { description: 'Created' } } }
    },
    '/api-powered-search-file/downloads/{downloadId}/file': {
      get: { tags: ['api-powered-search-file'], summary: 'Get download file', parameters: [{ in: 'path', name: 'downloadId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'File' }, '404': { description: 'Not found' } } }
    }
  }
};

const options = { definition, apis: [] } as const;

const swaggerSpec = swaggerJSDoc(options as any);

export function mountSwagger(router: Router) {
  router.get('/docs-json', (_req, res) => {
    res.json(swaggerSpec);
  });
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}