import { getFirebaseAdmin } from '../config/firebaseAdmin.js';

export async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Token Firebase manquant.' });
    }

    const decodedToken = await getFirebaseAdmin().auth().verifyIdToken(token);
    req.auth = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token Firebase invalide.', details: error.message });
  }
}
