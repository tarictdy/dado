import admin from 'firebase-admin';
import { getFirestore } from '../config/firebaseAdmin.js';

function normalizeRole(role) {
  const allowedRoles = ['CLIENT', 'PRESTATAIRE', 'VENDEUR_PRODUIT'];
  return allowedRoles.includes(role) ? role : 'CLIENT';
}

export async function createOrUpdateUserProfile(payload) {
  const db = getFirestore();
  const { uid, fullName, pseudo, phone, birthDate, role } = payload;

  console.log('[DADO][auth.service] createOrUpdateUserProfile called with:', {
    uid,
    fullName,
    pseudo,
    phone,
    birthDate,
    role,
  });

  const pseudoSnapshot = await db.collection('users').where('pseudo', '==', pseudo).limit(1).get();
  if (!pseudoSnapshot.empty && pseudoSnapshot.docs[0].id !== uid) {
    throw new Error('Ce pseudo est déjà utilisé.');
  }

  const userRef = db.collection('users').doc(uid);
  const existingDoc = await userRef.get();
  const existingData = existingDoc.exists ? existingDoc.data() : {};
  const now = admin.firestore.FieldValue.serverTimestamp();

  const user = {
    fullName,
    pseudo,
    phone,
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
    console.warn('[DADO][auth.service] No Firestore profile found for uid:', uid);
    return null;
  }
  console.log('[DADO][auth.service] Firestore profile fetched for uid:', uid);
  return { id: doc.id, ...doc.data() };
}
