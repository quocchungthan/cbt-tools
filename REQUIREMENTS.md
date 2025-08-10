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

# Original requirements on Notion:
| 10/08/2025

By route navigation:

/tools

Update the user preference and settings → From form Send to backend to save in a csv.

Backend having the service to load those settings, if the csv file does not have that, load it from env variables by default

Note for backend: We should have a service implementation (call this `dataservice`) and exposed the interfaces, at the moment that service save and loading the csv (we should have the a `database/` folder at the root directory and .git should ignore this at the moment.) and I’ll try with database later.

Another note for backend then → it’s should be embedded in angular ssr.

in the .env should have the key FILE_SUPPORTED and default value is “.pdf”, the form on UI should include that as well beside open key, open ai model, open ai proj id, open ai org id. sheet api key, sheet name, sheet id, … etc.

/tools/upload

An UI for uploading file, we also have a similar `dataservice` but on another csv, also should have. an interface for replacement later.

that service should generate id for each upload, the file should be placed in `database/` in root dir.

on UI should have a table 

/tools/convert-markdown

UI for input and data table for converting the uploaded file on the first step to markdown. the convert from should have dropdown to select uploaded file.

The data table below to see the command submitted, progress.

backend, also a `dataservice` to save the progress, the output file

the dataservice of this should return the list markdown we already have.

/tools/translate

Here the same logic with other tools but the input is list of original markdown, as a dropdown, user can select the target lang (can be en, vi for now (loaded from the. user setting as in the config (or .env see the first tool)))

The output should be another markdown file that matches the original markdown. or user can choose a strategy (dropdown) which is translating sentence by sentence - this strategy only available if user already use the tool breakdown to break the original markdown to the sentences.

/tools/compose

Where the forminputs are the dropdown to select the markdowns files we have (from the convert and from the translate)
also need `dataservice` to save and load the progress, input also have t he format of bilingual book (side by side, para by para, sentence by sentence,… (supported format should be in the setting dataservice as the step one.)).

Compose can have the default format that (compose only a translated md - only translated content).

/tools/convert-to-epub

This tool helps to convert the markdowns to epub file. the structure, data saving querying should be the same as the tools above.

the `businessservice` of this tool on backend should be able to return the list of epub to use in the later tool (sending mail)

/tools/send-mail

This tool should load the settings like email config in the user setting from `dataservice` of the first tool

On this tool, I can use 3 options of sending mail with special templates:

- Option one: Thank you user to use our service
- Option 2: Sorry for the delay
- Option 3: The book is ready with attached final epub (form input dropdown.)

`dataservice`  of this tool should save the progress, status of each mail send, 

`businessservice` able to return the list of email used. on the form, user can input new mail and a dropdown as suggestions get from list email.

/tools/content-breakdown

We should have a similar tool to breakdown a markdown file to csv (markdown id, chapter id, paragraph id, sentenceid, original content or anything similar to identify the part of that text in the original markdown) records stored with `dataservice` and business of breakingdown + fetching the list of breakingdown, mapping breakdown vs markdown in the `businessservice`.

/tools/translation-fine-tune

In order to tuning the translation to have the correct context. we need a tool to compare the original content breakdown vs translated content csv (use book as reference in the input drop down), each translated sentence map with the original sentence via sentence id in content breakdown. Display each sentence on its own paperlike input field (squared, no extra margin, padding, uyser can click to edit) - if the sentences belong to paragraph, dont breaklines, show the inputs next to each other to seeing that the sentences are next to each other in the real book. highlight the original sentence once the translated sentence is focused, the original sentence inputs are read only inputs.

This service find a way to map the translated to the original.

Once user clicks “save” the backend should update the translated content .csv respectively via the `dataservice` of translate tool backend service,

/tools/order-management

For crud bilingual book management. Each order must have the original file and translated file upload (optional (supported file from the setting )) the book name and author (requiremend), format (required) (drop down input from the settings), user email.

/tools/third-parites management

Such as print manifactures, ads, book shelf (tds). bookhshelf contain available books that user can order by just seletecting the order on the shelf and submit, we send the composed book to the print manifacture then ship that to the customer. Shipping partners,.. etc. we also have crud, table here.

- The record in csv file should have column to ref to the related file (pdf, md, …).
- `dataservice`s should be different from `businessservice`, business services are the stuff that actually process the file such as (converting, composing, uploading, generate ids, fallback settings,…) `businessservice` are the template holder to implement later.
- Business/ shared models should be in separated files to re uses, one model per file. one service per file, one data service per file.
- Document the development preference so the next increment should follow the rule.
- Theme UI design and color, form controls should look like cursor.com.
- Top nav have tools, and home, home currently should have nothing, the /tools nav would navigate to the tools page, you can see the routing design above.
- business service and dataservice should be used by server. the api endpoint should have prefix /api
- Implement docker build: nginx + port 80 + coordinating. access by direct url should work.
- All the method should be short, no Bloaters.
- Api should be prefixed with /api/tool-name/