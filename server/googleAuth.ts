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
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax'
    },
  });
}

export async function setupGoogleAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "https://home-serve-katiflam1.replit.app/api/auth/google/callback"
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
      
      const user = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        profileImageUrl,
      });
      
      console.log("User created/updated successfully:", user);
      return done(null, user);
    } catch (error) {
      console.error("Error in Google OAuth strategy:", error);
      return done(error, undefined);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(null, false);
    }
  });

  // Auth routes
  app.get("/api/auth/google", (req, res, next) => {
    console.log("Starting Google OAuth flow");
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get("/api/auth/google/callback", (req, res, next) => {
    console.log("OAuth callback reached");
    passport.authenticate("google", { 
      failureRedirect: "/?error=auth_failed",
    })(req, res, (err) => {
      if (err) {
        console.error("OAuth callback error:", err);
        return res.redirect("/?error=auth_failed");
      }
      console.log("OAuth callback successful, redirecting to home");
      // Successful authentication
      res.redirect("/");
    });
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};