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

  try {
    setStatus(statusElement, 'Generation du code OTP...');
    const result = await sendOTP(phone, 'sign-in-button', 'login');
    otpForm.classList.remove('hidden');

    const debugMessage = result.otpCode ? ` Code de test: ${result.otpCode}` : '';
    setStatus(statusElement, `OTP genere. Entrez le code pour vous connecter.${debugMessage}`);
  } catch (error) {
    console.error('[DADO][login] OTP request failed:', error);
    setStatus(statusElement, error.message, true);
  }
});

otpForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(otpForm);

  try {
    setStatus(statusElement, 'Verification OTP et connexion...');
    await verifyOTP(formData.get('otp'));
    const profile = await getCurrentProfile();
    localStorage.setItem('dadoUser', JSON.stringify(profile.user));
    window.location.href = profile.user.isProfileCompleted ? '/dashboard.html' : '/profile.html';
  } catch (error) {
    console.error('[DADO][login] login failed:', error);
    setStatus(statusElement, error.message, true);
  }
});
