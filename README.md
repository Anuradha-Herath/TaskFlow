# TaskFlow — Team Task Management System

A Jira-style task manager built with **Angular**, **Angular Material**, and a mock REST API (**json-server**). Features authentication (fake JWT), route guards, project and task CRUD, and a Kanban task board with drag-and-drop.

## Tech stack

- **Angular 21** — standalone components, signals, control flow
- **Angular Material** — UI components (cards, dialogs, forms, buttons, snackbar)
- **Angular CDK** — drag-and-drop for Kanban board
- **RxJS** — reactive data and HTTP
- **json-server** — mock REST API (dev)

## Features

- **Authentication:** Login and register with reactive forms; fake JWT stored in localStorage; route guard protects dashboard and project routes
- **Projects:** Create and delete projects; list view with open/delete actions
- **Tasks:** Add, edit, delete tasks; Kanban board with Todo / In Progress / Done columns
- **Kanban drag-and-drop:** Move task cards between columns to update status (Angular CDK)
- **User-scoped projects:** Dashboard shows only projects owned by the current user
- **Auth and API security (demo):** Authentication is client-side with a fake JWT fallback when the API does not provide login/register. **This is for development/demo only and is not secure.** The optional dev server (`npm run server:secure`) uses middleware that returns 401 for protected routes when no `Authorization: Bearer` header is sent. For production, use a real backend with proper JWT and protected endpoints.
- **Error handling:** Global HTTP error interceptor; 404 page for unknown routes
- **UI:** Loading and error states; confirmation dialogs for delete; Material snackbar feedback

## Screenshots

<!-- Add 1–2 screenshots (e.g. dashboard, Kanban board) here when ready -->
<!-- Example: ![Dashboard](docs/screenshot-dashboard.png) -->

## Live demo

<!-- Add your deployed URL here when you deploy (e.g. Vercel, Netlify) -->
<!-- Example: [Live demo](https://taskflow-demo.vercel.app) -->

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the mock API** (in a separate terminal)

   ```bash
   npm run server
   ```

   This runs json-server on `http://localhost:3000` with `db.json`. Start this first so the app can load projects and tasks.

3. **Start the Angular app**

   ```bash
   npm start
   ```

   Open `http://localhost:4200/`. Register or log in (any email/password works with the fake auth), then create projects and tasks.

## Development

- **Serve:** `ng serve` — dev server at `http://localhost:4200/` (run `npm run server` in another terminal for full functionality)
- **Build:** `ng build` — production build in `dist/`
- **Lint:** `ng lint` — ESLint
- **Test:** `ng test` — unit tests

## Building

```bash
ng build
```

Production output is in `dist/` (or `dist/taskflow/browser/` for the application build). Use the production configuration for deployment.

## Deployment

The app is a static Angular SPA. Build with `ng build` (production config) and deploy the output to any static host.

- **Vercel:** Connect the repo; set build command to `npm run build` and output directory to `dist/taskflow/browser` (or the path shown after build).
- **Netlify:** Same: build command `npm run build`, publish directory `dist/taskflow/browser`.
- **GitHub Pages:** Build, then push the contents of `dist/taskflow/browser` to a `gh-pages` branch or use a GitHub Action to build and deploy.

**API for production:** The app uses `environment.production.ts` with `apiUrl: '/api'` by default. For a live demo you can either:

- Deploy a real backend (e.g. Firebase, Supabase, or a small Node/Express API) and set `apiUrl` to that URL before building, or
- Deploy json-server (or a read-only mock API) alongside the frontend and proxy `/api` to it, or
- Document that the live demo uses client-side fake auth and no persistent backend.

After deploying, add the live URL under **Live demo** above.

## Running unit tests

```bash
ng test
```

## E2E tests (Playwright)

Run the mock API in one terminal (`npm run server`), then in another:

```bash
npm run e2e
```

Playwright will start the Angular dev server if needed. E2E tests cover login, dashboard, opening a project, and adding a task. For CI, the workflow runs E2E after build using the production bundle and json-server.

## Accessibility

Angular Material provides focus trapping in dialogs and keyboard navigation. Key actions (login, dialogs, menu) are keyboard and screen-reader friendly. For deeper checks, use browser DevTools or tools like axe.

## Additional resources

- [Angular CLI](https://angular.dev/tools/cli)
- [Angular Material](https://material.angular.io/)
- [Angular CDK Drag and Drop](https://material.angular.io/cdk/drag-drop/overview)
