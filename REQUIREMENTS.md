## Frontend UI (Angular) — Plan to Consume Node APIs + Shared Contracts

This document defines the UI-only implementation plan to consume the Node backend defined in `Node-Backend-Swagger.md`. It includes epics/tickets for Angular UI, API integration, pagination, and a shared TypeScript contract model used by both backend and frontend. Backend work is tracked separately; this doc focuses on UI.

### Global Assumptions
- **Angular version**: 17+ (standalone APIs, Vite builder, control flow, hydration)
- **Node.js**: 20 LTS
- **Package manager**: pnpm (or npm/yarn per org standard)
- **Testing**: Jest (unit/integration) + Playwright (e2e)
- **Lint/Format**: ESLint + Prettier
- **CI**: GitHub Actions (or your CI of choice)
- **UI**: Angular Material + CDK + custom design tokens
- **State**: NgRx (Store/Effects/Entity/Router-Store) or Signals-based Store (choose per ticket E1-04)
- **Routing**: Standalone route definitions with lazy-loaded feature areas
- **Auth**: OIDC or JWT with refresh tokens
- **Observability**: Sentry (errors) + Web Vitals + basic tracing (optional: OpenTelemetry)

Labels used across the board:
- `type:setup`, `type:feature`, `type:infra`, `type:security`, `type:docs`, `type:tests`
- `size:S` (≤1d), `size:M` (≤3d), `size:L` (≤1w), `size:XL` (>1w)
- `priority:P0|P1|P2`

---

## Epic E0 — Foundation, Repo, and Tooling

### E0-01 Choose baseline stack and conventions
- **Description**: Confirm Angular, Node, package manager, test stack, and coding conventions. Document in `docs/stack.md`.
- **Acceptance Criteria**:
  - `docs/stack.md` lists versions and rationales
  - Decision on `pnpm` vs `npm`
  - Decision on Jest/Playwright
- **Dependencies**: None
- **Estimate**: S
- **Labels**: `type:setup`, `priority:P0`

### E0-02 Initialize repository and Angular workspace
- **Description**: Create repo, Angular workspace with standalone configuration, strict mode, Vite builder, and app skeleton.
- **Acceptance Criteria**:
  - `main` branch protected, PR workflow defined
  - Angular app generated with `standalone` true
  - Initial commit with CI placeholder
- **Dependencies**: E0-01
- **Estimate**: S
- **Labels**: `type:setup`, `priority:P0`

### E0-03 Configure ESLint and Prettier
- **Description**: Replace TSLint (if present) with ESLint. Add Prettier with compatible ESLint config.
- **Acceptance Criteria**:
  - `eslint` runs via `pnpm lint`
  - `prettier` runs via `pnpm format`
  - CI step fails on lint errors
- **Dependencies**: E0-02
- **Estimate**: S
- **Labels**: `type:infra`, `type:tests`, `priority:P0`

### E0-04 Commit hooks and quality gates
- **Description**: Add Husky + lint-staged. Enforce `typecheck`, `lint`, and `format` on commit.
- **Acceptance Criteria**:
  - `pre-commit` runs `lint-staged`
  - `pre-push` runs `pnpm test` and `pnpm typecheck`
- **Dependencies**: E0-03
- **Estimate**: S
- **Labels**: `type:infra`

### E0-05 Base scripts and environment management
- **Description**: Add scripts: `dev`, `build`, `preview`, `test`, `test:watch`, `typecheck`, `lint`, `format`. Create `.env.example`.
- **Acceptance Criteria**:
  - `.env.example` includes API base URL, auth config
  - Scripts documented in `README.md`
- **Dependencies**: E0-02
- **Estimate**: S
- **Labels**: `type:setup`

### E0-06 CI pipeline (build, lint, test, artifact)
- **Description**: Implement GitHub Actions workflow for PRs and `main` merges. Cache pnpm, node.
- **Acceptance Criteria**:
  - Workflow status visible on PRs
  - Fails on lint/test errors
  - Stores build artifact
- **Dependencies**: E0-03, E0-05
- **Estimate**: M
- **Labels**: `type:infra`, `priority:P0`

### E0-07 Code owners and review rules
- **Description**: Add `CODEOWNERS` mapping and PR template.
- **Acceptance Criteria**:
  - `CODEOWNERS` enforced
  - PR template with checklists (tests, a11y, perf)
- **Dependencies**: None
- **Estimate**: S
- **Labels**: `type:docs`

---

## Epic E1 — Architecture, Conventions, and Base App

### E1-01 Define folder structure and boundaries
- **Description**: Establish `core`, `shared`, and `features/*` structure. Document naming, public APIs.
- **Acceptance Criteria**:
  - `docs/architecture.md` with diagrams
  - Enforced barrels or explicit imports policy
- **Dependencies**: E0-02
- **Estimate**: M
- **Labels**: `type:setup`, `type:docs`

### E1-02 Core module replacement (standalone) and providers
- **Description**: Implement `app.config.ts` with global providers (http, router, interceptors). Create `core` for singletons.
- **Acceptance Criteria**:
  - `provideHttpClient` with interceptors
  - `provideRouter` with lazy routes placeholder
- **Dependencies**: E1-01
- **Estimate**: S
- **Labels**: `type:infra`

### E1-03 Shared library and UI primitives
- **Description**: Create `shared` with reusable components, directives, and pipes. Export via index.
- **Acceptance Criteria**:
  - At least Button, Modal shell, Icon wrapper
  - Storybook ready (see E5-05)
- **Dependencies**: E1-01
- **Estimate**: M
- **Labels**: `type:feature`

### E1-04 State management strategy decision (NgRx vs Signals Store)
- **Description**: Document tradeoffs and select default. Prototype one feature both ways.
- **Acceptance Criteria**:
  - Decision recorded in ADR `docs/adr/0001-state.md`
  - Benchmarks or rationale captured
- **Dependencies**: E1-01
- **Estimate**: M
- **Labels**: `type:docs`, `priority:P1`

### E1-05 Error handling strategy
- **Description**: Define global error boundary patterns, http error parsing, user-friendly toasts.
- **Acceptance Criteria**:
  - Centralized error parser utility
  - Integration with logging (E6-01)
- **Dependencies**: E6-01
- **Estimate**: S
- **Labels**: `type:infra`

### E1-06 Configuration and environment separation
- **Description**: Implement config provider reading from `environment.*` and `.env` at build time.
- **Acceptance Criteria**:
  - Distinct `dev`, `staging`, `prod` configs
  - No secrets in repo
- **Dependencies**: E0-05
- **Estimate**: S
- **Labels**: `type:security`

---

## Epic E2 — Routing and Navigation

### E2-01 Base routing with lazy-loaded features
- **Description**: Create root routes and lazy load `features/home`, `features/auth`, `features/profile` (stubs).
- **Acceptance Criteria**:
  - Navigable routes with placeholders
  - Scroll position restoration on navigation
- **Dependencies**: E1-02
- **Estimate**: S
- **Labels**: `type:feature`

### E2-02 Guards, resolvers, and preloading
- **Description**: Implement auth guard placeholder, data resolver example, and selective route preloading strategy.
- **Acceptance Criteria**:
  - Guard applied to protected routes
  - Resolver demonstrated on profile route
- **Dependencies**: E2-01, E3-02
- **Estimate**: M
- **Labels**: `type:feature`

### E2-03 Breadcrumbs and title service
- **Description**: Add dynamic document titles and breadcrumb service from route data.
- **Acceptance Criteria**:
  - Titles reflect current route
  - Breadcrumb appears on protected pages
- **Dependencies**: E2-01
- **Estimate**: S
- **Labels**: `type:feature`

---

## Epic E3 — Authentication and Authorization

### E3-01 Auth domain models and API contracts
- **Description**: Define `User`, `Session`, tokens, and API DTOs. Document flows.
- **Acceptance Criteria**:
  - Type-safe models and mappers
  - Diagrams in `docs/auth.md`
- **Dependencies**: E1-01
- **Estimate**: M
- **Labels**: `type:docs`, `type:feature`

### E3-02 Auth service and HTTP interceptors
- **Description**: Implement login, logout, refresh, token storage, Authorization header, and 401 retry.
- **Acceptance Criteria**:
  - Refresh token flow covered by tests
  - Interceptor registered globally
- **Dependencies**: E3-01, E1-02
- **Estimate**: M
- **Labels**: `type:security`, `type:feature`

### E3-03 Login/Register/Reset UI
- **Description**: Build forms with Angular Material, validation, and inline errors.
- **Acceptance Criteria**:
  - Accessible forms (labels, aria, keyboard)
  - Error messages from server displayed
- **Dependencies**: E3-02
- **Estimate**: M
- **Labels**: `type:feature`, `type:accessibility`

### E3-04 Role-based access control (RBAC)
- **Description**: Introduce simple RBAC service with route data integration.
- **Acceptance Criteria**:
  - Routes specify required roles
  - Guard enforces roles in navigation and UI
- **Dependencies**: E3-02
- **Estimate**: M
- **Labels**: `type:security`

---

## Epic E4 — Data Access Layer and HTTP

### E4-01 HTTP client utilities and API base service
- **Description**: Create base API service with typed requests, error mapping, retry/backoff helpers.
- **Acceptance Criteria**:
  - Consistent error object format
  - Global timeout and cancellation support
- **Dependencies**: E1-02
- **Estimate**: M
- **Labels**: `type:infra`

### E4-02 DTOs, mappers, and validation
- **Description**: Define DTOs and mapping to domain models. Add lightweight runtime validation (zod or custom).
- **Acceptance Criteria**:
  - Invalid API responses surface clear errors
  - Mapper tests included
- **Dependencies**: E4-01
- **Estimate**: M
- **Labels**: `type:feature`, `type:tests`

### E4-03 Client-side caching and pagination helpers
- **Description**: Provide cache layer (memory) and pagination utilities interoperable with NgRx or Signals.
- **Acceptance Criteria**:
  - Cache invalidation rules documented
  - Pagination composable usable by at least one feature
- **Dependencies**: E4-01, E1-04
- **Estimate**: M
- **Labels**: `type:infra`

---

## Epic E5 — Design System, Theming, and Storybook

### E5-01 Install Angular Material and CDK
- **Description**: Add Angular Material with custom theme scaffold.
- **Acceptance Criteria**:
  - Dark and light theme toggles
  - Typography and spacing scales defined
- **Dependencies**: E0-02
- **Estimate**: S
- **Labels**: `type:feature`, `type:accessibility`

### E5-02 Design tokens and CSS variables
- **Description**: Implement tokens for color, spacing, radius, shadow via CSS variables and exportable TS.
- **Acceptance Criteria**:
  - Tokens referenced across components
  - Docs in `docs/design-system.md`
- **Dependencies**: E5-01
- **Estimate**: M
- **Labels**: `type:infra`, `type:docs`

### E5-03 Layout system (Grid, responsive breakpoints)
- **Description**: Provide responsive grid and container components.
- **Acceptance Criteria**:
  - Breakpoints documented and tested visually
- **Dependencies**: E5-02
- **Estimate**: M
- **Labels**: `type:feature`

### E5-04 Accessibility foundations
- **Description**: Keyboard focus styles, focus trap, skip links, color contrast.
- **Acceptance Criteria**:
  - Axe/Pa11y checks pass on key pages
- **Dependencies**: E5-01
- **Estimate**: M
- **Labels**: `type:accessibility`, `type:tests`

### E5-05 Storybook setup for components
- **Description**: Configure Storybook with controls and a11y addons.
- **Acceptance Criteria**:
  - Stories for Button, Modal, FormField
  - Visual regression baseline (optional)
- **Dependencies**: E1-03
- **Estimate**: M
- **Labels**: `type:infra`, `type:tests`

---

## Epic E6 — Observability, Logging, and Monitoring

### E6-01 Client logging abstraction
- **Description**: Implement logger with levels, JSON structure, and console transport.
- **Acceptance Criteria**:
  - Replace console.* with logger usage
- **Dependencies**: None
- **Estimate**: S
- **Labels**: `type:infra`

### E6-02 Error reporting integration (Sentry)
- **Description**: Add Sentry SDK, DSN via env, source maps upload in CI.
- **Acceptance Criteria**:
  - Errors show release and user context (respect privacy)
- **Dependencies**: E0-06
- **Estimate**: M
- **Labels**: `type:infra`, `type:security`

### E6-03 Web Vitals and performance analytics
- **Description**: Capture LCP, CLS, INP and send to analytics endpoint.
- **Acceptance Criteria**:
  - Dashboard or logs show vitals per release
- **Dependencies**: None
- **Estimate**: M
- **Labels**: `type:infra`, `type:performance`

---

## Epic E7 — Performance and SSR

### E7-01 Angular Universal and hydration
- **Description**: Add SSR build and hydrate on client.
- **Acceptance Criteria**:
  - SSR route renders on server
  - No hydration mismatch in logs
- **Dependencies**: E2-01
- **Estimate**: L
- **Labels**: `type:performance`

### E7-02 Route-level code splitting and preloading
- **Description**: Ensure each feature is lazily loaded and add custom preloading for critical routes.
- **Acceptance Criteria**:
  - Bundle analyzer shows reduced main bundle
- **Dependencies**: E2-01
- **Estimate**: S
- **Labels**: `type:performance`

### E7-03 Image optimization and asset policies
- **Description**: Responsive images, lazy loading, preconnect, and caching headers.
- **Acceptance Criteria**:
  - Largest images served in WebP/AVIF
- **Dependencies**: None
- **Estimate**: S
- **Labels**: `type:performance`

### E7-04 Performance budgets in CI
- **Description**: Set budgets for bundle sizes and INP/LCP thresholds.
- **Acceptance Criteria**:
  - CI fails on budget regressions
- **Dependencies**: E0-06
- **Estimate**: S
- **Labels**: `type:infra`, `type:performance`

---

## Epic E8 — Testing Strategy and Coverage

### E8-01 Unit testing with Jest
- **Description**: Configure Jest with ts-jest or swc, set coverage thresholds.
- **Acceptance Criteria**:
  - `pnpm test` runs and reports coverage
- **Dependencies**: E0-03
- **Estimate**: M
- **Labels**: `type:tests`

### E8-02 Component testing with Testing Library
- **Description**: Add `@testing-library/angular` and patterns for DOM queries.
- **Acceptance Criteria**:
  - Tests for shared components exist
- **Dependencies**: E1-03
- **Estimate**: S
- **Labels**: `type:tests`

### E8-03 E2E testing with Playwright
- **Description**: Create basic login and navigation e2e specs.
- **Acceptance Criteria**:
  - E2E runs in CI headless
- **Dependencies**: E3-03, E0-06
- **Estimate**: M
- **Labels**: `type:tests`

### E8-04 Test data builders and API mocking
- **Description**: Introduce factories/builders and MSW-like mocking (or Angular `provideHttpClientTesting`).
- **Acceptance Criteria**:
  - Unit tests avoid real network
- **Dependencies**: E8-01
- **Estimate**: S
- **Labels**: `type:tests`

---

## Epic E9 — Security and Compliance

### E9-01 Dependency scanning and updates
- **Description**: Enable Dependabot/Renovate and `npm audit` checks.
- **Acceptance Criteria**:
  - Automated PRs for updates
- **Dependencies**: E0-06
- **Estimate**: S
- **Labels**: `type:security`, `type:infra`

### E9-02 Content Security Policy (CSP)
- **Description**: Define CSP compatible with SSR and analytics. Document required origins.
- **Acceptance Criteria**:
  - Report-only mode enabled initially
- **Dependencies**: E7-01
- **Estimate**: M
- **Labels**: `type:security`

### E9-03 Secrets handling and .env policy
- **Description**: Centralize secrets in CI and do not commit to repo. Pre-commit checks.
- **Acceptance Criteria**:
  - `gitleaks` or similar runs in CI
- **Dependencies**: E0-04, E0-06
- **Estimate**: S
- **Labels**: `type:security`

---

## Epic E10 — Internationalization (i18n) and Localization

### E10-01 i18n scaffolding
- **Description**: Enable Angular i18n or Transloco. Create locale switcher and translation files.
- **Acceptance Criteria**:
  - Two locales visible in app (e.g., en, es)
- **Dependencies**: E1-02
- **Estimate**: M
- **Labels**: `type:feature`, `type:accessibility`

### E10-02 Date/number/currency formatting
- **Description**: Provide pipes/utilities and locale-aware formatting.
- **Acceptance Criteria**:
  - Locale switch updates formats immediately
- **Dependencies**: E10-01
- **Estimate**: S
- **Labels**: `type:feature`

---

## Epic E11 — PWA and Offline (Optional)

### E11-01 Service Worker and caching strategies
- **Description**: Enable service worker, cache static assets, and define runtime caching.
- **Acceptance Criteria**:
  - Lighthouse PWA passes core checks
- **Dependencies**: E7-01
- **Estimate**: M
- **Labels**: `type:feature`, `type:performance`

### E11-02 Offline UX and sync
- **Description**: Provide offline indicators and deferred sync for queued actions.
- **Acceptance Criteria**:
  - Actions queued offline are retried when online
- **Dependencies**: E11-01, E4-03
- **Estimate**: L
- **Labels**: `type:feature`

---

## Epic E12 — Release, Environments, and Delivery

### E12-01 Environment deployments
- **Description**: Configure staging and production deployments (e.g., Vercel/CF Pages/Static hosting + SSR node where needed).
- **Acceptance Criteria**:
  - PR previews available
  - Staging and prod URLs documented
- **Dependencies**: E0-06, E7-01
- **Estimate**: M
- **Labels**: `type:infra`

### E12-02 Versioning and changelog
- **Description**: Conventional commits, semantic-release (or Changesets) for automated versioning and changelog.
- **Acceptance Criteria**:
  - Automatic release notes on main merges
- **Dependencies**: E0-04
- **Estimate**: M
- **Labels**: `type:infra`, `type:docs`

### E12-03 Feature flags and progressive delivery
- **Description**: Add boolean flag provider and docs on rollout strategy.
- **Acceptance Criteria**:
  - At least one feature behind a flag
- **Dependencies**: E1-02
- **Estimate**: S
- **Labels**: `type:feature`, `type:infra`

---

## Epic E13 — Documentation and Developer Experience

### E13-01 Repository documentation
- **Description**: Write `README.md`, `CONTRIBUTING.md`, and `docs/index.md`.
- **Acceptance Criteria**:
  - Local dev steps validated on clean machine
- **Dependencies**: E0-05
- **Estimate**: S
- **Labels**: `type:docs`

### E13-02 Architecture Decision Records (ADR)
- **Description**: Set up `docs/adr` and capture key decisions (state, SSR, testing).
- **Acceptance Criteria**:
  - At least three ADRs filed
- **Dependencies**: E1-04, E7-01, E8-01
- **Estimate**: S
- **Labels**: `type:docs`

### E13-03 Developer onboarding guide
- **Description**: Short guide to set up, debug, profile, and test.
- **Acceptance Criteria**:
  - Verified by a new contributor
- **Dependencies**: E13-01
- **Estimate**: S
- **Labels**: `type:docs`

---

## Epic E14 — Feature Templates and Placeholders

These tickets establish repeatable patterns for product features. Replace `Entity` with your domain object (e.g., Project, Order, Dashboard).

### E14-01 Feature scaffolding template
- **Description**: Create a script or documented steps to generate a feature with routes, store, services, and tests.
- **Acceptance Criteria**:
  - Template produces compilable feature with tests
- **Dependencies**: E1-01, E8-01
- **Estimate**: M
- **Labels**: `type:infra`

### E14-02 `Entity` list page
- **Description**: Build list view with server-driven pagination, sorting, and filters.
- **Acceptance Criteria**:
  - Accessible table with keyboard navigation
  - API-driven data with loading/error states
- **Dependencies**: E4-03, E5-03
- **Estimate**: L
- **Labels**: `type:feature`

### E14-03 `Entity` detail page
- **Description**: Read-only details with breadcrumb, deep links, and shareable URL.
- **Acceptance Criteria**:
  - Handles not-found and unauthorized states
- **Dependencies**: E2-02
- **Estimate**: M
- **Labels**: `type:feature`

### E14-04 `Entity` create/edit forms
- **Description**: Reactive forms with validation, optimistic UI, and error summaries.
- **Acceptance Criteria**:
  - Form accessible, validation messages localized
- **Dependencies**: E10-01, E5-04
- **Estimate**: L
- **Labels**: `type:feature`

### E14-05 `Entity` delete flow
- **Description**: Confirmation modal, error handling, and toast notifications.
- **Acceptance Criteria**:
  - Deletion audited via logger
- **Dependencies**: E6-01
- **Estimate**: S
- **Labels**: `type:feature`

---

## Cross-Cutting Definition of Done (apply to all tickets)
- Unit and/or integration tests added or updated
- Lint, typecheck, and formatting pass locally and in CI
- Public APIs typed and documented
- Accessibility checked for new UI (focus, labels, contrast)
- Performance impact considered (bundle size, lazy-loading)
- Security implications assessed (no secrets, safe inputs)
- Docs updated (README, ADRs, or feature docs as appropriate)

## Suggested Execution Order (high level)
1. E0 Foundation (E0-01 → E0-07)
2. E1 Architecture (E1-01 → E1-06)
3. E2 Routing baseline
4. E5 Design System basics
5. E3 Auth (minimum viable login/logout)
6. E4 Data access utilities
7. E8 Testing stack
8. E6 Observability minimal
9. E7 Performance/SSR where needed
10. E10 i18n and E9 security tightening
11. E14 Feature delivery using templates
12. E12 Release and flags
13. E13 Documentation polish

## Open Questions (to refine with stakeholders)
- Identity provider details (OIDC issuer, scopes, token lifetimes)
- Required locales and translation sourcing process
- Targeted browsers and performance SLAs (LCP/INP budgets)
- Hosting and deployment constraints (static vs SSR node runtime)
- Data retention, audit, and compliance requirements (PII)

## Shared TypeScript Contracts (Backend <-> Frontend)

Goal
- Single source of truth for API contracts shared by Node backend and Angular frontend.
- Generate strongly-typed client and models from the backend OpenAPI at `/api/docs`.

Workspace structure (pnpm workspaces)
- `packages/contracts/` — generated OpenAPI types and lightweight typed client
- `apps/frontend/` — Angular app consuming `@contracts` package

Contracts implementation plan
- Ticket C1: Contracts package scaffold [size:S]
  - Create `packages/contracts` with tsconfig, build, and publish config (local workspace only)
  - Add scripts: `generate`, `build`, `lint`
  - Acceptance: package builds and can be imported from frontend
- Ticket C2: OpenAPI types generation [size:S]
  - Use `openapi-typescript` (or `orval`) to generate types from `http://localhost:3000/api/docs-json`
  - Output to `packages/contracts/src/types.ts`
  - Acceptance: `types.ts` contains schemas for all endpoints (settings, upload, …)
- Ticket C3: Typed API client [size:M]
  - Implement minimal fetch-based client with helpers for paging envelopes and error shape
  - Endpoints covered: settings, upload, convert-markdown, content-breakdown, translate, translation-fine-tune, compose, convert-to-epub, send-mail, order-management, third-parites
  - Acceptance: methods typed via generated models; runtime guards for envelopes
- Ticket C4: CI automation [size:S]
  - Script to refresh contracts types on backend changes; verify no drift in CI
  - Acceptance: `pnpm contracts:generate` updates types; frontend compiles

Frontend integration plan
- Ticket C5: Replace local DTOs with `@contracts` types [size:S]
  - Use generated `paths`/`components` types for request/response models
  - Acceptance: no `any` for API models; compile passes
- Ticket C6: API service wrapper in UI [size:S]
  - Create thin wrapper delegating to `@contracts` client; add interceptors for auth, base URL, errors
  - Acceptance: one import surface for UI to call APIs

Notes
- Alternative approach: code-first with zod schemas shared from backend; export package of schemas and derive OpenAPI. If adopted, adjust C2 to import schemas directly.

## UI consumption mapping by feature (endpoints used)

Settings `/tools`
- GET `/api/settings/` → load form values
- PUT `/api/settings/` → save values

Upload `/tools/upload`
- POST `/api/upload/` (multipart)
- GET `/api/upload/` (paged list)
- GET `/api/upload/:id`

Convert Markdown `/tools/convert-markdown`
- POST `/api/convert-markdown/jobs`
- GET `/api/convert-markdown/jobs` (paged list)
- GET `/api/convert-markdown/jobs/:jobId`
- GET `/api/convert-markdown/markdowns` (paged list)

Content Breakdown `/tools/content-breakdown`
- POST `/api/content-breakdown/:markdownId`
- GET `/api/content-breakdown/:markdownId` (paged list)

Translate `/tools/translate`
- POST `/api/translate/jobs`
- GET `/api/translate/jobs` (paged list)
- GET `/api/translate/jobs/:id`
- GET `/api/translate/markdowns` (paged list)

Translation Fine-tune `/tools/translation-fine-tune`
- GET `/api/translation-fine-tune/:translationId` (paged list)
- PUT `/api/translation-fine-tune/:translationId`

Compose `/tools/compose`
- POST `/api/compose/jobs`
- GET `/api/compose/jobs` (paged list)
- GET `/api/compose/jobs/:id`
- GET `/api/compose/markdowns` (paged list)

Convert to EPUB `/tools/convert-to-epub`
- POST `/api/convert-to-epub/jobs`
- GET `/api/convert-to-epub/jobs` (paged list)
- GET `/api/convert-to-epub/jobs/:id`
- GET `/api/convert-to-epub/epubs` (paged list)

Send Mail `/tools/send-mail`
- POST `/api/send-mail/jobs`
- GET `/api/send-mail/jobs` (paged list)
- GET `/api/send-mail/emails` (paged list + optional search)

Order Management `/tools/order-management`
- GET `/api/order-management/orders` (paged list)
- GET `/api/order-management/orders/:orderId`
- POST `/api/order-management/orders`
- PUT `/api/order-management/orders/:orderId`
- DELETE `/api/order-management/orders/:orderId`

Third-parties `/tools/third-parites management`
- Partners: GET/POST/PUT/DELETE `/api/third-parites/partners`
- Bookshelf: GET/POST/DELETE `/api/third-parites/bookshelf`
- Shipments: GET/POST `/api/third-parites/shipments`

## UI ticket adjustments to use shared contracts

- Update E4-01 (HTTP client utilities) to use `@contracts` client as the default implementation; keep adapters if needed.
- Update E4-02 (DTOs, mappers, and validation) to rely on generated types for compile-time safety; reserve mappers only for view-model shaping.
- All list views (E14-02 etc.) must use the paging envelope `{ items, page, pageSize, total, totalPages }` and surface sort/paging controls bound to query params.

## Developer workflow
- Start backend locally exposing `/api/docs-json`.
- Run `pnpm contracts:generate` to refresh `packages/contracts/src/types.ts` and client.
- Run UI with `pnpm dev` and verify typed endpoints compile.