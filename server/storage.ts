import {
  users,
  serviceCategories,
  serviceProviders,
  bookings,
  reviews,
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
}

export const storage = new DatabaseStorage();
