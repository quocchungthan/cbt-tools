# Full Specification for Angular SSR + Node.js Multi-Tool Application

## Overview
This document defines the architecture, routes, backend/frontend service structure, and UI design rules for a multi-tool web application. The application will use **Angular SSR** for the frontend and **Node.js (TypeScript)** for the backend, with CSV persistence in a `database/` directory for now, allowing a later migration to a real database.

**Theme:** Match [cursor.com](https://cursor.com) UI style — clean, modern, rounded corners, subtle gradients, well-spaced form controls.

**Folder rules:**
- `database/` at project root (ignored by Git)
- **One model per file**
- **One service per file**
- **Shared models** in `/models/`
- Separate **dataservice** (persistence) from **businessservice** (processing)

---

## Routes and Features

### Top Navigation
- **Home**: `/` (currently empty page)
- **Tools**: `/tools` main page (access to all tool routes)

---

## /tools – User Settings Tool

### Frontend
- Form fields:
  - `FILE_SUPPORTED` (default `.pdf`)
  - `open_ai_key`
  - `open_ai_model`
  - `open_ai_project_id`
  - `open_ai_org_id`
  - `sheet_api_key`
  - `sheet_name`
  - `sheet_id`
  - Target languages (default: `en`, `vi` — from settings or `.env`)
  - **Mail / SMTP settings**:
    - `mail_smtp_host`
    - `mail_smtp_port`
    - `mail_username`
    - `mail_password` (note: treat as secret; consider encryption or using env vars)
    - `mail_from_address`
    - `mail_from_name`
    - `mail_secure` (boolean, TLS/SSL enabled)
- Submit sends settings to backend

### Backend
- **dataservice**: Saves settings to `database/settings.csv` (including mail settings)
- Load defaults from `.env` if CSV missing
- `.env` contains at least:
  ```env
  FILE_SUPPORTED=".pdf"
  # Mail defaults (example)
  MAIL_SMTP_HOST="smtp.example.com"
  MAIL_SMTP_PORT="587"
  MAIL_USERNAME="user@example.com"
  MAIL_PASSWORD="supersecret"
  MAIL_FROM_ADDRESS="no-reply@example.com"
  MAIL_FROM_NAME="My EPUB Service"
  MAIL_SECURE="false" # true for SSL/TLS
  ```
- Service should be replaceable with DB in the future
- **Security note:** Mail credentials are sensitive. For production, prefer storing secrets in a secure vault or environment variables rather than plaintext CSV. If CSV is used for convenience, encrypt the credential column or restrict file access.

---

## /tools/upload – File Upload Tool

### Frontend
- File upload form
- Table showing:
  - ID
  - File name
  - Upload date

### Backend
- **dataservice**: Saves file metadata to `database/uploads.csv`
- Generate unique IDs
- Store files in `database/`
- Replaceable persistence layer

---

## /tools/convert-markdown – PDF to Markdown Tool

### Frontend
- Dropdown to select from uploaded files
- Convert button
- Table showing commands, progress, result

### Backend
- **dataservice**: Save conversion progress to `database/convert.csv`
- **businessservice**: Convert PDF to Markdown (placeholder)
- Return list of converted Markdown files

---

## /tools/translate – Markdown Translation Tool

### Frontend
- Dropdown to select Markdown
- Language selector (from settings/.env)
- Table for progress

### Backend
- **dataservice**: Save translation progress to `database/translate.csv`
- **businessservice**: Translate Markdown (placeholder)
- Return translated files list

---

## /tools/compose – Bilingual Composition Tool

### Frontend
- Dropdown to select multiple Markdown files
- Format selector (side-by-side, paragraph-by-paragraph, sentence-by-sentence)
- Table for progress

### Backend
- **dataservice**: Save composition progress to `database/compose.csv`
- **businessservice**: Compose bilingual books (placeholder)

---

## /tools/convert-to-epub – Markdown to EPUB Tool

### Frontend
- Dropdown to select Markdown
- Progress table

### Backend
- **dataservice**: Save EPUB conversion results to `database/epub.csv`
- **businessservice**: Convert Markdown to EPUB (placeholder)
- Return EPUB list

---

## /tools/send-mail – Email Sending Tool

### Frontend
- Load email config from `/tools` settings
- Template selector:
  1. Thank you
  2. Sorry for delay
  3. Book ready (attach EPUB)
- Dropdown for EPUB file
- Email input with suggestions from history

### Backend
- **dataservice**: Save mail send status to `database/mail.csv`
- **businessservice**: Send email (placeholder)
- Return list of used emails

---

## Backend Service Structure

- **dataservice**: CSV persistence (replaceable with DB later)
- **businessservice**: Processing logic (converting, translating, composing)
- All services in TypeScript
- Use interfaces for easy replacement

---

## Development Rules

- Angular SSR frontend
- Node.js TypeScript backend (embedded in SSR)
- One model/service per file
- `database/` ignored by Git
- Future DB migration requires minimal code changes
- Cursor.com-like UI design
- Responsive design
- Documented for future development

---

## Deliverables

- Fully functional Angular SSR + Node.js app
- Directory structure following rules
- UI for all `/tools` subpages
- CSV persistence
- Placeholder logic for business services
- `.env` with default values
- `.gitignore` ignoring `database/`

---
