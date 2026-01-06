import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { getProfile, updateProfile } from './users.controller';

const router = Router();

/**
 * User Profile Routes
 * All routes require authentication
 */

// GET /api/v1/users/me - Get current user profile
router.get('/me', authMiddleware, getProfile);

// PATCH /api/v1/users/me - Update current user profile
router.patch('/me', authMiddleware, updateProfile);

export { router as userRouter };
