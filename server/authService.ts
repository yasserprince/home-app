import { Express } from 'express';
import { generateToken, jwtAuth, optionalJwtAuth, type JWTPayload } from './jwtAuth.js';
import { storage } from './storage.js';
import bcrypt from 'bcryptjs';

export function setupJWTAuth(app: Express) {
  // Login endpoint for email/password
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValid = await bcrypt.compare(password, user.passwordHash || '');
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        accountType: user.accountType || 'individual',
        authProvider: 'email'
      };
      
      const token = generateToken(tokenPayload);
      
      // Set HTTP-only cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token // Also return for localStorage if needed
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });
  
  // Google OAuth success callback
  app.post('/api/auth/google/success', async (req, res) => {
    try {
      const { user } = req.body;
      
      if (!user || !user.email) {
        return res.status(400).json({ error: 'Invalid user data' });
      }
      
      // Create or update user in database
      const existingUser = await storage.getUserByEmail(user.email);
      let dbUser;
      
      if (existingUser) {
        // Update existing user
        dbUser = await storage.updateUser(existingUser.id, {
          firstName: user.firstName || existingUser.firstName,
          lastName: user.lastName || existingUser.lastName,
          profileImageUrl: user.profileImageUrl || existingUser.profileImageUrl,
          lastLoginAt: new Date()
        });
      } else {
        // Create new user
        dbUser = await storage.createUser({
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          profileImageUrl: user.profileImageUrl,
          role: 'service_seeker',
          accountType: 'individual',
          lastLoginAt: new Date()
        });
      }
      
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        sub: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        profileImageUrl: dbUser.profileImageUrl,
        role: dbUser.role,
        accountType: dbUser.accountType || 'individual',
        authProvider: 'google'
      };
      
      const token = generateToken(tokenPayload);
      
      // Set HTTP-only cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({
        success: true,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          role: dbUser.role
        },
        token
      });
      
    } catch (error) {
      console.error('Google auth success error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });
  
  // Get current user (JWT-based)
  app.get('/api/auth/user', jwtAuth, (req, res) => {
    res.json({
      user: req.user
    });
  });
  
  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
  });
  
  // Debug endpoint for JWT
  app.get('/api/debug-jwt', optionalJwtAuth, (req, res) => {
    res.json({
      hasUser: !!req.user,
      user: req.user,
      cookies: req.headers.cookie,
      authorization: req.headers.authorization
    });
  });
  
  console.log('✅ JWT Authentication configured');
}