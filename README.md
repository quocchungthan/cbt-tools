# CBT Tools

## Entrypoints

- **Home page** (`/`):
  - For preorder and listing available products.
- **Tools page** (`/tools`):
  - Protected by password. Default password is `admin123` or can be set via the `TOOLS_PASSWORD` environment variable.
  - All routes under `/tools` require this password (can be provided as a query, body, or `x-tools-password` header; browser will cache it in a cookie).

## Production Deployment

- Only port 80 of the Nginx container is exposed to the public.
- All other internal ports are not accessible externally.

## Environment Variables

- `TOOLS_PASSWORD`: Password for accessing `/tools` (default: `admin123`).

---

For more details, see the documentation or contact the maintainer.
