import {
  createOrUpdateUserProfile,
  getAuthenticatedUser,
  requestOtpChallenge,
  revokeSession,
  verifyOtpAndAuthenticate,
} from '../services/auth.service.js';

export async function requestOtp(req, res) {
  try {
    const { phone, mode } = req.body || {};
    const result = await requestOtpChallenge({ phone, mode });
    return res.json({
      message: 'OTP genere.',
      ...result,
    });
  } catch (error) {
    console.error('[DADO][auth.controller] requestOtp failed:', error);
    return res.status(400).json({ message: error.message });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { phone, mode, code, profile } = req.body || {};
    const result = await verifyOtpAndAuthenticate({
      phone,
      mode,
      otp: code,
      profile,
    });

    return res.json({
      message: mode === 'register' ? 'Inscription finalisee.' : 'Connexion reussie.',
      token: result.token,
      expiresAt: result.expiresAt,
      user: result.user,
    });
  } catch (error) {
    console.error('[DADO][auth.controller] verifyOtp failed:', error);
    return res.status(400).json({ message: error.message });
  }
}

export async function logout(req, res) {
  const token = req.auth?.token;
  revokeSession(token);
  return res.json({ message: 'Session fermee.' });
}

export async function registerProfile(req, res) {
  try {
    const { uid, fullName, pseudo, phone, birthDate, role } = req.body;
    const normalizedPhone = String(phone || '').replace(/\s+/g, '');
    const tokenPhone = String(req.auth?.phone_number || '').replace(/\s+/g, '');

    if (!uid || !fullName || !pseudo || !normalizedPhone || !birthDate || !role) {
      return res.status(400).json({ message: 'Tous les champs requis doivent etre fournis.' });
    }

    if (req.auth?.uid !== uid) {
      return res.status(403).json({ message: 'UID incoherent avec la session.' });
    }

    if (tokenPhone && tokenPhone !== normalizedPhone) {
      return res.status(403).json({ message: 'Le telephone fourni ne correspond pas a la session.' });
    }

    const user = await createOrUpdateUserProfile({ uid, fullName, pseudo, phone: normalizedPhone, birthDate, role });
    return res.status(201).json({ message: 'Profil DADO cree avec succes.', user });
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
