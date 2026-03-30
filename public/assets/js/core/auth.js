import {
  auth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
} from './firebase-client.js';

let localOtpSession = null;
const BYPASS_SMS_OTP = true;

export async function sendOTP(phone, containerId) {
  const normalizedPhone = String(phone || '').replace(/\s+/g, '');
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

  throw new Error('Le mode OTP SMS Firebase est désactivé pour le moment.');
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

    const credential = await signInAnonymously(auth);
    return {
      uid: credential.user.uid,
      phoneNumber: localOtpSession.phone,
      isAnonymous: true,
    };
  }
  throw new Error('Le mode OTP SMS Firebase est désactivé pour le moment.');
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
