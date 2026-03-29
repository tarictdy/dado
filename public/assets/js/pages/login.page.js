import { sendOTP, verifyOTP } from '../core/auth.js';
import { getCurrentProfile } from '../core/api.js';
import { setStatus } from '../core/ui.js';

const loginForm = document.getElementById('login-form');
const otpForm = document.getElementById('login-otp-form');
const statusElement = document.getElementById('status');

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const phone = String(formData.get('phone') || '').replace(/\s+/g, '');
  console.log('[DADO][login] OTP requested for phone:', phone);

  try {
    setStatus(statusElement, 'Envoi du code OTP...');
    const confirmationResult = await sendOTP(phone, 'sign-in-button');
    console.log('[DADO][login] OTP request started. verificationId:', confirmationResult?.verificationId || 'indisponible');
    otpForm.classList.remove('hidden');
    setStatus(statusElement, 'OTP envoyé. Renseignez le code reçu.');
  } catch (error) {
    console.error('[DADO][login] OTP request failed:', error);
    setStatus(statusElement, error.message, true);
  }
});

otpForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(otpForm);

  try {
    setStatus(statusElement, 'Connexion en cours...');
    const firebaseUser = await verifyOTP(formData.get('otp'));
    console.log('[DADO][login] Firebase user verified:', { uid: firebaseUser.uid, phoneNumber: firebaseUser.phoneNumber });
    const profile = await getCurrentProfile();
    console.log('[DADO][login] Firestore profile loaded:', profile);
    localStorage.setItem('dadoUser', JSON.stringify(profile.user));
    window.location.href = profile.user.isProfileCompleted ? '/dashboard.html' : '/profile.html';
  } catch (error) {
    console.error('[DADO][login] login failed:', error);
    setStatus(statusElement, error.message, true);
  }
});
