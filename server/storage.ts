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
  users,
  pets,
  bookings,
  sessions,
  packages,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pets
  getPet(id: string): Promise<Pet | undefined>;
  getPetsByUser(userId: string): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: string, pet: Partial<InsertPet>): Promise<Pet | undefined>;
  
  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getUpcomingBookings(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  cancelBooking(id: string): Promise<Booking | undefined>;
  
  // Sessions
  getSessionsByPet(petId: string): Promise<Session[]>;
  getSessionsByUser(userId: string): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  
  // Packages
  getPackagesByUser(userId: string): Promise<Package[]>;
  createPackage(pkg: InsertPackage): Promise<Package>;
  updatePackage(id: string, pkg: Partial<InsertPackage>): Promise<Package | undefined>;
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
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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
    const [updated] = await db
      .update(pets)
      .set(pet)
      .where(eq(pets.id, id))
      .returning();
    return updated || undefined;
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.date));
  }

  async getUpcomingBookings(userId: string): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          eq(bookings.status, "scheduled")
        )
      )
      .orderBy(bookings.date);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set(booking)
      .where(eq(bookings.id, id))
      .returning();
    return updated || undefined;
  }

  async cancelBooking(id: string): Promise<Booking | undefined> {
    return this.updateBooking(id, { status: "cancelled" });
  }

  // Sessions
  async getSessionsByPet(petId: string): Promise<Session[]> {
    return db
      .select()
      .from(sessions)
      .where(eq(sessions.petId, petId))
      .orderBy(desc(sessions.completedAt));
  }

  async getSessionsByUser(userId: string): Promise<Session[]> {
    return db
      .select()
      .from(sessions)
      .innerJoin(pets, eq(sessions.petId, pets.id))
      .where(eq(pets.userId, userId))
      .orderBy(desc(sessions.completedAt))
      .then(rows => rows.map(row => row.sessions));
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
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
    const [updated] = await db
      .update(packages)
      .set(pkg)
      .where(eq(packages.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
