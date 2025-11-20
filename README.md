# Event Management Application

A full‑stack web application to create and manage events across multiple profiles with timezone support. The app provides profile management, event creation and editing, and displays events normalized to user timezones. Data is stored in MongoDB Atlas, and the project is deployable on Vercel.

## Project Overview
- Purpose: Manage events assigned to one or more profiles, with accurate timezone handling for start/end times.
- Core features:
  - Create and list profiles
  - Create, update, and list events by profile
  - Timezone conversion for event inputs and display
  - Simple, student-friendly UI
- Tech stack:
  - Frontend: React (Vite), Tailwind CSS, Axios, Zustand
  - Backend: Node.js, Express, Mongoose
  - Database: MongoDB Atlas
  - Deployment: Vercel

### Architecture
```
React (Vite) ── Axios ───────────────▶ Express API ── Mongoose ──▶ MongoDB Atlas
   UI & State        HTTP (REST)           Controllers      ODM        Cloud DB
```

---

## Frontend
- Location: `frontend/`
- Framework/Libraries:
  - React (Vite)
  - Tailwind CSS
  - Axios for HTTP
  - Zustand for lightweight state

### Installation
```bash
# From repository root
npm run install:all            # installs root, then frontend, then backend
# Or only frontend
cd frontend
npm install
```

### Environment Variables
Create `frontend/.env.local`:
```env
VITE_API_URL=https://backend-url.vercel.app
```
During local development, point to the local backend:
```env
VITE_API_URL=http://localhost:5000
```
Reference file: `frontend/.env.example`

### Available Scripts
```bash
# From repo root
npm run dev            # start frontend dev server (Vite)
npm run build          # build production assets
npm run preview        # preview built assets locally

# Or from frontend directory
npm run dev
npm run build
npm run preview
npm run lint           # run ESLint checks
```

### Testing
- Current project does not include unit tests for the frontend.
- Recommended: add Jest + React Testing Library.
- Manual verification:
  - Launch dev server: `npm run dev`
  - Create a profile and an event via the UI
  - Confirm the network requests succeed and events render correctly

### Deployment (Frontend)
- Frontend is deployed via Vercel static build.
- `vercel.json` routes non‑`/api` paths to built frontend assets.
- Ensure `VITE_API_URL` is set in Vercel project environment variables and points to your backend URL.

---

## Backend
- Location: `backend/`
- Server: Express
- Database: MongoDB Atlas via Mongoose

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Create `backend/.env`:
```env
MONGO_URI=your-mongodb-atlas-connection-string
PORT=5000
```
Reference file: `backend/.env.example`

### Running Locally
```bash
# Start backend (from backend directory)
node server.js
# API base: http://localhost:5000
```

### API Endpoints
- Health
  - `GET /api/health`
  - Response: `{ status, database, timestamp }`

- Profiles
  - `POST /api/profiles`
    - Body: `{ name: string }`
    - Responses:
      - 201: `Profile`
      - 400: `{ message: 'Profile name is required.' }`
      - 400: `{ message: 'A profile with this name already exists.' }`
  - `GET /api/profiles`
    - Response: `Profile[]` (fields: `id`, `name`, `timezone`)

- Events
  - `POST /api/events`
    - Body:
      ```json
      {
        "profiles": ["<profileId>", "<profileId>"] ,
        "eventTimezone": "America/New_York",
        "startDateTime": "2024-12-15T14:00:00.000Z",
        "endDateTime": "2024-12-15T16:00:00.000Z"
      }
      ```
    - Responses:
      - 201: `Event`
      - 400: `{ message: 'All event fields are required.' }`
      - 400: `{ message: 'End date/time must be after the start date/time.' }`
  - `GET /api/events/:profileId`
    - Response: `Event[]` with populated `profiles` (fields: `name`, `timezone`)
  - `PUT /api/events/:id`
    - Body: same shape as `POST /api/events`
    - Responses:
      - 200: updated `Event`
      - 404: `{ message: 'Event not found.' }`
      - 400: validation errors as above



### Deployment (Backend)
- Deployed via Vercel serverless using `@vercel/node`.
- `vercel.json`:
  - Builds: `backend/server.js`
  - Routes: `/api/(.*)` → `backend/server.js`
- Configure `MONGO_URI` in Vercel project environment variables.

---

## Development Setup
### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster and connection string
- Vercel account (for deployment)

### Local Setup Steps
```bash
# 1) Install
npm run install:all

# 2) Backend env
cp backend/.env.example backend/.env
# Update MONGO_URI and PORT in backend/.env

# 3) Frontend env
cp frontend/.env.example frontend/.env.local
# Update VITE_API_URL to http://localhost:5000 for local dev

# 4) Run backend
cd backend && node server.js

# 5) Run frontend
cd ../frontend && npm run dev
# Frontend: http://localhost:5173 (or next available port)
# Backend:  http://localhost:5000
```

### Troubleshooting
- Port already in use:
  - Frontend: Vite auto-switches to a free port.
  - Backend: stop the existing process, or change `PORT` in `.env`.
- MongoDB connection errors:
  - Verify `MONGO_URI` in `backend/.env`.
  - Ensure IP access rules in MongoDB Atlas allow your machine.
- CORS issues:
  - Backend uses `cors()`; confirm `VITE_API_URL` points to the correct backend URL.

---

## Contribution Guidelines
- Code Style
  - Use ESLint defaults plus React Hooks rules; run `npm run lint` in `frontend`.
  - Prefer simple, readable naming and basic styling.
- Branching
  - `feature/*`, `fix/*`, `docs/*`
- Pull Requests
  - Include a clear description, screenshots for UI changes, and testing notes.
- Testing Requirements
  - For new features, include manual test steps and sample requests.

---

## License
- License: MIT
- Third‑party libraries:
  - React, Vite, Tailwind CSS, Axios, Zustand, Express, Mongoose, Day.js

---

