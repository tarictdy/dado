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
    await updateProfile(payload);
    setStatus(statusElement, 'Profil mis à jour. Redirection vers le dashboard...');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 900);
  } catch (error) {
    setStatus(statusElement, error.message, true);
  }
});
