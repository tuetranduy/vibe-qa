import { Request, Response, NextFunction } from 'express';
import { prisma } from '@vibe-qa/database';
import { v4 as uuidv4 } from 'uuid';
import { updateProfileSchema } from './users.validation';

/**
 * Get current user profile
 * 
 * @route GET /api/v1/users/me
 * @access Protected
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        meta: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    res.json({
      data: user,
      meta: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update current user profile
 * Only name field can be updated
 * 
 * @route PATCH /api/v1/users/me
 * @access Protected
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate request body
    const result = updateProfileSchema.safeParse(req.body);
    
    if (!result.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.flatten()
        },
        meta: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const userId = req.user.id;
    const { name } = result.data;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      data: updatedUser,
      meta: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
