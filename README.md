# TaskNest — Frontend

A modern, responsive personal task management web application built with **Angular 21** and **PrimeNG 21**, paired with a Spring Boot & MongoDB backend.

- **Live App:** https://tasknest-frontend-tau.vercel.app
- **Backend Repository:** https://github.com/ammaribnmohd/tasknest-backend

---

## Features

- **Authentication & Account Security**
  - User registration with email OTP verification
  - Session-based login with CSRF protection (`XSRF-TOKEN`)
  - Forgot password & OTP-verified password reset flow
  - Confirmation modal on sign-out
- **Task Management Views**
  - **Inbox**, **Today**, **Upcoming**, **All Tasks**, and **Completed** views
  - Priority filtering (`HIGH`, `MEDIUM`, `LOW`) and live task counts
  - Create, edit, status-toggle, and delete tasks with confirmation dialogs
- **UI & Experience**
  - Light & Dark mode toggle persisted in `localStorage`
  - Collapsible desktop sidebar and mobile navigation drawer
  - Same-origin `/api` proxy in both local development (`proxy.conf.json`) and Vercel production (`vercel.json`) so session cookies work across all browsers including Safari

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (`@angular/core` ^21.1.0, standalone components, signals) |
| UI Library | PrimeNG ^21.1.10, PrimeIcons ^8.0.2, `@primeuix/themes` |
| Styling | SCSS with CSS custom properties |
| Language | TypeScript ~5.9.2 |
| Testing | Vitest ^4.0.8 |
| Hosting | Vercel |

---

## Project Structure

```text
src/
├── environments/
│   ├── environment.ts              # Production config (apiUrl: '/api')
│   └── environment.development.ts  # Development config (apiUrl: '/api')
└── app/
    ├── core/
    │   ├── config/                 # Theme configuration & dark mode service
    │   ├── guards/                 # Auth route guards
    │   ├── interceptors/           # HTTP interceptor (credentials, CSRF, 401 redirect)
    │   ├── models/                 # Auth & user models
    │   └── services/               # AuthService
    ├── features/tasks/
    │   ├── components/             # Task list view & task modal
    │   ├── models/                 # Task, status, priority models
    │   └── services/               # TaskApiService & signal-based TaskStateService
    ├── layout/                     # Shell, sidebar, mobile drawer
    └── pages/                      # Login, Register, Verify Email, Password Reset, Settings, Task Views
```

---

## Local Development

### Prerequisites
- Node.js 22+ and npm
- Running instance of `tasknest-backend` on `http://localhost:8080`

### Setup & Run
```bash
npm install
npm start
```

Open `http://localhost:4200`. Requests to `/api/*` are automatically proxied to `http://localhost:8080` via `proxy.conf.json`.

### Build & Test
```bash
# Production build (outputs to dist/taskflow-frontend/browser)
npm run build

# Unit tests
npm test
```

---

## Deployment (Vercel)

1. Point `vercel.json` `/api/:path*` rewrite destination to your live backend URL.
2. Import the repository on Vercel with:
   - **Framework Preset:** `Angular`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/taskflow-frontend/browser`
3. No Vercel environment variables are required.
