import { db } from "./db";
import { users, pets, bookings, packages, sessions } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding database...");

  // Hash the demo password
  const demoPassword = "password123";
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  // Create a demo user with password
  const [user] = await db
    .insert(users)
    .values({
      email: "sarah@example.com",
      name: "Sarah Johnson",
      phone: "(555) 123-4567",
      passwordHash,
    })
    .returning();

  console.log("Created user:", user.email);

  // Create a pet
  const [pet] = await db
    .insert(pets)
    .values({
      userId: user.id,
      name: "Buddy",
      breed: "Golden Retriever",
      age: 3,
      weight: 65,
      notes: "Very energetic, loves running!",
    })
    .returning();

  console.log("Created pet:", pet.name);

  // Create an upcoming booking
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const [booking] = await db
    .insert(bookings)
    .values({
      userId: user.id,
      petId: pet.id,
      serviceType: "standard",
      date: tomorrow,
      timeSlot: "10:00 AM",
      location: "Home (Driveway)",
      status: "scheduled",
      price: 6000, // $60 in cents
      notes: "Please use the side driveway",
    })
    .returning();

  console.log("Created upcoming booking");

  // Create some past sessions
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Create past bookings (completed)
  const [pastBooking1] = await db
    .insert(bookings)
    .values({
      userId: user.id,
      petId: pet.id,
      serviceType: "standard",
      date: threeDaysAgo,
      timeSlot: "10:00 AM",
      location: "Home (Driveway)",
      status: "completed",
      price: 6000,
    })
    .returning();

  const [pastBooking2] = await db
    .insert(bookings)
    .values({
      userId: user.id,
      petId: pet.id,
      serviceType: "standard",
      date: fiveDaysAgo,
      timeSlot: "02:00 PM",
      location: "Home (Driveway)",
      status: "completed",
      price: 6000,
    })
    .returning();

  const [pastBooking3] = await db
    .insert(bookings)
    .values({
      userId: user.id,
      petId: pet.id,
      serviceType: "express",
      date: sevenDaysAgo,
      timeSlot: "09:00 AM",
      location: "Home (Driveway)",
      status: "completed",
      price: 4500,
    })
    .returning();

  // Create sessions for completed bookings
  await db.insert(sessions).values([
    {
      bookingId: pastBooking1.id,
      petId: pet.id,
      distance: "2.5 mi",
      duration: 30,
      notes: "Great session! Buddy is getting faster.",
      completedAt: threeDaysAgo,
    },
    {
      bookingId: pastBooking2.id,
      petId: pet.id,
      distance: "2.3 mi",
      duration: 30,
      notes: "Good energy today.",
      completedAt: fiveDaysAgo,
    },
    {
      bookingId: pastBooking3.id,
      petId: pet.id,
      distance: "1.5 mi",
      duration: 20,
      notes: "Quick warm-up session.",
      completedAt: sevenDaysAgo,
    },
  ]);

  console.log("Created 3 past sessions");

  // Create a session package
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 3);

  await db.insert(packages).values({
    userId: user.id,
    name: "10-Session Pack",
    totalSessions: 10,
    usedSessions: 6,
    expiresAt,
  });

  console.log("Created session package");
  console.log("✅ Seeding complete!");
  console.log("\n========================================");
  console.log("Demo user credentials:");
  console.log("Email:", user.email);
  console.log("Password:", demoPassword);
  console.log("User ID:", user.id);
  console.log("========================================\n");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
