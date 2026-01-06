import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@vibe-qa/database';
import { registerSchema, loginSchema } from '../validation/auth.schema';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = registerSchema.parse(req.body);
    
    const hashedPassword = await hashPassword(input.password);
    
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    const requestId = (req as any).id || 'unknown';
    
    res.status(201).json({
      data: {
        user,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    
    if (!user) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        },
        meta: {
          requestId: (req as any).id || 'unknown',
        },
      });
      return;
    }
    
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    
    if (!isPasswordValid) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        },
        meta: {
          requestId: (req as any).id || 'unknown',
        },
      });
      return;
    }
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });
    
    res.status(200).json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
      meta: {
        requestId: (req as any).id || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});
