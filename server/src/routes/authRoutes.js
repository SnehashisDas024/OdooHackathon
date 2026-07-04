import { Router } from 'express';
import { signIn, me, changePassword, refreshToken, signOut, forgotPassword } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { signInSchema, changePasswordSchema, forgotPasswordSchema } from '../validators/authValidators.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // generous in dev
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in 15 minutes.' } },
});

router.post('/sign-in', authLimiter, validateRequest(signInSchema), signIn);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/refresh', refreshToken);
router.post('/sign-out', authMiddleware, signOut);
router.get('/me', authMiddleware, me);
router.post('/change-password', authMiddleware, validateRequest(changePasswordSchema), changePassword);

export default router;
