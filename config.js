// API Base URL configuration
// Automatically switches between Local Development and Deployed Vercel Production
const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.protocol === 'file:';

window.API_URL = isLocalhost
  ? 'http://localhost:5000/api'
  : 'https://notes-backend-virid.vercel.app/api';
