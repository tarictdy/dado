import admin from 'firebase-admin';
import { randomBytes, randomUUID } from 'crypto';
import { getFirestore } from '../config/firebaseAdmin.js';

const OTP_TTL_MS = Number(process.env.OTP_TTL_MS || 5 * 60 * 1000);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 24 * 60 * 60 * 1000);
const otpStore = new Map();
const sessionStore = new Map();

function normalizeRole(role) {
  const allowedRoles = ['CLIENT', 'PRESTATAIRE', 'VENDEUR_PRODUIT'];
  return allowedRoles.includes(role) ? role : 'CLIENT';
}

function normalizeMode(mode) {
  return mode === 'register' ? 'register' : 'login';
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\s+/g, '');
}

function buildOtpKey(phone, mode) {
  return `${mode}:${phone}`;
}

function buildSessionToken() {
  return randomBytes(32).toString('base64url');
}

function buildNewUid() {
  return `usr_${randomUUID().replace(/-/g, '')}`;
}

function buildOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestOtpChallenge({ phone, mode }) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedMode = normalizeMode(mode);

  if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
    throw new Error('Numero invalide. Utilisez le format international, ex: +2250700000000.');
  }

  const otpCode = buildOtpCode();
  const expiresAt = Date.now() + OTP_TTL_MS;
  const otpKey = buildOtpKey(normalizedPhone, normalizedMode);

  otpStore.set(otpKey, {
    code: otpCode,
    attempts: 0,
    expiresAt,
    phone: normalizedPhone,
    mode: normalizedMode,
  });

  console.log(`[DADO][otp] ${normalizedMode} code for ${normalizedPhone}: ${otpCode}`);
  return {
    requestId: otpKey,
    expiresAt,
    otpCode: process.env.NODE_ENV === 'production' ? undefined : otpCode,
  };
}

export async function verifyOtpAndAuthenticate({ phone, mode, otp, profile }) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedMode = normalizeMode(mode);
  const normalizedOtp = String(otp || '').trim();
  const otpKey = buildOtpKey(normalizedPhone, normalizedMode);
  const challenge = otpStore.get(otpKey);

  if (!/^\d{6}$/.test(normalizedOtp)) {
    throw new Error('Code OTP invalide. Entrez les 6 chiffres.');
  }

  if (!challenge) {
    throw new Error('Aucune demande OTP active pour ce numero.');
  }

  if (Date.now() > challenge.expiresAt) {
    otpStore.delete(otpKey);
    throw new Error('OTP expire. Veuillez demander un nouveau code.');
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    otpStore.delete(otpKey);
    throw new Error('Trop de tentatives OTP. Demandez un nouveau code.');
  }

  if (challenge.code !== normalizedOtp) {
    challenge.attempts += 1;
    otpStore.set(otpKey, challenge);
    throw new Error('OTP incorrect.');
  }

  otpStore.delete(otpKey);
  let user;

  if (normalizedMode === 'register') {
    const existingUser = await getUserByPhone(normalizedPhone);
    if (existingUser) {
      throw new Error('Ce numero est deja associe a un compte. Connectez-vous.');
    }

    user = await createOrUpdateUserProfile({
      uid: buildNewUid(),
      fullName: profile?.fullName,
      pseudo: profile?.pseudo,
      phone: normalizedPhone,
      birthDate: profile?.birthDate,
      role: profile?.role,
    });
  } else {
    user = await getUserByPhone(normalizedPhone);
    if (!user) {
      throw new Error('Aucun compte trouve pour ce numero. Inscrivez-vous.');
    }
  }

  const sessionToken = buildSessionToken();
  const sessionExpiresAt = Date.now() + SESSION_TTL_MS;

  sessionStore.set(sessionToken, {
    uid: user.id,
    phone: normalizedPhone,
    createdAt: Date.now(),
    expiresAt: sessionExpiresAt,
  });

  return {
    user,
    token: sessionToken,
    expiresAt: sessionExpiresAt,
  };
}

export function getSessionFromToken(token) {
  const session = sessionStore.get(token);
  if (!session) {
    return null;
  }

  if (Date.now() > session.expiresAt) {
    sessionStore.delete(token);
    return null;
  }

  return session;
}

export function revokeSession(token) {
  if (!token) {
    return false;
  }
  return sessionStore.delete(token);
}

export async function createOrUpdateUserProfile(payload) {
  const db = getFirestore();
  const { uid, fullName, pseudo, phone, birthDate, role } = payload;
  const normalizedPseudo = String(pseudo || '').trim();
  const normalizedFullName = String(fullName || '').trim();
  const normalizedPhone = normalizePhone(phone);

  if (!uid) {
    throw new Error('UID manquant.');
  }

  if (!normalizedFullName || !normalizedPseudo) {
    throw new Error('Nom complet et pseudo sont obligatoires.');
  }

  if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
    throw new Error('Le numero de telephone doit etre au format international.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(birthDate || ''))) {
    throw new Error('La date de naissance est invalide (format attendu: YYYY-MM-DD).');
  }

  const pseudoSnapshot = await db.collection('users').where('pseudo', '==', normalizedPseudo).limit(1).get();
  if (!pseudoSnapshot.empty && pseudoSnapshot.docs[0].id !== uid) {
    throw new Error('Ce pseudo est deja utilise.');
  }

  const phoneSnapshot = await db.collection('users').where('phone', '==', normalizedPhone).limit(1).get();
  if (!phoneSnapshot.empty && phoneSnapshot.docs[0].id !== uid) {
    throw new Error('Ce numero de telephone est deja utilise.');
  }

  const userRef = db.collection('users').doc(uid);
  const existingDoc = await userRef.get();
  const existingData = existingDoc.exists ? existingDoc.data() : {};
  const now = admin.firestore.FieldValue.serverTimestamp();

  const user = {
    fullName: normalizedFullName,
    pseudo: normalizedPseudo,
    phone: normalizedPhone,
    birthDate,
    role: normalizeRole(role),
    profilePhoto: existingData.profilePhoto || '',
    bio: existingData.bio || '',
    city: existingData.city || '',
    categories: existingData.categories || [],
    genderTarget: existingData.genderTarget || 'TOUS',
    galleryCount: existingData.galleryCount || 0,
    adCount: existingData.adCount || 0,
    subscriptionStatus: existingData.subscriptionStatus || 'INACTIVE',
    isVerified: true,
    isProfileCompleted: existingData.isProfileCompleted || false,
    isActive: true,
    createdAt: existingDoc.exists ? existingData.createdAt : now,
    updatedAt: now,
  };

  await userRef.set(user, { merge: true });
  console.log('[DADO][auth.service] Firestore users/%s saved successfully.', uid);
  return { id: uid, ...user };
}

export async function getAuthenticatedUser(uid) {
  const doc = await getFirestore().collection('users').doc(uid).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
}

export async function getUserByPhone(phone) {
  const normalizedPhone = normalizePhone(phone);
  const snapshot = await getFirestore().collection('users').where('phone', '==', normalizedPhone).limit(1).get();
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}
