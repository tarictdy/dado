import admin from 'firebase-admin';

let firebaseAdminApp;

export function getFirebaseAdmin() {
  if (!firebaseAdminApp) {
    firebaseAdminApp = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
  }
  return firebaseAdminApp;
}

export function getFirestore() {
  return getFirebaseAdmin().firestore();
}
