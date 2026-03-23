import { Router } from 'express';
import { me, registerProfile } from '../controllers/auth.controller.js';
import { verifyFirebaseToken } from '../middlewares/verifyFirebaseToken.js';

const router = Router();

router.post('/register-profile', verifyFirebaseToken, registerProfile);
router.get('/me', verifyFirebaseToken, me);

export default router;
