import { Router } from 'express';
import { logout, me, registerProfile, requestOtp, verifyOtp } from '../controllers/auth.controller.js';
import { verifyFirebaseToken } from '../middlewares/verifyFirebaseToken.js';

const router = Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', verifyFirebaseToken, logout);
router.post('/register-profile', verifyFirebaseToken, registerProfile);
router.get('/me', verifyFirebaseToken, me);

export default router;
