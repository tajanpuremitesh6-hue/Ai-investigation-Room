import { authService } from './auth.js';

async function request(path, options = {}) {
  const token = authService.getToken();
  const response = await fetch(`/api/v1/investigations${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || 'The request could not be completed.');
  return body.data;
}

export const investigationService = {
  create: (payload) => request('', { method: 'POST', body: JSON.stringify(payload) }),
  list: (page = 1) => request(`?page=${page}`),
  status: (id) => request(`/${encodeURIComponent(id)}/generation-status`),
  get: (id) => request(`/${encodeURIComponent(id)}`),
  delete: (id) => request(`/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  accuse: (id, payload) => request(`/${encodeURIComponent(id)}/accusation`, { method: 'POST', body: JSON.stringify(payload) }),
  result: (id) => request(`/${encodeURIComponent(id)}/result`),
  evidence: (id) => request(`/${encodeURIComponent(id)}/evidence`),
  openEvidence: (id, evidenceId) => request(`/${encodeURIComponent(id)}/evidence/${encodeURIComponent(evidenceId)}/open`, { method: 'POST' }),
  bookmarkEvidence: (id, evidenceId, bookmarked) => request(`/${encodeURIComponent(id)}/evidence/${encodeURIComponent(evidenceId)}/bookmark`, { method: 'PUT', body: JSON.stringify({ bookmarked }) }),
  suspects: (id) => request(`/${encodeURIComponent(id)}/suspects`),
  timeline: (id) => request(`/${encodeURIComponent(id)}/timeline`),
  notes: (id) => request(`/${encodeURIComponent(id)}/notes`),
  createNote: (id, payload) => request(`/${encodeURIComponent(id)}/notes`, { method: 'POST', body: JSON.stringify(payload) }),
  updateNote: (id, noteId, payload) => request(`/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteNote: (id, noteId) => request(`/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' }),
};
