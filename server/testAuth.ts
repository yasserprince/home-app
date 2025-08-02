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
      isAuthenticated: req.isAuthenticated(),
      user: req.user
    });
  });
  
  // Simple test for direct Google OAuth (bypassing our signup flow)
  app.get("/api/test-direct-auth", (req, res) => {
    res.send(`
      <html>
        <body>
          <h2>Direct Google OAuth Test</h2>
          <a href="/api/auth/google">Login with Google (Direct)</a>
          <br><br>
          <a href="/api/debug-session">Check Session</a>
          <br><br>
          <a href="/">Back to Home</a>
        </body>
      </html>
    `);
  });
}