import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  referralCode: text("referral_code"),
  referredBy: varchar("referred_by"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Pets table
export const pets = pgTable("pets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  breed: text("breed").notNull(),
  age: integer("age"),
  weight: integer("weight"),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  createdAt: true,
});
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;

// Vaccinations table
export const vaccinations = pgTable("vaccinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  vaccineName: text("vaccine_name").notNull(),
  dateAdministered: timestamp("date_administered").notNull(),
  expirationDate: timestamp("expiration_date"),
  documentUrl: text("document_url"),
  vetName: text("vet_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVaccinationSchema = createInsertSchema(vaccinations).omit({
  id: true,
  createdAt: true,
});
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;
export type Vaccination = typeof vaccinations.$inferSelect;

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  serviceType: text("service_type").notNull(), // 'express', 'standard', 'pro'
  date: timestamp("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'completed', 'cancelled', 'checked_in'
  price: integer("price").notNull(), // in cents
  notes: text("notes"),
  qrCode: text("qr_code").unique(),
  qrTokenHash: text("qr_token_hash"),
  qrTokenIssuedAt: timestamp("qr_token_issued_at"),
  qrTokenExpiresAt: timestamp("qr_token_expires_at"),
  checkedInAt: timestamp("checked_in_at"),
  checkInVerifiedBy: varchar("check_in_verified_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  qrCode: true,
  qrTokenHash: true,
  qrTokenIssuedAt: true,
  qrTokenExpiresAt: true,
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Booking Check-ins table - audit log for QR code scans
export const bookingCheckins = pgTable("booking_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  qrTokenHash: text("qr_token_hash").notNull(),
  status: text("status").notNull(), // 'pending', 'validated', 'expired'
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
  scannerUserId: varchar("scanner_user_id"),
  scannerLocation: text("scanner_location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingCheckinSchema = createInsertSchema(bookingCheckins).omit({
  id: true,
  createdAt: true,
  scannedAt: true,
});
export type InsertBookingCheckin = z.infer<typeof insertBookingCheckinSchema>;
export type BookingCheckin = typeof bookingCheckins.$inferSelect;

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("usd"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull(), // 'pending', 'succeeded', 'failed', 'refunded'
  refundedAmount: integer("refunded_amount").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Sessions table - completed workout sessions
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  petId: varchar("pet_id").notNull().references(() => pets.id),
  distance: text("distance"), // "2.5 mi"
  duration: integer("duration"), // in minutes
  notes: text("notes"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  completedAt: true,
});
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Session Media (Photos/Videos)
export const sessionMedia = pgTable("session_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(), // 'photo', 'video'
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertSessionMediaSchema = createInsertSchema(sessionMedia).omit({
  id: true,
  uploadedAt: true,
});
export type InsertSessionMedia = z.infer<typeof insertSessionMediaSchema>;
export type SessionMedia = typeof sessionMedia.$inferSelect;

// Packages table - session packages
export const packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(), // "10-Session Pack"
  totalSessions: integer("total_sessions").notNull(),
  usedSessions: integer("used_sessions").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true,
});
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packages.$inferSelect;

// Referrals table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredUserId: varchar("referred_user_id").references(() => users.id),
  referralCode: text("referral_code").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'rewarded'
  rewardGranted: boolean("reward_granted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Notification Logs
export const notificationLogs = pgTable("notification_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'booking_confirmation', 'reminder', 'session_complete', 'photo_update'
  channel: text("channel").notNull(), // 'email', 'sms', 'push'
  recipient: text("recipient").notNull(), // email or phone number
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").notNull(), // 'sent', 'failed', 'pending'
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertNotificationLogSchema = createInsertSchema(notificationLogs).omit({
  id: true,
  sentAt: true,
});
export type InsertNotificationLog = z.infer<typeof insertNotificationLogSchema>;
export type NotificationLog = typeof notificationLogs.$inferSelect;

// Feedback/Reviews
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  bookingId: varchar("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  category: text("category"), // 'service', 'app', 'staff', 'overall'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
