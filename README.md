---
title: AbleSpace
emoji: 📚
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Collaborative Task Management Platform

A real-time collaborative task management application built with React, Node.js, Express, TypeScript, and MongoDB.

## Project Structure

- `backend/` - Node.js/Express backend API
# AbleSpace — Collaborative Task Management

A real-time collaborative task management application built with React (Vite), TypeScript, Node.js, Express, Socket.io and MongoDB.

This README covers local setup (frontend & backend), API contract highlights, architecture and design decisions, how real-time features are implemented, and trade-offs/assumptions.

**Contents**
- **Overview**: what the app does and how it works
- **Setup**: running frontend & backend locally
- **API Contract**: key endpoints to interact with the backend
- **Architecture & Design Decisions**: why major choices were made
- **Socket.io Integration**: how real-time is wired
- **Trade-offs & Assumptions**

**Overview — How the app works**
- Users register and log in. Authentication uses JWT (signed server-side) and the backend reads tokens from a cookie or `Authorization: Bearer <token>` header.
- Authenticated users create, update, assign, and comment on tasks. Tasks and notifications are persisted in MongoDB.
- Real-time task updates, notifications and chat messages are sent via Socket.io. When a task is updated the server emits `taskUpdated` and creates notifications when assignment changes occur.
- Frontend connects to the socket server and joins task rooms to receive chat messages and task-specific events.

## Setup (Run locally)

Prerequisites
- Node.js (v16+ recommended)
- npm
- MongoDB Atlas account or a local MongoDB instance

Repository layout
- See frontend at [frontend](frontend)
- See backend at [backend](backend)

1) Install dependencies (root workspace)

```bash
npm install
```

2) Backend setup

```bash
cd backend
npm install
```

Create a `backend/.env` with (example):

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
PORT=7860
```

Start backend (development):

```bash
npm run dev
```

By default the backend listens on port `7860` (see [backend/src/server.ts](backend/src/server.ts)).

3) Frontend setup

```bash
cd frontend
npm install
```

Create a `frontend/.env` (Vite env vars):

```
VITE_API_URL=http://localhost:7860
VITE_SOCKET_URL=http://localhost:7860
```

Start frontend:

```bash
npm run dev
```

4) Running both concurrently

At repository root the repo provides convenience scripts (if present in `package.json`) such as:

```bash
npm run dev        # runs frontend + backend concurrently if configured
npm run dev:backend
npm run dev:frontend
```

## Key environment variables
- `MONGODB_URI` — MongoDB connection string (backend/.env)
- `JWT_SECRET` — secret for signing JWTs (backend/.env)
- `FRONTEND_URL` — allowed origins for CORS and sockets (backend/.env)
- `VITE_API_URL` — frontend API base URL (frontend/.env)
- `VITE_SOCKET_URL` — frontend Socket.io URL (frontend/.env)

## API Contract (Key endpoints)

The server mounts the main route groups at these base paths (see [backend/src/server.ts](backend/src/server.ts)):
- `/api/users` — user & auth
- `/api/tasks` — task CRUD and task-related operations
- `/api/notifications` — notification retrieval/management
- `/api/academic` — academic tasks (specialized tasks)

Common endpoints (representative examples — refer to route files for exact inputs/validation):

- POST `/api/users/register` — register a new user (returns user + JWT)
- POST `/api/users/login` — login, returns JWT in cookie or token
- POST `/api/users/logout` — clears auth cookie
- GET `/api/users/me` — return current user (requires auth)

- GET `/api/tasks` — list tasks (supports query filters)
- POST `/api/tasks` — create a new task
- GET `/api/tasks/:id` — fetch a single task
- PATCH `/api/tasks/:id` — update a task (assignment, status, etc.)
- DELETE `/api/tasks/:id` — delete a task

- GET `/api/notifications` — list user notifications
- PATCH `/api/notifications/:id/read` — mark notification as read

Notes:
- The route implementations live in [backend/src/routes](backend/src/routes). See the following files for exact behaviour and request/response shapes:
   - [backend/src/routes/user.routes.ts](backend/src/routes/user.routes.ts)
   - [backend/src/routes/task.routes.ts](backend/src/routes/task.routes.ts)
   - [backend/src/routes/notification.routes.ts](backend/src/routes/notification.routes.ts)
   - [backend/src/routes/academicTask.routes.ts](backend/src/routes/academicTask.routes.ts)

Authentication & Authorization
- Routes that require authentication use the `authenticate` middleware in [backend/src/middlewares/auth.middleware.ts](backend/src/middlewares/auth.middleware.ts). The middleware reads the token from cookies or `Authorization` header.
- Role-based guards like `requireTeacher` and `requireStudent` are also available in the same middleware file.

## Architecture & Design Decisions

- Database: MongoDB (Mongoose)
   - Chosen for flexible schemata (tasks, notifications, messages have evolving shapes) and fast iteration using MongoDB Atlas or local MongoDB.
   - Models are implemented in [backend/src/models](backend/src/models).

- Authentication: JWT
   - Stateless, compact and easy to verify on each request using `jsonwebtoken`.
   - Tokens are expected in a secure cookie or `Authorization: Bearer` header. See [backend/src/middlewares/auth.middleware.ts](backend/src/middlewares/auth.middleware.ts).
   - Passwords are hashed with `bcrypt` (see user model/controller).

- Layering: Controllers + Routes
   - Request validation and business logic are organized into controllers (see [backend/src/controllers](backend/src/controllers)). This keeps express routes thin and focused on routing + middleware.

- Real-time: Socket.io service
   - Socket logic is encapsulated in `SocketService` at [backend/src/socket/socket.service.ts](backend/src/socket/socket.service.ts).
   - The server initializes SocketService with the Socket.io `Server` instance in [backend/src/server.ts](backend/src/server.ts).

- CORS & Origins
   - Allowed frontend origins are controlled by `FRONTEND_URL` and a sensible default list in [backend/src/server.ts](backend/src/server.ts). That same list is used for socket CORS.

## Socket.io Integration (Real-time)

- Backend
   - `SocketService` sets up socket listeners for:
      - `join` — register a user's socket mapping (userId ↔ socketId)
      - `taskUpdated` — server broadcasts `taskUpdated`, optionally creates a `Notification`, and emits `notification` to specific users if assigned
      - `sendMessage` / `joinTaskRoom` / `leaveTaskRoom` — chat functionality scoped to `task_<taskId>` rooms
   - The service maintains an in-memory mapping of connected users to sockets (note: not persistent across processes).

- Frontend
   - Frontend establishes a Socket.io connection using `frontend/src/services/socketService.ts` and exposes helper methods (`connect`, `joinTaskRoom`, `sendMessage`, `onNotification`, etc.).
   - A React hook `frontend/src/hooks/useSocket.ts` connects/disconnects on user login/logout.

Flow example: when a teacher assigns a student to a task
1. Teacher updates task via PATCH `/api/tasks/:id`.
2. Backend updates task in MongoDB and emits a `taskUpdated` event via SocketService.
3. SocketService creates a `Notification` record and emits a `notification` to the assigned user's socketId (if currently connected).
4. Frontend receives the `notification` event and updates the UI in real time.

## Trade-offs & Assumptions

- Single-process Socket store: the current in-memory mapping of userId→socketId is simple and works for single-instance deployments. For horizontal scaling (multiple backend instances) you must add a socket adapter (e.g., Redis adapter) to share socket state across instances.
- JWT storage: tokens are returned in cookies and are also accepted via `Authorization` header. For maximum security use `httpOnly`, `secure` cookies and rotate secrets in production.
- Validation: Zod is used for DTO validation in controllers (see [backend/src/dtos](backend/src/dtos)). Ensure DTOs are authoritative when integrating other clients.
- Database choice: MongoDB gives flexibility but is less strict than relational DBs for complex transactional workflows.

## Where to look in the codebase (quick links)
- Server entry: [backend/src/server.ts](backend/src/server.ts)
- Socket implementation: [backend/src/socket/socket.service.ts](backend/src/socket/socket.service.ts)
- Auth middleware: [backend/src/middlewares/auth.middleware.ts](backend/src/middlewares/auth.middleware.ts)
- Routes: [backend/src/routes](backend/src/routes)
- Frontend socket helpers: [frontend/src/services/socketService.ts](frontend/src/services/socketService.ts)
- Frontend socket hook: [frontend/src/hooks/useSocket.ts](frontend/src/hooks/useSocket.ts)

## Testing

- Backend tests live under [backend/src/tests](backend/src/tests). Run:

```bash
cd backend
npm test
```

- Frontend tests live under [frontend/src/tests](frontend/src/tests). Run:

```bash
cd frontend
npm test
```

## Next steps / Suggestions
- Use Redis + socket.io-redis adapter when deploying multiple backend instances.
- Enable HTTPS & secure cookies in production and rotate `JWT_SECRET` regularly.
- Add end-to-end tests for critical real-time flows (task assignment → notification → UI update).

---

If you'd like, I can also:
- add example curl requests for each endpoint,
- extract a machine-readable OpenAPI spec from the route handlers,
- or scaffold a `.env.example` for frontend/backend — tell me which.

---
