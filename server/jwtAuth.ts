import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Define AuthRequest interface locally
interface AuthRequest extends Request {
  user?: any;
  cookies?: { [key: string]: string };
}

// Check required environment variables
function checkAuthEnv() {
  const required = ['SESSION_SECRET'];
  required.forEach(key => {
    if (!process.env[key]) {
      throw new Error(`❌ ${key} is missing from environment variables`);
    }
  });
}

// Initialize JWT auth
checkAuthEnv();

const JWT_SECRET = process.env.SESSION_SECRET!;
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
  accountType: string;
  authProvider: 'google' | 'replit' | 'email';
  iat?: number;
  exp?: number;
}

export function generateToken(userData: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(userData, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'servicenow-app'
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function extractTokenFromRequest(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check HTTP-only cookie
  const token = req.cookies?.auth_token;
  if (token) {
    return token;
  }
  
  return null;
}

export const jwtAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractTokenFromRequest(req);
  
  if (!token) {
    console.log('🔐 JWT Auth: No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    console.log('🔐 JWT Auth: Invalid token');
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Populate req.user with JWT payload
  req.user = {
    id: payload.sub,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    profileImageUrl: payload.profileImageUrl,
    role: payload.role,
    accountType: payload.accountType,
    authProvider: payload.authProvider
  };
  
  console.log('🔐 JWT Auth: Success for user:', payload.email);
  next();
};

// Optional middleware for routes that can work with or without auth
export const optionalJwtAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractTokenFromRequest(req);
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = {
        id: payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        profileImageUrl: payload.profileImageUrl,
        role: payload.role,
        accountType: payload.accountType,
        authProvider: payload.authProvider
      };
    }
  }
  
  next();
};