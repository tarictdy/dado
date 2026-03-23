import { requireAuth } from '../core/guards.js';
import { updateProfile } from '../core/api.js';
import { setStatus } from '../core/ui.js';

const form = document.getElementById('profile-form');
const statusElement = document.getElementById('status');

await requireAuth();

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = {
    city: formData.get('city'),
    bio: formData.get('bio'),
    categories: String(formData.get('categories') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  };

  try {
    console.log('[DADO][profile] update payload:', payload);
    const response = await updateProfile(payload);
    console.log('[DADO][profile] Firestore profile updated:', response);
    setStatus(statusElement, 'Profil mis à jour. Redirection vers le dashboard...');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 900);
  } catch (error) {
    console.error('[DADO][profile] profile update failed:', error);
    setStatus(statusElement, error.message, true);
  }
});
