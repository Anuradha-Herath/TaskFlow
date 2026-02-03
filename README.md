# TaskFlow — Team Task Management System

A Jira-style task manager built with **Angular**, **Angular Material**, and a mock REST API (**json-server**). Features authentication (fake JWT), route guards, project and task CRUD, and a Kanban task board.

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the mock API** (in a separate terminal)

   ```bash
   npm run server
   ```

   This runs json-server on `http://localhost:3000` with `db.json`.

3. **Start the Angular app**

   ```bash
   npm start
   ```

   Open `http://localhost:4200/`. Register or log in (any email/password works with the fake auth), then create projects and tasks.

## Development server

To start the Angular dev server only:

```bash
ng serve
```

Once the server is running, open your browser at `http://localhost:4200/`. The app will reload when you change source files. For full functionality (projects and tasks), also run `npm run server` so the API is available.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
