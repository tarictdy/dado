import { updateUserProfile } from '../services/user.service.js';
import { getAuthenticatedUser } from '../services/auth.service.js';

export async function getProfile(req, res) {
  try {
    const user = await getAuthenticatedUser(req.auth.uid);
    if (!user) {
      return res.status(404).json({ message: 'Profil introuvable.' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('[DADO][user.controller] getProfile failed:', error);
    return res.status(500).json({ message: 'Impossible de récupérer le profil.', details: error.message });
  }
}

export async function patchProfile(req, res) {
  try {
    const user = await updateUserProfile(req.auth.uid, req.body);
    console.log('[DADO][user.controller] patchProfile response:', { id: user.id, isProfileCompleted: user.isProfileCompleted });
    return res.json({ message: 'Profil mis à jour.', user });
  } catch (error) {
    console.error('[DADO][user.controller] patchProfile failed:', error);
    return res.status(400).json({ message: error.message });
  }
}
