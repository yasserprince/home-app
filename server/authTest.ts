import type { Express } from "express";

export function setupAuthTest(app: Express) {
  // Simple test endpoint to verify authentication works
  app.get("/api/auth/test", (req, res) => {
    res.json({
      message: "Auth test endpoint",
      isAuthenticated: req.isAuthenticated(),
      user: req.user ? {
        id: req.user.id,
        email: req.user.email,
        authProvider: req.user.authProvider
      } : null,
      sessionInfo: {
        sessionID: req.sessionID,
        hasSession: !!req.session
      }
    });
  });

  // Test Google OAuth without signup flow
  app.get("/api/test-google", (req, res) => {
    res.send(`
      <html>
        <head><title>Test Google OAuth</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Google OAuth Test</h2>
          <p>Test the Google OAuth flow directly</p>
          <a href="/api/auth/google" style="display: inline-block; padding: 10px 20px; background: #4285f4; color: white; text-decoration: none; border-radius: 5px;">Login with Google</a>
          <br><br>
          <a href="/api/auth/test">Check Auth Status</a>
          <br><br>
          <a href="/">Back to Home</a>
        </body>
      </html>
    `);
  });
}