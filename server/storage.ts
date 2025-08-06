import {
  users,
  serviceCategories,
  serviceProviders,
  bookings,
  reviews,
  portfolioGalleries,
  portfolioImages,
  type User,
  type UpsertUser,
  type ServiceCategory,
  type InsertServiceCategory,
  type ServiceProvider,
  type InsertServiceProvider,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type PortfolioGallery,
  type InsertPortfolioGallery,
  type PortfolioImage,
  type InsertPortfolioImage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql, or, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  updateUserStatus(userId: string, isActive: boolean): Promise<User>;
  deleteUser(userId: string): Promise<boolean>;
  getAllBookings(): Promise<Booking[]>;
  
  // Service Category operations
  getAllServiceCategories(): Promise<ServiceCategory[]>;
  getPopularServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategoriesByGroup(group: string): Promise<ServiceCategory[]>;
  getServiceCategories(): Promise<ServiceCategory[]>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  updateServiceCategory(id: string, categoryData: Partial<ServiceCategory>): Promise<ServiceCategory | undefined>;
  deleteServiceCategory(id: string): Promise<boolean>;
  
  // Service Provider operations
  getServiceProviders(categoryId?: string, search?: string, userLat?: number, userLng?: number, radius?: number): Promise<(ServiceProvider & { user: User; category: ServiceCategory })[]>;
  getServiceProviderById(id: string): Promise<(ServiceProvider & { user: User; category: ServiceCategory }) | undefined>;
  getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  updateServiceProvider(id: string, providerData: Partial<ServiceProvider>): Promise<ServiceProvider>;
  updateServiceProviderRating(providerId: string): Promise<void>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<(Booking & { provider: ServiceProvider & { user: User } })[]>;
  getBookingById(id: string): Promise<(Booking & { provider: ServiceProvider & { user: User }; user: User }) | undefined>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getProviderReviews(providerId: string): Promise<(Review & { user: User })[]>;

  // Portfolio Gallery operations
  createPortfolioGallery(gallery: InsertPortfolioGallery): Promise<PortfolioGallery>;
  getPortfolioGalleriesByProvider(providerId: string): Promise<PortfolioGallery[]>;
  updatePortfolioGallery(id: string, updates: Partial<InsertPortfolioGallery>): Promise<PortfolioGallery | undefined>;
  deletePortfolioGallery(id: string): Promise<boolean>;

  // Portfolio Image operations
  createPortfolioImage(image: InsertPortfolioImage): Promise<PortfolioImage>;
  createPortfolioImages(images: InsertPortfolioImage[]): Promise<PortfolioImage[]>;
  getPortfolioImagesByGallery(galleryId: string): Promise<PortfolioImage[]>;
  getPortfolioImagesByProvider(providerId: string): Promise<PortfolioImage[]>;
  updatePortfolioImage(id: string, updates: Partial<InsertPortfolioImage>): Promise<PortfolioImage | undefined>;
  deletePortfolioImage(id: string): Promise<boolean>;
  setPortfolioImageAsPrimary(galleryId: string, imageId: string): Promise<boolean>;
  deleteAllPortfolioImages(providerId: string): Promise<void>;

  // Modern Portfolio operations
  getModernPortfolioGalleries(userId: string): Promise<any[]>;
  createModernPortfolioGallery(gallery: any): Promise<any>;
  addImagesToModernPortfolioGallery(userId: string, galleryId: string, images: any[]): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user!;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user!;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, userId));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  // Service Category operations
  async getAllServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories)
      .where(eq(serviceCategories.isActive, true))
      .orderBy(asc(serviceCategories.sortOrder), asc(serviceCategories.name));
  }

  async getPopularServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories)
      .where(and(eq(serviceCategories.isActive, true), eq(serviceCategories.isPopular, true)))
      .orderBy(asc(serviceCategories.sortOrder));
  }

  async getServiceCategoriesByGroup(group: string): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories)
      .where(and(eq(serviceCategories.isActive, true), eq(serviceCategories.category, group)))
      .orderBy(asc(serviceCategories.sortOrder));
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories);
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const [newCategory] = await db
      .insert(serviceCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateServiceCategory(id: string, categoryData: Partial<ServiceCategory>): Promise<ServiceCategory | undefined> {
    const [updatedCategory] = await db
      .update(serviceCategories)
      .set(categoryData)
      .where(eq(serviceCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteServiceCategory(id: string): Promise<boolean> {
    const result = await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Service Provider operations
  async getServiceProviders(categoryId?: string, search?: string, userLat?: number, userLng?: number, radius?: number): Promise<(ServiceProvider & { user: User; category: ServiceCategory })[]> {
    let whereConditions = [eq(serviceProviders.isAvailable, true)];

    if (categoryId) {
      whereConditions.push(eq(serviceProviders.categoryId, categoryId));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(serviceProviders.businessName, `%${search}%`),
          ilike(serviceProviders.description, `%${search}%`),
          ilike(serviceCategories.name, `%${search}%`)
        )!
      );
    }

    const query = db
      .select()
      .from(serviceProviders)
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .innerJoin(serviceCategories, eq(serviceProviders.categoryId, serviceCategories.id))
      .where(and(...whereConditions))
      .orderBy(desc(serviceProviders.rating));

    // If user location is provided, we can filter by distance
    // Note: For more complex distance queries, consider using PostGIS
    // For now, we'll fetch all and filter in memory for simplicity
    const results = await query;
    
    let providers = results.map(result => ({
      ...result.service_providers,
      user: result.users,
      category: result.service_categories,
    }));

    // Filter by location radius if provided
    if (userLat !== undefined && userLng !== undefined && radius !== undefined) {
      providers = providers.filter(provider => {
        if (!provider.latitude || !provider.longitude) return false;
        
        const distance = this.calculateDistance(
          userLat,
          userLng,
          parseFloat(provider.latitude),
          parseFloat(provider.longitude)
        );
        
        return distance <= radius;
      });
    }

    return providers;
  }

  // Helper method to calculate distance between two coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getServiceProviderById(id: string): Promise<(ServiceProvider & { user: User; category: ServiceCategory }) | undefined> {
    const [result] = await db
      .select()
      .from(serviceProviders)
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .innerJoin(serviceCategories, eq(serviceProviders.categoryId, serviceCategories.id))
      .where(eq(serviceProviders.id, id));

    if (!result) return undefined;

    return {
      ...result.service_providers,
      user: result.users,
      category: result.service_categories,
    };
  }

  async getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId));
    return provider;
  }

  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [newProvider] = await db
      .insert(serviceProviders)
      .values(provider)
      .returning();
    return newProvider;
  }

  async updateServiceProvider(id: string, providerData: Partial<ServiceProvider>): Promise<ServiceProvider> {
    const [updatedProvider] = await db
      .update(serviceProviders)
      .set({
        ...providerData,
        updatedAt: new Date(),
      })
      .where(eq(serviceProviders.id, id))
      .returning();
    return updatedProvider;
  }

  async updateServiceProviderRating(providerId: string): Promise<void> {
    const [ratingResult] = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(${reviews.id})`,
      })
      .from(reviews)
      .where(eq(reviews.providerId, providerId));

    if (ratingResult) {
      await db
        .update(serviceProviders)
        .set({
          rating: ratingResult.avgRating?.toString() || "0",
          reviewCount: ratingResult.count || 0,
          updatedAt: new Date(),
        })
        .where(eq(serviceProviders.id, providerId));
    }
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async getUserBookings(userId: string): Promise<(Booking & { provider: ServiceProvider & { user: User } })[]> {
    const results = await db
      .select()
      .from(bookings)
      .innerJoin(serviceProviders, eq(bookings.providerId, serviceProviders.id))
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));

    return results.map(result => ({
      ...result.bookings,
      provider: {
        ...result.service_providers,
        user: result.users,
      },
    }));
  }

  async getBookingById(id: string): Promise<(Booking & { provider: ServiceProvider & { user: User }; user: User }) | undefined> {
    const [result] = await db
      .select()
      .from(bookings)
      .innerJoin(serviceProviders, eq(bookings.providerId, serviceProviders.id))
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .where(eq(bookings.id, id));

    if (!result) return undefined;

    const [userResult] = await db
      .select()
      .from(users)
      .where(eq(users.id, result.bookings.userId));

    return {
      ...result.bookings,
      provider: {
        ...result.service_providers,
        user: result.users,
      },
      user: userResult,
    };
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    
    // Update provider rating
    await this.updateServiceProviderRating(review.providerId);
    
    return newReview;
  }

  async getProviderReviews(providerId: string): Promise<(Review & { user: User })[]> {
    const results = await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.providerId, providerId))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.reviews,
      user: result.users,
    }));
  }

  // Portfolio Gallery operations
  async createPortfolioGallery(gallery: InsertPortfolioGallery): Promise<PortfolioGallery> {
    const [newGallery] = await db
      .insert(portfolioGalleries)
      .values(gallery)
      .returning();
    return newGallery;
  }

  async getPortfolioGallery(id: string): Promise<PortfolioGallery | undefined> {
    const [gallery] = await db
      .select()
      .from(portfolioGalleries)
      .where(eq(portfolioGalleries.id, id));
    return gallery;
  }

  async getPortfolioGalleriesByProvider(providerId: string): Promise<PortfolioGallery[]> {
    const galleries = await db
      .select()
      .from(portfolioGalleries)
      .where(and(eq(portfolioGalleries.providerId, providerId), eq(portfolioGalleries.isActive, true)))
      .orderBy(asc(portfolioGalleries.sortOrder));
    return galleries;
  }

  async updatePortfolioGallery(id: string, updates: Partial<InsertPortfolioGallery>): Promise<PortfolioGallery | undefined> {
    const [updatedGallery] = await db
      .update(portfolioGalleries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolioGalleries.id, id))
      .returning();
    return updatedGallery;
  }

  async deletePortfolioGallery(id: string): Promise<boolean> {
    // First delete associated images
    await db.delete(portfolioImages).where(eq(portfolioImages.galleryId, id));
    
    // Then delete the gallery
    const [deletedGallery] = await db
      .delete(portfolioGalleries)
      .where(eq(portfolioGalleries.id, id))
      .returning();
    return !!deletedGallery;
  }

  // Portfolio Image operations
  async createPortfolioImage(image: InsertPortfolioImage): Promise<PortfolioImage> {
    const [newImage] = await db
      .insert(portfolioImages)
      .values(image)
      .returning();
    return newImage;
  }

  async createPortfolioImages(images: InsertPortfolioImage[]): Promise<PortfolioImage[]> {
    const newImages = await db
      .insert(portfolioImages)
      .values(images)
      .returning();
    return newImages;
  }

  async getPortfolioImagesByGallery(galleryId: string): Promise<PortfolioImage[]> {
    const images = await db
      .select()
      .from(portfolioImages)
      .where(eq(portfolioImages.galleryId, galleryId))
      .orderBy(asc(portfolioImages.sortOrder));
    return images;
  }

  async getPortfolioImagesByProvider(providerId: string): Promise<PortfolioImage[]> {
    const images = await db
      .select()
      .from(portfolioImages)
      .where(eq(portfolioImages.providerId, providerId))
      .orderBy(asc(portfolioImages.sortOrder));
    return images;
  }

  async updatePortfolioImage(id: string, updates: Partial<InsertPortfolioImage>): Promise<PortfolioImage | undefined> {
    const [updatedImage] = await db
      .update(portfolioImages)
      .set(updates)
      .where(eq(portfolioImages.id, id))
      .returning();
    return updatedImage;
  }

  async deletePortfolioImage(id: string): Promise<boolean> {
    const [deletedImage] = await db
      .delete(portfolioImages)
      .where(eq(portfolioImages.id, id))
      .returning();
    return !!deletedImage;
  }

  async setPortfolioImageAsPrimary(galleryId: string, imageId: string): Promise<boolean> {
    // First, remove primary status from all images in the gallery
    await db
      .update(portfolioImages)
      .set({ isPrimary: false })
      .where(eq(portfolioImages.galleryId, galleryId));

    // Then set the specified image as primary
    const [updatedImage] = await db
      .update(portfolioImages)
      .set({ isPrimary: true })
      .where(eq(portfolioImages.id, imageId))
      .returning();
    
    return !!updatedImage;
  }

  async deleteAllPortfolioImages(providerId: string): Promise<void> {
    // Get service provider for this user
    const [serviceProvider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, providerId));

    if (!serviceProvider) {
      return;
    }

    // Delete all portfolio images for this provider
    await db
      .delete(portfolioImages)
      .where(eq(portfolioImages.providerId, serviceProvider.id));
  }

  // Modern Portfolio operations - database-backed storage
  async getModernPortfolioGalleries(userId: string): Promise<any[]> {
    try {
      // Get service provider for this user first
      const [serviceProvider] = await db
        .select()
        .from(serviceProviders)
        .where(eq(serviceProviders.userId, userId));

      if (!serviceProvider) {
        return [];
      }

      const galleries = await db
        .select()
        .from(portfolioGalleries)
        .where(eq(portfolioGalleries.providerId, serviceProvider.id))
        .orderBy(asc(portfolioGalleries.createdAt));

      // Get images for each gallery
      const galleriesWithImages = await Promise.all(
        galleries.map(async (gallery) => {
          const images = await db
            .select()
            .from(portfolioImages)
            .where(eq(portfolioImages.galleryId, gallery.id))
            .orderBy(asc(portfolioImages.createdAt));
          
          return {
            ...gallery,
            images: images
          };
        })
      );

      return galleriesWithImages;
    } catch (error) {
      console.error("Error fetching modern portfolio galleries:", error);
      return [];
    }
  }

  async createModernPortfolioGallery(gallery: any): Promise<any> {
    try {
      // Get or create service provider for this user
      let [serviceProvider] = await db
        .select()
        .from(serviceProviders)
        .where(eq(serviceProviders.userId, gallery.userId));

      if (!serviceProvider) {
        // Create a default service provider for portfolio management
        const [newProvider] = await db
          .insert(serviceProviders)
          .values({
            userId: gallery.userId,
            businessName: 'Portfolio Provider',
            description: 'Default provider for portfolio management',
            categoryId: '641bce0d-f3fe-42b1-988b-b36d17f4f067', // Default to General Handyman category
            hourlyRate: '50.00',
            isAvailable: true,
            experienceYears: 1,
            location: 'Algeria',
            services: ['General Services']
          })
          .returning();
        serviceProvider = newProvider;
      }

      const [insertedGallery] = await db
        .insert(portfolioGalleries)
        .values({
          id: gallery.id,
          providerId: serviceProvider.id,
          userId: gallery.userId,
          title: gallery.title,
          description: gallery.description || '',
          category: gallery.category,
          serviceType: gallery.serviceType || '',
          isActive: gallery.isActive ?? true,
          sortOrder: gallery.sortOrder || 0,
        })
        .returning();

      return {
        ...insertedGallery,
        images: []
      };
    } catch (error) {
      console.error("Error creating modern portfolio gallery:", error);
      throw error;
    }
  }

  async addImagesToModernPortfolioGallery(userId: string, galleryId: string, images: any[]): Promise<any> {
    try {
      // Verify gallery exists and belongs to user
      const [gallery] = await db
        .select()
        .from(portfolioGalleries)
        .where(eq(portfolioGalleries.id, galleryId));

      if (!gallery) {
        return null;
      }

      // Get or create service provider for this user
      let [serviceProvider] = await db
        .select()
        .from(serviceProviders)
        .where(eq(serviceProviders.userId, userId));

      if (!serviceProvider) {
        // Create a default service provider for portfolio management
        const [newProvider] = await db
          .insert(serviceProviders)
          .values({
            userId: userId,
            businessName: 'Portfolio Provider',
            description: 'Default provider for portfolio management',
            categoryId: '641bce0d-f3fe-42b1-988b-b36d17f4f067', // Default to General Handyman category
            hourlyRate: '50.00',
            isAvailable: true,
            experienceYears: 1,
            location: 'Algeria',
            services: ['General Services']
          })
          .returning();
        serviceProvider = newProvider;
      }

      // Insert images into database
      const insertedImages = await Promise.all(
        images.map(async (image) => {
          // Extract object path from image URL
          let objectPath = image.imageUrl;
          if (image.imageUrl.startsWith('/objects/')) {
            objectPath = image.imageUrl;
          } else if (image.imageUrl.includes('/.private/')) {
            // Convert from storage URL to object path
            const urlParts = image.imageUrl.split('/.private/');
            if (urlParts.length > 1) {
              objectPath = `/objects/${urlParts[1].split('?')[0]}`;
            }
          }

          const [insertedImage] = await db
            .insert(portfolioImages)
            .values({
              id: image.id,
              galleryId: galleryId,
              providerId: serviceProvider.id,
              imageUrl: image.imageUrl,
              objectPath: objectPath,
              title: image.title || '',
              description: image.description || '',
              imageType: image.imageType || 'work_sample',
              isPrimary: image.isPrimary || false,
              sortOrder: image.sortOrder || 0,
            })
            .returning();
          return insertedImage;
        })
      );

      // Update gallery's updatedAt timestamp
      await db
        .update(portfolioGalleries)
        .set({ updatedAt: new Date() })
        .where(eq(portfolioGalleries.id, galleryId));

      // Return updated gallery with images
      const allImages = await db
        .select()
        .from(portfolioImages)
        .where(eq(portfolioImages.galleryId, galleryId))
        .orderBy(asc(portfolioImages.createdAt));

      return {
        ...gallery,
        images: allImages
      };
    } catch (error) {
      console.error("Error adding images to modern portfolio gallery:", error);
      throw error;
    }
  }

  async addImageToModernPortfolioGallery(galleryId: string, imageData: any): Promise<any> {
    try {
      // Check if gallery exists and get user info
      const [gallery] = await db
        .select()
        .from(portfolioGalleries)
        .where(eq(portfolioGalleries.id, galleryId));

      if (!gallery) {
        return null;
      }

      console.log("Gallery found:", gallery);
      console.log("Gallery providerId:", gallery.providerId);

      // Get service provider for this gallery
      let [serviceProvider] = await db
        .select()
        .from(serviceProviders)
        .where(eq(serviceProviders.id, gallery.providerId));

      if (!serviceProvider) {
        console.error("Service provider not found for gallery.providerId:", gallery.providerId);
        throw new Error("Service provider not found for gallery");
      }

      // Extract object path from image URL
      let objectPath = imageData.imageUrl;
      if (imageData.imageUrl.startsWith('/objects/')) {
        objectPath = imageData.imageUrl;
      } else if (imageData.imageUrl.includes('/.private/')) {
        // Convert from storage URL to object path
        const urlParts = imageData.imageUrl.split('/.private/');
        if (urlParts.length > 1) {
          objectPath = `/objects/${urlParts[1].split('?')[0]}`;
        }
      }

      // Insert image
      const [insertedImage] = await db
        .insert(portfolioImages)
        .values({
          id: imageData.id,
          galleryId: galleryId,
          providerId: serviceProvider.id,
          imageUrl: imageData.imageUrl,
          objectPath: objectPath,
          title: imageData.title || '',
          description: imageData.description || '',
          imageType: imageData.imageType || 'work_sample',
          isPrimary: imageData.isPrimary || false,
          sortOrder: imageData.sortOrder || 0,
        })
        .returning();

      // Update gallery's updatedAt timestamp
      await db
        .update(portfolioGalleries)
        .set({ updatedAt: new Date() })
        .where(eq(portfolioGalleries.id, galleryId));

      return insertedImage;
    } catch (error) {
      console.error("Error adding image to modern portfolio gallery:", error);
      throw error;
    }
  }

  async deleteModernPortfolioImage(galleryId: string, imageId: string): Promise<boolean> {
    for (const [userId, galleries] of Array.from(this.modernPortfolioData.entries())) {
      const galleryIndex = galleries.findIndex((g: any) => g.id === galleryId);
      if (galleryIndex >= 0) {
        const images = galleries[galleryIndex].images || [];
        const imageIndex = images.findIndex((img: any) => img.id === imageId);
        if (imageIndex >= 0) {
          images.splice(imageIndex, 1);
          galleries[galleryIndex].updatedAt = new Date();
          this.modernPortfolioData.set(userId, galleries);
          return true;
        }
      }
    }
    return false;
  }

  async deleteModernPortfolioImageById(imageId: string): Promise<boolean> {
    try {
      // Find the image and its gallery
      const [image] = await db
        .select()
        .from(portfolioImages)
        .where(eq(portfolioImages.id, imageId));

      if (!image) {
        return false;
      }

      // Delete the image
      await db
        .delete(portfolioImages)
        .where(eq(portfolioImages.id, imageId));

      // Update gallery's updatedAt timestamp
      await db
        .update(portfolioGalleries)
        .set({ updatedAt: new Date() })
        .where(eq(portfolioGalleries.id, image.galleryId));

      return true;
    } catch (error) {
      console.error("Error deleting modern portfolio image:", error);
      return false;
    }
  }

  async updateModernPortfolioImage(imageId: string, updates: any): Promise<boolean> {
    try {
      // Find the image
      const [image] = await db
        .select()
        .from(portfolioImages)
        .where(eq(portfolioImages.id, imageId));

      if (!image) {
        return false;
      }

      // Update the image
      await db
        .update(portfolioImages)
        .set({
          title: updates.title ?? image.title,
          description: updates.description ?? image.description,
          imageType: updates.imageType ?? image.imageType,
          isPublic: updates.isPublic ?? image.isPublic,
          isPrimary: updates.isPrimary ?? image.isPrimary,
          sortOrder: updates.sortOrder ?? image.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(portfolioImages.id, imageId));

      // Update gallery's updatedAt timestamp
      await db
        .update(portfolioGalleries)
        .set({ updatedAt: new Date() })
        .where(eq(portfolioGalleries.id, image.galleryId));

      return true;
    } catch (error) {
      console.error("Error updating modern portfolio image:", error);
      return false;
    }
  }

  async deleteModernPortfolioImage(galleryId: string, imageId: string): Promise<boolean> {
    try {
      // Delete the image
      const result = await db
        .delete(portfolioImages)
        .where(and(eq(portfolioImages.id, imageId), eq(portfolioImages.galleryId, galleryId)));

      if (result.rowCount === 0) {
        return false;
      }

      // Update gallery's updatedAt timestamp
      await db
        .update(portfolioGalleries)
        .set({ updatedAt: new Date() })
        .where(eq(portfolioGalleries.id, galleryId));

      return true;
    } catch (error) {
      console.error("Error deleting modern portfolio image:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
