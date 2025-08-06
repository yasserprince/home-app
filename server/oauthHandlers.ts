import { Express, Request, Response } from 'express';
import { generateToken, type JWTPayload } from './jwtAuth.js';
import { storage } from './storage.js';

export function setupOAuthHandlers(app: Express) {
  // Google OAuth initiate
  app.get('/api/auth/google', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set('redirect_uri', 'https://home-app-1-yasserdaddi.replit.app/api/auth/google/callback');
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');

    res.redirect(googleAuthUrl.toString());
  });

  // Google OAuth callback
  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        console.error('No authorization code received');
        return res.redirect('/get-started?error=oauth_failed');
      }

      // Exchange code for token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: 'https://home-app-1-yasserdaddi.replit.app/api/auth/google/callback'
        })
      });

      const tokens = await tokenResponse.json();
      
      if (!tokens.access_token) {
        console.error('Failed to get access token:', tokens);
        return res.redirect('/get-started?error=oauth_failed');
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      const googleUser = await userResponse.json();
      console.log('Google user data:', googleUser);

      if (!googleUser.email) {
        console.error('No email in Google user data');
        return res.redirect('/get-started?error=oauth_failed');
      }

      // Create or update user in database
      const existingUser = await storage.getUserByEmail(googleUser.email);
      let dbUser;

      if (existingUser) {
        // Update existing user
        dbUser = await storage.updateUser(existingUser.id, {
          firstName: googleUser.given_name || existingUser.firstName,
          lastName: googleUser.family_name || existingUser.lastName,
          profileImageUrl: googleUser.picture || existingUser.profileImageUrl,
          lastLoginAt: new Date()
        });
      } else {
        // Create new user
        dbUser = await storage.createUser({
          email: googleUser.email,
          firstName: googleUser.given_name || '',
          lastName: googleUser.family_name || '',
          profileImageUrl: googleUser.picture,
          role: 'service_seeker',
          accountType: 'individual',
          lastLoginAt: new Date()
        });
      }

      // Generate JWT token
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

      const jwtToken = generateToken(tokenPayload);

      // Set HTTP-only cookie
      res.cookie('auth_token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      console.log('✅ Google OAuth success for:', googleUser.email);
      
      // Redirect to dashboard or home page
      res.redirect('/dashboard');

    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/get-started?error=oauth_failed');
    }
  });

  // Replit OAuth initiate (simplified)
  app.get('/api/auth/replit', (req, res) => {
    // For now, redirect to Google OAuth or show not implemented
    res.status(501).json({ 
      error: 'Replit OAuth will be implemented in next phase',
      suggestion: 'Please use Google OAuth or email/password for now'
    });
  });

  console.log('✅ OAuth handlers configured');
}