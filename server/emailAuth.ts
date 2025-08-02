import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import type { Express } from "express";
import { storage } from "./storage";

export async function setupEmailAuth(app: Express) {
  // Local Strategy for email/password authentication
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      console.log("Local authentication attempt for:", email);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("User not found:", email);
        return done(null, false, { message: 'Invalid email or password' });
      }

      if (!user.password) {
        console.log("User has no password (OAuth user):", email);
        return done(null, false, { message: 'Please sign in with Google' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log("Invalid password for user:", email);
        return done(null, false, { message: 'Invalid email or password' });
      }

      console.log("Local authentication successful for:", email);
      return done(null, user);
    } catch (error) {
      console.error("Local authentication error:", error);
      return done(error);
    }
  }));

  // Email/password authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        address,
        wilaya,
        commune,
        postalCode,
        role
      } = req.body;

      console.log("Email signup attempt for:", email);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        authProvider: "email",
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        address,
        wilaya,
        commune,
        postalCode,
        role: role || "service_seeker", // Use consistent role naming
        isActive: true,
        isVerified: false
      });

      console.log("Email signup successful for:", email);

      // Log the user in automatically
      req.logIn(user, (err) => {
        if (err) {
          console.error("Auto-login error after signup:", err);
          return res.status(500).json({ message: 'Signup successful but login failed' });
        }
        res.json({ message: 'Signup successful', user: { id: user.id, email: user.email, role: user.role } });
      });

    } catch (error) {
      console.error("Email signup error:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post("/api/auth/signin", (req, res, next) => {
    console.log("Email signin attempt for:", req.body.email);
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Email signin error:", err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      
      if (!user) {
        console.log("Email signin failed:", info?.message);
        return res.status(401).json({ message: info?.message || 'Authentication failed' });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Login session error:", err);
          return res.status(500).json({ message: 'Login failed' });
        }
        
        console.log("Email signin successful for:", user.email);
        res.json({ message: 'Signin successful', user: { id: user.id, email: user.email, role: user.role } });
      });
    })(req, res, next);
  });
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};