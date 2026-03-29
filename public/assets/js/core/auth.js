import { auth, getRecaptchaVerifier, onAuthStateChanged, signInWithPhoneNumber, signOut } from './firebase-client.js';

let confirmationResultCache = null;

function normalizePhone(phone) {
  return String(phone || '').replace(/\s+/g, '');
}

export async function sendOTP(phone, containerId) {
  const normalizedPhone = normalizePhone(phone);
  if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
    throw new Error('Numéro invalide. Utilisez le format international, ex: +2250700000000.');
  }
  const verifier = getRecaptchaVerifier(containerId);
  confirmationResultCache = await signInWithPhoneNumber(auth, normalizedPhone, verifier);
  return confirmationResultCache;
}

export async function verifyOTP(code) {
  if (!confirmationResultCache) {
    throw new Error('Aucune demande OTP active.');
  }
  const normalizedCode = String(code || '').trim();
  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error('Code OTP invalide. Entrez les 6 chiffres reçus.');
  }
  const credential = await confirmationResultCache.confirm(normalizedCode);
  return credential.user;
}

export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  return user.getIdToken();
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function logout() {
  await signOut(auth);
  localStorage.removeItem('dadoUser');
}
