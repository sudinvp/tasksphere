# TaskSphere – Frontend (React)

React app for the TaskSphere architecture. Talks only to the Spring Boot core
service over REST (`VITE_API_BASE_URL`, default `http://localhost:8080`) — it
never calls the FastAPI AI service directly; that happens server-to-server
from the Spring backend.

## Stack
- React 19 + Vite
- React Router
- Recharts (dashboard charts)
- Plain CSS with a design-token system (`src/styles/tokens.css`) — no UI framework

## Design
- **Palette**: cool slate background, cobalt primary, amber for priority/warning, green for success, red for overdue/danger.
- **Type**: Space Grotesk (display), Inter (body), IBM Plex Mono (data/timestamps).
- **Signature elements**: circular "orbit ring" progress indicators for project completion, and task priority shown as an ascending arc of dots rather than a flat colored badge — both nod to the "Sphere" in the product name.

## Pages
- `/login`, `/register` — auth
- `/` — dashboard: totals, tasks-by-status pie, tasks-by-priority bars, overall completion ring
- `/projects` — project grid, create-project modal (Admin/PM only)
- `/projects/:id` — project detail with a kanban board (To do / In progress / In review / Done), create-task modal, task detail modal with status change + comments
- `/tasks` — "My tasks": everything assigned to the signed-in user across all projects
- `/notifications` — task assignments, status updates, deadline reminders; click to mark read

## Running locally

```bash
cd tasksphere-frontend
npm install
cp .env.example .env     # edit if your backend isn't on localhost:8080
npm run dev
```

Opens at `http://localhost:5173`. The Spring Boot backend must be running
(default `http://localhost:8080`) and its CORS config (`SecurityConfig.java`)
must allow `http://localhost:5173` as an origin — the backend's current
allowlist is `http://localhost:3000`, so **update that to `5173`** (Vite's
default dev port) or start the frontend with `npm run dev -- --port 3000`.

## Building for production
```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally to sanity-check it
```
This was built and verified in this environment: `npm run build` succeeds
cleanly and `npm run lint` (oxlint) reports zero errors.

## Login
There's no seeded frontend user — use the Spring Boot backend's seeded admin
(`admin@tasksphere.local` / `ChangeMe123!`) or register a new account from
`/register` (new accounts start as `EMPLOYEE`; promote via the backend's
`PUT /api/users/{id}/role` as an admin).

## Notes / next steps
- Role-based UI is minimal right now — Admin/PM-only actions (create project,
  change project status, delete task) are hidden based on `user.role`, but
  there's no dedicated admin/user-management screen yet.
- The AI-suggested category and priority score (from the FastAPI service, via
  the Spring backend) are shown on the task detail modal and as a small badge
  on kanban cards when present.
- No drag-and-drop on the kanban board yet — status changes happen via the
  task detail modal's status buttons. Reasonable next addition if you want it.
- Notification polling is a simple 30s interval (`AppShell.jsx`), not a
  websocket — fine for this scale, swap out if you add real-time push later.
