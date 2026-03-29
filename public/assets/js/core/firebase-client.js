import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAb2NR_aVqhdzfsu_ouGMXfHF5jkq2cxtQ',
  authDomain: 'dodo-adbfc.firebaseapp.com',
  projectId: 'dodo-adbfc',
  storageBucket: 'dodo-adbfc.firebasestorage.app',
  messagingSenderId: '883360874679',
  appId: '1:883360874679:web:35ed08a206d1ad3cb88d32',
};

// OAuth 2.0 Web Client ID (Firebase project dodo-adbfc)
const webOAuthClientId = '883360874679-hduihu360dp69og3jl9p2p8r0g3bhfss.apps.googleusercontent.com';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.languageCode = 'fr';

let recaptchaVerifier;
let recaptchaTargetId;

function getRecaptchaVerifier(targetId = 'sign-in-button') {
  if (!recaptchaVerifier || recaptchaTargetId !== targetId) {
    recaptchaTargetId = targetId;
    recaptchaVerifier = new RecaptchaVerifier(auth, targetId, {
      size: 'invisible',
      callback: () => {},
    });
    window.recaptchaVerifier = recaptchaVerifier;
    recaptchaVerifier.render();
  }
  return recaptchaVerifier;
}

export {
  app,
  auth,
  webOAuthClientId,
  getRecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
};
