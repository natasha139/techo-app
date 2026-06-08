// Techo App API client
// All requests go to Cloudflare Pages Functions at /api/*
// Every request (except register/login) requires X-Sync-Code header

const BASE = '';

async function apiFetch(path: string, options: RequestInit = {}, syncCode?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (syncCode) headers['X-Sync-Code'] = syncCode;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function register(username: string): Promise<{ sync_code: string; username: string }> {
  return apiFetch('/api/user/register', { method: 'POST', body: JSON.stringify({ username }) });
}

export async function login(syncCode: string): Promise<{ sync_code: string; username: string }> {
  return apiFetch('/api/user/login', { method: 'POST', body: JSON.stringify({ sync_code: syncCode }) });
}

// ─── Self Growth ─────────────────────────────────────────────────────────────

export const api = {
  wishes: {
    list: (sc: string) => apiFetch('/api/self-growth/wishes', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/self-growth/wishes', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/self-growth/wishes?id=${id}`, { method: 'DELETE' }, sc),
    sync: (sc: string, items: any[]) => apiFetch('/api/self-growth/wishes/sync', { method: 'POST', body: JSON.stringify(items) }, sc),
  },
  skills: {
    list: (sc: string) => apiFetch('/api/self-growth/skills', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/self-growth/skills', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/self-growth/skills?id=${id}`, { method: 'DELETE' }, sc),
  },
  work: {
    list: (sc: string) => apiFetch('/api/self-growth/work', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/self-growth/work', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/self-growth/work?id=${id}`, { method: 'DELETE' }, sc),
  },
  hobbies: {
    list: (sc: string) => apiFetch('/api/self-growth/hobbies', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/self-growth/hobbies', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/self-growth/hobbies?id=${id}`, { method: 'DELETE' }, sc),
  },
  sideHustles: {
    list: (sc: string) => apiFetch('/api/self-growth/side-hustles', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/self-growth/side-hustles', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/self-growth/side-hustles?id=${id}`, { method: 'DELETE' }, sc),
  },
  diary: {
    list: (sc: string) => apiFetch('/api/self-growth/diary', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/self-growth/diary', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/self-growth/diary?id=${id}`, { method: 'DELETE' }, sc),
  },

  // ─── Parenting ─────────────────────────────────────────────────────────────
  milestones: {
    list: (sc: string) => apiFetch('/api/parenting/milestones', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/parenting/milestones', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/parenting/milestones?id=${id}`, { method: 'DELETE' }, sc),
  },
  childLogs: {
    list: (sc: string) => apiFetch('/api/parenting/logs', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/parenting/logs', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/parenting/logs?id=${id}`, { method: 'DELETE' }, sc),
  },
  childDiaries: {
    list: (sc: string) => apiFetch('/api/parenting/diary', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/parenting/diary', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/parenting/diary?id=${id}`, { method: 'DELETE' }, sc),
  },

  // ─── General ───────────────────────────────────────────────────────────────
  cells: {
    list: (sc: string) => apiFetch('/api/general/cells', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/general/cells', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/general/cells?id=${id}`, { method: 'DELETE' }, sc),
    sync: (sc: string, items: any[]) => apiFetch('/api/general/cells/sync', { method: 'POST', body: JSON.stringify(items) }, sc),
  },
  habits: {
    list: (sc: string) => apiFetch('/api/general/habits', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/general/habits', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/general/habits?id=${id}`, { method: 'DELETE' }, sc),
  },
  weeklySummary: {
    get: (sc: string) => apiFetch('/api/general/weekly-summary', {}, sc),
    save: (sc: string, data: any) => apiFetch('/api/general/weekly-summary', { method: 'POST', body: JSON.stringify(data) }, sc),
  },
  finance: {
    list: (sc: string) => apiFetch('/api/general/finance', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/general/finance', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/general/finance?id=${id}`, { method: 'DELETE' }, sc),
  },
  fitness: {
    list: (sc: string) => apiFetch('/api/general/fitness', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/general/fitness', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/general/fitness?id=${id}`, { method: 'DELETE' }, sc),
  },
  inbox: {
    list: (sc: string) => apiFetch('/api/self-growth/inbox', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/self-growth/inbox', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/self-growth/inbox?id=${id}`, { method: 'DELETE' }, sc),
  },
  parentingResources: {
    list: (sc: string) => apiFetch('/api/parenting/resources', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/parenting/resources', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/parenting/resources?id=${id}`, { method: 'DELETE' }, sc),
  },
  childGoals: {
    list: (sc: string, scope?: string) => apiFetch(`/api/parenting/goals${scope ? `?scope=${scope}` : ''}`, {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/parenting/goals', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/parenting/goals?id=${id}`, { method: 'DELETE' }, sc),
  },
  growthLinks: {
    list: (sc: string) => apiFetch('/api/parenting/growth-links', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/parenting/growth-links', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/parenting/growth-links?id=${id}`, { method: 'DELETE' }, sc),
  },
  mediaNotes: {
    list: (sc: string) => apiFetch('/api/general/media-notes', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/general/media-notes', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/general/media-notes?id=${id}`, { method: 'DELETE' }, sc),
  },
  reminders: {
    list: (sc: string) => apiFetch('/api/general/reminders', {}, sc),
    upsert: (sc: string, item: any) => apiFetch('/api/general/reminders', { method: 'POST', body: JSON.stringify(item) }, sc),
    delete: (sc: string, id: string) => apiFetch(`/api/general/reminders?id=${id}`, { method: 'DELETE' }, sc),
  },
  settings: {
    getAll: (sc: string) => apiFetch('/api/general/settings', {}, sc),
    set: (sc: string, data: Record<string, string>) => apiFetch('/api/general/settings', { method: 'POST', body: JSON.stringify(data) }, sc),
    delete: (sc: string, key: string) => apiFetch(`/api/general/settings?key=${encodeURIComponent(key)}`, { method: 'DELETE' }, sc),
  },
};
