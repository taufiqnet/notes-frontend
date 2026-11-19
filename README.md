# Secure Note-Taking Application - Frontend Client

A lightweight, minimal, and fully functional Single Page Application (SPA) built using vanilla HTML5, CSS3, and JavaScript (ES6+). Zero build-step requirement, zero styling libraries/templates, and 100% focused on backend correctness, authentication, role isolation, and aggregation visualization.

---

## Features

- **Auth & Session Management**:
  - Public registration (strictly creates `user` role).
  - Secure JWT storage in `localStorage` with automatic `Bearer` header injection.
  - Active session validation via `GET /api/auth/me`.
  - Conditional navigation rendering based on `role === 'admin'`.
- **User Notes**:
  - Paginated list of confidential notes owned exclusively by the current user.
  - Create, inline edit, and delete notes.
- **User Profile**:
  - View identity details and update display name and interests tags (`PUT /api/auth/me`).
- **Community Posts (Public & Authenticated)**:
  - Publicly accessible paginated feed of community posts.
  - Create posts when authenticated.
  - Strict ownership rules: only author can edit/delete; admin can delete.
  - Integrated link to inspect author's profile and aggregated post history (**Scenario 2**).
- **Admin Management Panel (`role === 'admin'` only)**:
  - **Users CRUD**: Paginated list of registered accounts, create new accounts with specific roles, delete users with cascading cleanup.
  - **All Notes**: View all system notes across all users, with optional filter by `?owner=<userId>`.
  - **Scenario 1 Aggregation View**: Interactive table showing user accounts grouped by interest category, with count, user list, pagination, and optional `?interest=` search filter.
- **Configurable API Endpoint**: Centralized `config.js` (`window.API_URL`).

---

## Getting Started

### Local Development

1. Open `config.js` and ensure the API base URL matches your backend:
   ```javascript
   window.API_URL = 'http://localhost:5000/api';
   ```
2. Serve the static files using any local HTTP server:
   ```bash
   # Option A: Python HTTP server
   python -m http.server 3000

   # Option B: Node http-server or npx serve
   npx serve . -p 3000
   ```
3. Open your browser at `http://localhost:3000`.

---

## Deployment to Vercel

1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for notes-frontend"
   ```
2. Push to GitHub:
   ```bash
   git remote add origin https://github.com/<username>/notes-frontend.git
   git branch -M main
   git push -u origin main
   ```
3. Deploy to Vercel:
   - Import repository on [Vercel](https://vercel.com).
   - Set Framework Preset to **Other** (Static Site).
   - In `config.js`, update `window.API_URL` to point to your deployed backend URL on Vercel:
     ```javascript
     window.API_URL = 'https://your-notes-backend.vercel.app/api';
     ```
   - Deploy. The included `vercel.json` ensures all route requests fallback gracefully to `index.html`.
