## Application Design [Angular] — Incremental Ticket Plan (Aligned to Spec)

This plan translates the provided specification into actionable, incremental tickets. It assumes Angular 17+ with SSR, an embedded Node/Express server for APIs, CSV-backed persistence (temporary), and a clear separation between `dataservice` (persistence/IO) and `businessservice` (domain process orchestration). All APIs are prefixed with `/api/tool-name/` and documented via Swagger at `/api/docs`.

Global defaults
- Angular: 17+, Standalone APIs, SSR (Angular Universal)
- Server: Express embedded in Angular SSR (`server.ts`), routes split per tool
- Storage: CSV files under `database/` (git-ignored); later replaceable with DB
- ID generation: UUID v4
- Env: `.env` with `FILE_SUPPORTED=".pdf"` default; also OpenAI and Sheets keys
- UI Theme: Inspired by cursor.com; consistent components and spacing
- Docker: Multi-stage build; Nginx on port 80 reverse-proxies to Node SSR server; direct deep links work
- Coding style: Short methods, no bloaters; one model per file; one service per file; one dataservice per file

Labels and estimates
- Labels: `type:setup`, `type:feature`, `type:infra`, `type:security`, `type:docs`, `type:tests`, `type:ux`
- Sizes: `size:S` (≤1d), `size:M` (≤3d), `size:L` (≤1w), `size:XL` (>1w)
- Priority: `P0`, `P1`, `P2`

Directory baseline
- `database/` (CSV files, .gitignored)
- `server/` (SSR, API routes) with `server.ts`, `api/` grouped per tool
- `src/app/features/tools/*` (UI per tool)
- `src/app/core/` (providers, logging, config)
- `src/app/shared/` (UI primitives, tables, forms)
- `models/`, `services/dataservice/`, `services/businessservice/`
- `docs/`

---

Epic E0 — Foundation, SSR API, and Standards

E0-01 Initialize workspace, SSR, and routing shell [size:S, P0, type:setup]
- Create Angular 17 app with SSR (Universal). Add base routes `/`, `/tools`.
- Acceptance: SSR builds and serves; navigating to `/` and `/tools` works.

E0-02 `.env` and configuration provider [size:S, P0, type:infra]
- Add `.env` and `.env.example` with `FILE_SUPPORTED=".pdf"`, OpenAI keys (key, model, project id, org id), Sheets keys (api key, sheet name, sheet id).
- Provide app-wide configuration service with env fallback.
- Acceptance: Config injectable; unit tests confirm defaults from env.

E0-03 Git ignore and `database/` setup [size:S, P0, type:setup]
- Create `database/` folder; add to `.gitignore`.
- Acceptance: `database/` excluded from git; present in dev.

E0-04 Dataservice/businessservice architecture scaffolding [size:M, P0, type:infra]
- Create base interfaces:
  - Dataservice: CRUD over CSV, file IO utils, schema validation, id generation.
  - Businessservice: Stateless orchestrators calling dataservices; placeholder implementations for later processing (convert/compose/etc.).
- Acceptance: Interfaces defined; one example implementation with tests.

E0-05 API scaffolding and route partitioning [size:M, P0, type:infra]
- Embed Express into `server.ts`. Split API routes per tool under `server/api/<tool>/routes/*.ts`.
- Global prefix `/api` and per-tool prefix `/api/tool-name/`.
- Acceptance: Health endpoint `/api/health` returns 200; example tool endpoint returns 200.

E0-06 Swagger `/api/docs` [size:S, P0, type:infra]
- Generate OpenAPI spec from route definitions; serve Swagger UI at `/api/docs`.
- Acceptance: Browsable docs with paths grouped per tool.

E0-07 Theming and base UI [size:M, P1, type:ux]
- Theme resembling cursor.com: colors, typography, form controls, focus states.
- Acceptance: Design tokens in CSS variables; global styles applied; dark/light optional.

E0-08 Top navigation and route wiring [size:S, P1, type:feature]
- Top nav links: Home (`/`), Tools (`/tools`). Tools page links to sub-tools.
- Acceptance: Client routing to all tools pages; SSR deep links resolved via Nginx/Node.

E0-09 Docker + Nginx reverse proxy [size:L, P0, type:infra]
- Multi-stage build: Angular SSR server (Node) + Nginx on 80 proxying `/api` to Node and serving static/SSR for app routes. Direct URLs work.
- Acceptance: `docker run -p 80:80` serves app; `/tools/*` deep links work; `/api/*` reachable.

E0-10 Coding standards and documentation [size:S, P1, type:docs]
- Document rules: short methods, one model/service per file, separation of concerns, naming conventions, testing requirements.
- Acceptance: `docs/dev-preferences.md` committed.

---

Epic E1 — Settings Tool `/tools` (User Preferences & Settings)

Data requirements
- CSV: `database/settings.csv` with keys/values; defaults from `.env` when missing.
- Fields: `fileSupported` (default from env), `openAiKey`, `openAiModel`, `openAiProjectId`, `openAiOrgId`, `sheetApiKey`, `sheetName`, `sheetId`, and extensible.

E1-01 Settings models and dataservice [size:S, P0, type:feature]
- Create `Settings` model and `settingsDataservice` to read/write CSV with fallback to env.
- Acceptance: Read returns defaults if CSV absent; write persists CSV; tests added.

E1-02 Settings UI form and save [size:M, P0, type:feature]
- Build form on `/tools` to edit settings. Include all specified fields; validate presence where needed.
- On save, call API to persist via dataservice to CSV.
- Acceptance: Form loads existing/fallback values; saving updates CSV; toasts on success/error.

E1-03 Settings API endpoints [size:S, P0, type:infra]
- `GET /api/settings/` read; `PUT /api/settings/` update.
- Swagger documented; error handling consistent.
- Acceptance: Endpoints tested via e2e.

---

Epic E2 — Upload Tool `/tools/upload`

Data requirements
- CSV: `database/uploads.csv` with columns: `id`, `filename`, `originalPath`, `mime`, `size`, `createdAt`.
- Files stored under `database/uploads/<id>/<originalFilename>`.

E2-01 Upload dataservice and storage layout [size:M, P0, type:infra]
- Create dataservice for upload records and filesystem writes; generate UUIDs.
- Acceptance: Files written under per-id directory; CSV entries created; tests included.

E2-02 Upload businessservice (stub) [size:S, P1, type:infra]
- Orchestrates id generation and storage; no heavy processing yet.
- Acceptance: Service returns created record; unit tests.

E2-03 Upload API [size:M, P0, type:feature]
- `POST /api/upload/` multipart; returns record.
- `GET /api/upload/` list; `GET /api/upload/:id` detail.
- Acceptance: Swagger docs; file size/type validated against `fileSupported`.

E2-04 Upload UI [size:M, P0, type:feature]
- Page with uploader and table listing uploads (id, name, size, date).
- Acceptance: Upload new file; table updates; validation messages shown.

---

Epic E3 — Convert to Markdown `/tools/convert-markdown`

Data requirements
- CSV: `database/convert_markdown_jobs.csv` with `jobId`, `uploadId`, `command`, `status`, `progress`, `createdAt`.
- Outputs under `database/markdown/<jobId>/<output.md>`; list tracked in `database/markdown_outputs.csv` with `jobId`, `markdownId`, `path`, `createdAt`.

E3-01 Convert dataservice [size:M, P1, type:infra]
- Persist jobs and outputs; list existing markdowns.
- Acceptance: Can record job lifecycle and output paths; tests for CSV round-trip.

E3-02 Convert businessservice (template) [size:M, P1, type:infra]
- Placeholder conversion pipeline; accepts upload id, options; updates progress.
- Acceptance: Emits progress events; stubs write demo markdown file.

E3-03 Convert API [size:M, P1, type:feature]
- `POST /api/convert-markdown/jobs` start job; `GET /api/convert-markdown/jobs` list; `GET /api/convert-markdown/jobs/:jobId` status; `GET /api/convert-markdown/markdowns` list outputs.
- Acceptance: Swagger; progress observable (polling or SSE optional).

E3-04 Convert UI [size:M, P1, type:feature]
- Dropdown to select uploaded file; form for options; table of submitted commands with status/progress; list of available markdown outputs.
- Acceptance: Start job; see progress; see outputs.

---

Epic E4 — Content Breakdown `/tools/content-breakdown`

Data requirements
- CSV: `database/breakdown.csv` with `markdownId`, `chapterId`, `paragraphId`, `sentenceId`, `text`, `position` (or similar for ordering).
- Map of markdownId to breakdown records; additional index CSV optional.

E4-01 Breakdown models and dataservice [size:M, P1, type:infra]
- CRUD for breakdown entries; by markdown id.
- Acceptance: Write and read breakdown sets; tests added.

E4-02 Breakdown businessservice (template) [size:M, P1, type:infra]
- Stub to split markdown into sentences/paragraphs; generates IDs and order.
- Acceptance: Deterministic breakdown for demo content.

E4-03 Breakdown API and UI [size:M, P1, type:feature]
- API: `POST /api/content-breakdown/:markdownId` produce breakdown; `GET /api/content-breakdown/:markdownId` list records.
- UI: Dropdown of available markdowns; action to run breakdown; table/grid showing records.
- Acceptance: Can run and view breakdown; CSV persisted.

---

Epic E5 — Translate `/tools/translate`

Data requirements
- CSV: `database/translations.csv` with `translationId`, `sourceMarkdownId`, `strategy`, `targetLang`, `status`, `createdAt`.
- Translated markdown files under `database/markdown_translated/<translationId>/<output.md>`.
- If sentence-by-sentence strategy: also `database/translations_sentences.csv` mapping `sentenceId` → translated text.

E5-01 Translation dataservice [size:M, P1, type:infra]
- Persist translation jobs, outputs, and (optional) sentence mappings.
- Acceptance: CRUD with indexes by source and lang.

E5-02 Translation businessservice (template) [size:M, P1, type:infra]
- Stub that copies or lightly transforms source markdown; supports strategies: whole-file; sentence-by-sentence (enabled only when breakdown exists).
- Acceptance: Flags strategy availability based on breakdown presence.

E5-03 Translation API [size:M, P1, type:feature]
- `POST /api/translate/jobs` start; `GET /api/translate/jobs`; `GET /api/translate/jobs/:id`; `GET /api/translate/markdowns` list outputs.
- Acceptance: Swagger; gating logic for strategies.

E5-04 Translation UI [size:M, P1, type:feature]
- Dropdown of source markdowns; target lang dropdown (default from settings); strategy dropdown (enable sentence-by-sentence only if breakdown exists).
- Table of submitted jobs with status; list outputs.
- Acceptance: End-to-end flow with progress.

---

Epic E6 — Translation Fine-tune `/tools/translation-fine-tune`

Data requirements
- Reads from `breakdown.csv` and `translations_sentences.csv` to map sentence pairs by `sentenceId`.
- Writes back to `translations_sentences.csv` and updates translated markdown file upon save.

E6-01 Fine-tune UI [size:L, P1, type:feature]
- Paper-like inputs for each translated sentence; original shown read-only next to it; highlighting original when translated field is focused; preserve paragraph grouping (no extra margins; squared inputs; inline).
- Acceptance: Smooth editing of many sentences; keyboard navigation; accessibility.

E6-02 Fine-tune API and businessservice [size:M, P1, type:feature]
- `GET /api/translation-fine-tune/:translationId` returns mapped pairs; `PUT /api/translation-fine-tune/:translationId` saves edits.
- Businessservice maps sentences; dataservice writes to CSV and updates composed translated markdown.
- Acceptance: Edits persist and reflect in translated markdown.

---

Epic E7 — Compose `/tools/compose`

Data requirements
- CSV: `database/compose_jobs.csv` with `jobId`, `inputs` (source ids array), `format`, `status`, `outputPath`.
- Output markdown under `database/markdown_composed/<jobId>/<output.md>`.
- Supported formats configured via settings/dataservice (e.g., side-by-side, paragraph-by-paragraph, sentence-by-sentence, translated-only default).

E7-01 Compose dataservice [size:M, P1, type:infra]
- Persist compose jobs and outputs.
- Acceptance: CRUD and list outputs.

E7-02 Compose businessservice (template) [size:M, P1, type:infra]
- Stub merging logic respecting selected format; defaults to translated-only.
- Acceptance: Writes composed markdown file deterministically.

E7-03 Compose API and UI [size:M, P1, type:feature]
- API: `POST /api/compose/jobs`; `GET /api/compose/jobs`; `GET /api/compose/jobs/:id`; `GET /api/compose/markdowns` outputs.
- UI: Dropdowns to pick markdowns from convert/translate; format dropdown sourced from settings; show progress and outputs.
- Acceptance: End-to-end compose flow.

---

Epic E8 — Convert to EPUB `/tools/convert-to-epub`

Data requirements
- CSV: `database/epub_jobs.csv` (`jobId`, `inputs`, `status`, `outputPath`);
- Outputs under `database/epubs/<jobId>/<output.epub>`;
- Businessservice must list available epubs for mail tool.

E8-01 EPUB dataservice and businessservice (template) [size:M, P1, type:infra]
- Persist jobs and outputs; stub converter writing a sample EPUB.
- Acceptance: Outputs appear; businessservice lists epubs consumable by mail tool.

E8-02 EPUB API and UI [size:M, P1, type:feature]
- API: `POST /api/convert-to-epub/jobs`; `GET /api/convert-to-epub/jobs`; `GET /api/convert-to-epub/jobs/:id`; `GET /api/convert-to-epub/epubs` list.
- UI: Select input markdowns; show conversion jobs and output list.
- Acceptance: End-to-end conversion with visible epubs.

---

Epic E9 — Send Mail `/tools/send-mail`

Data requirements
- Settings provide email config; CSV: `database/emails.csv` with `email`, `lastUsedAt`, `count`; CSV: `database/mail_jobs.csv` with `jobId`, `email`, `template`, `epubPath`, `status`, `createdAt`.

Templates
- Option 1: Thank you for using our service
- Option 2: Sorry for the delay
- Option 3: The book is ready (attach selected EPUB)

E9-01 Mail dataservice and businessservice (template) [size:M, P1, type:infra]
- Persist mail jobs and email list; suggestions dropdown from `emails.csv`.
- Businessservice returns known emails; stub send (no real SMTP initially).
- Acceptance: Job persistence; suggestions update after sends.

E9-02 Mail API and UI [size:M, P1, type:feature]
- API: `POST /api/send-mail/jobs`; `GET /api/send-mail/jobs`; `GET /api/send-mail/emails`.
- UI: New email input with suggestions; template selection; EPUB dropdown populated from E8; status table.
- Acceptance: Create jobs; statuses visible; emails list grows.

---

Epic E10 — Order Management `/tools/order-management`

Data requirements
- CSV: `database/orders.csv` with `orderId`, `bookName` (req), `author` (req), `format` (req from settings), `userEmail`, `originalFileId` (optional), `translatedFileId` (optional), `createdAt`.

E10-01 Order models, dataservice, and UI [size:L, P1, type:feature]
- CRUD orders; validations for required fields; supported file types aligned with settings.
- Acceptance: Table + create/edit/delete modals; references to upload ids validated.

E10-02 Order API [size:M, P1, type:feature]
- RESTful endpoints under `/api/order-management/` for CRUD.
- Acceptance: Swagger documented; e2e tests for CRUD.

---

Epic E11 — Third-parties Management `/tools/third-parites` (printing, ads, bookshelf, shipping)

Data requirements
- CSV: `database/partners.csv` with partner records (type, name, endpoints/configs, contact).
- CSV: `database/bookshelf.csv` listing available composed books; references to files via path columns (pdf, md, epub).
- CSV: `database/shipments.csv` with shipping requests.

E11-01 Partners CRUD [size:M, P2, type:feature]
- UI + API to manage print manufacturers, ads, bookshelf entries, shipping partners.
- Acceptance: Table views and forms; references to related files stored by path.

E11-02 Bookshelf order-to-print flow (stub) [size:L, P2, type:feature]
- Select an order on the shelf and submit; businessservice stubs sending to print manufacturer and creating a shipment record.
- Acceptance: Records created; statuses updated.

---

Epic E12 — Common Infrastructure and Cross-cutting Concerns

E12-01 File reference policy and schemas [size:S, P0, type:docs]
- Document CSV schemas and file path conventions for each tool.
- Acceptance: `docs/csv-schemas.md` complete.

E12-02 Logging and job progress model [size:M, P1, type:infra]
- Standardize job statuses: queued, running, succeeded, failed; include progress percent and messages.
- Acceptance: Utilities available and used by all job-based tools.

E12-03 Reusable UI primitives [size:M, P1, type:ux]
- Tables with sorting/filtering; form field components; toasts; confirmations.
- Acceptance: Used in at least three tools.

E12-04 Security basics [size:S, P1, type:security]
- Input validation, file type checking from settings, rate limits on sensitive endpoints.
- Acceptance: Tests for validation; configuration-driven limits.

E12-05 Tests and CI [size:M, P1, type:tests]
- Unit tests for dataservices/businessservices; e2e smoke for main flows; CI runs tests and lints.
- Acceptance: Green CI on PRs; coverage threshold documented.

E12-06 Swagger completeness and grouping [size:S, P1, type:infra]
- Ensure all endpoints documented and grouped under their tool names.
- Acceptance: `/api/docs` shows all paths; no missing schemas.

---

API Overview (prefix and examples)
- Base: `/api`
- Settings: `/api/settings/`
- Upload: `/api/upload/`
- Convert Markdown: `/api/convert-markdown/`
- Content Breakdown: `/api/content-breakdown/`
- Translate: `/api/translate/`
- Translation Fine-tune: `/api/translation-fine-tune/`
- Compose: `/api/compose/`
- Convert to EPUB: `/api/convert-to-epub/`
- Send Mail: `/api/send-mail/`
- Order Mgmt: `/api/order-management/`
- Third-parties: `/api/third-parites/`
- Swagger: `/api/docs`

Suggested execution order
1) E0 Foundation (SSR, config, database/, API, Swagger, Docker/Nginx, theme, nav)
2) E1 Settings
3) E2 Upload
4) E3 Convert Markdown
5) E4 Content Breakdown
6) E5 Translate
7) E6 Translation Fine-tune
8) E7 Compose
9) E8 Convert to EPUB
10) E9 Send Mail
11) E10 Order Management
12) E11 Third-parties
13) E12 Cross-cutting hardening (logging, security, tests, docs)

Definition of Done (for all tickets)
- Short, readable methods; one model/service per file
- Types/interfaces defined; CSV schema documented where applicable
- Unit/e2e tests updated; lint/typecheck pass; CI green
- Swagger updated for any endpoint change
- UI accessible (labels, focus, keyboard); theme consistent
- No secrets in repo; `.env` driven configuration
- Direct deep links work in Docker+Nginx deployment