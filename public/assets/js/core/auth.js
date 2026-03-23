import { auth, getRecaptchaVerifier, onAuthStateChanged, signInWithPhoneNumber, signOut } from './firebase-client.js';

let confirmationResultCache = null;

export async function sendOTP(phone, containerId) {
  const verifier = getRecaptchaVerifier(containerId);
  confirmationResultCache = await signInWithPhoneNumber(auth, phone, verifier);
  return confirmationResultCache;
}

export async function verifyOTP(code) {
  if (!confirmationResultCache) {
    throw new Error('Aucune demande OTP active.');
  }
  const credential = await confirmationResultCache.confirm(code);
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
