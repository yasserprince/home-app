import { Express, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from './storage';

// Simple JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key';
const JWT_EXPIRES_IN = '24h';

// JWT token interface
interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Enhanced request interface
interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Generate JWT token
export function generateToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Simple JWT middleware - single responsibility
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  (req as AuthRequest).user = decoded;
  next();
}

// Setup simple auth routes
export function setupSimpleAuth(app: Express) {
  
  // Login with email/password
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }
      
      // Find user by email (using a more direct approach)
      let user = null;
      try {
        // Since we don't have getUsers, we'll need to implement a direct lookup
        // For now, we'll use the existing auth system fallback
        user = await storage.getUserByEmail?.(email) || null;
      } catch (error) {
        // If getUserByEmail doesn't exist, return null
        user = null;
      }
      
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = generateToken({ 
        userId: user.id, 
        email: user.email 
      });
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        } 
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });
  
  // Register new user
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields required' });
      }
      
      // Check if user exists
      let existingUser = null;
      try {
        existingUser = await storage.getUserByEmail?.(email) || null;
      } catch (error) {
        // If getUserByEmail doesn't exist, assume user doesn't exist
        existingUser = null;
      }
      
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const newUser = await storage.createUser({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        authProvider: 'email',
        role: 'service_seeker',
        accountType: 'individual',
        isActive: true
      });
      
      // Generate JWT token
      const token = generateToken({ 
        userId: newUser.id, 
        email: newUser.email 
      });
      
      res.status(201).json({ 
        token, 
        user: { 
          id: newUser.id, 
          email: newUser.email, 
          firstName: newUser.firstName, 
          lastName: newUser.lastName 
        } 
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
  
  // Get current user
  app.get('/api/auth/me', requireAuth, async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const user = await storage.getUser(authReq.user!.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        accountType: user.accountType
      });
      
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });
  
  // Google OAuth fallback (simplified)
  app.post('/api/auth/google', async (req: Request, res: Response) => {
    try {
      const { googleToken } = req.body;
      
      // In production, verify googleToken with Google
      // For demo, create/find user from token data
      
      // Mock Google user data (replace with actual Google verification)
      const googleUser = {
        id: 'google-user-123',
        email: 'user@gmail.com',
        firstName: 'Google',
        lastName: 'User'
      };
      
      // Find or create user
      let user = await storage.getUser(googleUser.id);
      if (!user) {
        user = await storage.createUser({
          id: googleUser.id,
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          authProvider: 'google',
          role: 'service_seeker',
          accountType: 'individual',
          isActive: true
        });
      }
      
      // Generate JWT token
      const token = generateToken({ 
        userId: user.id, 
        email: user.email 
      });
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        } 
      });
      
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ error: 'Google authentication failed' });
    }
  });
  
  console.log('✅ Simple JWT authentication configured');
}