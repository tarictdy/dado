import { sendOTP, verifyOTP } from '../core/auth.js';
import { getCurrentProfile } from '../core/api.js';
import { setStatus } from '../core/ui.js';

const loginForm = document.getElementById('login-form');
const otpForm = document.getElementById('login-otp-form');
const statusElement = document.getElementById('status');

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const phone = formData.get('phone');

  try {
    setStatus(statusElement, 'Envoi du code OTP...');
    await sendOTP(phone, 'recaptcha-container');
    otpForm.classList.remove('hidden');
    setStatus(statusElement, 'OTP envoyé. Renseignez le code reçu.');
  } catch (error) {
    setStatus(statusElement, error.message, true);
  }
});

otpForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(otpForm);

  try {
    setStatus(statusElement, 'Connexion en cours...');
    await verifyOTP(formData.get('otp'));
    const profile = await getCurrentProfile();
    localStorage.setItem('dadoUser', JSON.stringify(profile.user));
    window.location.href = profile.user.isProfileCompleted ? '/dashboard.html' : '/profile.html';
  } catch (error) {
    setStatus(statusElement, error.message, true);
  }
});
