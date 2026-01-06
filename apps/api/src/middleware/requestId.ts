import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestIdMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  (req as any).id = uuidv4();
  next();
}
