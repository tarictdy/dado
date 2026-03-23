import { createOrUpdateUserProfile, getAuthenticatedUser } from '../services/auth.service.js';

export async function registerProfile(req, res) {
  try {
    const { uid, fullName, pseudo, phone, birthDate, role } = req.body;

    if (!uid || !fullName || !pseudo || !phone || !birthDate || !role) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être fournis.' });
    }

    if (req.auth?.uid !== uid) {
      return res.status(403).json({ message: 'UID incohérent avec le token Firebase.' });
    }

    console.log('[DADO][auth.controller] Register profile request accepted for uid:', uid);
    const user = await createOrUpdateUserProfile({ uid, fullName, pseudo, phone, birthDate, role });
    console.log('[DADO][auth.controller] Register profile response:', { id: user.id, pseudo: user.pseudo, role: user.role });
    return res.status(201).json({ message: 'Profil DADO créé avec succès.', user });
  } catch (error) {
    console.error('[DADO][auth.controller] registerProfile failed:', error);
    return res.status(400).json({ message: error.message });
  }
}

export async function me(req, res) {
  try {
    const user = await getAuthenticatedUser(req.auth.uid);
    if (!user) {
      return res.status(404).json({ message: 'Profil introuvable.' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('[DADO][auth.controller] me failed:', error);
    return res.status(500).json({ message: 'Impossible de charger le profil.', details: error.message });
  }
}
