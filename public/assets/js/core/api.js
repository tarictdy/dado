import { getDevBypassPhone, getIdToken } from './auth.js';

const API_BASE_URL = '/api';

async function request(path, options = {}) {
  const token = await getIdToken();
  const devBypassPhone = getDevBypassPhone();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(devBypassPhone ? { 'x-dado-dev-phone': devBypassPhone } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Erreur inconnue.' }));
    throw new Error(payload.message || 'Erreur API.');
  }

  return response.json();
}

export function registerProfile(payload) {
  return request('/auth/register-profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCurrentProfile() {
  return request('/auth/me');
}

export function updateProfile(payload) {
  return request('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
