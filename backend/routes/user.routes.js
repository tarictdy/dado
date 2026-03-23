import { Router } from 'express';
import { getProfile, patchProfile } from '../controllers/user.controller.js';
import { verifyFirebaseToken } from '../middlewares/verifyFirebaseToken.js';

const router = Router();

router.get('/profile', verifyFirebaseToken, getProfile);
router.patch('/profile', verifyFirebaseToken, patchProfile);

export default router;
