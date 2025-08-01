// Simple test endpoint to debug OAuth issues
import type { Express } from "express";

export function setupTestAuth(app: Express) {
  app.get("/api/test-env", (req, res) => {
    res.json({
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasSessionSecret: !!process.env.SESSION_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      clientIdStart: process.env.GOOGLE_CLIENT_ID?.substring(0, 10),
    });
  });

  app.get("/api/test-callback", (req, res) => {
    res.json({
      query: req.query,
      headers: Object.keys(req.headers),
      cookies: req.cookies,
      session: req.session,
    });
  });
}