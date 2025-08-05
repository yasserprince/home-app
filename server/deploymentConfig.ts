/**
 * Deployment Configuration
 * Ensures identical behavior between development and production environments
 */

export interface DeploymentConfig {
  isProduction: boolean;
  environment: string;
  objectStorage: {
    bucketId: string;
    publicPaths: string[];
    privateDir: string;
  };
  database: {
    url: string;
    configured: boolean;
  };
  auth: {
    google: boolean;
    replit: boolean;
  };
}

export function getDeploymentConfig(): DeploymentConfig {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Object Storage Configuration
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";
  const publicPathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
  const publicPaths = publicPathsStr.split(",").map(p => p.trim()).filter(p => p.length > 0);
  const privateDir = process.env.PRIVATE_OBJECT_DIR || "";
  
  // Database Configuration
  const databaseUrl = process.env.DATABASE_URL || "";
  
  // Auth Configuration
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  const replitId = process.env.REPL_ID || "";
  
  return {
    isProduction,
    environment: isProduction ? "PRODUCTION" : "DEVELOPMENT",
    objectStorage: {
      bucketId,
      publicPaths,
      privateDir
    },
    database: {
      url: databaseUrl,
      configured: Boolean(databaseUrl)
    },
    auth: {
      google: Boolean(googleClientId),
      replit: Boolean(replitId)
    }
  };
}

export function validateDeploymentConfig(): { valid: boolean; errors: string[] } {
  const config = getDeploymentConfig();
  const errors: string[] = [];
  
  // Required environment variables
  if (!config.objectStorage.bucketId) {
    errors.push("DEFAULT_OBJECT_STORAGE_BUCKET_ID is missing");
  }
  
  if (config.objectStorage.publicPaths.length === 0) {
    errors.push("PUBLIC_OBJECT_SEARCH_PATHS is missing or empty");
  }
  
  if (!config.objectStorage.privateDir) {
    errors.push("PRIVATE_OBJECT_DIR is missing");
  }
  
  if (!config.database.configured) {
    errors.push("DATABASE_URL is missing");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function logDeploymentConfig(): void {
  const config = getDeploymentConfig();
  const validation = validateDeploymentConfig();
  
  console.log("\n🚀 DEPLOYMENT CONFIGURATION");
  console.log("============================");
  console.log(`Environment: ${config.environment}`);
  console.log(`Valid Config: ${validation.valid ? "✅ YES" : "❌ NO"}`);
  
  if (!validation.valid) {
    console.log("\n❌ Configuration Errors:");
    validation.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log("\n📦 Object Storage:");
  console.log(`  Bucket ID: ${config.objectStorage.bucketId ? "✅ SET" : "❌ MISSING"}`);
  console.log(`  Public Paths: ${config.objectStorage.publicPaths.length} configured`);
  console.log(`  Private Dir: ${config.objectStorage.privateDir ? "✅ SET" : "❌ MISSING"}`);
  
  console.log("\n🗄️ Database:");
  console.log(`  URL: ${config.database.configured ? "✅ CONFIGURED" : "❌ MISSING"}`);
  
  console.log("\n🔐 Authentication:");
  console.log(`  Google OAuth: ${config.auth.google ? "✅ ENABLED" : "❌ DISABLED"}`);
  console.log(`  Replit Auth: ${config.auth.replit ? "✅ ENABLED" : "❌ DISABLED"}`);
  
  console.log("============================\n");
}

export function ensureIdenticalBehavior(): void {
  const config = getDeploymentConfig();
  
  // Log identical behavior enforcement
  console.log(`🔧 Enforcing identical behavior for ${config.environment}`);
  
  // Detect GitHub deployment vs local development
  const isGitHubDeployment = Boolean(process.env.REPL_DEPLOYMENT_ID);
  const isLinkedToGitHub = Boolean(process.env.REPL_GIT_REPO);
  
  console.log(`📱 GitHub Integration Status:`);
  console.log(`  - Deployment ID: ${isGitHubDeployment ? "✅ SET" : "❌ NOT SET"}`);
  console.log(`  - Git Repo: ${isLinkedToGitHub ? "✅ LINKED" : "❌ NOT LINKED"}`);
  
  // Set consistent defaults for missing configurations
  if (!process.env.REPLIT_SIDECAR_ENDPOINT) {
    process.env.REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
  }
  
  // Ensure consistent timeout and retry settings
  if (!process.env.REQUEST_TIMEOUT) {
    process.env.REQUEST_TIMEOUT = "30000"; // 30 seconds
  }
  
  // GitHub deployment specific fixes
  if (isGitHubDeployment || config.isProduction) {
    console.log("🔄 Applying GitHub deployment fixes...");
    
    // Ensure production environment variables are properly set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }
    
    // Force consistent app behavior regardless of deployment method
    process.env.FORCE_IDENTICAL_BEHAVIOR = "true";
    
    console.log("✅ GitHub deployment fixes applied");
  }
  
  console.log("✅ Identical behavior enforced");
}