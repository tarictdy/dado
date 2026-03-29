import { sendOTP, verifyOTP } from '../core/auth.js';
import { registerProfile } from '../core/api.js';
import { setStatus } from '../core/ui.js';

const registerForm = document.getElementById('register-form');
const otpForm = document.getElementById('otp-form');
const statusElement = document.getElementById('status');
let pendingProfile = null;

registerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  pendingProfile = Object.fromEntries(formData.entries());
  pendingProfile.phone = String(pendingProfile.phone || '').replace(/\s+/g, '');
  console.log('[DADO][register] pending profile captured:', pendingProfile);

  try {
    setStatus(statusElement, 'Envoi du code OTP...');
    const confirmationResult = await sendOTP(pendingProfile.phone, 'recaptcha-container');
    console.log('[DADO][register] OTP request started. verificationId:', confirmationResult?.verificationId || 'indisponible');
    otpForm.classList.remove('hidden');
    setStatus(statusElement, 'Code envoyé. Entrez l’OTP reçu par SMS.');
  } catch (error) {
    console.error('[DADO][register] OTP request failed:', error);
    setStatus(statusElement, error.message, true);
  }
});

otpForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(otpForm);
  const otp = formData.get('otp');

  try {
    if (!pendingProfile) {
      throw new Error('Commencez par remplir le formulaire d’inscription.');
    }
    setStatus(statusElement, 'Validation du code OTP...');
    const firebaseUser = await verifyOTP(otp);
    const payload = {
      uid: firebaseUser.uid,
      ...pendingProfile,
    };
    console.log('[DADO][register] Firebase user verified:', { uid: firebaseUser.uid, phoneNumber: firebaseUser.phoneNumber });
    console.log('[DADO][register] registerProfile payload:', payload);
    const profile = await registerProfile(payload);
    console.log('[DADO][register] profile saved in Firestore:', profile);
    localStorage.setItem('dadoUser', JSON.stringify(profile.user));
    window.location.href = profile.user.isProfileCompleted ? '/dashboard.html' : '/profile.html';
  } catch (error) {
    console.error('[DADO][register] OTP verification / profile save failed:', error);
    setStatus(statusElement, error.message, true);
  }
});
