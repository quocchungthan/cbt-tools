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

Filesystem layout
- Uploads: `database/uploads/{id}/{originalFilename}`
- Markdown outputs: `database/markdown/{jobId}/{output.md}`
- Translated markdown: `database/markdown_translated/{translationId}/{output.md}`
- Composed markdown: `database/markdown_composed/{jobId}/{output.md}`
- EPUB outputs: `database/epubs/{jobId}/{output.epub}`

Paging for GET list endpoints
- Query params: `page` (default 1, min 1), `pageSize` (default 20, max 100), optional `sort` and `order` ('asc'|'desc')
- Response envelope: `{ items: T[], page: number, pageSize: number, total: number, totalPages: number }`
- Implementation: load from CSV, apply filters, sort, then paginate in-memory

API endpoints and IO mapping

Settings `/api/settings/`
- GET `/api/settings/`
  - Output: `{ fileSupported: string, openAiKey?: string, openAiModel?: string, openAiProjectId?: string, openAiOrgId?: string, sheetApiKey?: string, sheetName?: string, sheetId?: string }`
  - CSV: READ `settings.csv` (fallback to `.env`)
- PUT `/api/settings/`
  - Body: partial settings fields
  - Output: saved object (same shape)
  - CSV: UPSERT `settings.csv`

Upload `/api/upload/`
- POST `/api/upload/` (multipart field `file`)
  - Output: `{ id, filename, originalPath, mime, size, createdAt }`
  - CSV: WRITE `uploads.csv`; FS: save under `uploads/{id}/`
- GET `/api/upload/` (paged list)
  - Output: paging envelope of upload records
  - CSV: READ `uploads.csv`
- GET `/api/upload/:id`
  - Output: single record or 404
  - CSV: READ `uploads.csv`

Convert Markdown `/api/convert-markdown/`
- POST `/api/convert-markdown/jobs`
  - Body: `{ uploadId: string, command?: string, options?: object }`
  - Output: job record with status and progress
  - CSV: WRITE `convert_markdown_jobs.csv`
- GET `/api/convert-markdown/jobs` (paged list)
  - Output: paging envelope of jobs
  - CSV: READ `convert_markdown_jobs.csv`
- GET `/api/convert-markdown/jobs/:jobId`
  - Output: job record or 404
  - CSV: READ `convert_markdown_jobs.csv`
- GET `/api/convert-markdown/markdowns` (paged list)
  - Output: paging envelope of `{ jobId, markdownId, path, createdAt }`
  - CSV: READ `markdown_outputs.csv`

Content Breakdown `/api/content-breakdown/`
- POST `/api/content-breakdown/:markdownId`
  - Output: `{ markdownId, recordsCreated }`
  - CSV: WRITE `breakdown.csv` records
- GET `/api/content-breakdown/:markdownId` (paged list)
  - Output: paging envelope of breakdown rows
  - CSV: READ `breakdown.csv`

Translate `/api/translate/`
- POST `/api/translate/jobs`
  - Body: `{ sourceMarkdownId: string, targetLang: 'en'|'vi', strategy: 'whole-file'|'sentence-by-sentence' }`
  - Output: translation job
  - CSV: WRITE `translations.csv` (+ init `translations_sentences.csv` when sentence mode)
- GET `/api/translate/jobs` (paged list)
  - Output: paging envelope of translation jobs
  - CSV: READ `translations.csv`
- GET `/api/translate/jobs/:id`
  - Output: job or 404
  - CSV: READ `translations.csv`
- GET `/api/translate/markdowns` (paged list)
  - Output: paging envelope of translated outputs
  - CSV: READ `translations.csv` + translated outputs index

Translation Fine-tune `/api/translation-fine-tune/`
- GET `/api/translation-fine-tune/:translationId` (paged list)
  - Output: paging envelope of `{ sentenceId, originalText, translatedText }`
  - CSV: READ `breakdown.csv` + `translations_sentences.csv`
- PUT `/api/translation-fine-tune/:translationId`
  - Body: `Array<{ sentenceId: string, translatedText: string }>`
  - Output: `{ translationId, updated: number }`
  - CSV: UPSERT `translations_sentences.csv` and update translated markdown file

Compose `/api/compose/`
- POST `/api/compose/jobs`
  - Body: `{ inputMarkdownIds: string[], format: 'side-by-side'|'paragraph-by-paragraph'|'sentence-by-sentence'|'translated-only' }`
  - Output: compose job
  - CSV: WRITE `compose_jobs.csv`
- GET `/api/compose/jobs` (paged list)
  - Output: paging envelope of compose jobs
  - CSV: READ `compose_jobs.csv`
- GET `/api/compose/jobs/:id`
  - Output: job or 404
  - CSV: READ `compose_jobs.csv`
- GET `/api/compose/markdowns` (paged list)
  - Output: paging envelope of composed outputs
  - CSV: READ from `compose_jobs.csv` where `status='succeeded'`

Convert to EPUB `/api/convert-to-epub/`
- POST `/api/convert-to-epub/jobs`
  - Body: `{ inputMarkdownIds: string[] }`
  - Output: epub job
  - CSV: WRITE `epub_jobs.csv`
- GET `/api/convert-to-epub/jobs` (paged list)
  - Output: paging envelope of epub jobs
  - CSV: READ `epub_jobs.csv`
- GET `/api/convert-to-epub/jobs/:id`
  - Output: job or 404
  - CSV: READ `epub_jobs.csv`
- GET `/api/convert-to-epub/epubs` (paged list)
  - Output: paging envelope of epubs
  - CSV: READ from `epub_jobs.csv` where `status='succeeded'`

Send Mail `/api/send-mail/`
- POST `/api/send-mail/jobs`
  - Body: `{ email: string, template: 'thank-you'|'delay'|'book-ready', epubPath?: string }`
  - Output: mail job
  - CSV: WRITE `mail_jobs.csv`; UPSERT `emails.csv`
- GET `/api/send-mail/jobs` (paged list)
  - Output: paging envelope of mail jobs
  - CSV: READ `mail_jobs.csv`
- GET `/api/send-mail/emails` (paged list + optional search)
  - Query: optional `q`
  - Output: paging envelope of `{ email, lastUsedAt, count }`
  - CSV: READ `emails.csv`

Order Management `/api/order-management/`
- GET `/api/order-management/orders` (paged list)
  - Output: paging envelope of orders
  - CSV: READ `orders.csv`
- GET `/api/order-management/orders/:orderId`
  - Output: order or 404
  - CSV: READ `orders.csv`
- POST `/api/order-management/orders`
  - Body: `{ bookName, author, format, userEmail?, originalFileId?, translatedFileId? }`
  - Output: order
  - CSV: WRITE `orders.csv`
- PUT `/api/order-management/orders/:orderId`
  - Body: partial order
  - Output: order
  - CSV: UPDATE `orders.csv`
- DELETE `/api/order-management/orders/:orderId`
  - Output: `{ deleted: true }`
  - CSV: DELETE `orders.csv`

Third-parties `/api/third-parites/`
- Partners
  - GET `/api/third-parites/partners` (paged list)
    - Output: paging envelope of partners
    - CSV: READ `partners.csv`
  - POST `/api/third-parites/partners`
    - Body: `{ type, name, endpoint?, config?, contact? }`
    - Output: partner record
    - CSV: WRITE `partners.csv` (serialize `config` → `configJson`)
  - PUT `/api/third-parites/partners/:partnerId`
    - Body: partial partner
    - Output: partner record
    - CSV: UPDATE `partners.csv`
  - DELETE `/api/third-parites/partners/:partnerId`
    - Output: `{ deleted: true }`
    - CSV: DELETE `partners.csv`
- Bookshelf
  - GET `/api/third-parites/bookshelf` (paged list)
    - Output: paging envelope of bookshelf entries
    - CSV: READ `bookshelf.csv`
  - POST `/api/third-parites/bookshelf`
    - Body: `{ title, composedMarkdownPath, epubPath?, orderId? }`
    - Output: shelf record
    - CSV: WRITE `bookshelf.csv`
  - DELETE `/api/third-parites/bookshelf/:shelfId`
    - Output: `{ deleted: true }`
    - CSV: DELETE `bookshelf.csv`
- Shipments
  - GET `/api/third-parites/shipments` (paged list)
    - Output: paging envelope of shipments
    - CSV: READ `shipments.csv`
  - POST `/api/third-parites/shipments`
    - Body: `{ orderId, partnerId }`
    - Output: shipment record
    - CSV: WRITE `shipments.csv`

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
- Tags by tool: settings, upload, convert-markdown, content-breakdown, translate, translation-fine-tune, compose, convert-to-epub, send-mail, order-management, third-parites
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