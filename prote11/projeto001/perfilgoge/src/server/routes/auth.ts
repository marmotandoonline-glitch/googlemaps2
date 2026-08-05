import express from 'express';
import { register, login, me } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

export const authRouter = express.Router();

// Strict rate limiter for login to mitigate brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

authRouter.post('/register', register);
authRouter.post('/login', loginLimiter, login);
authRouter.get('/me', authMiddleware, me);
