import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  console.log("Session configuration:", {
    isProduction: process.env.NODE_ENV === 'production',
    hasSecret: !!process.env.SESSION_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-for-replit',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Lax for development
    },
  });
}

export async function setupGoogleAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Only setup Google OAuth if credentials are available
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Google OAuth credentials not found - skipping Google OAuth setup");
    return;
  }
  
  // Use the correct deployed domain for OAuth callback
  const callbackURL = "https://home-app-1-yasserdaddi.replit.app/api/auth/google/callback";
    
  console.log("Setting up Google OAuth with:", {
    clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "...",
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    callbackURL,
    nodeEnv: process.env.NODE_ENV
  });

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google OAuth profile received:", JSON.stringify(profile, null, 2));
      
      // Extract user info from Google profile
      const email = profile.emails?.[0]?.value;
      const firstName = profile.name?.givenName;
      const lastName = profile.name?.familyName;
      const profileImageUrl = profile.photos?.[0]?.value;

      console.log("Extracted profile data:", { email, firstName, lastName, profileImageUrl });

      if (!email) {
        console.error("No email found in Google profile");
        return done(new Error("No email found in Google profile"), undefined);
      }

      // Upsert user in database - use google_ prefix for Google OAuth users  
      const userId = `google_${profile.id}`;
      console.log("Creating/updating user:", { id: userId, email, firstName, lastName });
      
      // Check if user exists by email first
      let user = await storage.getUserByEmail(email);
      
      if (user) {
        console.log("User exists, updating with Google profile:", user.id);
        // Update existing user with Google data
        const updatedUser = await storage.updateUser(user.id, {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          profileImageUrl: profileImageUrl || user.profileImageUrl,
          authProvider: "google"
        });
        user = updatedUser || user;
      } else {
        console.log("Creating new Google user");
        // Create new user with google prefix to avoid ID conflicts
        user = await storage.createUser({
          id: `google_${profile.id}`, // Use google prefix
          email,
          firstName,
          lastName,
          profileImageUrl,
          authProvider: "google",
          role: "service_seeker" // Default role for Google users
        });
      }
      
      console.log("User created/updated successfully:", user);
      return done(null, user);
    } catch (error) {
      console.error("Error in Google OAuth strategy:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      return done(error as Error, undefined);
    }
  }));

  // Unified serialization for all auth types
  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user);
    if (user.claims) {
      // Replit Auth user format
      done(null, { type: 'replit', data: user });
    } else {
      // Google/Email Auth user format
      done(null, { type: 'database', id: user.id });
    }
  });

  passport.deserializeUser(async (sessionData: any, done) => {
    try {
      console.log("Deserializing user:", sessionData);
      
      if (sessionData.type === 'replit') {
        // Return Replit user session data directly
        return done(null, sessionData.data);
      } else {
        // Fetch database user
        const user = await storage.getUser(sessionData.id);
        if (!user) {
          return done(null, false);
        }
        done(null, user);
      }
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(null, false);
    }
  });

  // Auth routes
  app.get("/api/auth/google", (req, res, next) => {
    console.log("Starting Google OAuth flow with query:", req.query);
    passport.authenticate("google", { 
      scope: ["profile", "email"],
      state: req.query.state as string || undefined
    })(req, res, next);
  });

  app.get("/api/auth/google/callback", (req, res, next) => {
    console.log("=== OAUTH CALLBACK START ===");
    console.log("OAuth callback received with query:", req.query);
    console.log("Request headers relevant:", {
      'user-agent': req.headers['user-agent'],
      'referer': req.headers['referer'],
      'host': req.headers['host']
    });
    
    if (req.query.error) {
      console.error("OAuth error from Google:", req.query.error);
      return res.redirect("/?error=oauth_denied");
    }
    
    passport.authenticate("google", (err: any, user: any, info: any) => {
      console.log("=== OAUTH AUTHENTICATION RESULT ===");
      console.log("Error:", err);
      console.log("User:", user ? { id: user.id, email: user.email } : null);
      console.log("Info:", info);
      
      if (err) {
        console.error("OAuth authentication error:", err);
        console.error("Full error:", JSON.stringify(err, null, 2));
        return res.redirect("/?error=auth_failed");
      }
      
      if (!user) {
        console.error("No user returned from OAuth. Info:", info);
        return res.redirect("/?error=no_user");
      }
      
      req.logIn(user, (loginErr) => {
        console.log("=== LOGIN ATTEMPT ===");
        console.log("Login error:", loginErr);
        
        if (loginErr) {
          console.error("Login error after OAuth:", loginErr);
          console.error("Full login error:", JSON.stringify(loginErr, null, 2));
          return res.redirect("/?error=login_failed");
        }
        
        console.log("OAuth login successful for user:", user.email);
        console.log("Session after login:", req.sessionID);
        console.log("=== OAUTH CALLBACK END (SUCCESS) ===");
        res.redirect("/");
      });
    })(req, res, next);
  });

  // Handle both GET and POST logout for convenience
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.redirect("/?error=logout_failed");
      }
      res.redirect("/");
    });
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Debug endpoint to test session
  app.get("/api/debug-session", (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      sessionID: req.sessionID,
      hasSession: !!req.session
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};