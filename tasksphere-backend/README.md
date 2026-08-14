# TaskSphere – Core Application (Spring Boot)

This is the Java/Spring Boot service from the TaskSphere architecture: everything
except the AI module, which will live in a separate FastAPI service and be called
over REST from `AiClientService`.

## Stack
- Java 17, Spring Boot 3.3 (Web, Security, Data JPA, Validation)
- MySQL 8
- JWT auth (jjwt)
- Lombok

## Modules implemented
- **Auth**: register / login, JWT issuance (`/api/auth/**`)
- **User management**: list/view users, admin-only role & enable/disable (`/api/users/**`)
- **Project management**: CRUD, member assignment, status, progress % (`/api/projects/**`)
- **Task management**: CRUD, assignment, priority, due dates, status, comments (`/api/tasks/**`)
- **Dashboard**: totals, completed/pending/overdue, progress, breakdowns (`/api/dashboard/summary`)
- **Notifications**: task-assignment / status-update / deadline-reminder records, daily overdue scan (`/api/notifications/**`)
- **AI integration point**: `AiClientService` calls `POST {ai-service.base-url}/api/ai/analyze-task` when a task is created; fails soft if the AI service isn't up yet.

## Roles
`ADMIN`, `PROJECT_MANAGER`, `EMPLOYEE` — enforced with `@PreAuthorize` at the controller layer and `@EnableMethodSecurity`.

## Running locally

1. Install MySQL 8+ and create nothing manually — the app auto-creates the `tasksphere` schema (`createDatabaseIfNotExist=true`).
2. Set env vars (or edit `application.yml` directly for local dev):
   ```
   DB_USERNAME=root
   DB_PASSWORD=yourpassword
   JWT_SECRET=<a long random string, 256+ bits>
   AI_SERVICE_URL=http://localhost:8000   # FastAPI service, once built
   ```
3. Build & run:
   ```
   mvn spring-boot:run
   ```
   (This sandbox has no internet access to Maven Central, so the build was written
   and reviewed carefully but not compiled here — run `mvn clean install` locally
   to verify and pull dependencies.)

4. A default admin is seeded on first boot:
   ```
   email: admin@tasksphere.local
   password: ChangeMe123!
   ```
   Change this immediately in any non-local environment.

## Auth flow
- `POST /api/auth/register` → creates an `EMPLOYEE` user, returns a JWT.
- `POST /api/auth/login` → returns a JWT.
- Send `Authorization: Bearer <token>` on all other requests.
- An admin can promote a user via `PUT /api/users/{id}/role`.

## Sample requests

Register:
```json
POST /api/auth/register
{ "fullName": "Jane Doe", "email": "jane@company.com", "password": "supersecret1" }
```

Create a project (PM/Admin only):
```json
POST /api/projects
{ "name": "Website Revamp", "description": "Q4 redesign", "memberIds": [2,3] }
```

Create a task:
```json
POST /api/tasks
{ "title": "Set up CI pipeline", "description": "GitHub Actions build+test", "projectId": 1, "assigneeId": 3, "priority": "HIGH", "dueDate": "2026-09-01" }
```

## What's intentionally stubbed / next steps
- `AiClientService` expects a FastAPI endpoint `POST /api/ai/analyze-task` returning
  `{ "suggested_category": "...", "priority_score": 0.0-1.0 }`. That service isn't built yet
  (per your earlier answer, it'll use a trained ML model — happy to build that next).
- Notifications are persisted to MySQL and polled via `GET /api/notifications`; no
  WebSocket/push layer yet — there's a comment marking the hook point in `NotificationService`.
- No refresh-token rotation yet (`jwt.refresh-expiration-ms` is defined in config but unused) —
  straightforward to add if you want silent re-auth.
- CORS is currently locked to `http://localhost:3000` for the future React frontend; update
  `SecurityConfig.corsConfigurationSource()` for other origins.
