<div align="center">

# Task Pro — Backend

The API powering Task Pro, a Kanban-style task manager — authentication,
persistence, caching and the REST endpoints behind the app.

[![Code Quality](https://github.com/chertik77/TaskPro-backend/actions/workflows/code-quality.yml/badge.svg)](https://github.com/chertik77/TaskPro-backend/actions/workflows/code-quality.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

[Live App](https://www.taskpro.qzz.io) · [Frontend Repo](https://github.com/chertik77/TaskPro-frontend)

</div>

## Features

- **Authentication and Authorization:**
  Email and password, Google and Microsoft OAuth, and WebAuthn passkeys, built on
  better-auth. Sessions are issued as `HttpOnly` cookies and stored in Redis, so
  users can review their active devices and revoke any of them instantly.

- **Board Management:**
  Full CRUD for boards with custom icons and backgrounds, letting users organize
  their work into separate, flexible workspaces.

- **Task Management:**
  Scalable APIs for creating, updating, prioritizing and organizing tasks within
  columns. Reordering uses fractional ordering, so dragging a card writes a
  single value instead of rewriting the entire column, with an automatic
  rebalance when neighbouring positions grow too close.

- **Labels:**
  Reusable, user-scoped labels with a many-to-many relation to tasks, so the same
  label can be applied across boards without duplication.

- **User Settings:**
  Persisted preferences covering theme, accent color, date format, board
  background blur, font size, animations, card density, default task priority and
  deadline, and label display — keeping the experience consistent across devices.

- **Database Integration:**
  MongoDB through Prisma, with models designed for cascading deletes and indexed
  on the fields boards and columns are actually read by.

- **Caching:**
  Redis caching for read-heavy resources, using versioned keys so a single write
  retires every stale board snapshot at once.

- **Profile Management:**
  Avatar uploads through Cloudinary, tracking the stored asset so replaced or
  deleted images are cleaned up rather than orphaned.

- **Help Email Integration:**
  Support requests sent through Resend, delivering a confirmation to the user and
  a notification to the support inbox.

- **API Design:**
  Every endpoint is declared with `@hono/zod-openapi`, so validation, TypeScript
  types and the published OpenAPI 3.1 schema all derive from one definition and
  the documentation can never drift from the implementation.

- **Reliability:**
  A health endpoint that probes MongoDB and Redis, graceful shutdown on
  `SIGTERM`/`SIGINT`, fail-fast environment validation at boot, security headers,
  a strict CORS allowlist, and consistent error handling that never leaks
  internals.

## Project Contributors

- [Denys Babych](https://github.com/chertik77) - Team Lead
- [Sergii Drozdiuk](https://github.com/Sergii-Drozdiuk) - Scrum Master
- [Andrii Malysh](https://github.com/Agmund2002) - Fullstack developer
- [Valeriia Trytiak](https://github.com/Valeriia-Trytiak) - Fullstack developer
- [Kateryna Khamko](https://github.com/Katya982) - Fullstack developer
- [Andrii Zirchenko](https://github.com/Andrey9019) - Fullstack developer

## Languages and Tools

![Languages and Tools](https://skills.syvixor.com/api/icons?i=nodejs,ts,hono,prisma,mongodb,swagger,cloudinary,redis,zod,betterauth,resend,githubactions,yarn,commitlint,eslint,prettier,postman,vscode&perline=9)

## License

Released under the [MIT License](./LICENSE) — © 2024-2026 Denys Babych.
