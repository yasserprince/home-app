import type { Express } from "express";

export function setupDebugAuth(app: Express) {
  // Debug route to manually trigger OAuth flow issues
  app.get("/api/debug/oauth-test", async (req, res) => {
    try {
      // Test if we can create a user manually
      const testUser = {
        id: "test-google-user",
        email: "test@google.com",
        firstName: "Test",
        lastName: "User",
        authProvider: "google",
        role: "service_seeker",
        isActive: true,
        isVerified: false
      };

      // Test session functionality
      req.session.testData = "session-working";

      res.json({
        message: "Debug test successful",
        sessionWorking: !!req.session.testData,
        sessionID: req.sessionID,
        environment: process.env.NODE_ENV,
        secrets: {
          hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
          hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
          hasSessionSecret: !!process.env.SESSION_SECRET,
          hasDatabaseUrl: !!process.env.DATABASE_URL
        }
      });
    } catch (error) {
      console.error("Debug auth test error:", error);
      res.status(500).json({ 
        error: "Debug test failed", 
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Test manual login
  app.post("/api/debug/manual-login", async (req, res) => {
    try {
      const fakeUser = {
        id: "debug-user-123",
        email: "debug@test.com",
        firstName: "Debug",
        lastName: "User",
        role: "service_seeker"
      };

      req.logIn(fakeUser, (err) => {
        if (err) {
          console.error("Manual login failed:", err);
          return res.status(500).json({ error: "Manual login failed", details: err.message });
        }
        
        res.json({ 
          message: "Manual login successful",
          user: fakeUser,
          isAuthenticated: req.isAuthenticated()
        });
      });
    } catch (error) {
      console.error("Manual login error:", error);
      res.status(500).json({ error: "Manual login error", message: error.message });
    }
  });
}