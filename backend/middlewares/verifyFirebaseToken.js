import { getSessionFromToken } from '../services/auth.service.js';

export async function verifyFirebaseToken(req, res, next) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ message: 'Session manquante.' });
  }

  const session = getSessionFromToken(token);
  if (!session) {
    return res.status(401).json({ message: 'Session invalide ou expiree.' });
  }

  req.auth = {
    uid: session.uid,
    phone_number: session.phone,
    token,
  };

  return next();
}
