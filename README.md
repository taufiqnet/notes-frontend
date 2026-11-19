# Secure Note-Taking Application - Frontend Client

A minimal, fast, and functional Single Page Application (SPA) built using vanilla HTML5, CSS3, and JavaScript (ES6+). Zero build tools, zero UI frameworks or styling templates, and 100% focused on backend correctness, authentication, role isolation, and aggregation visualization.

---

## Live Deployments & Evaluation Credentials

- **Live Application**: [https://notes-frontend-gold.vercel.app](https://notes-frontend-gold.vercel.app)
- **Connected Backend API**: [https://notes-backend-virid.vercel.app/api](https://notes-backend-virid.vercel.app/api)

### Evaluation Credentials

| Role | Email | Password | Features to Test |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `AdminPassword123!` | Users CRUD, view all notes across system with owner filter, Scenario 1 Interests Aggregation |
| **Standard User** | Register any new account | Min 6 chars | Personal notes CRUD, update profile interests, publish community posts, view Scenario 2 posts |

> **Tip**: The login screen on the live website includes an **"Auto-fill Admin Credentials"** button for quick one-click evaluation!

---

## Features

- **Authentication & Roles**:
  - Public registration (strictly creates `user` role).
  - Secure JWT storage in `localStorage` with automatic `Bearer <token>` header injection on all API requests.
  - Active session validation via `GET /api/auth/me`.
  - Conditional navigation rendering: the **Admin Panel** tab is displayed **only** when `role === 'admin'`.
- **User Notes**:
  - Paginated list of confidential notes owned exclusively by the current user.
  - Create note, inline edit note, and delete note.
  - Other users' notes are strictly isolated and protected by the backend (403 Forbidden).
- **User Profile**:
  - View identity details (User ID, Role, Email).
  - Update display name and comma-separated interests tags (`PUT /api/auth/me`). Role is immutable.
- **Community Posts (Public & Authenticated)**:
  - Publicly accessible paginated feed of community posts (no authentication required to read).
  - Create posts when authenticated.
  - Strict ownership rules: only author can edit/delete; admin can delete.
  - Clickable **"View author posts (Scenario 2)"** link on any post to inspect the author's profile and aggregated post history.
- **Admin Management Dashboard (`role === 'admin'` only)**:
  - **Users CRUD**: Paginated list of registered accounts, create new accounts with specific roles (`user` or `admin`), delete users with cascading cleanup.
  - **All System Notes**: View all notes across all users, with optional filter by `?owner=<userId>`, inline edit, and delete.
  - **Scenario 1 Aggregation View**: Interactive table showing user accounts grouped by interest category, with count, user list, pagination, and optional `?interest=` search filter.
- **Configurable API Endpoint**: Centralized `config.js` (`window.API_URL`).

---

## Project Structure

```text
notes-frontend/
├── app.js          # Application logic, state, API wrapper, pagination, event handlers
├── config.js       # Centralized API URL configuration (window.API_URL)
├── index.html      # Semantic HTML views (Auth, Notes, Profile, Posts, Scenario 2, Admin)
├── style.css       # Clean, minimal unstyled CSS
├── vercel.json     # Static SPA routing configuration
└── README.md       # Frontend documentation
```

---

## Local Development

1. Open `config.js` and set the backend API URL:
   ```javascript
   // For local backend:
   window.API_URL = 'http://localhost:5000/api';

   // For deployed backend:
   window.API_URL = 'https://notes-backend-virid.vercel.app/api';
   ```
2. Serve the static files using any local HTTP server:
   ```bash
   # Option A: Python HTTP server
   python -m http.server 3000

   # Option B: Node npx serve
   npx serve . -p 3000
   ```
3. Open `http://localhost:3000` in your browser.

---

## Deployment to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for notes-frontend"
   git branch -M main
   git remote add origin https://github.com/<username>/notes-frontend.git
   git push -u origin main
   ```
2. **Deploy on Vercel**:
   - Import the repository on [Vercel](https://vercel.com).
   - Set Framework Preset to **Other** (Static Site).
   - Leave Build Command and Output Directory empty.
   - Click **Deploy**.
