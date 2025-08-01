import type { Express } from "express";
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
        radius ? parseInt(radius as string) : undefined
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

  // Initialize sample data
  app.post('/api/init-data', async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      if (categories.length === 0) {
        // Create sample categories
        const sampleCategories = [
          {
            name: "Plumbing",
            description: "Leak repair, drain cleaning, water heater",
            icon: "fas fa-faucet",
            color: "hsl(207, 90%, 54%)",
          },
          {
            name: "Electrical",
            description: "Wiring, panel upgrades, lighting",
            icon: "fas fa-bolt",
            color: "hsl(39, 96%, 49%)",
          },
          {
            name: "HVAC",
            description: "Heating, cooling & air conditioning",
            icon: "fas fa-thermometer-half",
            color: "hsl(200, 70%, 45%)",
          },
          {
            name: "Cleaning",
            description: "House cleaning & sanitization",
            icon: "fas fa-broom",
            color: "hsl(271, 81%, 56%)",
          },
          {
            name: "Handyman",
            description: "General repairs & maintenance",
            icon: "fas fa-hammer",
            color: "hsl(25, 85%, 55%)",
          },
          {
            name: "Landscaping",
            description: "Lawn care & garden design",
            icon: "fas fa-seedling",
            color: "hsl(150, 70%, 40%)",
          },
          {
            name: "Pest Control",
            description: "Insect & rodent removal",
            icon: "fas fa-bug",
            color: "hsl(350, 70%, 50%)",
          },
          {
            name: "Appliance Repair",
            description: "Washer, dryer & kitchen appliances",
            icon: "fas fa-cog",
            color: "hsl(220, 60%, 50%)",
          },
          {
            name: "Roofing",
            description: "Roof repair & installation",
            icon: "fas fa-home",
            color: "hsl(15, 75%, 45%)",
          },
          {
            name: "Painting",
            description: "Interior & exterior painting",
            icon: "fas fa-paint-roller",
            color: "hsl(300, 70%, 55%)",
          },
          {
            name: "Flooring",
            description: "Installation & refinishing",
            icon: "fas fa-th-large",
            color: "hsl(35, 65%, 50%)",
          },
          {
            name: "Security",
            description: "Security systems & smart home",
            icon: "fas fa-shield-alt",
            color: "hsl(240, 70%, 50%)",
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

  const httpServer = createServer(app);
  return httpServer;
}
