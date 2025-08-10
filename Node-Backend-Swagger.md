## Node Backend + Swagger — Implementation Requirements (No UI)

Purpose
- Implement a Node.js backend service exposing the defined `/api/*` endpoints
- Document all endpoints with Swagger (OpenAPI 3) at `/api/docs`
- Persist data in CSV files under `database/` (temporary store, replaceable later)
- Enforce separation of `dataservice` (persistence/IO) vs `businessservice` (processing/orchestration)
- No UI included

Stack
- Node.js 20 LTS
- Express 5
- Swagger: `swagger-jsdoc` + `swagger-ui-express` (OpenAPI 3)
- Validation: `zod` (or `joi`) for request/response schemas
- CSV IO: `fast-csv` or `csv-parse` + `csv-stringify`; filesystem via `fs/promises`
- IDs: `uuid` v4
- Logging: `pino` (or `winston`) with JSON logs
- Security: `helmet`, CORS (configurable), `express-rate-limit` (basic limits)
- Env management: `dotenv`
- Tests: Jest (unit/integration)

Directory structure
- `database/` (git-ignored) — all CSV data persisted here
- `src/`
  - `index.ts` — server bootstrap
  - `app.ts` — Express app setup (middlewares, routes, error handling)
  - `config/` — env loading, constants (e.g., defaults)
  - `lib/` — CSV helpers, file utilities, paginator, error utils
  - `middleware/` — validation, error, rate limiting
  - `models/` — TypeScript interfaces/types (one model per file)
  - `services/`
    - `dataservice/` — CSV CRUD per domain (one per file)
    - `businessservice/` — orchestration logic per tool (one per file)
  - `routes/` — router modules per tool (split by file)
  - `docs/` — optional OpenAPI YAML if not generated from JSDoc
- `Dockerfile`, `nginx.conf`
- `.env`, `.env.example`

Environment variables
- `PORT` default `3000`
- `FILE_SUPPORTED` default `.pdf`
- OpenAI: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_PROJECT_ID`, `OPENAI_ORG_ID`
- Google Sheets: `SHEET_API_KEY`, `SHEET_NAME`, `SHEET_ID`
- `DATA_DIR` default `database`

General conventions
- Base API path: `/api`
- Per-tool prefix: `/api/tool-name/` (see endpoints below)
- All list endpoints support paging and optional sorting (see Paging)
- Error format: `{ error: string, message: string, details?: unknown }`
- Job status model: `{ status: 'queued'|'running'|'succeeded'|'failed', progress?: number (0-100), message?: string }`
- Methods should be short and readable; one model/service per file; no bloaters

CSV storage and schemas
- Settings: `settings.csv` — columns `[key, value]`
- Uploads: `uploads.csv` — `[id, filename, originalPath, mime, size, createdAt]`
- Convert markdown jobs: `convert_markdown_jobs.csv` — `[jobId, uploadId, command, status, progress, createdAt]`
- Markdown outputs index: `markdown_outputs.csv` — `[jobId, markdownId, path, createdAt]`
- Breakdown: `breakdown.csv` — `[markdownId, chapterId, paragraphId, sentenceId, text, position, createdAt]`
- Translations: `translations.csv` — `[translationId, sourceMarkdownId, targetLang, strategy, status, createdAt]`
- Translation sentences: `translations_sentences.csv` — `[translationId, sentenceId, translatedText, updatedAt]`
- Compose jobs: `compose_jobs.csv` — `[jobId, inputs(json), format, status, outputPath, createdAt]`
- EPUB jobs: `epub_jobs.csv` — `[jobId, inputs(json), status, outputPath, createdAt]`
- Mail jobs: `mail_jobs.csv` — `[jobId, email, template, epubPath, status, createdAt]`
- Emails index: `emails.csv` — `[email, lastUsedAt, count]`
- Orders: `orders.csv` — `[orderId, bookName, author, format, userEmail, originalFileId, translatedFileId, createdAt, updatedAt]`
- Partners: `partners.csv` — `[partnerId, type, name, endpoint, configJson, contact, createdAt]`
- Bookshelf: `bookshelf.csv` — `[shelfId, title, composedMarkdownPath, epubPath, orderId, createdAt]`
- Shipments: `shipments.csv` — `[shipmentId, orderId, partnerId, status, trackingNumber, createdAt]`
- API-powered search: `api_searches.csv` — `[searchId, query, source('order'|'manual'), requestedLangs(json)?, maxResults, status, createdAt]`
- API-powered search results: `api_search_results.csv` — `[resultId, searchId, title, url, fileType, language('en'|'vi'|'unknown'), isFree, priceCents?, rank, discoveredAt]`
- API-powered search downloads: `api_search_downloads.csv` — `[downloadId, resultId, filename, path, mime, size, createdAt]`

Filesystem layout
- Uploads: `database/uploads/{id}/{originalFilename}`
- Markdown outputs: `database/markdown/{jobId}/{output.md}`
- Translated markdown: `database/markdown_translated/{translationId}/{output.md}`
- Composed markdown: `database/markdown_composed/{jobId}/{output.md}`
- EPUB outputs: `database/epubs/{jobId}/{output.epub}`
- API-powered search downloads: `database/search_downloads/{downloadId}/{filename}`

Paging for GET list endpoints
- Query params: `page` (default 1, min 1), `pageSize` (default 20, max 100), optional `sort` and `order` ('asc'|'desc')
- Response envelope: `{ items: T[], page: number, pageSize: number, total: number, totalPages: number }`
- Implementation: load from CSV, apply filters, sort, then paginate in-memory

API endpoints and IO mapping

Settings `/api/settings/`
- GET `/api/settings/`
  - Input: none
  - Output: `{ fileSupported: string, openAiKey?: string, openAiModel?: string, openAiProjectId?: string, openAiOrgId?: string, sheetApiKey?: string, sheetName?: string, sheetId?: string }`
  - CSV: READ `settings.csv` (fallback to `.env` for missing keys)
  - Filesystem: none
  - Status: 200
- PUT `/api/settings/`
  - Input: body partial settings `{ fileSupported?, openAiKey?, openAiModel?, openAiProjectId?, openAiOrgId?, sheetApiKey?, sheetName?, sheetId? }`
  - Output: saved settings (same shape as GET)
  - CSV: WRITE/UPSERT `settings.csv` rows `[key, value]`
  - Filesystem: none
  - Status: 200 / 400 (validation)

Upload `/api/upload/`
- POST `/api/upload/` (multipart)
  - Input: file field `file`
  - Output: `{ id: string, filename: string, originalPath: string, mime: string, size: number, createdAt: string }`
  - CSV: WRITE `uploads.csv` `[id, filename, originalPath, mime, size, createdAt]`
  - Filesystem: stores file at `database/uploads/{id}/{originalFilename}`
  - Status: 201 / 400 (type unsupported per settings.fileSupported)
- GET `/api/upload/`
  - Input: query `page, pageSize, sort?, order?`
  - Output: paging envelope of upload records
  - CSV: READ `uploads.csv`
  - Filesystem: none
  - Status: 200
- GET `/api/upload/:id`
  - Input: path `id`
  - Output: single upload record or 404
  - CSV: READ `uploads.csv`
  - Filesystem: none
  - Status: 200 / 404

Convert Markdown `/api/convert-markdown/`
- POST `/api/convert-markdown/jobs`
  - Input: body `{ uploadId: string, command?: string, options?: Record<string, unknown> }`
  - Output: `{ jobId: string, uploadId: string, command?: string, status: 'queued'|'running'|'succeeded'|'failed', progress: number, createdAt: string }`
  - CSV: WRITE `convert_markdown_jobs.csv` `[jobId, uploadId, command, status, progress, createdAt]`
  - Filesystem: may create initial work dir under `database/markdown/{jobId}/`
  - Status: 201 / 400 (invalid uploadId)
- GET `/api/convert-markdown/jobs`
  - Input: query `page, pageSize, sort?, order?`, optional `status`
  - Output: paging envelope of jobs
  - CSV: READ `convert_markdown_jobs.csv`
  - Filesystem: none
  - Status: 200
- GET `/api/convert-markdown/jobs/:jobId`
  - Input: path `jobId`
  - Output: job record or 404
  - CSV: READ `convert_markdown_jobs.csv`
  - Filesystem: none
  - Status: 200 / 404
- GET `/api/convert-markdown/markdowns`
  - Input: query `page, pageSize, sort?, order?`, optional `uploadId`
  - Output: paging envelope of `{ jobId, markdownId, path, createdAt }`
  - CSV: READ `markdown_outputs.csv` `[jobId, markdownId, path, createdAt]`
  - Filesystem: markdown files at `database/markdown/{jobId}/{output.md}`
  - Status: 200

Content Breakdown `/api/content-breakdown/`
- POST `/api/content-breakdown/:markdownId`
  - Input: path `markdownId`
  - Output: `{ markdownId: string, recordsCreated: number }`
  - CSV: WRITE `breakdown.csv` rows `[markdownId, chapterId, paragraphId, sentenceId, text, position, createdAt]`
  - Filesystem: reads markdown file referenced by `markdown_outputs.csv`
  - Status: 201 / 400 (missing markdown) / 404
- GET `/api/content-breakdown/:markdownId`
  - Input: path `markdownId`, query `page, pageSize, sort?, order?`
  - Output: paging envelope of breakdown rows
  - CSV: READ `breakdown.csv`
  - Filesystem: none
  - Status: 200 / 404

Translate `/api/translate/`
- POST `/api/translate/jobs`
  - Input: body `{ sourceMarkdownId: string, targetLang: 'en'|'vi', strategy: 'whole-file'|'sentence-by-sentence' }`
  - Output: `{ translationId: string, sourceMarkdownId: string, targetLang: string, strategy: string, status: 'queued'|'running'|'succeeded'|'failed', createdAt: string }`
  - CSV: WRITE `translations.csv` `[translationId, sourceMarkdownId, targetLang, strategy, status, createdAt]`; if sentence strategy, INIT `translations_sentences.csv` rows `[translationId, sentenceId, translatedText, updatedAt]`
  - Filesystem: write translated markdown under `database/markdown_translated/{translationId}/` (as ready)
  - Status: 201 / 400 (invalid strategy or missing breakdown)
- GET `/api/translate/jobs`
  - Input: query `page, pageSize, sort?, order?`, optional `status`, `targetLang`
  - Output: paging envelope of translation jobs
  - CSV: READ `translations.csv`
  - Filesystem: none
  - Status: 200
- GET `/api/translate/jobs/:id`
  - Input: path `id` (translationId)
  - Output: translation job or 404
  - CSV: READ `translations.csv`
  - Filesystem: none
  - Status: 200 / 404
- GET `/api/translate/markdowns`
  - Input: query `page, pageSize, sort?, order?`, optional `sourceMarkdownId`
  - Output: paging envelope of `{ translationId, sourceMarkdownId, targetLang, path, createdAt }`
  - CSV: READ `translations.csv` + translated outputs index (e.g., `markdown_translated_index.csv`)
  - Filesystem: translated markdown at `database/markdown_translated/{translationId}/{output.md}`
  - Status: 200

Translation Fine-tune `/api/translation-fine-tune/`
- GET `/api/translation-fine-tune/:translationId`
  - Input: path `translationId`, query `page, pageSize, sort?, order?`
  - Output: paging envelope of `{ sentenceId, originalText, translatedText }`
  - CSV: READ `breakdown.csv` + `translations_sentences.csv`
  - Filesystem: none
  - Status: 200 / 404
- PUT `/api/translation-fine-tune/:translationId`
  - Input: path `translationId`, body `Array<{ sentenceId: string, translatedText: string }>`
  - Output: `{ translationId: string, updated: number }`
  - CSV: UPSERT `translations_sentences.csv`; update aggregate translated markdown file
  - Filesystem: rewrite translated markdown under `database/markdown_translated/{translationId}/`
  - Status: 200 / 400

Compose `/api/compose/`
- POST `/api/compose/jobs`
  - Input: body `{ inputMarkdownIds: string[], format: 'side-by-side'|'paragraph-by-paragraph'|'sentence-by-sentence'|'translated-only' }`
  - Output: `{ jobId: string, inputs: string[], format: string, status: 'queued'|'running'|'succeeded'|'failed', outputPath?: string, createdAt: string }`
  - CSV: WRITE `compose_jobs.csv` `[jobId, inputs(json), format, status, outputPath, createdAt]`
  - Filesystem: composed markdown at `database/markdown_composed/{jobId}/{output.md}`
  - Status: 201 / 400
- GET `/api/compose/jobs`
  - Input: query `page, pageSize, sort?, order?`, optional `status`
  - Output: paging envelope of compose jobs
  - CSV: READ `compose_jobs.csv`
  - Filesystem: none
  - Status: 200
- GET `/api/compose/jobs/:id`
  - Input: path `id` (jobId)
  - Output: compose job or 404
  - CSV: READ `compose_jobs.csv`
  - Filesystem: none
  - Status: 200 / 404
- GET `/api/compose/markdowns`
  - Input: query `page, pageSize, sort?, order?`
  - Output: paging envelope of `{ jobId, path, createdAt }`
  - CSV: READ from `compose_jobs.csv` where `status='succeeded'` (or `compose_index.csv`)
  - Filesystem: composed markdown at persisted `outputPath`
  - Status: 200

Convert to EPUB `/api/convert-to-epub/`
- POST `/api/convert-to-epub/jobs`
  - Input: body `{ inputMarkdownIds: string[] }`
  - Output: `{ jobId: string, inputs: string[], status: 'queued'|'running'|'succeeded'|'failed', outputPath?: string, createdAt: string }`
  - CSV: WRITE `epub_jobs.csv` `[jobId, inputs(json), status, outputPath, createdAt]`
  - Filesystem: epub at `database/epubs/{jobId}/{output.epub}`
  - Status: 201 / 400
- GET `/api/convert-to-epub/jobs`
  - Input: query `page, pageSize, sort?, order?`, optional `status`
  - Output: paging envelope of epub jobs
  - CSV: READ `epub_jobs.csv`
  - Filesystem: none
  - Status: 200
- GET `/api/convert-to-epub/jobs/:id`
  - Input: path `id` (jobId)
  - Output: epub job or 404
  - CSV: READ `epub_jobs.csv`
  - Filesystem: none
  - Status: 200 / 404
- GET `/api/convert-to-epub/epubs`
  - Input: query `page, pageSize, sort?, order?`
  - Output: paging envelope of `{ jobId, path, createdAt }`
  - CSV: READ from `epub_jobs.csv` where `status='succeeded'` (or `epub_index.csv`)
  - Filesystem: epub at persisted `outputPath`
  - Status: 200

Send Mail `/api/send-mail/`
- POST `/api/send-mail/jobs`
  - Input: body `{ email: string, template: 'thank-you'|'delay'|'book-ready', epubPath?: string }`
  - Output: `{ jobId: string, email: string, template: string, epubPath?: string, status: 'queued'|'running'|'succeeded'|'failed', createdAt: string }`
  - CSV: WRITE `mail_jobs.csv` `[jobId, email, template, epubPath, status, createdAt]`; UPSERT `emails.csv` `[email, lastUsedAt, count]`
  - Filesystem: none
  - Status: 201 / 400
- GET `/api/send-mail/jobs`
  - Input: query `page, pageSize, sort?, order?`, optional `status`, `email`
  - Output: paging envelope of mail jobs
  - CSV: READ `mail_jobs.csv`
  - Filesystem: none
  - Status: 200
- GET `/api/send-mail/emails`
  - Input: query `page, pageSize, sort?, order?`, optional `q` (search prefix)
  - Output: paging envelope of `{ email: string, lastUsedAt: string, count: number }`
  - CSV: READ `emails.csv`
  - Filesystem: none
  - Status: 200

Order Management `/api/order-management/`
- GET `/api/order-management/orders`
  - Input: query `page, pageSize, sort?, order?`, optional `format`, `email`
  - Output: paging envelope of orders `{ orderId, bookName, author, format, userEmail?, originalFileId?, translatedFileId?, createdAt, updatedAt? }`
  - CSV: READ `orders.csv`
  - Filesystem: none
  - Status: 200
- GET `/api/order-management/orders/:orderId`
  - Input: path `orderId`
  - Output: order record or 404
  - CSV: READ `orders.csv`
  - Filesystem: none
  - Status: 200 / 404
- POST `/api/order-management/orders`
  - Input: body `{ bookName: string, author: string, format: string, userEmail?: string, originalFileId?: string, translatedFileId?: string }`
  - Output: order record
  - CSV: WRITE `orders.csv` `[orderId, bookName, author, format, userEmail, originalFileId, translatedFileId, createdAt]`
  - Filesystem: none
  - Status: 201 / 400
- PUT `/api/order-management/orders/:orderId`
  - Input: path `orderId`, body partial order
  - Output: updated order record
  - CSV: UPDATE `orders.csv` row by `orderId`, set `updatedAt`
  - Filesystem: none
  - Status: 200 / 400 / 404
- DELETE `/api/order-management/orders/:orderId`
  - Input: path `orderId`
  - Output: `{ deleted: true }`
  - CSV: DELETE from `orders.csv` by `orderId`
  - Filesystem: none
  - Status: 200 / 404

Third-parties `/api/third-parites/`
- GET `/api/third-parites/partners`
  - Input: query `page, pageSize, sort?, order?`, optional `type`
  - Output: paging envelope of `{ partnerId, type, name, endpoint?, configJson?, contact?, createdAt }`
  - CSV: READ `partners.csv`
  - Filesystem: none
  - Status: 200
- POST `/api/third-parites/partners`
  - Input: body `{ type: 'print'|'ads'|'bookshelf'|'shipping', name: string, endpoint?: string, config?: Record<string, unknown>, contact?: string }`
  - Output: partner record
  - CSV: WRITE `partners.csv` (serialize `config` → `configJson`)
  - Filesystem: none
  - Status: 201 / 400
- PUT `/api/third-parites/partners/:partnerId`
  - Input: path `partnerId`, body partial partner
  - Output: partner record
  - CSV: UPDATE `partners.csv`
  - Filesystem: none
  - Status: 200 / 400 / 404
- DELETE `/api/third-parites/partners/:partnerId`
  - Input: path `partnerId`
  - Output: `{ deleted: true }`
  - CSV: DELETE from `partners.csv`
  - Filesystem: none
  - Status: 200 / 404
- GET `/api/third-parites/bookshelf`
  - Input: query `page, pageSize, sort?, order?`
  - Output: paging envelope of `{ shelfId, title, composedMarkdownPath, epubPath?, orderId?, createdAt }`
  - CSV: READ `bookshelf.csv`
  - Filesystem: none
  - Status: 200
- POST `/api/third-parites/bookshelf`
  - Input: body `{ title: string, composedMarkdownPath: string, epubPath?: string, orderId?: string }`
  - Output: shelf record
  - CSV: WRITE `bookshelf.csv`
  - Filesystem: none
  - Status: 201 / 400
- DELETE `/api/third-parites/bookshelf/:shelfId`
  - Input: path `shelfId`
  - Output: `{ deleted: true }`
  - CSV: DELETE from `bookshelf.csv`
  - Filesystem: none
  - Status: 200 / 404
- GET `/api/third-parites/shipments`
  - Input: query `page, pageSize, sort?, order?`, optional `status`
  - Output: paging envelope of `{ shipmentId, orderId, partnerId, status, trackingNumber?, createdAt }`
  - CSV: READ `shipments.csv`
  - Filesystem: none
  - Status: 200
- POST `/api/third-parites/shipments`
  - Input: body `{ orderId: string, partnerId: string }`
  - Output: shipment record
  - CSV: WRITE `shipments.csv`
  - Filesystem: none
  - Status: 201 / 400

API-powered search file `/api/api-powered-search-file/`
- POST `/api/api-powered-search-file/search`
  - Input: body `{ bookName?: string, orderId?: string, requestedLangs?: ('en'|'vi')[], maxResults?: number }` (if `bookName` omitted and `orderId` present, derive name from order; default requestedLangs `['en','vi']`, maxResults 10)
  - Output: `{ searchId: string, query: string, requestedLangs: string[], maxResults: number, status: 'queued'|'running'|'succeeded'|'failed', createdAt: string }`
  - CSV: WRITE `api_searches.csv` `[searchId, query, source, requestedLangs(json), maxResults, status, createdAt]`
  - Filesystem: none
  - Status: 201 / 400 (no query derivable)
- GET `/api/api-powered-search-file/searches`
  - Input: query `page, pageSize, sort?, order?`, optional `status`
  - Output: paging envelope of `{ searchId, query, source, requestedLangs, maxResults, status, createdAt }`
  - CSV: READ `api_searches.csv`
  - Filesystem: none
  - Status: 200
- GET `/api/api-powered-search-file/searches/:searchId`
  - Input: path `searchId`
  - Output: `{ searchId, query, source, requestedLangs, maxResults, status, createdAt }` or 404
  - CSV: READ `api_searches.csv`
  - Filesystem: none
  - Status: 200 / 404
- GET `/api/api-powered-search-file/results`
  - Input: query `searchId` (required), `page, pageSize, sort?, order?`
  - Output: paging envelope of `{ resultId: string, searchId: string, title: string, url: string, fileType: 'pdf'|'unknown', language: 'en'|'vi'|'unknown', isFree: boolean, priceCents?: number, rank: number, discoveredAt: string }`
  - CSV: READ `api_search_results.csv`
  - Filesystem: none
  - Status: 200 / 400 (missing searchId)
- POST `/api/api-powered-search-file/downloads`
  - Input: body `{ resultId: string }`
  - Output: `{ downloadId: string, resultId: string, filename: string, path: string, mime: string, size: number, createdAt: string }`
  - CSV: WRITE `api_search_downloads.csv` `[downloadId, resultId, filename, path, mime, size, createdAt]`
  - Filesystem: download file stored at `database/search_downloads/{downloadId}/{filename}`
  - Status: 201 / 400 (invalid result or unsupported file type)
- GET `/api/api-powered-search-file/downloads`
  - Input: query `page, pageSize, sort?, order?`, optional `searchId`
  - Output: paging envelope of `{ downloadId, resultId, filename, path, mime, size, createdAt }`
  - CSV: READ `api_search_downloads.csv`
  - Filesystem: none
  - Status: 200
- GET `/api/api-powered-search-file/downloads/:downloadId/file`
  - Input: path `downloadId`
  - Output: file stream with `Content-Disposition` attachment
  - CSV: READ `api_search_downloads.csv`
  - Filesystem: read file from `database/search_downloads/{downloadId}/{filename}`
  - Status: 200 / 404

Notes on ranking criteria
- Businessservice should use OpenAI-powered web search to discover results for the query and rank as:
  1) PDF results in English and Vietnamese (requested languages first)
  2) Free results appear before paid results; among paid, sort by lowest price
  3) Preserve overall top-k as `maxResults`
- Persist all discovered results with `rank` reflecting final order

Misc
- GET `/api/health`
  - Input: none
  - Output: `{ status: 'ok', time: string }`
  - CSV: none
  - Filesystem: none
  - Status: 200
- GET `/api/docs`
  - Input: none
  - Output: Swagger UI
  - CSV: none
  - Filesystem: none
  - Status: 200

Error handling and validation
- Validate inputs with zod/joi; return 400 with details on failure
- 404 for missing resources; 500 for unexpected errors (do not leak internals)
- Common error response shape is enforced across routes

Security
- `helmet` defaults
- CORS allowlist via env (comma-separated)
- Basic rate limiting on mutating endpoints and job starters
- File type checks against `FILE_SUPPORTED`

Logging and metrics
- JSON logs with request id; log incoming requests, errors, and job state transitions
- Optional: simple metrics endpoint `/api/health` with uptime and timestamp

Swagger
- Served at `/api/docs`
- Tags by tool: settings, upload, convert-markdown, content-breakdown, translate, translation-fine-tune, compose, convert-to-epub, send-mail, order-management, third-parites, api-powered-search-file
- Include component schemas for all models and CSV-backed entities

Docker and deployment
- Node service listens on `3000`
- Nginx container on `80` reverse-proxies `/api` to Node
- Mount `database/` as a volume or bake as a writable path
- Healthcheck ping `/api/health`

Non-functional requirements
- Consistent performance for paging over up to ~50k rows per CSV (optimize by streaming, indexing columns in memory as needed)
- Filesystem-safe paths; sanitize filenames; avoid path traversal
- All write operations atomic (write temp + rename)

Milestones (execution order)
1) Bootstrap Express app, env, logging, security, Swagger (tags + health) — `/api/docs`, `/api/health`
2) Settings dataservice + routes
3) Uploads (multipart, storage, listing)
4) Convert markdown jobs + outputs listing (stub conversion)
5) Content breakdown (stub)
6) Translate (stub strategies, gating on breakdown for sentence mode)
7) Translation fine-tune (read/write sentence pairs)
8) Compose (formats stub)
9) Convert to EPUB (stub outputs)
10) Send mail (stub sending + email suggestions)
11) Order management CRUD
12) Third-parites (partners, bookshelf, shipments)
13) Hardening: paging, sorting, validation coverage, tests, Docker, Nginx

Definition of Done
- Endpoints implemented with validations, paging, and consistent error handling
- CSV files read/written as specified; filesystem operations safe and atomic
- Swagger docs complete and accurate; `/api/docs` browsable
- Tests for dataservices and routes; lint/typecheck passing
- Docker image builds and runs behind Nginx; `/api/health` OK