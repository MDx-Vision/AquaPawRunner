import {
  type User,
  type InsertUser,
  type Pet,
  type InsertPet,
  type Booking,
  type InsertBooking,
  type Session,
  type InsertSession,
  type Package,
  type InsertPackage,
  type Vaccination,
  type InsertVaccination,
  type Payment,
  type InsertPayment,
  type SessionMedia,
  type InsertSessionMedia,
  type Referral,
  type InsertReferral,
  type NotificationLog,
  type InsertNotificationLog,
  type Feedback,
  type InsertFeedback,
  users,
  pets,
  bookings,
  sessions,
  packages,
  vaccinations,
  payments,
  sessionMedia,
  referrals,
  notificationLogs,
  feedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, lt } from "drizzle-orm";
import { randomBytes } from "crypto";

function generateReferralCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

function generateQRCode(): string {
  return randomBytes(16).toString('hex');
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  generateReferralCodeForUser(userId: string): Promise<User | undefined>;
  
  // Pets
  getPet(id: string): Promise<Pet | undefined>;
  getPetsByUser(userId: string): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: string, pet: Partial<InsertPet>): Promise<Pet | undefined>;
  
  // Vaccinations
  getVaccination(id: string): Promise<Vaccination | undefined>;
  getVaccinationsByPet(petId: string): Promise<Vaccination[]>;
  getExpiringVaccinations(petId: string, daysAhead: number): Promise<Vaccination[]>;
  createVaccination(vaccination: InsertVaccination): Promise<Vaccination>;
  updateVaccination(id: string, vaccination: Partial<InsertVaccination>): Promise<Vaccination | undefined>;
  deleteVaccination(id: string): Promise<boolean>;
  
  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByQRCode(qrCode: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getUpcomingBookings(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  cancelBooking(id: string): Promise<Booking | undefined>;
  checkInBooking(qrCode: string): Promise<Booking | undefined>;
  
  // Payments
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByStripeIntent(stripePaymentIntentId: string): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: string): Promise<Payment[]>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  updatePaymentByStripeIntent(stripePaymentIntentId: string, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // Sessions
  getSession(id: string): Promise<Session | undefined>;
  getSessionsByPet(petId: string): Promise<Session[]>;
  getSessionsByUser(userId: string): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  
  // Session Media
  getSessionMedia(sessionId: string): Promise<SessionMedia[]>;
  createSessionMedia(media: InsertSessionMedia): Promise<SessionMedia>;
  
  // Packages
  getPackagesByUser(userId: string): Promise<Package[]>;
  createPackage(pkg: InsertPackage): Promise<Package>;
  updatePackage(id: string, pkg: Partial<InsertPackage>): Promise<Package | undefined>;
  
  // Referrals
  getReferral(id: string): Promise<Referral | undefined>;
  getReferralsByReferrer(referrerId: string): Promise<Referral[]>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: string, referral: Partial<InsertReferral>): Promise<Referral | undefined>;
  
  // Notifications
  createNotificationLog(log: InsertNotificationLog): Promise<NotificationLog>;
  getNotificationsByUser(userId: string): Promise<NotificationLog[]>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByUser(userId: string): Promise<Feedback[]>;
  getAllFeedback(): Promise<Feedback[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const referralCode = generateReferralCode();
    const [user] = await db.insert(users).values({ ...insertUser, referralCode }).returning();
    return user;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated || undefined;
  }

  async generateReferralCodeForUser(userId: string): Promise<User | undefined> {
    const referralCode = generateReferralCode();
    return this.updateUser(userId, { referralCode });
  }

  // Pets
  async getPet(id: string): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || undefined;
  }

  async getPetsByUser(userId: string): Promise<Pet[]> {
    return db.select().from(pets).where(eq(pets.userId, userId));
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const [pet] = await db.insert(pets).values(insertPet).returning();
    return pet;
  }

  async updatePet(id: string, pet: Partial<InsertPet>): Promise<Pet | undefined> {
    const [updated] = await db.update(pets).set(pet).where(eq(pets.id, id)).returning();
    return updated || undefined;
  }

  // Vaccinations
  async getVaccination(id: string): Promise<Vaccination | undefined> {
    const [vaccination] = await db.select().from(vaccinations).where(eq(vaccinations.id, id));
    return vaccination || undefined;
  }

  async getVaccinationsByPet(petId: string): Promise<Vaccination[]> {
    return db.select().from(vaccinations).where(eq(vaccinations.petId, petId)).orderBy(desc(vaccinations.dateAdministered));
  }

  async getExpiringVaccinations(petId: string, daysAhead: number): Promise<Vaccination[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return db.select().from(vaccinations).where(
      and(
        eq(vaccinations.petId, petId),
        lt(vaccinations.expirationDate, futureDate)
      )
    );
  }

  async createVaccination(insertVaccination: InsertVaccination): Promise<Vaccination> {
    const [vaccination] = await db.insert(vaccinations).values(insertVaccination).returning();
    return vaccination;
  }

  async updateVaccination(id: string, vaccination: Partial<InsertVaccination>): Promise<Vaccination | undefined> {
    const [updated] = await db.update(vaccinations).set(vaccination).where(eq(vaccinations.id, id)).returning();
    return updated || undefined;
  }

  async deleteVaccination(id: string): Promise<boolean> {
    const result = await db.delete(vaccinations).where(eq(vaccinations.id, id));
    return true;
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingByQRCode(qrCode: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.qrCode, qrCode));
    return booking || undefined;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.date));
  }

  async getUpcomingBookings(userId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(
      and(
        eq(bookings.userId, userId),
        eq(bookings.status, "scheduled")
      )
    ).orderBy(bookings.date);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const qrCode = generateQRCode();
    const [booking] = await db.insert(bookings).values({ ...insertBooking, qrCode }).returning();
    return booking;
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updated] = await db.update(bookings).set(booking).where(eq(bookings.id, id)).returning();
    return updated || undefined;
  }

  async cancelBooking(id: string): Promise<Booking | undefined> {
    return this.updateBooking(id, { status: "cancelled" });
  }

  async checkInBooking(qrCode: string): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings)
      .set({ status: "checked_in", checkedInAt: new Date() })
      .where(eq(bookings.qrCode, qrCode))
      .returning();
    return booking || undefined;
  }

  // Payments
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentByStripeIntent(stripePaymentIntentId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
    return payment || undefined;
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.bookingId, bookingId));
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updated] = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return updated || undefined;
  }

  async updatePaymentByStripeIntent(stripePaymentIntentId: string, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updated] = await db.update(payments).set(payment).where(eq(payments.stripePaymentIntentId, stripePaymentIntentId)).returning();
    return updated || undefined;
  }

  // Sessions
  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async getSessionsByPet(petId: string): Promise<Session[]> {
    return db.select().from(sessions).where(eq(sessions.petId, petId)).orderBy(desc(sessions.completedAt));
  }

  async getSessionsByUser(userId: string): Promise<Session[]> {
    return db.select().from(sessions)
      .innerJoin(pets, eq(sessions.petId, pets.id))
      .where(eq(pets.userId, userId))
      .orderBy(desc(sessions.completedAt))
      .then(rows => rows.map(row => row.sessions));
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  // Session Media
  async getSessionMedia(sessionId: string): Promise<SessionMedia[]> {
    return db.select().from(sessionMedia).where(eq(sessionMedia.sessionId, sessionId)).orderBy(desc(sessionMedia.uploadedAt));
  }

  async createSessionMedia(insertMedia: InsertSessionMedia): Promise<SessionMedia> {
    const [media] = await db.insert(sessionMedia).values(insertMedia).returning();
    return media;
  }

  // Packages
  async getPackagesByUser(userId: string): Promise<Package[]> {
    return db.select().from(packages).where(eq(packages.userId, userId));
  }

  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const [pkg] = await db.insert(packages).values(insertPackage).returning();
    return pkg;
  }

  async updatePackage(id: string, pkg: Partial<InsertPackage>): Promise<Package | undefined> {
    const [updated] = await db.update(packages).set(pkg).where(eq(packages.id, id)).returning();
    return updated || undefined;
  }

  // Referrals
  async getReferral(id: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.id, id));
    return referral || undefined;
  }

  async getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, referrerId));
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.referralCode, code));
    return referral || undefined;
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals).values(insertReferral).returning();
    return referral;
  }

  async updateReferral(id: string, referral: Partial<InsertReferral>): Promise<Referral | undefined> {
    const [updated] = await db.update(referrals).set(referral).where(eq(referrals.id, id)).returning();
    return updated || undefined;
  }

  // Notifications
  async createNotificationLog(insertLog: InsertNotificationLog): Promise<NotificationLog> {
    const [log] = await db.insert(notificationLogs).values(insertLog).returning();
    return log;
  }

  async getNotificationsByUser(userId: string): Promise<NotificationLog[]> {
    return db.select().from(notificationLogs).where(eq(notificationLogs.userId, userId)).orderBy(desc(notificationLogs.sentAt));
  }

  // Feedback
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [fb] = await db.insert(feedback).values(insertFeedback).returning();
    return fb;
  }

  async getFeedbackByUser(userId: string): Promise<Feedback[]> {
    return db.select().from(feedback).where(eq(feedback.userId, userId)).orderBy(desc(feedback.createdAt));
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }
}

export const storage = new DatabaseStorage();
