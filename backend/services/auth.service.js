import admin from 'firebase-admin';
import { getFirestore } from '../config/firebaseAdmin.js';

function normalizeRole(role) {
  const allowedRoles = ['CLIENT', 'PRESTATAIRE', 'VENDEUR_PRODUIT'];
  return allowedRoles.includes(role) ? role : 'CLIENT';
}

export async function createOrUpdateUserProfile(payload) {
  const db = getFirestore();
  const { uid, fullName, pseudo, phone, birthDate, role } = payload;

  const pseudoSnapshot = await db.collection('users').where('pseudo', '==', pseudo).limit(1).get();
  if (!pseudoSnapshot.empty && pseudoSnapshot.docs[0].id !== uid) {
    throw new Error('Ce pseudo est déjà utilisé.');
  }

  const userRef = db.collection('users').doc(uid);
  const existingDoc = await userRef.get();
  const now = admin.firestore.FieldValue.serverTimestamp();

  const user = {
    fullName,
    pseudo,
    phone,
    birthDate,
    role: normalizeRole(role),
    profilePhoto: existingDoc.data()?.profilePhoto || '',
    bio: existingDoc.data()?.bio || '',
    city: existingDoc.data()?.city || '',
    categories: existingDoc.data()?.categories || [],
    genderTarget: existingDoc.data()?.genderTarget || 'TOUS',
    galleryCount: existingDoc.data()?.galleryCount || 0,
    adCount: existingDoc.data()?.adCount || 0,
    subscriptionStatus: existingDoc.data()?.subscriptionStatus || 'INACTIVE',
    isVerified: true,
    isProfileCompleted: existingDoc.data()?.isProfileCompleted || false,
    isActive: true,
    createdAt: existingDoc.exists ? existingDoc.data().createdAt : now,
    updatedAt: now,
  };

  await userRef.set(user, { merge: true });
  return { id: uid, ...user };
}

export async function getAuthenticatedUser(uid) {
  const doc = await getFirestore().collection('users').doc(uid).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
}
