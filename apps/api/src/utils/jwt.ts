import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: number;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * Generate a JWT token with user payload
 * @param payload - User data to encode in token (userId, email)
 * @returns Signed JWT token string
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d'
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload or null if invalid/expired
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
