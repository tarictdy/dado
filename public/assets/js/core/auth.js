import {
  auth,
  createUserWithEmailAndPassword,
  getRecaptchaVerifier,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
} from './firebase-client.js';

let confirmationResultCache = null;
let localOtpSession = null;
const BYPASS_SMS_OTP = true;
const DEV_PASSWORD = 'Dado_Dev_2026!';

function normalizePhone(phone) {
  return String(phone || '').replace(/\s+/g, '');
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\s+/g, '');
}

export async function sendOTP(phone, containerId) {
  const normalizedPhone = normalizePhone(phone);
  if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
    throw new Error('Numéro invalide. Utilisez le format international, ex: +2250700000000.');
  }

  if (BYPASS_SMS_OTP) {
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    localOtpSession = {
      otpCode,
      phone: normalizedPhone,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    console.log(`[DADO][OTP-BYPASS] Code OTP pour ${normalizedPhone}: ${otpCode}`);
    return { verificationId: `local-${Date.now()}` };
  }

  const verifier = getRecaptchaVerifier(containerId);
  confirmationResultCache = await signInWithPhoneNumber(auth, normalizedPhone, verifier);
  return confirmationResultCache;
}

export async function verifyOTP(code) {
  const normalizedCode = String(code || '').trim();
  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error('Code OTP invalide. Entrez les 6 chiffres reçus.');
  }

  if (BYPASS_SMS_OTP) {
    if (!localOtpSession) {
      throw new Error('Aucune demande OTP active.');
    }
    if (Date.now() > localOtpSession.expiresAt) {
      throw new Error('OTP expiré. Veuillez demander un nouveau code.');
    }
    if (localOtpSession.otpCode !== normalizedCode) {
      throw new Error('OTP incorrect.');
    }

    const email = `${localOtpSession.phone.replace(/\D/g, '')}@dado.local`;
    try {
      const credential = await signInWithEmailAndPassword(auth, email, DEV_PASSWORD);
      return {
        ...credential.user,
        phoneNumber: localOtpSession.phone,
      };
    } catch (error) {
      if (error?.code !== 'auth/invalid-credential' && error?.code !== 'auth/user-not-found') {
        throw error;
      }
      const credential = await createUserWithEmailAndPassword(auth, email, DEV_PASSWORD);
      return {
        ...credential.user,
        phoneNumber: localOtpSession.phone,
      };
    }
  }

  if (!confirmationResultCache) {
    throw new Error('Aucune demande OTP active.');
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
