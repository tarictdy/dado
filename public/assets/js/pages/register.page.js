import { sendOTP, verifyOTP } from '../core/auth.js';
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

  try {
    setStatus(statusElement, 'Generation du code OTP...');
    const result = await sendOTP(pendingProfile.phone, 'sign-in-button', 'register');
    otpForm.classList.remove('hidden');

    const debugMessage = result.otpCode ? ` Code de test: ${result.otpCode}` : '';
    setStatus(statusElement, `OTP genere. Entrez le code pour finaliser l inscription.${debugMessage}`);
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
      throw new Error('Commencez par remplir le formulaire d inscription.');
    }

    setStatus(statusElement, 'Verification OTP et finalisation de l inscription...');
    const authResult = await verifyOTP(otp, { profile: pendingProfile });
    localStorage.setItem('dadoUser', JSON.stringify(authResult.user));
    window.location.href = authResult.user?.isProfileCompleted ? '/dashboard.html' : '/profile.html';
  } catch (error) {
    console.error('[DADO][register] OTP verification failed:', error);
    setStatus(statusElement, error.message, true);
  }
});
