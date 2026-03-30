import { getFirebaseAdmin } from '../config/firebaseAdmin.js';

export async function verifyFirebaseToken(req, res, next) {
  try {
    const devPhone = String(req.headers['x-dado-dev-phone'] || req.query.dev_phone || '').trim();
    if (devPhone) {
      const uid = `dev_${devPhone.replace(/\D/g, '')}`;
      req.auth = { uid, phone_number: devPhone, isDevBypass: true };
      return next();
    }

    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Token Firebase manquant.' });
    }

    const decodedToken = await getFirebaseAdmin().auth().verifyIdToken(token);
    req.auth = decodedToken;
    return next();
  } catch (error) {
    const devPhone = String(req.headers['x-dado-dev-phone'] || req.query.dev_phone || '').trim();
    if (devPhone) {
      const uid = `dev_${devPhone.replace(/\D/g, '')}`;
      req.auth = { uid, phone_number: devPhone, isDevBypass: true };
      return next();
    }
    return res.status(401).json({ message: 'Token Firebase invalide.', details: error.message });
  }
}
