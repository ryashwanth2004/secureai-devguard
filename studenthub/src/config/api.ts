// Determine backend endpoint:
// 1. Query parameter ?api=... or saved localStorage ('SECUREAI_API_URL') for dynamic switching.
// 2. VITE_API_URL if set during build/runtime.
// 3. Fallback to active Cloudflare tunnel URL on public domains (e.g. Vercel, mobile devices).
// 4. Default to http://localhost:8000 on local development.

const CLOUDFLARE_TUNNEL_URL = 'https://learning-reasonable-estimates-notes.trycloudflare.com';

function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const queryApi = params.get('api_url') || params.get('api');
    if (queryApi) {
      localStorage.setItem('SECUREAI_API_URL', queryApi);
      return queryApi;
    }
    const saved = localStorage.getItem('SECUREAI_API_URL');
    if (saved && saved.trim() !== '') {
      return saved;
    }
  }

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
