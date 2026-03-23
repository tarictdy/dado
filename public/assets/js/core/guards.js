import { getCurrentUser } from './auth.js';
import { getCurrentProfile } from './api.js';

export async function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }
  try {
    return await getCurrentProfile();
  } catch (error) {
    window.location.href = '/login.html';
    return null;
  }
}

export function redirectAfterProfile(profile) {
  if (!profile?.user?.isProfileCompleted) {
    window.location.href = '/profile.html';
    return;
  }
  window.location.href = '/dashboard.html';
}
