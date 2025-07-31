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
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  dateOfBirth: timestamp("date_of_birth"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  notifications: boolean("notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon").notNull(),
  color: varchar("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = typeof serviceCategories.$inferInsert;

export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = typeof serviceProviders.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// Validation schemas
export const insertServiceCategorySchema = createInsertSchema(serviceCategories);
export const insertServiceProviderSchema = createInsertSchema(serviceProviders);
export const insertBookingSchema = createInsertSchema(bookings);
export const insertReviewSchema = createInsertSchema(reviews);
