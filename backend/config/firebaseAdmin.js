import admin from 'firebase-admin';

let firebaseAdminApp;

const firebaseProjectConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'dodo-adbfc',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'dodo-adbfc.firebasestorage.app',
};

function getCredential() {
  const inlineServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineServiceAccount) {
    try {
      return admin.credential.cert(JSON.parse(inlineServiceAccount));
    } catch (error) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON invalide: ${error.message}`);
    }
  }

  return admin.credential.applicationDefault();
}

export function getFirebaseAdmin() {
  if (!firebaseAdminApp) {
    firebaseAdminApp = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          ...firebaseProjectConfig,
          credential: getCredential(),
        });
  }
  return firebaseAdminApp;
}

export function getFirestore() {
  return getFirebaseAdmin().firestore();
}
