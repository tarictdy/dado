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

  try {
    setStatus(statusElement, 'Envoi du code OTP...');
    await sendOTP(pendingProfile.phone, 'recaptcha-container');
    otpForm.classList.remove('hidden');
    setStatus(statusElement, 'Code envoyé. Entrez l’OTP reçu par SMS.');
  } catch (error) {
    setStatus(statusElement, error.message, true);
  }
});

otpForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(otpForm);
  const otp = formData.get('otp');

  try {
    setStatus(statusElement, 'Validation du code OTP...');
    const firebaseUser = await verifyOTP(otp);
    const payload = {
      uid: firebaseUser.uid,
      ...pendingProfile,
    };
    const profile = await registerProfile(payload);
    localStorage.setItem('dadoUser', JSON.stringify(profile.user));
    window.location.href = profile.user.isProfileCompleted ? '/dashboard.html' : '/profile.html';
  } catch (error) {
    setStatus(statusElement, error.message, true);
  }
});
