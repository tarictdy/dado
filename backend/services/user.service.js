import admin from 'firebase-admin';
import { getFirestore } from '../config/firebaseAdmin.js';

export async function updateUserProfile(uid, payload) {
  const userRef = getFirestore().collection('users').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('Utilisateur introuvable.');
  }

  console.log('[DADO][user.service] updateUserProfile called with:', { uid, payload });

  const updates = {
    city: payload.city || '',
    bio: payload.bio || '',
    categories: Array.isArray(payload.categories) ? payload.categories : [],
    isProfileCompleted: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await userRef.set(updates, { merge: true });
  const updatedDoc = await userRef.get();
  console.log('[DADO][user.service] Firestore users/%s updated successfully.', uid);
  return { id: updatedDoc.id, ...updatedDoc.data() };
}
