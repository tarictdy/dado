import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD7ZxpQM70Hj5aroyCWSS0dvtwgFi0JjE0',
  authDomain: 'avra-e8665.firebaseapp.com',
  projectId: 'avra-e8665',
  storageBucket: 'avra-e8665.firebasestorage.app',
  messagingSenderId: '962028328457',
  appId: '1:962028328457:web:5dbf262929347fbba14ad8',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.languageCode = 'fr';

let recaptchaVerifier;

function getRecaptchaVerifier(containerId = 'recaptcha-container') {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'normal',
      callback: () => {},
    });
    recaptchaVerifier.render();
  }
  return recaptchaVerifier;
}

export {
  app,
  auth,
  getRecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
};
