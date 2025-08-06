import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { logDeploymentConfig, ensureIdenticalBehavior, validateDeploymentConfig } from "./deploymentConfig";

const app = express();

// Ensure consistent environment handling
const isProduction = process.env.NODE_ENV === "production";
console.log(`🚀 Starting server in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);

// Consistent middleware setup for both environments
app.use(express.json({ limit: '50mb' })); // Increase limit for file uploads
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Environment consistency check for deployment
const requiredEnvVars = [
  'DATABASE_URL',
  'PRIVATE_OBJECT_DIR', 
  'PUBLIC_OBJECT_SEARCH_PATHS',
  'DEFAULT_OBJECT_STORAGE_BUCKET_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.warn(`⚠️ Missing environment variables: ${missingEnvVars.join(', ')}`);
} else {
  console.log('✅ All required environment variables are present');
}

// Log object storage configuration for debugging
console.log('🪣 Object Storage Configuration:', {
  bucketId: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID ? 'SET' : 'MISSING',
  privateDir: process.env.PRIVATE_OBJECT_DIR ? 'SET' : 'MISSING',
  publicPaths: process.env.PUBLIC_OBJECT_SEARCH_PATHS ? 'SET' : 'MISSING',
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Ensure identical deployment behavior
  ensureIdenticalBehavior();
  
  // Log comprehensive deployment configuration
  logDeploymentConfig();
  
  // Validate deployment configuration
  const validation = validateDeploymentConfig();
  if (!validation.valid) {
    console.error("❌ Deployment configuration validation failed!");
    validation.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  // Import and setup new simple architecture
  const { setupSimpleAuth } = await import('./simpleAuth.js');
  const { setupSimpleUpload } = await import('./simpleUpload.js');
  
  // Setup simple auth and upload (new architecture)
  setupSimpleAuth(app);
  setupSimpleUpload(app);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    console.log('📋 Setting up Vite development server...');
    await setupVite(app, server);
  } else {
    console.log('📦 Setting up static file serving for production...');
    serveStatic(app);
    
    // Additional production configuration for identical behavior
    app.use((req, res, next) => {
      // Ensure consistent routing behavior in production
      if (req.path.startsWith('/api')) {
        return next();
      }
      
      // For non-API routes, ensure SPA routing works identically
      if (!req.path.includes('.') && req.method === 'GET') {
        // This is likely a client-side route, serve index.html
        return next();
      }
      
      next();
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
