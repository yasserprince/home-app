import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwtAuth.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        role: string;
        accountType: string;
        authProvider: string;
      };
    }
  }
}

export function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Get token from Authorization header or cookies
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Attach user to request
  req.user = {
    id: decoded.sub,
    email: decoded.email,
    firstName: decoded.firstName,
    lastName: decoded.lastName,
    role: decoded.role,
    accountType: decoded.accountType,
    authProvider: decoded.authProvider
  };
  
  next();
}

export function optionalJwtAuth(req: Request, res: Response, next: NextFunction) {
  // Get token from Authorization header or cookies
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.auth_token;
  
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role,
        accountType: decoded.accountType,
        authProvider: decoded.authProvider
      };
    }
  }
  
  next();
}