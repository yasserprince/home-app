import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // For email/password auth (hashed)
  authProvider: varchar("auth_provider").default("email"), // 'email' or 'google'
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"), // User bio description, max 300 characters
  role: varchar("role").notNull().default("service_seeker"), // admin, support, service_seeker, service_provider, company
  accountType: varchar("account_type").default("individual"), // individual, company
  companyName: varchar("company_name"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  wilaya: varchar("wilaya"), // Algerian wilaya code for Algerian users
  zipCode: varchar("zip_code"),
  sex: varchar("sex"), // 'male' or 'female'
  dateOfBirth: timestamp("date_of_birth"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  notifications: boolean("notifications").default(true),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  locationEnabled: boolean("location_enabled").default(false),
  lastLocationUpdate: timestamp("last_location_update"),
  // KYC and Verification fields
  kycStatus: varchar("kyc_status").default("unverified"), // unverified, pending, verified, rejected
  idVerificationStatus: varchar("id_verification_status").default("unverified"),
  phoneVerificationStatus: varchar("phone_verification_status").default("unverified"),
  emailVerificationStatus: varchar("email_verification_status").default("unverified"),
  backgroundCheckStatus: varchar("background_check_status").default("not_required"),
  verificationDocuments: jsonb("verification_documents"), // Store document verification results
  trustScore: integer("trust_score").default(0), // 0-100 trust score
  verificationDate: timestamp("verification_date"),
  verificationProvider: varchar("verification_provider"), // didit, idenfy, etc.
  // Professional Profile Fields (inspired by TaskRabbit/Thumbtack/Handy)
  yearsExperience: integer("years_experience"), // Years of professional experience
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }), // Service hourly rate
  availability: varchar("availability").default("part-time"), // full-time, part-time, weekends-only, evenings-only
  skills: text("skills").array(), // Professional skills array
  languages: text("languages").array(), // Spoken languages
  serviceArea: varchar("service_area"), // Geographic service coverage
  responseTime: varchar("response_time").default("within-24h"), // typical response time
  completedJobs: integer("completed_jobs").default(0), // Number of completed jobs
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"), // Average rating
  reviewCount: integer("review_count").default(0), // Total reviews received
  isServiceProvider: boolean("is_service_provider").default(false), // Professional service provider flag
  licenseNumber: varchar("license_number"), // Professional license number
  insuranceVerified: boolean("insurance_verified").default(false), // Insurance verification status
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameAr: varchar("name_ar"), // Arabic name
  nameFr: varchar("name_fr"), // French name
  description: text("description"),
  descriptionAr: text("description_ar"), // Arabic description
  descriptionFr: text("description_fr"), // French description
  icon: varchar("icon").notNull(), // Lucide icon name
  color: varchar("color").notNull(), // Tailwind color class
  category: varchar("category").notNull(), // Main category group
  isPopular: boolean("is_popular").default(false),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  averagePrice: decimal("average_price", { precision: 10, scale: 2 }), // Average hourly rate
  estimatedDuration: varchar("estimated_duration"), // Typical duration
  skillLevel: varchar("skill_level").default("intermediate"), // beginner, intermediate, expert
  requiresLicense: boolean("requires_license").default(false),
  emergencyService: boolean("emergency_service").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: varchar("business_name").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => serviceCategories.id).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  isAvailable: boolean("is_available").default(true),
  experienceYears: integer("experience_years"),
  location: varchar("location"),
  services: text("services").array(),
  profileImageUrl: varchar("profile_image_url"),
  portfolioImages: text("portfolio_images").array(), // Deprecated - use portfolioGalleries instead
  achievements: text("achievements"), // Professional achievements and qualifications
  workExperience: jsonb("work_experience"), // Detailed work experience as JSON
  certifications: text("certifications").array(), // Professional certifications
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  serviceRadius: integer("service_radius").default(25), // in kilometers
  locationEnabled: boolean("location_enabled").default(false),
  lastLocationUpdate: timestamp("last_location_update"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  serviceType: varchar("service_type").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: varchar("scheduled_time").notNull(),
  address: text("address").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, in_progress, completed, cancelled
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  finalCost: decimal("final_cost", { precision: 10, scale: 2 }),
  estimatedDuration: integer("estimated_duration"), // in hours
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Portfolio Gallery system for service providers
export const portfolioGalleries = pgTable("portfolio_galleries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  title: varchar("title").notNull(), // e.g., "Kitchen Renovation", "Before/After Shots"
  description: text("description"),
  category: varchar("category").notNull(), // "featured", "before_after", "work_samples", "equipment", "certifications"
  serviceType: varchar("service_type"), // Link to specific service category if applicable
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const portfolioImages = pgTable("portfolio_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  galleryId: varchar("gallery_id").references(() => portfolioGalleries.id, { onDelete: "cascade" }).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id).notNull(),
  imageUrl: varchar("image_url").notNull(), // Object storage URL
  objectPath: varchar("object_path").notNull(), // Object storage path for access control
  title: varchar("title"),
  description: text("description"),
  imageType: varchar("image_type").notNull(), // "before", "after", "work_sample", "equipment", "certificate"
  isPrimary: boolean("is_primary").default(false), // Primary image for the gallery
  sortOrder: integer("sort_order").default(0),
  dimensions: jsonb("dimensions"), // {width: 1920, height: 1080}
  fileSize: integer("file_size"), // in bytes
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
  serviceProviders: many(serviceProviders),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  providers: many(serviceProviders),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
  category: one(serviceCategories, {
    fields: [serviceProviders.categoryId],
    references: [serviceCategories.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
  portfolioGalleries: many(portfolioGalleries),
  portfolioImages: many(portfolioImages),
}));

export const portfolioGalleryRelations = relations(portfolioGalleries, ({ one, many }) => ({
  provider: one(serviceProviders, {
    fields: [portfolioGalleries.providerId],
    references: [serviceProviders.id],
  }),
  images: many(portfolioImages),
}));

export const portfolioImageRelations = relations(portfolioImages, ({ one }) => ({
  gallery: one(portfolioGalleries, {
    fields: [portfolioImages.galleryId],
    references: [portfolioGalleries.id],
  }),
  provider: one(serviceProviders, {
    fields: [portfolioImages.providerId],
    references: [serviceProviders.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  provider: one(serviceProviders, {
    fields: [bookings.providerId],
    references: [serviceProviders.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  provider: one(serviceProviders, {
    fields: [reviews.providerId],
    references: [serviceProviders.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  interval: varchar("interval").notNull(), // 'monthly', 'yearly'
  features: text("features").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planId: varchar("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: varchar("status").notNull(), // 'active', 'cancelled', 'expired', 'paused'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true),
  paymentMethod: varchar("payment_method"),
  lastPaymentDate: timestamp("last_payment_date"),
  nextPaymentDate: timestamp("next_payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = typeof serviceCategories.$inferInsert;

export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = typeof serviceProviders.$inferInsert;

export type PortfolioGallery = typeof portfolioGalleries.$inferSelect;
export type InsertPortfolioGallery = typeof portfolioGalleries.$inferInsert;

export type PortfolioImage = typeof portfolioImages.$inferSelect;
export type InsertPortfolioImage = typeof portfolioImages.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// Validation schemas
export const insertServiceCategorySchema = createInsertSchema(serviceCategories);
export const insertServiceProviderSchema = createInsertSchema(serviceProviders);
export const insertBookingSchema = createInsertSchema(bookings);
export const insertReviewSchema = createInsertSchema(reviews);
