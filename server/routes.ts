import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupGoogleAuth, isAuthenticated } from "./googleAuth";
import { setupEmailAuth } from "./emailAuth";
import { setupAuth, isAuthenticated as isReplitAuthenticated } from "./replitAuth";
import { setupTestAuth } from "./testAuth";
import { setupAuthTest } from "./authTest";
import { setupDebugAuth } from "./debugAuth";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import express from "express";
import { insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import sharp from "sharp";
import { z } from "zod";
import { seedServiceCategories } from "./seedCategories";

// Helper functions for gallery creation
function getGalleryTitleFromId(galleryId: string): string {
  switch (galleryId) {
    case 'featured-work': return 'Featured Work';
    case 'before-after': return 'Before & After';
    case 'work-samples': return 'Work Samples';
    case 'tools-equipment': return 'Tools & Equipment';
    case 'certifications': return 'Certifications';
    default: return 'Portfolio Gallery';
  }
}

function getCategoryFromGalleryId(galleryId: string): string {
  switch (galleryId) {
    case 'featured-work': return 'featured';
    case 'before-after': return 'before_after';
    case 'work-samples': return 'work_samples';
    case 'tools-equipment': return 'equipment';
    case 'certifications': return 'certifications';
    default: return 'work_samples';
  }
}

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🔧 Configuring routes for", process.env.NODE_ENV);
  
  // Early API route test to ensure proper registration
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
  // Production-specific middleware for consistent behavior
  const isProduction = process.env.NODE_ENV === "production";
  const isGitHubDeployment = Boolean(process.env.REPL_DEPLOYMENT_ID);
  console.log(`🔧 Configuring routes for ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  
  // Add consistent headers for both environments
  app.use((_req, res, next) => {
    // Security headers for production consistency
    if (isProduction) {
      res.header('X-Frame-Options', 'DENY');
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
    next();
  });

  // Auth middleware
  await setupGoogleAuth(app);
  await setupEmailAuth(app);
  await setupAuth(app); // Replit Auth
  
  // Auto-initialize data for production deployments
  if (isProduction || isGitHubDeployment) {
    console.log("🚀 Production deployment detected - auto-initializing data...");
    try {
      // Check if categories already exist to avoid duplicates
      const existingCategories = await storage.getServiceCategories();
      if (existingCategories.length === 0) {
        console.log("📦 No categories found, seeding from SERVICE_CATEGORIES...");
        const { SERVICE_CATEGORIES } = await import('./seedCategories.js');
        
        // Create categories using the proper format
        for (const categoryData of SERVICE_CATEGORIES.slice(0, 25)) { // Top 25 categories for deployment
          try {
            await storage.createServiceCategory({
              name: categoryData.name,
              icon: categoryData.icon,
              color: categoryData.color,
              category: categoryData.category,
              description: categoryData.description,
              nameAr: categoryData.nameAr,
              nameFr: categoryData.nameFr,
              descriptionAr: categoryData.descriptionAr,
              descriptionFr: categoryData.descriptionFr,
              isPopular: categoryData.isPopular,
              sortOrder: categoryData.sortOrder,
              averagePrice: categoryData.averagePrice,
              estimatedDuration: categoryData.estimatedDuration,
              skillLevel: categoryData.skillLevel,
              requiresLicense: categoryData.requiresLicense,
              emergencyService: categoryData.emergencyService
            });
            console.log(`✅ Created category: ${categoryData.name}`);
          } catch (catError) {
            console.error(`❌ Failed to create category ${categoryData.name}:`, catError);
          }
        }
        console.log("✅ Categories seeded for production");
      } else {
        console.log(`✅ Categories already exist in production (${existingCategories.length} found)`);
      }
    } catch (error) {
      console.error("❌ Error seeding categories:", error);
    }
  }
  
  // Test endpoints for debugging
  setupTestAuth(app);
  setupAuthTest(app);
  setupDebugAuth(app);

  // Comprehensive deployment verification endpoint
  app.get('/api/deployment/verify', async (req, res) => {
    console.log("🔍 Running comprehensive deployment verification...");
    
    const tests = [];
    const isProduction = process.env.NODE_ENV === "production";
    const isGitHubDeployment = Boolean(process.env.REPL_DEPLOYMENT_ID);
    
    // Test 1: Categories seeded correctly
    let categoriesTest = { name: "Categories Seeded", passed: false, details: null };
    try {
      const categories = await storage.getServiceCategories();
      categoriesTest.passed = categories.length >= 20; // Should have at least 20 categories
      categoriesTest.details = `Found ${categories.length} categories. Top 5: ${categories.slice(0, 5).map(c => c.name).join(', ')}`;
    } catch (error) {
      categoriesTest.details = `Error: ${(error as Error).message}`;
    }
    tests.push(categoriesTest);
    
    // Test 2: Object storage working for profile images
    let objectStorageTest = { name: "Object Storage", passed: false, details: null };
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      objectStorageTest.passed = uploadURL && uploadURL.includes('storage.googleapis.com');
      objectStorageTest.details = `Upload URL generated: ${uploadURL ? 'YES' : 'NO'}`;
    } catch (error) {
      objectStorageTest.details = `Error: ${(error as Error).message}`;
    }
    tests.push(objectStorageTest);
    
    // Test 3: Session configuration
    let sessionTest = { name: "Session Configuration", passed: false, details: null };
    try {
      sessionTest.passed = Boolean(process.env.SESSION_SECRET);
      sessionTest.details = `Session secret: ${sessionTest.passed ? 'CONFIGURED' : 'MISSING'}`;
    } catch (error) {
      sessionTest.details = `Error: ${(error as Error).message}`;
    }
    tests.push(sessionTest);
    
    // Test 4: Database connectivity
    let dbTest = { name: "Database Connection", passed: false, details: null };
    try {
      const user = await storage.getUser('test-user-id'); // This will fail but test connectivity
      dbTest.passed = true; // If we get here, DB is connected
      dbTest.details = "Database connected successfully";
    } catch (error) {
      // DB error is expected, but connection should work
      dbTest.passed = !(error as Error).message.includes('connect');
      dbTest.details = `Connection test: ${dbTest.passed ? 'OK' : 'FAILED'}`;
    }
    tests.push(dbTest);
    
    const allPassed = tests.every(test => test.passed);
    const criticalIssues = tests.filter(test => !test.passed).map(test => test.name);
    
    res.json({
      status: allPassed ? "DEPLOYMENT_READY" : "NEEDS_FIXES",
      environment: isProduction ? "PRODUCTION" : "DEVELOPMENT",
      isGitHubDeployment,
      tests,
      criticalIssues,
      summary: {
        totalTests: tests.length,
        passed: tests.filter(t => t.passed).length,
        failed: tests.filter(t => !t.passed).length
      },
      recommendation: allPassed 
        ? "Deployment should work identically to development" 
        : `Fix these issues: ${criticalIssues.join(', ')}`,
      timestamp: new Date().toISOString()
    });
  });

  // Deployment status endpoint for verifying identical behavior
  app.get('/api/deployment/status', async (req, res) => {
    const { getDeploymentConfig } = await import('./deploymentConfig.js');
    const config = getDeploymentConfig();
    
    // GitHub deployment detection
    const isGitHubDeployment = Boolean(process.env.REPL_DEPLOYMENT_ID);
    const gitRepo = process.env.REPL_GIT_REPO || null;
    const isProduction = process.env.NODE_ENV === "production";
    
    // Critical deployment checks
    let categoriesStatus = { count: 0, seeded: false, error: null };
    try {
      const categories = await storage.getServiceCategories();
      categoriesStatus = { count: categories.length, seeded: categories.length > 0, error: null };
    } catch (error) {
      categoriesStatus.error = error.message;
    }

    let objectStorageTest = { working: false, error: null };
    try {
      const objectStorageService = new ObjectStorageService();
      const privateDir = objectStorageService.getPrivateObjectDir();
      const publicPaths = objectStorageService.getPublicObjectSearchPaths();
      objectStorageTest = { working: !!(privateDir && publicPaths.length > 0), error: null };
    } catch (error) {
      objectStorageTest.error = error.message;
    }

    // Critical issues check
    const criticalIssues = [];
    if (!categoriesStatus.seeded) criticalIssues.push("CATEGORIES_NOT_SEEDED");
    if (!objectStorageTest.working) criticalIssues.push("OBJECT_STORAGE_NOT_CONFIGURED");
    if (!config.database.connected) criticalIssues.push("DATABASE_NOT_CONNECTED");
    
    const deploymentHealthy = criticalIssues.length === 0;
    
    res.json({
      status: deploymentHealthy ? "HEALTHY" : "CRITICAL_ISSUES",
      environment: config.environment,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      github: {
        isDeployment: isGitHubDeployment,
        repository: gitRepo,
        deploymentId: process.env.REPL_DEPLOYMENT_ID || null
      },
      criticalChecks: {
        categories: categoriesStatus,
        objectStorage: objectStorageTest,
        database: config.database,
        issues: criticalIssues
      },
      objectStorage: {
        configured: Boolean(config.objectStorage.bucketId),
        publicPathsCount: config.objectStorage.publicPaths.length,
        hasPrivateDir: Boolean(config.objectStorage.privateDir),
        bucketId: config.objectStorage.bucketId ? 'SET' : 'MISSING'
      },
      auth: config.auth,
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      envVars: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        REPLIT_SIDECAR_ENDPOINT: process.env.REPLIT_SIDECAR_ENDPOINT ? 'SET' : 'MISSING'
      }
    });
  });
  
  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Verification endpoints
  app.post('/api/verification/email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = ((req.user as any)?.claims || {}).sub;
      
      // Generate verification token
      const verificationToken = Math.random().toString(36).substring(2, 15);
      
      // Update user with pending email verification
      await storage.updateUser(userId, {
        emailVerificationStatus: 'pending',
        verificationDocuments: JSON.stringify({
          emailToken: verificationToken,
          emailTokenExpiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        })
      });

      // In production, send actual email with verification link
      // For demo purposes, we'll simulate success
      console.log(`Email verification token for ${userId}: ${verificationToken}`);
      
      res.json({ 
        message: "Verification email sent",
        // In development, return token for testing
        ...(process.env.NODE_ENV === 'development' && { token: verificationToken })
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  app.post('/api/verification/phone', isAuthenticated, async (req: any, res) => {
    try {
      const userId = ((req.user as any)?.claims || {}).sub;
      
      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update user with pending phone verification
      await storage.updateUser(userId, {
        phoneVerificationStatus: 'pending',
        verificationDocuments: JSON.stringify({
          phoneCode: verificationCode,
          phoneCodeExpiry: Date.now() + 10 * 60 * 1000 // 10 minutes
        })
      });

      // In production, send actual SMS using free services like:
      // - Twilio free trial: $15 credit
      // - TextBelt API: free tier available
      // - SMSGateway24: free trial
      console.log(`Phone verification code for ${userId}: ${verificationCode}`);
      
      res.json({ 
        message: "Verification code sent",
        // In development, return code for testing
        ...(process.env.NODE_ENV === 'development' && { code: verificationCode })
      });
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post('/api/verification/verify-email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = ((req.user as any)?.claims || {}).sub;
      const { token } = req.body;
      
      const user = await storage.getUser(userId);
      const verificationData = user?.verificationDocuments ? JSON.parse(user.verificationDocuments as string) : {};
      
      if (verificationData.emailToken === token && Date.now() < verificationData.emailTokenExpiry) {
        await storage.updateUser(userId, {
          emailVerificationStatus: 'verified',
          trustScore: (user?.trustScore || 0) + 25,
          verificationDate: new Date()
        });
        res.json({ message: "Email verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid or expired verification token" });
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  app.post('/api/verification/verify-phone', isAuthenticated, async (req: any, res) => {
    try {
      const userId = ((req.user as any)?.claims || {}).sub;
      const { code } = req.body;
      
      const user = await storage.getUser(userId);
      const verificationData = user?.verificationDocuments ? JSON.parse(user.verificationDocuments as string) : {};
      
      if (verificationData.phoneCode === code && Date.now() < verificationData.phoneCodeExpiry) {
        await storage.updateUser(userId, {
          phoneVerificationStatus: 'verified',
          trustScore: (user?.trustScore || 0) + 25,
          verificationDate: new Date()
        });
        res.json({ message: "Phone verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid or expired verification code" });
      }
    } catch (error) {
      console.error("Error verifying phone:", error);
      res.status(500).json({ message: "Failed to verify phone" });
    }
  });

  // Enhanced auth middleware with detailed debugging
  const isAnyAuthenticated: RequestHandler = async (req, res, next) => {
    console.log("🔒 Auth middleware check:", {
      hasSession: !!req.session,
      sessionUser: !!(req.session as any)?.user,
      hasPassportUser: !!req.user,
      isPassportAuth: req.isAuthenticated?.(),
      sessionId: req.sessionID,
      cookies: req.headers.cookie?.substring(0, 100),
      userAgent: req.headers['user-agent']?.substring(0, 50)
    });
    
    // Check Replit Auth first (via custom setup)
    if (((req as any).user?.claims || {}).sub) {
      console.log("✅ Replit auth detected");
      return next();
    }
    
    // Check Passport-based auth (Google, Email)
    if (req.isAuthenticated && req.isAuthenticated()) {
      console.log("✅ Passport auth detected");
      return next();
    }
    
    // Check direct session auth
    if ((req as any).session?.user) {
      console.log("✅ Session auth detected");
      return next();
    }
    
    console.log("❌ No authentication found");
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.get('/api/auth/user', isAnyAuthenticated, async (req: any, res) => {
    try {
      // Handle different auth types
      if (((req.user as any)?.claims || {})?.sub) {
        // Replit Auth user - get full user data from database
        const userId = ((req.user as any)?.claims || {}).sub;
        const dbUser = await storage.getUser(userId);
        
        if (dbUser) {
          // Return database user data (includes uploaded profile images)
          return res.json(dbUser);
        } else {
          // User not in database yet, create from claims
          const newUser = {
            id: userId,
            email: ((req.user as any)?.claims || {}).email,
            firstName: ((req.user as any)?.claims || {}).first_name,
            lastName: ((req.user as any)?.claims || {}).last_name,
            profileImageUrl: ((req.user as any)?.claims || {}).profile_image_url || null,
            authProvider: 'replit',
            role: 'service_seeker',
            accountType: 'individual',
            isActive: true
          };
          return res.json(newUser);
        }
      } else if (req.user?.id) {
        // Google Auth or Email Auth user
        return res.json(req.user);
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Debug authentication endpoint - test route to verify API access
  app.get('/api/auth/debug', (req, res) => {
    console.log("🔍 Authentication Debug endpoint reached");
    
    const debugInfo = {
      endpoint: "debug endpoint working",
      sessionId: req.sessionID || "none",
      hasSession: !!req.session,
      hasUser: !!req.user,
      isAuthenticated: req.isAuthenticated?.() || false,
      cookies: req.headers.cookie || "none",
      userAgent: req.headers['user-agent'] || "none",
      timestamp: new Date().toISOString()
    };
    
    console.log("Debug info:", debugInfo);
    res.json(debugInfo);
  });

  // Enhanced logout endpoint that works for all auth types
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          // Continue with logout even if session destroy fails
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Account update route
  app.put('/api/account', isAnyAuthenticated, async (req: any, res) => {
    try {
      // Handle different auth types
      const userId = ((req.user as any)?.claims || {})?.sub || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found in session' });
      }
      
      const updates = req.body;
      
      // Validate role change if provided
      if (updates.role && !['service_seeker', 'service_provider', 'company'].includes(updates.role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }
      
      // If changing to company, require company name
      if (updates.role === 'company' && !updates.companyName?.trim()) {
        return res.status(400).json({ message: 'Company name is required for company accounts' });
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Location update route
  app.put('/api/location', isAnyAuthenticated, async (req: any, res) => {
    try {
      // Handle different auth types
      const userId = ((req.user as any)?.claims || {})?.sub || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found in session' });
      }
      
      const { locationEnabled, latitude, longitude } = req.body;
      
      const updates: any = { locationEnabled };
      
      if (locationEnabled && latitude !== undefined && longitude !== undefined) {
        updates.latitude = latitude.toString();
        updates.longitude = longitude.toString();
      } else if (!locationEnabled) {
        updates.latitude = null;
        updates.longitude = null;
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'Location updated successfully', user: updatedUser });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  // Google Maps API key endpoint for frontend
  app.get('/api/maps/config', (req, res) => {
    res.json({
      apiKey: process.env.GOOGLE_MAPS_API_KEY || null,
      hasApiKey: !!process.env.GOOGLE_MAPS_API_KEY
    });
  });

  // Deprecated - this endpoint was replaced by the working one below

  // Deprecated - this endpoint was replaced by the working one below

  // Admin middleware - restrict to specific email only
  const isAdmin: RequestHandler = async (req: any, res, next) => {
    try {
      const userId = ((req.user as any)?.claims || {})?.sub;
      const userEmail = ((req.user as any)?.claims || {})?.email;
      const user = await storage.getUser(userId);
      
      // Only allow admin access for katiflam1@gmail.com
      if (!user || user.role !== 'admin' || userEmail !== 'katiflam1@gmail.com') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Failed to verify admin status" });
    }
  };

  // Support middleware - limited permissions
  const isSupport: RequestHandler = async (req: any, res, next) => {
    try {
      const userId = ((req.user as any)?.claims || {})?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin' && user.role !== 'support')) {
        return res.status(403).json({ message: "Support access required" });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Failed to verify support status" });
    }
  };

  // Admin routes (full permissions)
  // Removed: Replaced with session-based admin auth version below

  app.put('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      // Prevent changing own role
      const currentUserId = (req.user as any)?.claims?.sub;
      if (id === currentUserId) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }
      
      const user = await storage.updateUserRole(id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.put('/api/admin/users/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      // Prevent deactivating own account
      const currentUserId = (req.user as any)?.id;
      if (id === currentUserId) {
        return res.status(400).json({ message: "Cannot deactivate your own account" });
      }
      
      const user = await storage.updateUserStatus(id, isActive);
      res.json(user);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent deleting own account
      const currentUserId = (req.user as any)?.id;
      if (id === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Simple admin setup endpoint that works around authentication issues
  app.post('/api/setup-admin', async (req: any, res) => {
    try {
      // Find user by email directly from database
      const targetEmail = 'katiflam1@gmail.com';
      const user = await storage.getUserByEmail(targetEmail);
      
      if (!user) {
        return res.status(404).json({ message: "User not found with email: " + targetEmail });
      }

      // Update user to admin role
      await storage.updateUserRole(user.id, 'admin');
      
      res.json({ 
        message: "Admin role assigned successfully", 
        userId: user.id, 
        email: user.email 
      });
    } catch (error) {
      console.error("Error setting up admin:", error);
      res.status(500).json({ message: "Failed to setup admin", error: error.message });
    }
  });

  // Support routes (limited permissions - view only)
  app.get('/api/support/users', isAuthenticated, isSupport, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Support can only see basic user info, not sensitive data
      const safeUsers = users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Support can only activate/deactivate users, not change roles or delete
  // Service Categories API
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getAllServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/popular', async (req, res) => {
    try {
      const categories = await storage.getPopularServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching popular categories:", error);
      res.status(500).json({ message: "Failed to fetch popular categories" });
    }
  });

  app.get('/api/categories/by-group/:group', async (req, res) => {
    try {
      const { group } = req.params;
      const categories = await storage.getServiceCategoriesByGroup(group);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories by group:", error);
      res.status(500).json({ message: "Failed to fetch categories by group" });
    }
  });

  // Seed categories endpoint (development only)
  app.post('/api/seed/categories', async (req, res) => {
    try {
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Only available in development" });
      }
      
      await seedServiceCategories();
      res.json({ message: "Service categories seeded successfully" });
    } catch (error) {
      console.error("Error seeding categories:", error);
      res.status(500).json({ message: "Failed to seed categories" });
    }
  });

  // Seed providers endpoint (development only)
  app.post('/api/seed/providers', async (req, res) => {
    try {
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Only available in development" });
      }
      
      const { seedServiceProviders } = await import('./seedProviders');
      await seedServiceProviders();
      res.json({ message: "Service providers seeded successfully" });
    } catch (error) {
      console.error("Error seeding providers:", error);
      res.status(500).json({ message: "Failed to seed providers" });
    }
  });

  app.put('/api/support/users/:id/status', isAuthenticated, isSupport, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      // Support cannot deactivate admin users
      const targetUser = await storage.getUser(id);
      if (targetUser?.role === 'admin') {
        return res.status(403).json({ message: "Cannot modify admin users" });
      }
      
      const user = await storage.updateUserStatus(id, isActive);
      res.json(user);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Deprecated - moved to proper object storage section below around line 1353

  // Deprecated - moved to proper object storage section below around line 1360

  // Serve private objects with ACL check
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = ((req.user as any)?.claims || {})?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      console.log("🖼️ Portfolio image request:", req.path);
      console.log("🔍 Object path param:", req.params.objectPath);
      
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Serve public objects without authentication
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Profile update endpoint
  app.put('/api/profile', isAuthenticated, upload.single('profileImage'), async (req: any, res) => {
    try {
      const userId = ((req.user as any)?.claims || {}).sub;
      const updateData = { ...req.body };
      
      // Handle profile image upload
      if (req.file) {
        updateData.profileImageUrl = `/uploads/${req.file.filename}`;
      }
      
      // Convert date string to Date object if provided
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }
      
      // Convert notifications string to boolean
      if (updateData.notifications !== undefined) {
        updateData.notifications = updateData.notifications === 'true';
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Location update endpoint
  app.put('/api/location', isAuthenticated, async (req: any, res) => {
    try {
      const userId = ((req.user as any)?.claims || {}).sub;
      const { locationEnabled, latitude, longitude } = req.body;
      
      const updateData: any = {
        locationEnabled,
        lastLocationUpdate: new Date(),
      };
      
      if (locationEnabled && latitude !== undefined && longitude !== undefined) {
        updateData.latitude = latitude.toString();
        updateData.longitude = longitude.toString();
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  // Service Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Service Providers
  app.get('/api/providers', async (req, res) => {
    try {
      const { categoryId, search, latitude, longitude, radius } = req.query;
      const providers = await storage.getServiceProviders(
        categoryId as string,
        search as string,
        latitude ? parseFloat(latitude as string) : undefined,
        longitude ? parseFloat(longitude as string) : undefined,
        radius ? parseInt(radius as string) || 50 : undefined
      );
      res.json(providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  app.get('/api/providers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const provider = await storage.getServiceProviderById(id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      res.json(provider);
    } catch (error) {
      console.error("Error fetching provider:", error);
      res.status(500).json({ message: "Failed to fetch provider" });
    }
  });

  // Booking routes
  app.post('/api/bookings', isReplitAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId,
        scheduledDate: new Date(req.body.scheduledDate + 'T' + req.body.scheduledTime),
      });

      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Failed to create booking' });
    }
  });

  app.get('/api/bookings', isReplitAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });

  app.get('/api/bookings/:id', isReplitAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Ensure user can only access their own bookings
      if (booking.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({ message: 'Failed to fetch booking' });
    }
  });

  app.patch('/api/bookings/:id/status', isReplitAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { status } = req.body;
      const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const booking = await storage.updateBookingStatus(req.params.id, status);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      res.json(booking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ message: 'Failed to update booking status' });
    }
  });

  // Bookings
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = ((req.user as any)?.claims || {}).sub;
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId,
      });
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = ((req.user as any)?.claims || {}).sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const booking = await storage.getBookingById(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking
      const userId = ((req.user as any)?.claims || {}).sub;
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.patch('/api/bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking
      const userId = ((req.user as any)?.claims || {}).sub;
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedBooking = await storage.updateBookingStatus(id, status);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Reviews
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = ((req.user as any)?.claims || {}).sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/providers/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getProviderReviews(id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Create admin user endpoint (for setup)
  app.post('/api/setup-admin', async (req, res) => {
    try {
      const { adminId } = req.body;
      if (!adminId) {
        return res.status(400).json({ message: "Admin ID is required" });
      }
      
      // Update the specified user to admin role
      const adminUser = await storage.updateUserRole(adminId, 'admin');
      res.json({ message: "Admin user created successfully", user: adminUser });
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Initialize sample data
  app.post('/api/init-data', async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      if (categories.length === 0) {
        // Create sample categories
        const sampleCategories = [
          // Core Home Infrastructure
          {
            name: "Plumbing",
            description: "Pipe repair, drain cleaning, water heater service",
            icon: "wrench",
            color: "#3B82F6",
          },
          {
            name: "Electrical",
            description: "Wiring, panel upgrades, lighting installation",
            icon: "zap",
            color: "#F59E0B",
          },
          {
            name: "HVAC",
            description: "Heating, cooling & air conditioning repair",
            icon: "thermometer",
            color: "#0EA5E9",
          },
          // Home Improvement & Construction
          {
            name: "Handyman",
            description: "General repairs, furniture assembly, minor fixes",
            icon: "hammer",
            color: "#EA580C",
          },
          {
            name: "Painting",
            description: "Interior & exterior painting, cabinet refinishing",
            icon: "paintbrush",
            color: "hsl(300, 70%, 55%)",
          },
          {
            name: "Roofing",
            description: "Roof installation, repair & gutter services",
            icon: "home",
            color: "hsl(15, 75%, 45%)",
          },
          {
            name: "Flooring",
            description: "Hardwood, tile, carpet installation & refinishing",
            icon: "grid",
            color: "hsl(35, 65%, 50%)",
          },
          {
            name: "Kitchen Remodeling",
            description: "Kitchen renovation & cabinet installation",
            icon: "chef-hat",
            color: "hsl(120, 60%, 45%)",
          },
          {
            name: "Bathroom Remodeling",
            description: "Bathroom renovation & fixture installation",
            icon: "bath",
            color: "hsl(180, 70%, 50%)",
          },
          {
            name: "Carpentry",
            description: "Custom woodwork, built-ins, trim installation",
            icon: "saw",
            color: "hsl(30, 80%, 45%)",
          },
          // Cleaning & Maintenance
          {
            name: "House Cleaning",
            description: "Regular cleaning, deep cleaning, move-out cleaning",
            icon: "sparkles",
            color: "hsl(271, 81%, 56%)",
          },
          {
            name: "Carpet Cleaning",
            description: "Professional carpet & upholstery cleaning",
            icon: "spray",
            color: "hsl(210, 70%, 50%)",
          },
          {
            name: "Window Cleaning",
            description: "Interior & exterior window cleaning",
            icon: "square",
            color: "hsl(195, 80%, 55%)",
          },
          {
            name: "Pressure Washing",
            description: "Driveway, siding & deck power washing",
            icon: "droplets",
            color: "hsl(200, 85%, 60%)",
          },
          {
            name: "Junk Removal",
            description: "Furniture removal, garage cleanouts, hauling",
            icon: "truck",
            color: "hsl(30, 70%, 50%)",
          },
          // Outdoor & Landscaping
          {
            name: "Landscaping",
            description: "Lawn care, garden design, tree services",
            icon: "leaf",
            color: "hsl(150, 70%, 40%)",
          },
          {
            name: "Lawn Care",
            description: "Mowing, fertilizing, weed control",
            icon: "leaf",
            color: "hsl(120, 75%, 45%)",
          },
          {
            name: "Tree Services",
            description: "Tree trimming, removal & stump grinding",
            icon: "tree",
            color: "hsl(90, 65%, 40%)",
          },
          {
            name: "Fence Installation",
            description: "Wood, vinyl & chain link fence installation",
            icon: "fence",
            color: "hsl(45, 70%, 50%)",
          },
          {
            name: "Deck Building",
            description: "Deck construction, repair & staining",
            icon: "layout",
            color: "hsl(20, 75%, 50%)",
          },
          // Appliances & Technology
          {
            name: "Appliance Repair",
            description: "Washer, dryer, refrigerator & appliance service",
            icon: "cog",
            color: "hsl(220, 60%, 50%)",
          },
          {
            name: "TV Mounting",
            description: "Wall mounting & entertainment system setup",
            icon: "tv",
            color: "hsl(260, 70%, 55%)",
          },
          {
            name: "Smart Home",
            description: "Smart device installation & home automation",
            icon: "wifi",
            color: "hsl(240, 70%, 50%)",
          },
          {
            name: "Security Systems",
            description: "Security camera & alarm system installation",
            icon: "shield",
            color: "hsl(350, 70%, 50%)",
          },
          // Moving & Assembly
          {
            name: "Furniture Assembly",
            description: "IKEA & furniture assembly services",
            icon: "chair",
            color: "hsl(40, 80%, 55%)",
          },
          {
            name: "Moving Services",
            description: "Local moving, packing & heavy lifting",
            icon: "boxes",
            color: "hsl(280, 70%, 50%)",
          },
          // Specialized Services
          {
            name: "Pool Services",
            description: "Pool cleaning, maintenance & repair",
            icon: "swimming-pool",
            color: "hsl(190, 80%, 55%)",
          },
          {
            name: "Pest Control",
            description: "Insect, rodent & termite removal",
            icon: "bug",
            color: "hsl(350, 70%, 50%)",
          },
          {
            name: "Driveway Services",
            description: "Concrete, asphalt installation & repair",
            icon: "road",
            color: "hsl(0, 0%, 45%)",
          },
          {
            name: "Garage Door",
            description: "Garage door installation & repair",
            icon: "warehouse",
            color: "hsl(10, 70%, 50%)",
          },
          // Personal & Lifestyle Services
          {
            name: "Pet Services",
            description: "Dog walking, pet sitting & grooming",
            icon: "paw-print",
            color: "hsl(320, 70%, 55%)",
          },
          {
            name: "Personal Training",
            description: "In-home fitness & personal training",
            icon: "dumbbell",
            color: "hsl(0, 80%, 55%)",
          },
          {
            name: "Tutoring",
            description: "Academic tutoring & test preparation",
            icon: "graduation-cap",
            color: "hsl(230, 70%, 50%)",
          },
          {
            name: "Photography",
            description: "Event, portrait & real estate photography",
            icon: "camera",
            color: "hsl(50, 80%, 50%)",
          },
          // Wellness & Care
          {
            name: "Massage Therapy",
            description: "Therapeutic & relaxation massage",
            icon: "spa",
            color: "hsl(280, 60%, 55%)",
          },
          {
            name: "Elder Care",
            description: "Senior companion & assistance services",
            icon: "heart",
            color: "hsl(340, 70%, 55%)",
          },
          // Event & Party Services
          {
            name: "Event Planning",
            description: "Party planning & event coordination",
            icon: "calendar-alt",
            color: "hsl(300, 80%, 60%)",
          },
          {
            name: "Catering",
            description: "Event catering & private chef services",
            icon: "utensils",
            color: "hsl(20, 85%, 55%)",
          },
          {
            name: "DJ Services",
            description: "Music entertainment for events",
            icon: "music",
            color: "hsl(260, 80%, 60%)",
          },
          {
            name: "Bartending",
            description: "Professional bartending for events",
            icon: "cocktail",
            color: "hsl(340, 85%, 55%)",
          },
          // Automotive & Transportation
          {
            name: "Auto Repair",
            description: "Mobile car repair & maintenance",
            icon: "car",
            color: "hsl(0, 70%, 50%)",
          },
          {
            name: "Car Detailing",
            description: "Auto detailing & car wash services",
            icon: "car-wash",
            color: "hsl(210, 80%, 55%)",
          },
          // Professional Services
          {
            name: "Accounting",
            description: "Tax preparation & bookkeeping",
            icon: "calculator",
            color: "hsl(120, 50%, 45%)",
          },
          {
            name: "Legal Services",
            description: "Notary & legal consultation",
            icon: "gavel",
            color: "hsl(30, 60%, 40%)",
          },
          {
            name: "Web Design",
            description: "Website design & development",
            icon: "code",
            color: "hsl(200, 80%, 50%)",
          },
          // Seasonal Services
          {
            name: "Snow Removal",
            description: "Snow plowing & ice removal",
            icon: "snowflake",
            color: "hsl(190, 70%, 55%)",
          },
          {
            name: "Holiday Decorating",
            description: "Christmas & holiday decoration services",
            icon: "star",
            color: "hsl(360, 80%, 60%)",
          },
          // Repair & Restoration
          {
            name: "Furniture Repair",
            description: "Furniture restoration & upholstery",
            icon: "sofa",
            color: "hsl(25, 70%, 50%)",
          },
          {
            name: "Small Engine Repair",
            description: "Lawnmower & small engine repair",
            icon: "cogs",
            color: "hsl(60, 70%, 45%)",
          },
          // Energy & Environmental
          {
            name: "Solar Installation",
            description: "Solar panel installation & maintenance",
            icon: "solar-panel",
            color: "hsl(45, 90%, 55%)",
          },
          {
            name: "Insulation",
            description: "Home insulation & weatherization",
            icon: "temperature-low",
            color: "hsl(200, 60%, 50%)",
          },
        ];

        for (const category of sampleCategories) {
          await storage.createServiceCategory(category);
        }
      }
      
      // Create sample providers for the new categories
      const providers = await storage.getServiceProviders();
      if (providers.length === 0) {
        const createdCategories = await storage.getServiceCategories();
        const sampleProviders = [
          {
            userId: "sample-user-1",
            businessName: "Pro Plumbing Solutions",
            description: "Licensed plumber with 15+ years experience. Available for emergency repairs and installations.",
            categoryId: createdCategories.find(c => c.name === "Plumbing")?.id || "",
            hourlyRate: "85.00",
            rating: "4.9",
            reviewCount: 127,
            isAvailable: true,
            experienceYears: 15,
            location: "Downtown Area",
            services: ["Emergency Repairs", "Pipe Installation", "Water Heater Service", "Drain Cleaning"],
          },
          {
            userId: "sample-user-2", 
            businessName: "Elite Electrical Services",
            description: "Certified electrician specializing in residential and commercial wiring. Fast and reliable service.",
            categoryId: createdCategories.find(c => c.name === "Electrical")?.id || "",
            hourlyRate: "95.00",
            rating: "4.8",
            reviewCount: 98,
            isAvailable: true,
            experienceYears: 12,
            location: "Metro Area",
            services: ["Panel Upgrades", "Outlet Installation", "Lighting", "Smart Home Wiring"],
          },
          {
            userId: "sample-user-3",
            businessName: "Climate Control Experts",
            description: "HVAC specialists with experience in all major brands. Same-day service available.",
            categoryId: createdCategories.find(c => c.name === "HVAC")?.id || "",
            hourlyRate: "110.00",
            rating: "4.7",
            reviewCount: 156,
            isAvailable: true,
            experienceYears: 18,
            location: "North Side",
            services: ["AC Repair", "Heating Service", "Duct Cleaning", "System Installation"],
          },
          {
            userId: "sample-user-4",
            businessName: "Sparkle Clean Services",
            description: "Professional house cleaning with eco-friendly products. Bonded and insured team.",
            categoryId: createdCategories.find(c => c.name === "Cleaning")?.id || "",
            hourlyRate: "45.00",
            rating: "4.9",
            reviewCount: 203,
            isAvailable: true,
            experienceYears: 8,
            location: "City Wide",
            services: ["Deep Cleaning", "Regular Maintenance", "Move-out Cleaning", "Post-Construction"],
          },
          {
            userId: "sample-user-5",
            businessName: "Fix-It-Fast Handyman",
            description: "General handyman services for all your home repair needs. No job too small!",
            categoryId: createdCategories.find(c => c.name === "Handyman")?.id || "",
            hourlyRate: "65.00",
            rating: "4.6",
            reviewCount: 89,
            isAvailable: true,
            experienceYears: 10,
            location: "South District",
            services: ["Furniture Assembly", "Minor Repairs", "Painting Touch-ups", "Installation Services"],
          },
          {
            userId: "sample-user-6",
            businessName: "Green Thumb Landscaping",
            description: "Complete landscaping and lawn care services. Transform your outdoor space.",
            categoryId: createdCategories.find(c => c.name === "Landscaping")?.id || "",
            hourlyRate: "55.00",
            rating: "4.8",
            reviewCount: 74,
            isAvailable: true,
            experienceYears: 12,
            location: "Suburban Areas",
            services: ["Lawn Maintenance", "Garden Design", "Tree Service", "Irrigation Systems"],
          },
        ];

        // Create sample users first, then providers
        for (const provider of sampleProviders) {
          try {
            // Create a sample user for each provider
            await storage.upsertUser({
              id: provider.userId,
              email: `${provider.businessName.toLowerCase().replace(/\s+/g, '')}@example.com`,
              firstName: provider.businessName.split(' ')[0],
              lastName: "Professional",
              profileImageUrl: null,
            });
            
            // Create the provider
            await storage.createServiceProvider(provider);
          } catch (error) {
            console.error(`Error creating provider ${provider.businessName}:`, error);
          }
        }
      }
      
      res.json({ message: "Sample data initialized" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  // Add search suggestions endpoint
  app.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json([]);
    }
    
    const query = q.toLowerCase().trim();
    const suggestions: Array<{
      type: string;
      text: string;
      description: string;
      icon: string;
      color: string;
      id: string;
    }> = [];
    
    // Get categories
    const categories = await storage.getServiceCategories();
    
    // Add matching categories (limit to 4)
    const matchingCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes(query)
    ).slice(0, 4);
    
    matchingCategories.forEach(category => {
      suggestions.push({
        type: 'category',
        text: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        id: category.id
      });
    });
    
    res.json(suggestions);
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
  });

  // Social authentication routes
  app.get('/api/auth/google', (req, res) => {
    res.redirect('/api/login');
  });

  app.get('/api/auth/facebook', (req, res) => {
    res.redirect('/api/login');
  });

  app.get('/api/auth/apple', (req, res) => {
    res.redirect('/api/login');
  });

  // Signup route
  app.post('/api/signup', async (req, res) => {
    try {
      const signupData = req.body;
      
      // TODO: Implement user creation logic
      // For now, just return success
      res.json({ 
        success: true, 
        message: 'Account created successfully',
        user: {
          id: Date.now().toString(),
          email: signupData.email,
          firstName: signupData.firstName,
          lastName: signupData.lastName
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create account' 
      });
    }
  });

  // Public profile images endpoint - Fast, no ACL checks needed
  app.get("/public/profile-images/:imageId", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const imagePath = `/objects/uploads/${req.params.imageId}`;
    console.log(`🖼️ [${isProduction ? 'PROD' : 'DEV'}] Public profile image request:`, imagePath);
    
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(imagePath);
      console.log(`✅ [${isProduction ? 'PROD' : 'DEV'}] Serving public profile image:`, objectFile.name);
      
      // Set aggressive caching for profile images - identical in both environments
      res.set({
        'Cache-Control': 'public, max-age=86400', // 24 hours
        'Content-Type': 'image/jpeg',
        'Access-Control-Allow-Origin': '*', // Allow cross-origin for profile images
        'Access-Control-Allow-Methods': 'GET'
      });
      
      objectStorageService.downloadObject(objectFile, res, 86400); // 24h cache
    } catch (error) {
      console.error(`❌ [${isProduction ? 'PROD' : 'DEV'}] Error serving profile image:`, error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Object storage endpoints - For serving profile images and other objects
  app.get("/objects/:objectPath(*)", async (req: any, res) => {
    const objectStorageService = new ObjectStorageService();
    console.log("🔍 Object access request for:", req.path);
    
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      console.log("📁 Object file found:", objectFile.name);
      
      // Check if user is authenticated for private access
      const userId = ((req.user as any)?.claims || {})?.sub;
      console.log("👤 User ID:", userId || 'anonymous');
      
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId, // Can be undefined for public access
        requestedPermission: "read" as any,
      });
      
      if (!canAccess) {
        console.log("❌ Access denied for object:", req.path, "User:", userId || 'anonymous');
        return res.status(401).json({ message: "Unauthorized", objectPath: req.path });
      }
      
      console.log("✅ Serving object:", req.path, "to user:", userId || 'anonymous');
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("💥 Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        console.log("🚫 Object not found:", req.path);
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Modern upload endpoints with authentication
  const { uploadService } = await import('./uploadService');

  // Generate presigned upload URLs (using existing auth middleware)
  app.post("/api/upload/presigned-url", isAnyAuthenticated, async (req: any, res) => {
    try {
      console.log("🔒 Presigned URL request with auth middleware");
      
      // Get user ID using same pattern as other endpoints
      const userId = ((req.user as any)?.claims || {})?.sub || req.user?.id;

      console.log("✅ Found user ID:", userId);

      const { uploadType = 'portfolio', fileCount = 1, fileExtensions = [] } = req.body;

      console.log("✅ Generating presigned URLs for user:", userId, "type:", uploadType, "count:", fileCount);

      const result = await uploadService.generatePresignedUploadUrls({
        userId,
        uploadType,
        fileCount,
        fileExtensions
      });

      res.json(result);
    } catch (error) {
      console.error("Error generating presigned URLs:", error);
      res.status(500).json({ 
        error: "Failed to generate upload URLs", 
        message: (error as Error).message 
      });
    }
  });

  // Set ACL policy for uploaded files (using existing auth middleware)
  app.post("/api/upload/set-acl", isAnyAuthenticated, async (req: any, res) => {
    try {
      // Get user ID using same pattern as other endpoints
      const userId = ((req.user as any)?.claims || {})?.sub || req.user?.id;
      const { fileUrl, visibility = 'private', uploadType = 'portfolio' } = req.body;

      if (!fileUrl) {
        return res.status(400).json({ error: "File URL is required" });
      }

      const objectPath = await uploadService.setFileAcl({
        fileUrl,
        userId,
        visibility,
        uploadType
      });

      res.json({ objectPath, message: "ACL policy set successfully" });
    } catch (error) {
      console.error("Error setting ACL:", error);
      res.status(500).json({ 
        error: "Failed to set file permissions", 
        message: (error as Error).message 
      });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:objectPath(*)", async (req, res) => {
    try {
      const userId = req.isAuthenticated && req.isAuthenticated() && req.user 
        ? ((req.user as any)?.id || (req.user as any)?.claims?.sub)
        : undefined;

      await uploadService.serveFile({
        objectPath: req.params.objectPath,
        userId,
        response: res
      });
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: "Error serving file" });
    }
  });

  // Delete uploaded file (using existing auth middleware)
  app.delete("/api/upload/file/:objectPath(*)", isAnyAuthenticated, async (req: any, res) => {
    try {
      // Get user ID using same pattern as other endpoints
      const userId = ((req.user as any)?.claims || {})?.sub || req.user?.id;
      const success = await uploadService.deleteFile(req.params.objectPath, userId);

      if (success) {
        res.json({ message: "File deleted successfully" });
      } else {
        res.status(500).json({ error: "Failed to delete file" });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Error deleting file" });
    }
  });

  // Profile image upload endpoint
  app.put("/api/profile/image", isAuthenticated, async (req: any, res) => {
    console.log(`📸 [${isProduction ? 'PROD' : 'DEV'}] Profile image update request:`, req.body);
    
    if (!req.body.imageURL) {
      console.log("Missing imageURL in request body");
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = ((req.user as any)?.claims || {})?.sub;
    console.log(`👤 [${isProduction ? 'PROD' : 'DEV'}] User ID:`, userId);

    try {
      const objectStorageService = new ObjectStorageService();
      console.log(`📥 [${isProduction ? 'PROD' : 'DEV'}] Raw imageURL received:`, req.body.imageURL);
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public", // Make profile images public so they can be displayed without auth
        },
      );

      console.log(`📁 [${isProduction ? 'PROD' : 'DEV'}] Object path normalized:`, objectPath);

      // Convert to public profile image URL for faster access - IDENTICAL in both environments
      const imageId = objectPath.split('/').pop(); // Extract UUID from path
      const publicImageUrl = `/public/profile-images/${imageId}`;
      console.log(`🔗 [${isProduction ? 'PROD' : 'DEV'}] Public image URL:`, publicImageUrl);
      
      // Update user profile with public image URL
      const updatedUser = await storage.updateUser(userId, { profileImageUrl: publicImageUrl });
      console.log("User updated successfully with public image URL:", publicImageUrl);

      res.status(200).json({
        objectPath: publicImageUrl,
        user: updatedUser,
        message: "Profile image updated successfully"
      });
    } catch (error) {
      console.error("Error setting profile image:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error.message || "Failed to update profile image"
      });
    }
  });

  // Portfolio images upload endpoint for service providers
  app.put("/api/profile/portfolio", isAuthenticated, async (req: any, res) => {
    if (!req.body.imageURLs || !Array.isArray(req.body.imageURLs)) {
      return res.status(400).json({ error: "imageURLs array is required" });
    }

    const userId = ((req.user as any)?.claims || {})?.sub;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPaths = [];

      // Process each image URL
      for (const imageURL of req.body.imageURLs) {
        const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
          imageURL,
          {
            owner: userId,
            visibility: "public",
          },
        );
        objectPaths.push(objectPath);
      }

      // Update service provider portfolio with new image URLs
      const serviceProvider = await storage.getServiceProviderByUserId(userId);
      if (serviceProvider) {
        const existingImages = serviceProvider.portfolioImages || [];
        const updatedImages = [...existingImages, ...objectPaths];
        
        await storage.updateServiceProvider(serviceProvider.id, { 
          portfolioImages: updatedImages 
        });
      }

      res.status(200).json({
        objectPaths: objectPaths,
      });
    } catch (error) {
      console.error("Error adding portfolio images:", error);
      res.status(500).json({ error: "Internal server error", message: (error as Error).message });
    }
  });

  // Get service provider by user ID endpoint
  app.get("/api/service-providers/user/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const serviceProvider = await storage.getServiceProviderByUserId(userId);
      res.json(serviceProvider);
    } catch (error) {
      console.error("Error fetching service provider:", error);
      res.status(500).json({ error: "Failed to fetch service provider" });
    }
  });

  // Update service provider endpoint
  app.put("/api/service-providers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedProvider = await storage.updateServiceProvider(id, updateData);
      res.json(updatedProvider);
    } catch (error) {
      console.error("Error updating service provider:", error);
      res.status(500).json({ error: "Failed to update service provider" });
    }
  });

  // Special Admin-only endpoints - Restricted to katiflam1@gmail.com
  const isSuperAdmin: RequestHandler = async (req, res, next) => {
    // Check if user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user email from different auth types
    let userEmail = null;
    const user = req.user as any;
    if (user?.claims?.email) {
      // Replit Auth
      userEmail = user.claims.email;
    } else if (user?.email) {
      // Google/Email Auth
      userEmail = user.email;
    }
    
    console.log("Super admin check - User email:", userEmail);
    
    // Only allow katiflam1@gmail.com
    if (userEmail !== "katiflam1@gmail.com") {
      return res.status(403).json({ message: "Access denied - Super admin only" });
    }
    
    return next();
  };

  // Admin login with email and password
  app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    const adminEmail = "katiflam1@gmail.com";
    const adminPassword = "SuperAdmin2025!Secure#Platform";
    
    console.log("🔐 Admin login attempt:", { 
      email, 
      hasPassword: !!password,
      sessionId: req.sessionID,
      sessionData: req.session
    });
    
    if (email === adminEmail && password === adminPassword) {
      // Create a simple admin session
      (req.session as any).adminAuth = {
        email: adminEmail,
        isAdmin: true,
        loginTime: new Date().toISOString()
      };
      
      console.log("✅ Admin login successful, session data:", {
        sessionId: req.sessionID,
        adminAuth: ((req.session as any)?.adminAuth)
      });
      res.json({ success: true, message: "Admin login successful" });
    } else {
      console.log("❌ Admin login failed");
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Admin logout
  app.post('/api/admin/logout', async (req, res) => {
    (req.session as any).adminAuth = null;
    console.log("🔓 Admin logged out");
    res.json({ success: true, message: "Admin logged out" });
  });

  // Test session endpoint
  app.get('/api/admin/test-session', (req: any, res) => {
    console.log("🧪 Session test:", {
      sessionId: req.sessionID,
      hasSession: !!req.session,
      sessionData: req.session,
      adminAuth: req.session?.adminAuth,
      cookies: req.headers.cookie
    });
    res.json({
      sessionId: req.sessionID,
      hasSession: !!req.session,
      adminAuth: req.session?.adminAuth || null
    });
  });

  // Password check for admin panel (legacy support)
  app.post('/api/admin/verify-password', async (req, res) => {
    const { password } = req.body;
    const correctPassword = "SuperAdmin2025!Secure#Platform";
    
    if (password === correctPassword) {
      (req.session as any).adminAuth = {
        email: "katiflam1@gmail.com",
        isAdmin: true,
        loginTime: new Date().toISOString()
      };
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  // Get all users for admin panel
  app.get('/api/admin/users', async (req: any, res) => {
    console.log("🚨 ADMIN USERS ENDPOINT HIT!"); // Always log this
    try {
      console.log("🔍 Admin users request:", {
        sessionId: req.sessionID,
        adminAuth: req.session?.adminAuth,
        hasSession: !!req.session,
        cookies: req.headers.cookie,
        sessionData: req.session
      });
      
      // Check admin session first
      if (req.session?.adminAuth?.isAdmin && ((req.session as any)?.adminAuth)?.email === "katiflam1@gmail.com") {
        console.log("✅ Admin access via session auth");
        const users = await storage.getAllUsers();
        console.log("📊 Fetched users count:", users.length);
        return res.json(users);
      }
      
      // Fallback to regular authentication
      if (!req.isAuthenticated() || !req.user) {
        console.log("❌ No admin session and not authenticated");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get user email from different auth types
      let userEmail = null;
      if (((req.user as any)?.claims || {})?.email) {
        userEmail = ((req.user as any)?.claims || {}).email;
      } else if (req.user?.email) {
        userEmail = req.user.email;
      }
      
      console.log("🔍 Admin users request - User email:", userEmail);
      
      // Only allow katiflam1@gmail.com
      if (userEmail !== "katiflam1@gmail.com") {
        console.log("❌ Access denied - wrong email:", userEmail);
        return res.status(403).json({ message: "Access denied - Super admin only" });
      }
      
      console.log("✅ Admin access granted, fetching users...");
      const users = await storage.getAllUsers();
      console.log("📊 Fetched users count:", users.length);
      res.json(users);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get admin statistics
  app.get('/api/admin/stats', async (req, res) => {
    try {
      // Check admin session first
      if (((req.session as any)?.adminAuth)?.isAdmin && ((req.session as any)?.adminAuth)?.email === "katiflam1@gmail.com") {
        // Admin session is valid, proceed
      } else if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        // Check regular authentication
        let userEmail = null;
        if (((req.user as any)?.claims || {})?.email) {
          userEmail = ((req.user as any)?.claims || {}).email;
        } else if (req.user?.email) {
          userEmail = req.user.email;
        }
        
        // Only allow katiflam1@gmail.com
        if (userEmail !== "katiflam1@gmail.com") {
          return res.status(403).json({ message: "Access denied - Super admin only" });
        }
      }
      
      const [users, providers, bookings, categories] = await Promise.all([
        storage.getAllUsers(),
        storage.getServiceProviders(),
        storage.getAllBookings(),
        storage.getServiceCategories()
      ]);

      const stats = {
        totalUsers: users.length,
        totalProviders: providers.length,
        totalBookings: bookings.length,
        totalCategories: categories.length,
        activeUsers: users.filter(u => u.isActive).length,
        verifiedProviders: providers.filter(p => {
          const user = users.find(u => u.id === p.userId);
          return user?.isVerified;
        }).length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Update any user (super admin only)
  app.put('/api/admin/users/:userId', async (req, res) => {
    try {
      // Check admin session first
      if (((req.session as any)?.adminAuth)?.isAdmin && ((req.session as any)?.adminAuth)?.email === "katiflam1@gmail.com") {
        // Admin session is valid, proceed
      } else if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        // Check regular authentication
        let userEmail = null;
        if (((req.user as any)?.claims || {})?.email) {
          userEmail = ((req.user as any)?.claims || {}).email;
        } else if (req.user?.email) {
          userEmail = req.user.email;
        }
        
        // Only allow katiflam1@gmail.com
        if (userEmail !== "katiflam1@gmail.com") {
          return res.status(403).json({ message: "Access denied - Super admin only" });
        }
      }
      
      const { userId } = req.params;
      const updates = req.body.updates || req.body;
      
      console.log("Updating user:", userId, "with:", updates);
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete any user (super admin only)
  app.delete('/api/admin/users/:userId', async (req, res) => {
    try {
      let currentUserEmail = "katiflam1@gmail.com"; // Default for session auth
      
      // Check admin session first
      if (((req.session as any)?.adminAuth)?.isAdmin && ((req.session as any)?.adminAuth)?.email === "katiflam1@gmail.com") {
        // Admin session is valid, proceed
      } else if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        // Check regular authentication
        if (((req.user as any)?.claims || {})?.email) {
          currentUserEmail = ((req.user as any)?.claims || {}).email;
        } else if (req.user?.email) {
          currentUserEmail = req.user.email;
        }
        
        // Only allow katiflam1@gmail.com
        if (currentUserEmail !== "katiflam1@gmail.com") {
          return res.status(403).json({ message: "Access denied - Super admin only" });
        }
      }
      
      const { userId } = req.params;
      
      // Prevent super admin from deleting themselves
      const userToDelete = await storage.getUser(userId);
      if (userToDelete?.email === currentUserEmail) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      console.log("Deleting user:", userId);
      
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Add new admin (super admin only)
  app.post('/api/admin/add-admin', isSuperAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found with this email' });
      }
      
      // Update user role to admin
      const updatedUser = await storage.updateUser(user.id, { 
        role: 'admin',
        accountType: 'admin'
      });
      
      res.json({ 
        message: 'Admin added successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error("Error adding admin:", error);
      res.status(500).json({ message: "Failed to add admin" });
    }
  });

  // Create new service category (super admin only)
  app.post('/api/admin/categories', isSuperAdmin, async (req, res) => {
    try {
      const categoryData = req.body;
      
      if (!categoryData.name || !categoryData.icon || !categoryData.color) {
        return res.status(400).json({ message: 'Name, icon, and color are required' });
      }
      
      const newCategory = await storage.createServiceCategory(categoryData);
      
      res.json({ 
        message: 'Category created successfully',
        category: newCategory
      });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update service category (super admin only)
  app.put('/api/admin/categories/:categoryId', isSuperAdmin, async (req, res) => {
    try {
      const { categoryId } = req.params;
      const updateData = req.body;
      
      const updatedCategory = await storage.updateServiceCategory(categoryId, updateData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete service category (super admin only)
  app.delete('/api/admin/categories/:categoryId', isSuperAdmin, async (req, res) => {
    try {
      const { categoryId } = req.params;
      
      const deleted = await storage.deleteServiceCategory(categoryId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Portfolio Gallery routes
  app.get('/api/portfolios/:providerId/galleries', async (req, res) => {
    try {
      const { providerId } = req.params;
      console.log(`=== FETCHING GALLERIES FOR PROVIDER: ${providerId} ===`);
      
      const galleries = await storage.getPortfolioGalleriesByProvider(providerId);
      console.log(`Found ${galleries.length} galleries:`, galleries.map(g => ({ id: g.id, title: g.title, category: g.category })));
      
      // Get images for each gallery
      const galleriesWithImages = await Promise.all(
        galleries.map(async (gallery) => {
          const images = await storage.getPortfolioImagesByGallery(gallery.id);
          console.log(`Gallery ${gallery.id} (${gallery.title}) has ${images.length} images:`, 
            images.map(img => ({ id: img.id, objectPath: img.objectPath })));
          return { ...gallery, images };
        })
      );
      
      console.log(`=== RETURNING ${galleriesWithImages.length} GALLERIES WITH IMAGES ===`);
      res.json(galleriesWithImages);
    } catch (error) {
      console.error("Error fetching portfolio galleries:", error);
      res.status(500).json({ message: "Failed to fetch portfolio galleries" });
    }
  });

  // OLD: Conflicting route removed - now handled by modern portfolio API

  app.post('/api/portfolios/galleries', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get user's service provider profile
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "User is not a service provider" });
      }

      const galleryData = {
        ...req.body,
        providerId: provider.id,
      };

      const newGallery = await storage.createPortfolioGallery(galleryData);
      res.json(newGallery);
    } catch (error) {
      console.error("Error creating portfolio gallery:", error);
      res.status(500).json({ message: "Failed to create portfolio gallery" });
    }
  });

  app.put('/api/portfolios/galleries/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      
      // Verify ownership (get gallery and check provider belongs to user)
      const provider = await storage.getServiceProviderByUserId(userId!);
      if (!provider) {
        return res.status(403).json({ message: "User is not a service provider" });
      }

      const updatedGallery = await storage.updatePortfolioGallery(id, req.body);
      if (!updatedGallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      res.json(updatedGallery);
    } catch (error) {
      console.error("Error updating portfolio gallery:", error);
      res.status(500).json({ message: "Failed to update portfolio gallery" });
    }
  });

  app.delete('/api/portfolios/galleries/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      
      // Verify ownership
      const provider = await storage.getServiceProviderByUserId(userId!);
      if (!provider) {
        return res.status(403).json({ message: "User is not a service provider" });
      }

      const deleted = await storage.deletePortfolioGallery(id);
      if (!deleted) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      res.json({ message: "Gallery deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio gallery:", error);
      res.status(500).json({ message: "Failed to delete portfolio gallery" });
    }
  });

  // Portfolio Image routes
  app.post('/api/portfolios/images/upload', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get user's service provider profile, or create one if doesn't exist
      let provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        // Auto-create a basic service provider profile for portfolio uploads
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Get a default category (first available category)
        const categories = await storage.getServiceCategories();
        const defaultCategory = categories[0];
        
        if (!defaultCategory) {
          return res.status(500).json({ message: "No service categories available" });
        }

        // Create basic service provider profile
        provider = await storage.createServiceProvider({
          userId: userId,
          businessName: `${user.firstName || 'Professional'} ${user.lastName || 'Services'}`.trim() || 'Professional Services',
          description: 'Professional service provider',
          categoryId: defaultCategory.id,
          hourlyRate: '50.00', // Default rate
          experienceYears: 1,
          location: user.wilaya || 'Algeria',
          services: ['General Services'],
        });

        console.log(`Auto-created service provider profile for user ${userId}`);
      }

      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.post('/api/portfolios/images', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get user's service provider profile, or create one if doesn't exist
      let provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        // Auto-create a basic service provider profile for portfolio uploads
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Get a default category (first available category)
        const categories = await storage.getServiceCategories();
        const defaultCategory = categories[0];
        
        if (!defaultCategory) {
          return res.status(500).json({ message: "No service categories available" });
        }

        // Create basic service provider profile
        provider = await storage.createServiceProvider({
          userId: userId,
          businessName: `${user.firstName || 'Professional'} ${user.lastName || 'Services'}`.trim() || 'Professional Services',
          description: 'Professional service provider',
          categoryId: defaultCategory.id,
          hourlyRate: '50.00', // Default rate
          experienceYears: 1,
          location: user.wilaya || 'Algeria',
          services: ['General Services'],
        });

        console.log(`Auto-created service provider profile for user ${userId}`);
      }

      const images = Array.isArray(req.body) ? req.body : [req.body];
      
      // Ensure galleries exist or create them
      const galleryIds = [...new Set(images.map(img => img.galleryId))];
      for (const galleryId of galleryIds) {
        const existingGallery = await storage.getPortfolioGallery(galleryId);
        if (!existingGallery) {
          // Create default gallery based on galleryId
          const galleryTitle = getGalleryTitleFromId(galleryId);
          const category = getCategoryFromGalleryId(galleryId);
          
          await storage.createPortfolioGallery({
            id: galleryId, // Use the provided ID
            providerId: provider.id,
            title: galleryTitle,
            description: `${galleryTitle} portfolio images`,
            category: category,
            isActive: true,
            sortOrder: 0,
          });
        }
      }
      
      const imageData = images.map(img => ({
        ...img,
        providerId: provider.id,
      }));

      // Process object storage paths
      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      
      const processedImages = await Promise.all(
        imageData.map(async (img) => {
          const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
            img.imageUrl,
            {
              owner: userId,
              visibility: "public", // Portfolio images are public
            }
          );
          
          return {
            ...img,
            objectPath,
          };
        })
      );

      const newImages = await storage.createPortfolioImages(processedImages);
      res.json(newImages);
    } catch (error) {
      console.error("Error creating portfolio images:", error);
      res.status(500).json({ message: "Failed to create portfolio images" });
    }
  });

  app.put('/api/portfolios/images/:id/primary', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      const { galleryId } = req.body;
      
      // Verify ownership
      const provider = await storage.getServiceProviderByUserId(userId!);
      if (!provider) {
        return res.status(403).json({ message: "User is not a service provider" });
      }

      const updated = await storage.setPortfolioImageAsPrimary(galleryId, id);
      if (!updated) {
        return res.status(404).json({ message: "Image not found" });
      }

      res.json({ message: "Primary image updated successfully" });
    } catch (error) {
      console.error("Error updating primary image:", error);
      res.status(500).json({ message: "Failed to update primary image" });
    }
  });

  // Update portfolio image metadata
  app.put('/api/portfolios/images/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      const { description, alt, isPrimary } = req.body;
      
      // Verify ownership
      const provider = await storage.getServiceProviderByUserId(userId!);
      if (!provider) {
        return res.status(403).json({ message: "User is not a service provider" });
      }

      const updated = await storage.updatePortfolioImage(id, {
        description,
        alt,
        isPrimary
      });
      
      if (!updated) {
        return res.status(404).json({ message: "Image not found" });
      }

      res.json({ message: "Image updated successfully", image: updated });
    } catch (error) {
      console.error("Error updating portfolio image:", error);
      res.status(500).json({ message: "Failed to update portfolio image" });
    }
  });

  app.delete('/api/portfolios/images/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { id } = req.params;
      
      // Verify ownership
      const provider = await storage.getServiceProviderByUserId(userId!);
      if (!provider) {
        return res.status(403).json({ message: "User is not a service provider" });
      }

      const deleted = await storage.deletePortfolioImage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Image not found" });
      }

      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio image:", error);
      res.status(500).json({ message: "Failed to delete portfolio image" });
    }
  });

  // Clean up orphaned/non-working portfolio images
  app.delete('/api/portfolios/cleanup-images', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get all modern portfolio galleries for the user
      const galleries = await storage.getModernPortfolioGalleries(userId);
      let deletedCount = 0;
      
      for (const gallery of galleries) {
        const images = gallery.images || [];
        for (const image of images) {
          try {
            // Test if the image URL is accessible
            const response = await fetch(image.url, { method: 'HEAD' });
            if (!response.ok) {
              // Image is not accessible, remove it from the gallery
              await storage.deleteModernPortfolioImage(gallery.id, image.id);
              deletedCount++;
              console.log(`Deleted non-working image: ${image.id} from gallery ${gallery.id}`);
            }
          } catch (error) {
            // Image is not accessible, remove it from the gallery
            await storage.deleteModernPortfolioImage(gallery.id, image.id);
            deletedCount++;
            console.log(`Deleted inaccessible image: ${image.id} from gallery ${gallery.id}`);
          }
        }
      }

      res.json({ message: `Cleaned up ${deletedCount} non-working images` });
    } catch (error) {
      console.error("Error cleaning up portfolio images:", error);
      res.status(500).json({ message: "Failed to clean up portfolio images" });
    }
  });

  // ===============================
  // NEW MODERN PORTFOLIO API ROUTES  
  // ===============================
  
  // Add image to modern portfolio gallery
  app.post('/api/portfolios/modern-images', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      const { galleryId, objectPath, filename, description, imageType } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Set ACL policy for the uploaded object
      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      
      const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
        objectPath,
        {
          owner: userId,
          visibility: 'public',
          aclRules: []
        }
      );

      // Add image to the gallery
      const imageData = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageUrl: normalizedPath,
        objectPath: normalizedPath,
        title: filename,
        description: description || '',
        imageType: imageType || 'work_sample',
        isPrimary: false,
        sortOrder: 0
      };

      await storage.addImageToModernPortfolioGallery(galleryId, imageData);
      
      res.json({ 
        message: "Image added successfully", 
        image: imageData 
      });
    } catch (error) {
      console.error("Error adding image to modern portfolio:", error);
      res.status(500).json({ message: "Failed to add image to portfolio" });
    }
  });

  // Update modern portfolio image
  app.put('/api/portfolios/images/:imageId', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      const { imageId } = req.params;
      const { description } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const updated = await storage.updateModernPortfolioImage(imageId, { description });
      
      if (!updated) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.json({ message: "Image updated successfully" });
    } catch (error) {
      console.error("Error updating modern portfolio image:", error);
      res.status(500).json({ message: "Failed to update image" });
    }
  });

  // Delete all portfolio images for user (must come before specific image delete)
  app.delete('/api/portfolios/images/all', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      
      // Delete all portfolio images for this user
      await storage.deleteAllPortfolioImages(userId);
      
      res.json({ 
        message: "All portfolio images deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting all portfolio images:", error);
      res.status(500).json({ message: "Failed to delete portfolio images" });
    }
  });

  // Delete modern portfolio image
  app.delete('/api/portfolios/images/:imageId', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      const { imageId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const deleted = await storage.deleteModernPortfolioImageById(imageId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting modern portfolio image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Get galleries for current user (using existing auth middleware)
  app.get('/api/portfolios/galleries/:userId?', isAnyAuthenticated, async (req: any, res) => {
    try {
      console.log("📂 Portfolio galleries request with auth middleware");
      
      // Get user ID using same pattern as other endpoints
      const userId = ((req.user as any)?.claims || {})?.sub || req.user?.id;
      const requestedUserId = req.params.userId || userId;
      
      console.log("✅ Authenticated user:", userId, "requesting data for:", requestedUserId);
      
      // Get galleries from storage - if none exist, create default galleries
      let galleries = await storage.getModernPortfolioGalleries(requestedUserId);
      
      if (!galleries || galleries.length === 0) {
        console.log("Creating default galleries for user:", requestedUserId);
        // Create default galleries
        const defaultGalleries = [
          {
            id: `${Date.now()}-featured-${Math.random().toString(36).substr(2, 9)}`,
            title: 'Featured Work',
            category: 'featured',
            userId: requestedUserId,
            images: [],
            serviceType: '',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: `${Date.now()}-before-after-${Math.random().toString(36).substr(2, 9)}`,
            title: 'Before & After',
            category: 'before_after',
            userId: requestedUserId,
            images: [],
            serviceType: '',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: `${Date.now()}-work-samples-${Math.random().toString(36).substr(2, 9)}`,
            title: 'Work Samples',
            category: 'work_samples',
            userId: requestedUserId,
            images: [],
            serviceType: '',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: `${Date.now()}-tools-equipment-${Math.random().toString(36).substr(2, 9)}`,
            title: 'Tools & Equipment',
            category: 'equipment',
            userId: requestedUserId,
            images: [],
            serviceType: '',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: `${Date.now()}-certifications-${Math.random().toString(36).substr(2, 9)}`,
            title: 'Certifications',
            category: 'certifications',
            userId: requestedUserId,
            images: [],
            serviceType: '',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        // Store default galleries
        for (const gallery of defaultGalleries) {
          await storage.createModernPortfolioGallery(gallery);
        }
        
        galleries = defaultGalleries;
      }
      
      console.log(`📊 Returning ${galleries.length} galleries for user ${requestedUserId}`);
      res.json(galleries);
    } catch (error) {
      console.error("Error fetching modern portfolio galleries:", error);
      res.status(500).json({ message: "Failed to fetch galleries" });
    }
  });

  // Get modern portfolio images for current user
  app.get('/api/portfolios/modern-images', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const images = await storage.getModernPortfolioImages(userId);
      res.json(images || []);
    } catch (error) {
      console.error("Error fetching modern portfolio images:", error);
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });

  // Create a new gallery
  app.post('/api/portfolios/galleries', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { title, category, serviceType, isPublic } = req.body;
      
      // Generate a unique ID
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newGallery = {
        id,
        title,
        category: category || 'work_samples',
        images: [],
        serviceType: serviceType || '',
        isPublic: isPublic !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.json(newGallery);
    } catch (error) {
      console.error("Error creating gallery:", error);
      res.status(500).json({ message: "Failed to create gallery" });
    }
  });

  // Upload images to a gallery - handles post-upload metadata from object storage
  app.post('/api/portfolios/galleries/:galleryId/images', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      const { galleryId } = req.params;
      const images = req.body; // Array of image metadata from the upload
      
      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: "No image data provided" });
      }
      
      const processedImages = [];
      
      for (const imageData of images) {
        const imageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Process the URL to convert from object storage URL to serving URL
        const objectStorageService = new ObjectStorageService();
        
        // Set ACL policy for the uploaded image
        console.log(`🔐 Setting ACL policy for image: ${imageData.imageUrl || imageData.url}`);
        const servingUrl = await objectStorageService.trySetObjectEntityAclPolicy(
          imageData.imageUrl || imageData.url,
          {
            owner: userId,
            visibility: "public", // Portfolio images are public
            aclRules: [] // No additional rules needed for public images
          }
        );
        
        const processedImage: any = {
          id: imageId,
          url: servingUrl,
          thumbnailUrl: servingUrl, // Use same URL for thumbnail for now
          alt: imageData.title || imageData.alt || 'Portfolio image',
          isPrimary: imageData.isPrimary || processedImages.length === 0,
          metadata: {
            filename: imageData.title || 'image',
            imageType: imageData.imageType || 'work_sample',
            description: imageData.description || '',
            isPublic: imageData.isPublic !== false
          },
          uploadedAt: new Date().toISOString()
        };
        
        processedImages.push(processedImage);
      }
      
      // Add images to the gallery
      await storage.addImagesToModernPortfolioGallery(userId, galleryId, processedImages);
      
      res.json({ 
        message: "Images processed successfully",
        images: processedImages 
      });
    } catch (error) {
      console.error("Error processing uploaded images:", error);
      res.status(500).json({ message: "Failed to process uploaded images" });
    }
  });

  // Delete a gallery
  app.delete('/api/portfolios/galleries/:galleryId', isReplitAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { galleryId } = req.params;
      
      res.json({ message: "Gallery deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery:", error);
      res.status(500).json({ message: "Failed to delete gallery" });
    }
  });



  // Fix ACL policies for existing images
  app.post('/api/portfolios/fix-acl', isReplitAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      
      const galleries = await storage.getModernPortfolioGalleries(userId);
      let fixedCount = 0;
      
      for (const gallery of galleries) {
        const images = gallery.images || [];
        for (const image of images) {
          try {
            // Only process images with object paths (not signed URLs)
            if (image.objectPath && image.objectPath.startsWith('/objects/')) {
              await objectStorageService.trySetObjectEntityAclPolicy(
                image.objectPath,
                {
                  owner: userId,
                  visibility: 'public',
                  aclRules: []
                }
              );
              fixedCount++;
              console.log(`Set ACL policy for image: ${image.id}`);
            }
          } catch (error) {
            console.log(`Failed to set ACL for image ${image.id}: ${error.message}`);
          }
        }
      }
      
      res.json({ 
        message: `Fixed ACL policies for ${fixedCount} images`,
        fixedCount 
      });
    } catch (error) {
      console.error("Error fixing ACL policies:", error);
      res.status(500).json({ message: "Failed to fix ACL policies" });
    }
  });

  // Serve protected objects with ACL policy checking
  app.get('/objects/:objectPath(*)', isReplitAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub;
      const { ObjectStorageService, ObjectNotFoundError } = await import('./objectStorage');
      const { ObjectPermission } = await import('./objectAcl');
      
      const objectStorageService = new ObjectStorageService();
      
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(req.path);
        const canAccess = await objectStorageService.canAccessObjectEntity({
          objectFile,
          userId: userId,
          requestedPermission: ObjectPermission.READ,
        });
        
        if (!canAccess) {
          return res.sendStatus(401);
        }
        
        objectStorageService.downloadObject(objectFile, res);
      } catch (error) {
        console.error("Error checking object access:", error);
        if (error instanceof ObjectNotFoundError) {
          return res.sendStatus(404);
        }
        return res.sendStatus(500);
      }
    } catch (error) {
      console.error("Error serving protected object:", error);
      return res.sendStatus(500);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
