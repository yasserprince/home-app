import { Express } from 'express';

export function setupDebugRoutes(app: Express) {
  // Debug route to check session and authentication
  app.get('/api/debug-session', (req, res) => {
    const sessionData = (req.session as any);
    res.json({
      session: {
        id: req.sessionID,
        cookie: req.session?.cookie,
        exists: !!req.session,
        passport: sessionData?.passport
      },
      user: req.user,
      isAuthenticated: req.isAuthenticated?.(),
      middleware: {
        sessionExists: !!req.session,
        passportInitialized: !!req.login,
        hasDeserializeUser: !!sessionData?.passport?.user
      },
      debug: {
        userAgent: req.headers['user-agent'],
        cookies: req.headers.cookie?.substring(0, 100),
        sessionStore: sessionData ? Object.keys(sessionData) : []
      }
    });
  });
}