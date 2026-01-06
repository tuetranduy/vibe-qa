/**
 * Express Request type extensions for JWT authentication
 * Adds user context to Request interface after successful authentication
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

export {};
