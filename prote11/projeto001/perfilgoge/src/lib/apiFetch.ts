import fetch from 'node-fetch';

export type ApiFetchOptions = RequestInit & {
  parseJson?: boolean;
};

export async function apiFetch(url: string, options: ApiFetchOptions = {}) {
  const { parseJson = true, ...init } = options;

  // Ensure cookies are sent for same-site auth
  if (!init.credentials) init.credentials = 'include';

  const res = await fetch(url, init as any);
  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => null);
    }
    const err: any = new Error(body?.error || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (!parseJson) return res;
  return res.json();
}
