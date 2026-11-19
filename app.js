// Application State
let state = {
  token: localStorage.getItem('notes_token') || null,
  user: null,
  notesPage: 1,
  notesTotalPages: 1,
  postsPage: 1,
  postsTotalPages: 1,
  userPostsPage: 1,
  userPostsTotalPages: 1,
  userPostsUserId: null,
  adminUsersPage: 1,
  adminUsersTotalPages: 1,
  adminNotesPage: 1,
  adminNotesTotalPages: 1,
  adminInterestsPage: 1,
  adminInterestsTotalPages: 1,
};

// UI Alert Helper
function showAlert(message, isError = false) {
  const alertEl = document.getElementById('global-alert');
  alertEl.textContent = message;
  alertEl.className = isError ? 'alert error' : 'alert success';
  alertEl.style.display = 'block';
  setTimeout(() => {
    alertEl.style.display = 'none';
  }, 5000);
}

// Unified API Fetch wrapper
async function apiFetch(endpoint, options = {}) {
  const url = `${window.API_URL}${endpoint}`;
  const headers = options.headers || {};

  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    throw err;
  }
}

// Navigation & Tab Switching
function switchSection(sectionId) {
  const sections = [
    'auth-section',
    'notes-section',
    'profile-section',
    'posts-section',
    'user-posts-section',
    'admin-section',
  ];

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === sectionId ? 'block' : 'none';
  });

  const navMap = {
    'auth-section': 'nav-auth',
    'notes-section': 'nav-notes',
    'profile-section': 'nav-profile',
    'posts-section': 'nav-posts',
    'admin-section': 'nav-admin',
  };

  document.querySelectorAll('nav button').forEach((btn) => btn.classList.remove('active'));
  const activeNavId = navMap[sectionId];
  if (activeNavId && document.getElementById(activeNavId)) {
    document.getElementById(activeNavId).classList.add('active');
  }

  // Auto load section data
  if (sectionId === 'notes-section') loadNotes(1);
  if (sectionId === 'profile-section') loadProfile();
  if (sectionId === 'posts-section') loadPosts(1);
  if (sectionId === 'admin-section') loadAdminUsers(1);
}

function showAuthTab(tab) {
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tab-login-btn').className = tab === 'login' ? 'active' : '';
  document.getElementById('tab-register-btn').className = tab === 'register' ? 'active' : '';
}

function fillAdminCredentials() {
  document.getElementById('login-email').value = 'admin@example.com';
  document.getElementById('login-password').value = 'AdminPassword123!';
  showAlert('Admin credentials filled. Click "Sign In" to evaluate.');
}

function showAdminTab(tab) {
  document.getElementById('admin-users-view').style.display = tab === 'users' ? 'block' : 'none';
  document.getElementById('admin-notes-view').style.display = tab === 'notes' ? 'block' : 'none';
  document.getElementById('admin-interests-view').style.display = tab === 'interests' ? 'block' : 'none';

  document.getElementById('admin-tab-users-btn').className = tab === 'users' ? 'active' : '';
  document.getElementById('admin-tab-notes-btn').className = tab === 'notes' ? 'active' : '';
  document.getElementById('admin-tab-interests-btn').className = tab === 'interests' ? 'active' : '';

  if (tab === 'users') loadAdminUsers(1);
  if (tab === 'notes') loadAdminNotes(1);
  if (tab === 'interests') loadAdminInterests(1);
}

// Authentication Handlers
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    state.token = res.token;
    state.user = res.user;
    localStorage.setItem('notes_token', res.token);
    localStorage.setItem('notes_user', JSON.stringify(res.user));

    showAlert(`Welcome back, ${res.user.name}!`);
    updateAuthUI();
    switchSection('notes-section');
  } catch (err) {
    showAlert(err.message, true);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const rawInterests = document.getElementById('reg-interests').value;

  const interests = rawInterests
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, interests }),
    });

    state.token = res.token;
    state.user = res.user;
    localStorage.setItem('notes_token', res.token);
    localStorage.setItem('notes_user', JSON.stringify(res.user));

    showAlert(`Registration successful! Role: ${res.user.role}`);
    updateAuthUI();
    switchSection('notes-section');
  } catch (err) {
    showAlert(err.message, true);
  }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('notes_token');
  localStorage.removeItem('notes_user');
  showAlert('Logged out successfully.');
  updateAuthUI();
  switchSection('auth-section');
}

function updateAuthUI() {
  const isLoggedIn = !!state.token;
  const isAdmin = state.user && state.user.role === 'admin';

  document.getElementById('nav-auth').style.display = isLoggedIn ? 'none' : 'inline-block';
  document.getElementById('nav-notes').style.display = isLoggedIn ? 'inline-block' : 'none';
  document.getElementById('nav-profile').style.display = isLoggedIn ? 'inline-block' : 'none';
  document.getElementById('nav-logout').style.display = isLoggedIn ? 'inline-block' : 'none';
  document.getElementById('nav-admin').style.display = isAdmin ? 'inline-block' : 'none';
  document.getElementById('create-post-wrapper').style.display = isLoggedIn ? 'block' : 'none';

  const userStatusEl = document.getElementById('user-status');
  if (isLoggedIn && state.user) {
    userStatusEl.innerHTML = `Logged in as: <strong>${state.user.name}</strong> (${state.user.email}) <span class="badge">${state.user.role}</span>`;
  } else {
    userStatusEl.textContent = 'Not logged in';
  }
}

// Initial App Auth Check
async function init() {
  if (state.token) {
    try {
      const res = await apiFetch('/auth/me');
      state.user = res.user;
      localStorage.setItem('notes_user', JSON.stringify(res.user));
      updateAuthUI();
      switchSection('notes-section');
      return;
    } catch (err) {
      console.warn('Session expired or invalid, logging out.');
      logout();
      return;
    }
  }
  updateAuthUI();
  switchSection('auth-section');
}

// Notes Handlers
async function loadNotes(page = 1) {
  state.notesPage = page;
  const container = document.getElementById('notes-list-container');
  container.innerHTML = '<p>Loading notes...</p>';

  try {
    const res = await apiFetch(`/notes?page=${page}&limit=10`);
    state.notesTotalPages = res.totalPages;

    document.getElementById('notes-page-info').textContent = `Page ${res.page} of ${res.totalPages || 1} (Total: ${res.total})`;
    document.getElementById('notes-prev-btn').disabled = res.page <= 1;
    document.getElementById('notes-next-btn').disabled = res.page >= res.totalPages;

    if (!res.data || res.data.length === 0) {
      container.innerHTML = '<p>No notes found. Create your first note above!</p>';
      return;
    }

    let html = '<table><thead><tr><th>Title</th><th>Content</th><th>Created</th><th>Actions</th></tr></thead><tbody>';
    res.data.forEach((note) => {
      const escapedTitle = escapeHtml(note.title);
      const escapedContent = escapeHtml(note.content);
      html += `
        <tr>
          <td><strong>${escapedTitle}</strong></td>
          <td>${escapedContent}</td>
          <td>${new Date(note.createdAt).toLocaleString()}</td>
          <td>
            <button class="btn btn-small" onclick="openEditNote('${note._id}', '${escapeAttr(note.title)}', '${escapeAttr(note.content)}')">Edit</button>
            <button class="btn btn-danger btn-small" onclick="handleDeleteNote('${note._id}')">Delete</button>
          </td>
        </tr>
      `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error loading notes: ${err.message}</p>`;
  }
}

function changeNotesPage(delta) {
  const target = state.notesPage + delta;
  if (target >= 1 && target <= state.notesTotalPages) {
    loadNotes(target);
  }
}

async function handleCreateNote(e) {
  e.preventDefault();
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;

  try {
    await apiFetch('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
    showAlert('Note created successfully!');
    document.getElementById('create-note-form').reset();
    loadNotes(1);
  } catch (err) {
    showAlert(err.message, true);
  }
}

function openEditNote(id, title, content) {
  document.getElementById('edit-note-id').value = id;
  document.getElementById('edit-note-title').value = title;
  document.getElementById('edit-note-content').value = content;
  document.getElementById('edit-note-form').style.display = 'block';
}

function cancelEditNote() {
  document.getElementById('edit-note-form').reset();
  document.getElementById('edit-note-form').style.display = 'none';
}

async function handleSaveEditedNote(e) {
  e.preventDefault();
  const id = document.getElementById('edit-note-id').value;
  const title = document.getElementById('edit-note-title').value;
  const content = document.getElementById('edit-note-content').value;

  try {
    await apiFetch(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    });
    showAlert('Note updated successfully!');
    cancelEditNote();
    loadNotes(state.notesPage);
  } catch (err) {
    showAlert(err.message, true);
  }
}

async function handleDeleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) return;

  try {
    await apiFetch(`/notes/${id}`, { method: 'DELETE' });
    showAlert('Note deleted.');
    loadNotes(state.notesPage);
  } catch (err) {
    showAlert(err.message, true);
  }
}

// Profile Handlers
async function loadProfile() {
  try {
    const res = await apiFetch('/auth/me');
    state.user = res.user;
    document.getElementById('prof-id').value = res.user._id;
    document.getElementById('prof-role').value = res.user.role;
    document.getElementById('prof-email').value = res.user.email;
    document.getElementById('prof-name').value = res.user.name;
    document.getElementById('prof-interests').value = (res.user.interests || []).join(', ');
  } catch (err) {
    showAlert(err.message, true);
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const name = document.getElementById('prof-name').value;
  const rawInterests = document.getElementById('prof-interests').value;
  const interests = rawInterests
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const res = await apiFetch('/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ name, interests }),
    });
    state.user = res.user;
    localStorage.setItem('notes_user', JSON.stringify(res.user));
    showAlert('Profile updated successfully!');
    updateAuthUI();
  } catch (err) {
    showAlert(err.message, true);
  }
}

// Community Posts Handlers
async function loadPosts(page = 1) {
  state.postsPage = page;
  const container = document.getElementById('posts-list-container');
  container.innerHTML = '<p>Loading public posts...</p>';

  try {
    const res = await apiFetch(`/posts?page=${page}&limit=10`);
    state.postsTotalPages = res.totalPages;

    document.getElementById('posts-page-info').textContent = `Page ${res.page} of ${res.totalPages || 1} (Total: ${res.total})`;
    document.getElementById('posts-prev-btn').disabled = res.page <= 1;
    document.getElementById('posts-next-btn').disabled = res.page >= res.totalPages;

    if (!res.data || res.data.length === 0) {
      container.innerHTML = '<p>No community posts yet. Create the first one above!</p>';
      return;
    }

    let html = '';
    const currentUserId = state.user ? state.user._id : null;
    const isAdmin = state.user && state.user.role === 'admin';

    res.data.forEach((post) => {
      const authorId = post.author?._id || post.author;
      const authorName = post.author?.name || 'Unknown Author';
      const isAuthor = currentUserId && String(authorId) === String(currentUserId);
      const canDelete = isAuthor || isAdmin;

      html += `
        <div class="card" style="margin-bottom: 12px;">
          <h4>${escapeHtml(post.title)}</h4>
          <p style="margin: 8px 0;">${escapeHtml(post.content)}</p>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
            By: <strong>${escapeHtml(authorName)}</strong> |
            <a href="javascript:void(0)" onclick="viewUserPosts('${authorId}', 1)">View author posts (Scenario 2)</a> |
            ${new Date(post.createdAt).toLocaleString()}
          </div>
          <div>
            ${isAuthor ? `<button class="btn btn-small" onclick="openEditPost('${post._id}', '${escapeAttr(post.title)}', '${escapeAttr(post.content)}')">Edit</button>` : ''}
            ${canDelete ? `<button class="btn btn-danger btn-small" onclick="handleDeletePost('${post._id}')">Delete</button>` : ''}
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error loading posts: ${err.message}</p>`;
  }
}

function changePostsPage(delta) {
  const target = state.postsPage + delta;
  if (target >= 1 && target <= state.postsTotalPages) {
    loadPosts(target);
  }
}

async function handleCreatePost(e) {
  e.preventDefault();
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;

  try {
    await apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
    showAlert('Post published!');
    document.getElementById('create-post-form').reset();
    loadPosts(1);
  } catch (err) {
    showAlert(err.message, true);
  }
}

function openEditPost(id, title, content) {
  document.getElementById('edit-post-id').value = id;
  document.getElementById('edit-post-title').value = title;
  document.getElementById('edit-post-content').value = content;
  document.getElementById('edit-post-form').style.display = 'block';
}

function cancelEditPost() {
  document.getElementById('edit-post-form').reset();
  document.getElementById('edit-post-form').style.display = 'none';
}

async function handleSaveEditedPost(e) {
  e.preventDefault();
  const id = document.getElementById('edit-post-id').value;
  const title = document.getElementById('edit-post-title').value;
  const content = document.getElementById('edit-post-content').value;

  try {
    await apiFetch(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    });
    showAlert('Post updated!');
    cancelEditPost();
    loadPosts(state.postsPage);
  } catch (err) {
    showAlert(err.message, true);
  }
}

async function handleDeletePost(id) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    await apiFetch(`/posts/${id}`, { method: 'DELETE' });
    showAlert('Post deleted.');
    loadPosts(state.postsPage);
  } catch (err) {
    showAlert(err.message, true);
  }
}

// SCENARIO 2: USER'S POSTS AGGREGATION VIEW
async function viewUserPosts(userId, page = 1) {
  state.userPostsUserId = userId;
  state.userPostsPage = page;
  switchSection('user-posts-section');

  const profileCard = document.getElementById('user-profile-card');
  const postsContainer = document.getElementById('user-aggregated-posts-container');
  profileCard.innerHTML = '<p>Loading user profile...</p>';
  postsContainer.innerHTML = '<p>Loading aggregated posts...</p>';

  try {
    const res = await apiFetch(`/users/${userId}/posts?page=${page}&limit=10`);
    state.userPostsTotalPages = res.totalPages;

    document.getElementById('user-posts-page-info').textContent = `Page ${res.page} of ${res.totalPages || 1} (Total Posts: ${res.total})`;
    document.getElementById('user-posts-prev-btn').disabled = res.page <= 1;
    document.getElementById('user-posts-next-btn').disabled = res.page >= res.totalPages;

    const u = res.user;
    profileCard.innerHTML = `
      <p><strong>Name:</strong> ${escapeHtml(u.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(u.email)}</p>
      <p><strong>Role:</strong> <span class="badge">${escapeHtml(u.role)}</span></p>
      <p><strong>Interests:</strong> ${(u.interests || []).map((i) => `<span class="badge">${escapeHtml(i)}</span>`).join(' ') || 'None'}</p>
      <p><strong>Joined:</strong> ${new Date(u.createdAt).toLocaleDateString()}</p>
    `;

    if (!res.data || res.data.length === 0) {
      postsContainer.innerHTML = '<p>This user has not authored any posts yet.</p>';
      return;
    }

    let html = '<table><thead><tr><th>Title</th><th>Content</th><th>Published</th></tr></thead><tbody>';
    res.data.forEach((p) => {
      html += `
        <tr>
          <td><strong>${escapeHtml(p.title)}</strong></td>
          <td>${escapeHtml(p.content)}</td>
          <td>${new Date(p.createdAt).toLocaleString()}</td>
        </tr>
      `;
    });
    html += '</tbody></table>';
    postsContainer.innerHTML = html;
  } catch (err) {
    profileCard.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    postsContainer.innerHTML = '';
  }
}

function changeUserPostsPage(delta) {
  const target = state.userPostsPage + delta;
  if (target >= 1 && target <= state.userPostsTotalPages) {
    viewUserPosts(state.userPostsUserId, target);
  }
}

// ADMIN PANEL: USERS CRUD
async function loadAdminUsers(page = 1) {
  state.adminUsersPage = page;
  const container = document.getElementById('admin-users-table-container');
  container.innerHTML = '<p>Loading users...</p>';

  try {
    const res = await apiFetch(`/users?page=${page}&limit=10`);
    state.adminUsersTotalPages = res.totalPages;

    document.getElementById('admin-users-page-info').textContent = `Page ${res.page} of ${res.totalPages || 1} (Total: ${res.total})`;
    document.getElementById('admin-users-prev-btn').disabled = res.page <= 1;
    document.getElementById('admin-users-next-btn').disabled = res.page >= res.totalPages;

    let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Interests</th><th>Actions</th></tr></thead><tbody>';
    res.data.forEach((u) => {
      html += `
        <tr>
          <td style="font-size:11px;">${u._id}</td>
          <td>${escapeHtml(u.name)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="badge">${u.role}</span></td>
          <td>${(u.interests || []).join(', ')}</td>
          <td>
            <button class="btn btn-danger btn-small" onclick="handleAdminDeleteUser('${u._id}')">Delete</button>
          </td>
        </tr>
      `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

function changeAdminUsersPage(delta) {
  const target = state.adminUsersPage + delta;
  if (target >= 1 && target <= state.adminUsersTotalPages) {
    loadAdminUsers(target);
  }
}

async function handleAdminCreateUser(e) {
  e.preventDefault();
  const name = document.getElementById('admin-user-name').value;
  const email = document.getElementById('admin-user-email').value;
  const password = document.getElementById('admin-user-password').value;
  const role = document.getElementById('admin-user-role').value;
  const rawInterests = document.getElementById('admin-user-interests').value;

  const interests = rawInterests
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    await apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, interests }),
    });
    showAlert(`User ${name} created with role ${role}!`);
    document.getElementById('admin-create-user-form').reset();
    loadAdminUsers(1);
  } catch (err) {
    showAlert(err.message, true);
  }
}

async function handleAdminDeleteUser(id) {
  if (!confirm('Are you sure you want to delete this user and all associated notes/posts?')) return;

  try {
    await apiFetch(`/users/${id}`, { method: 'DELETE' });
    showAlert('User deleted successfully.');
    loadAdminUsers(state.adminUsersPage);
  } catch (err) {
    showAlert(err.message, true);
  }
}

// ADMIN PANEL: ALL NOTES
async function loadAdminNotes(page = 1) {
  state.adminNotesPage = page;
  const container = document.getElementById('admin-notes-table-container');
  container.innerHTML = '<p>Loading all system notes...</p>';

  const ownerFilter = document.getElementById('admin-notes-filter-owner').value.trim();
  const queryParam = ownerFilter ? `&owner=${encodeURIComponent(ownerFilter)}` : '';

  try {
    const res = await apiFetch(`/notes?page=${page}&limit=10${queryParam}`);
    state.adminNotesTotalPages = res.totalPages;

    document.getElementById('admin-notes-page-info').textContent = `Page ${res.page} of ${res.totalPages || 1} (Total: ${res.total})`;
    document.getElementById('admin-notes-prev-btn').disabled = res.page <= 1;
    document.getElementById('admin-notes-next-btn').disabled = res.page >= res.totalPages;

    if (!res.data || res.data.length === 0) {
      container.innerHTML = '<p>No notes found matching query.</p>';
      return;
    }

    let html = '<table><thead><tr><th>Title</th><th>Content</th><th>Owner</th><th>Actions</th></tr></thead><tbody>';
    res.data.forEach((n) => {
      const ownerText = n.owner ? `${escapeHtml(n.owner.name)} (${escapeHtml(n.owner.email)})` : 'N/A';
      html += `
        <tr>
          <td><strong>${escapeHtml(n.title)}</strong></td>
          <td>${escapeHtml(n.content)}</td>
          <td>${ownerText}</td>
          <td>
            <button class="btn btn-danger btn-small" onclick="handleAdminDeleteNote('${n._id}')">Delete</button>
          </td>
        </tr>
      `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

function clearAdminNotesFilter() {
  document.getElementById('admin-notes-filter-owner').value = '';
  loadAdminNotes(1);
}

function changeAdminNotesPage(delta) {
  const target = state.adminNotesPage + delta;
  if (target >= 1 && target <= state.adminNotesTotalPages) {
    loadAdminNotes(target);
  }
}

async function handleAdminDeleteNote(id) {
  if (!confirm('Are you sure you want to delete this note as Admin?')) return;

  try {
    await apiFetch(`/notes/${id}`, { method: 'DELETE' });
    showAlert('Note deleted.');
    loadAdminNotes(state.adminNotesPage);
  } catch (err) {
    showAlert(err.message, true);
  }
}

// ADMIN PANEL: SCENARIO 1 (GROUPED BY INTERESTS)
async function loadAdminInterests(page = 1) {
  state.adminInterestsPage = page;
  const container = document.getElementById('admin-interests-container');
  container.innerHTML = '<p>Executing Scenario 1 Aggregation Pipeline...</p>';

  const interestFilter = document.getElementById('admin-interests-filter').value.trim();
  const queryParam = interestFilter ? `&interest=${encodeURIComponent(interestFilter)}` : '';

  try {
    const res = await apiFetch(`/users/grouped-by-interests?page=${page}&limit=10${queryParam}`);
    state.adminInterestsTotalPages = res.totalPages;

    document.getElementById('admin-interests-page-info').textContent = `Page ${res.page} of ${res.totalPages || 1} (Total Groups: ${res.total})`;
    document.getElementById('admin-interests-prev-btn').disabled = res.page <= 1;
    document.getElementById('admin-interests-next-btn').disabled = res.page >= res.totalPages;

    if (!res.data || res.data.length === 0) {
      container.innerHTML = '<p>No user interest groups found.</p>';
      return;
    }

    let html = '<table><thead><tr><th>Interest Category</th><th>User Count</th><th>Associated Users</th></tr></thead><tbody>';
    res.data.forEach((group) => {
      const userList = (group.users || [])
        .map((u) => `${escapeHtml(u.name)} (${escapeHtml(u.email)})`)
        .join(', ');

      html += `
        <tr>
          <td><strong>${escapeHtml(group._id)}</strong></td>
          <td><span class="badge" style="font-weight:bold;">${group.count}</span></td>
          <td>${userList}</td>
        </tr>
      `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error running aggregation: ${err.message}</p>`;
  }
}

function clearAdminInterestsFilter() {
  document.getElementById('admin-interests-filter').value = '';
  loadAdminInterests(1);
}

function changeAdminInterestsPage(delta) {
  const target = state.adminInterestsPage + delta;
  if (target >= 1 && target <= state.adminInterestsTotalPages) {
    loadAdminInterests(target);
  }
}

// Sanitization helpers
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;')
    .replace(/\n/g, ' ');
}

// Start app on DOM ready
document.addEventListener('DOMContentLoaded', init);
