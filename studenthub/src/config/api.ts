// Determine backend endpoint:
// 1. If VITE_API_URL is explicitly set during build or runtime, use it.
// 2. If running in browser on production domain (e.g. *.vercel.app, external host/devices), use the live Cloudflare tunnel URL.
// 3. Otherwise fall back to localhost:8000 for local development.

const CLOUDFLARE_TUNNEL_URL = 'https://detailed-suggestion-awareness-commonly.trycloudflare.com';

function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return CLOUDFLARE_TUNNEL_URL;
  }
  return 'http://localhost:8000';
}

export const API_BASE_URL = resolveApiBaseUrl().replace(/\/+$/, '');
