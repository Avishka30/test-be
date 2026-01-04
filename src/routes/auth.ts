import { Router } from 'express';
import { registerUser, loginUser, refreshAccessToken } from '../controllers/authController';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// CRITICAL FIX: This enables the refresh logic
router.post('/refresh', refreshAccessToken);

export default router;