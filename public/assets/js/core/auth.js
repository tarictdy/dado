const AUTH_API_BASE = '/api/auth';
const AUTH_TOKEN_STORAGE_KEY = 'dadoAuthToken';
const USER_STORAGE_KEY = 'dadoUser';

let localOtpSession = null;

function normalizePhone(phone) {
  return String(phone || '').replace(/\s+/g, '');
}

function readStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({ message: 'Erreur inconnue.' }));
  if (!response.ok) {
    throw new Error(payload.message || 'Erreur API.');
  }
  return payload;
}

export async function sendOTP(phone, _containerId, mode = 'login') {
  const normalizedPhone = normalizePhone(phone);
  if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
    throw new Error('Numero invalide. Utilisez le format international, ex: +2250700000000.');
  }

  const normalizedMode = mode === 'register' ? 'register' : 'login';
  const response = await fetch(`${AUTH_API_BASE}/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: normalizedPhone, mode: normalizedMode }),
  });

  const payload = await parseApiResponse(response);
  localOtpSession = {
    phone: normalizedPhone,
    mode: normalizedMode,
    requestId: payload.requestId,
    expiresAt: payload.expiresAt,
  };

  return payload;
}

export async function verifyOTP(code, options = {}) {
  const normalizedCode = String(code || '').trim();
  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error('Code OTP invalide. Entrez les 6 chiffres.');
  }

  if (!localOtpSession) {
    throw new Error('Aucune demande OTP active.');
  }

  const response = await fetch(`${AUTH_API_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: localOtpSession.phone,
      mode: localOtpSession.mode,
      code: normalizedCode,
      profile: options.profile,
    }),
  });

  const payload = await parseApiResponse(response);
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, payload.token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user));
  localOtpSession = null;

  return {
    uid: payload.user?.id,
    phoneNumber: payload.user?.phone,
    user: payload.user,
    token: payload.token,
  };
}

export async function getIdToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function getCurrentUser() {
  return readStoredUser();
}

export function watchAuthState(callback) {
  callback(getCurrentUser());
  return () => {};
}

export async function logout() {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    await fetch(`${AUTH_API_BASE}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {});
  }

  localOtpSession = null;
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}
