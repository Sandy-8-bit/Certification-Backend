## Certification Backend

Backend service for the Wisework certification platform. It exposes a small but fully structured Express + Prisma stack that is ready for additional resources (courses, enrollments, etc.). Use this document as the contributor guide for architecture, workflows, and common tasks.

### Tech Stack

- Node.js + TypeScript
- Express 5
- Prisma ORM (PostgreSQL)
- Supabase Auth (JWT) + role-based guard
- pnpm for dependency + script management

### Environment Variables

Create an `.env` file at the project root before running the API. The service expects:

| Variable              | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `PORT`                | Port for HTTP server (defaults to 3000).                   |
| `DATABASE_URL`        | PostgreSQL connection string used by Prisma.               |
| `SUPABASE_URL`        | Supabase project URL, used to validate JWT issuer.         |
| `SUPABASE_JWT_SECRET` | Service role JWT secret for verifying tokens.              |
| `ADMIN_UUID`          | Supabase user ID that should be seeded as the first admin. |

### Project Layout

```
src/
	index.ts              # Starts HTTP server
	server.ts             # Express app factory (middleware + routes)
	controller/
		adminUserController.ts
	routes/
		adminUser.ts        # Example router mounted at /users
	middleware/
		supabaseAuth.ts     # Decodes Supabase JWT into req.user (id , name)
		requireAdmin.ts     # Guards admin-only endpoints
		errorHandler.ts     # Centralized error mapper
	errors/appError.ts    # Reusable operational error class
	utils/asyncHandler.ts # Wrapper to catch async errors
	lib/prisma.ts         # Prisma singleton bootstrapper
prisma/
	schema.prisma         # Data models + enums
	migrations/           # Auto-generated SQL migrations
```

### Runtime Flow

1. `src/index.ts` reads `PORT` and launches the Express instance exported from `src/server.ts`.
2. `server.ts` wires global middleware (JSON body parsing, CORS), registers domain routers, and attaches error handling.
3. Requests flow through layered middleware:
   - `supabaseAuthJwtDecode`: validates the Supabase JWT, populates `req.user`.
   - (Optional) `requireAdmin`: loads the calling user via Prisma and verifies `role === "admin"`.
   - Route-level controller wrapped with `asyncHandler` catches rejected promises.
4. Controllers import the Prisma singleton from `src/lib/prisma.ts` to query or mutate data.
5. Any thrown `AppError` or unexpected exception is normalized by `globalErrorHandler` into a JSON response.

### Scripts

| Command        | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| `pnpm install` | Install dependencies.                                         |
| `pnpm dev`     | Start the dev server with `nodemon` (restarts on TS changes). |
| `pnpm build`   | Build the TypeScript project into `dist/` using `tsc`.        |
| `pnpm start`   | Run the compiled JavaScript (`node dist/index.js`).           |

### Working With Prisma

#### Adding a New Model

1. Update `prisma/schema.prisma` with the new `model`, relations, and enums.
2. Generate a migration: `pnpm prisma migrate dev --name <meaningful-name>`.
3. Inspect the generated SQL inside `prisma/migrations/<timestamp>_<name>/migration.sql`.
4. Commit both the schema and migration folder so teammates share the same history.
5. Access the new model via the typed Prisma client (`prisma.<model>`).

#### Running Existing Migrations

Use `pnpm prisma migrate dev` to apply pending migrations locally. For databases that should not run in "dev" mode (CI/CD), use `pnpm prisma migrate deploy`.

#### Prisma Studio

Launch a data viewer with `pnpm prisma studio`. It connects using `DATABASE_URL` and reflects the schema.

### Request + Error Flow

```
Client -> Router -> supabaseAuthJwtDecode -> (requireAdmin) -> Controller -> Prisma -> Response
																					 \-> AppError thrown -> globalErrorHandler -> JSON error
```

Key utilities:

- `AppError(message, statusCode)` marks operational errors (e.g., unauthorized) so the global handler can respond with intentional HTTP codes.
- `asyncHandler(fn)` wraps async route/controller functions to forward rejected Promises to the error middleware.

### Building New Routes

1. **Create a controller** under `src/controller/`. Export simple async functions that take `(req, res)` and use Prisma. Throw `AppError` for expected failures.
2. **Define a router** inside `src/routes/`. Import needed middleware, wrap controllers with `asyncHandler`, and mount paths with `router.get/post/...`.
3. **Mount the router** in `src/server.ts` with a base path (`app.use("/courses", coursesRouter);`). Ensure the router is imported near the top of the file.
4. **Protect endpoints** as needed:
   - Authenticated users: `router.use(supabaseAuthJwtDecode);` or attach per-route.
   - Admin-only: chain `requireAdmin` after the auth middleware.
5. **Validate payloads** (future enhancement): add JOI/Zod validation middleware before controllers.

Example (`/users/me`) flow:

```
router.get("/me", supabaseAuthJwtDecode, asyncHandler(getCurrentUser));
```

### Adding Admin-Only Endpoints

```
router.post(
	"/courses",
	supabaseAuthJwtDecode,
	requireAdmin,
	asyncHandler(createCourse)
);
```

`requireAdmin` fetches the caller from Prisma, verifies `role === "admin"`, and propagates a `403` `AppError` if unauthorized.

### Running + Building

1. `pnpm dev` – live-reloads on file changes.
2. `pnpm build` – compiles TypeScript (output in `dist/`).
3. `pnpm start` – runs the production build (make sure `dist/` is up to date).

### Testing

No automated tests are configured yet. When adding tests, prefer vitest/jest + supertest for API layers and keep fixtures under a `tests/` directory.

### Contribution Checklist

- Keep TypeScript strictness (no implicit `any`).
- Use `asyncHandler` on every async route.
- Throw `AppError` for expected HTTP errors; let unexpected issues bubble up.
- Run `pnpm prisma migrate dev` after schema edits and commit the migration.
- Verify `pnpm build` before pushing.

This baseline follows clean layering (router → middleware → controller → prisma). Copy the existing `/users/me` route when introducing new resources to stay consistent.
