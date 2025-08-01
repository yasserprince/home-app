import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import express from "express";
import { insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

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
  // Auth middleware
  await setupAuth(app);
  
  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Verification endpoints
  app.post('/api/verification/email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin middleware
  const isAdmin: RequestHandler = async (req: any, res, next) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Failed to verify admin status" });
    }
  };

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
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
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Profile update endpoint
  app.put('/api/profile', isAuthenticated, upload.single('profileImage'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  // Bookings
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
            color: "hsl(207, 90%, 54%)",
          },
          {
            name: "Electrical",
            description: "Wiring, panel upgrades, lighting installation",
            icon: "zap",
            color: "hsl(39, 96%, 49%)",
          },
          {
            name: "HVAC",
            description: "Heating, cooling & air conditioning repair",
            icon: "thermometer",
            color: "hsl(200, 70%, 45%)",
          },
          // Home Improvement & Construction
          {
            name: "Handyman",
            description: "General repairs, furniture assembly, minor fixes",
            icon: "hammer",
            color: "hsl(25, 85%, 55%)",
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

  const httpServer = createServer(app);
  return httpServer;
}
