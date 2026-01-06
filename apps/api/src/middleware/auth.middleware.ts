import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../utils/jwt';

/**
 * JWT Authentication Middleware
 * 
 * Extracts and verifies JWT token from Authorization header.
 * Attaches decoded user data to req.user for downstream handlers.
 * 
 * Usage in routes:
 * ```typescript
 * import { authMiddleware } from '../middleware/auth.middleware';
 * router.get('/protected', authMiddleware, handler);
 * // Access user in handler: req.user.id, req.user.email
 * ```
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns 401 response if authentication fails, or calls next() if successful
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists
  if (!authHeader) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing authentication token'
      },
      meta: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  // Validate header format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (!authHeader.startsWith('Bearer ') || parts.length !== 2 || !parts[1]) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization format'
      },
      meta: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  // Extract token from "Bearer <token>"
  const token = parts[1];

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      },
      meta: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  // Attach user to request object
  req.user = {
    id: decoded.userId,
    email: decoded.email
  };

  next();
}
