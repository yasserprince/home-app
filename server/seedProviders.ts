import { storage } from "./storage";
import type { InsertServiceProvider, UpsertUser } from "@shared/schema";

export async function seedServiceProviders() {
  console.log("Starting service providers seeding...");

  try {
    // First, create sample service provider users
    const sampleProviders = [
      {
        email: "ahmed.electrician@example.com",
        firstName: "Ahmed",
        lastName: "Ben Ali",
        role: "service_provider" as const,
        phone: "+213-555-0101",
        city: "Algiers",
        wilaya: "16", // Algiers
        isServiceProvider: true,
        yearsExperience: 8,
        hourlyRate: "75.00",
        skills: ["Electrical Wiring", "Lighting Installation", "Panel Upgrades"],
        languages: ["Arabic", "French", "English"],
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      {
        email: "mohamed.plumber@example.com", 
        firstName: "Mohamed",
        lastName: "Benali",
        role: "service_provider" as const,
        phone: "+213-555-0102",
        city: "Oran",
        wilaya: "31", // Oran
        isServiceProvider: true,
        yearsExperience: 12,
        hourlyRate: "85.00",
        skills: ["Pipe Repair", "Drain Cleaning", "Water Heater Installation"],
        languages: ["Arabic", "French"],
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      {
        email: "fatima.cleaner@example.com",
        firstName: "Fatima",
        lastName: "Khadija",
        role: "service_provider" as const,
        phone: "+213-555-0103", 
        city: "Constantine",
        wilaya: "25", // Constantine
        isServiceProvider: true,
        yearsExperience: 5,
        hourlyRate: "45.00",
        skills: ["Deep Cleaning", "Window Cleaning", "Carpet Cleaning"],
        languages: ["Arabic", "French"],
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      {
        email: "youssef.handyman@example.com",
        firstName: "Youssef",
        lastName: "Madani",
        role: "service_provider" as const,
        phone: "+213-555-0104",
        city: "Algiers",
        wilaya: "16", // Algiers  
        isServiceProvider: true,
        yearsExperience: 15,
        hourlyRate: "65.00",
        skills: ["Furniture Assembly", "Wall Mounting", "Basic Repairs"],
        languages: ["Arabic", "French", "English"],
        profileImageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
      }
    ];

    // Create the users first
    const createdUsers = [];
    for (const providerData of sampleProviders) {
      try {
        const user = await storage.upsertUser(providerData);
        createdUsers.push(user);
        console.log(`Created provider user: ${user.firstName} ${user.lastName}`);
      } catch (error) {
        console.log(`User ${providerData.email} already exists, skipping...`);
        const existingUser = await storage.getUserByEmail(providerData.email);
        if (existingUser) {
          createdUsers.push(existingUser);
        }
      }
    }

    // Get service categories to link providers
    const categories = await storage.getAllServiceCategories();
    
    // Create service provider profiles
    const providerProfiles = [
      {
        userId: createdUsers[0]?.id, // Ahmed - Electrician
        businessName: "Ahmed Electrical Services",
        description: "Professional electrical services with 8+ years experience. Licensed and insured.",
        categoryId: categories.find(c => c.name.toLowerCase().includes('electrical'))?.id || categories[0]?.id,
        hourlyRate: "75.00",
        experienceYears: 8,
        location: "Algiers, Algeria",
        services: ["Electrical Wiring", "Lighting Installation", "Panel Upgrades", "Emergency Repairs"],
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        isAvailable: true,
        rating: "4.8",
        reviewCount: 47
      },
      {
        userId: createdUsers[1]?.id, // Mohamed - Plumber
        businessName: "Mohamed Plumbing Solutions", 
        description: "Expert plumbing services for residential and commercial properties. 24/7 emergency service.",
        categoryId: categories.find(c => c.name.toLowerCase().includes('plumbing'))?.id || categories[1]?.id,
        hourlyRate: "85.00",
        experienceYears: 12,
        location: "Oran, Algeria",
        services: ["Pipe Repair", "Drain Cleaning", "Water Heater Installation", "Leak Detection"],
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        isAvailable: true,
        rating: "4.9",
        reviewCount: 83
      },
      {
        userId: createdUsers[2]?.id, // Fatima - Cleaning
        businessName: "Fatima Professional Cleaning",
        description: "Thorough and reliable cleaning services for homes and offices. Eco-friendly products used.",
        categoryId: categories.find(c => c.name.toLowerCase().includes('cleaning'))?.id || categories[2]?.id,
        hourlyRate: "45.00", 
        experienceYears: 5,
        location: "Constantine, Algeria",
        services: ["Deep Cleaning", "Window Cleaning", "Carpet Cleaning", "Move-in/Move-out Cleaning"],
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        isAvailable: true,
        rating: "4.7",
        reviewCount: 31
      },
      {
        userId: createdUsers[3]?.id, // Youssef - Handyman
        businessName: "Youssef General Services",
        description: "Experienced handyman for all your home repair and maintenance needs. No job too small!",
        categoryId: categories.find(c => c.name.toLowerCase().includes('handyman') || c.name.toLowerCase().includes('maintenance'))?.id || categories[3]?.id,
        hourlyRate: "65.00",
        experienceYears: 15,
        location: "Algiers, Algeria", 
        services: ["Furniture Assembly", "Wall Mounting", "Basic Repairs", "Home Maintenance"],
        profileImageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
        isAvailable: true,
        rating: "4.6",
        reviewCount: 62
      }
    ];

    // Create service provider profiles
    for (const providerProfile of providerProfiles) {
      if (providerProfile.userId && providerProfile.categoryId) {
        try {
          const provider = await storage.createServiceProvider(providerProfile as InsertServiceProvider);
          console.log(`Created service provider: ${provider.businessName}`);
        } catch (error) {
          console.log(`Provider ${providerProfile.businessName} might already exist, skipping...`);
        }
      }
    }

    console.log("Service providers seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding service providers:", error);
    throw error;
  }
}