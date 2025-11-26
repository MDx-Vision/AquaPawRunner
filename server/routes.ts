import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPetSchema, insertBookingSchema, insertSessionSchema, insertPackageSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.get("/api/users/email/:email", async (req, res) => {
    const user = await storage.getUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Pets
  app.post("/api/pets", async (req, res) => {
    try {
      const validatedData = insertPetSchema.parse(req.body);
      const pet = await storage.createPet(validatedData);
      res.json(pet);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/pets/:id", async (req, res) => {
    const pet = await storage.getPet(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    res.json(pet);
  });

  app.get("/api/users/:userId/pets", async (req, res) => {
    const pets = await storage.getPetsByUser(req.params.userId);
    res.json(pets);
  });

  app.patch("/api/pets/:id", async (req, res) => {
    try {
      const pet = await storage.updatePet(req.params.id, req.body);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      res.json(pet);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  // Bookings
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    const booking = await storage.getBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  });

  app.get("/api/users/:userId/bookings", async (req, res) => {
    const bookings = await storage.getBookingsByUser(req.params.userId);
    res.json(bookings);
  });

  app.get("/api/users/:userId/bookings/upcoming", async (req, res) => {
    const bookings = await storage.getUpcomingBookings(req.params.userId);
    res.json(bookings);
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.post("/api/bookings/:id/cancel", async (req, res) => {
    const booking = await storage.cancelBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  });

  // Sessions
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/pets/:petId/sessions", async (req, res) => {
    const sessions = await storage.getSessionsByPet(req.params.petId);
    res.json(sessions);
  });

  app.get("/api/users/:userId/sessions", async (req, res) => {
    const sessions = await storage.getSessionsByUser(req.params.userId);
    res.json(sessions);
  });

  // Packages
  app.post("/api/packages", async (req, res) => {
    try {
      const validatedData = insertPackageSchema.parse(req.body);
      const pkg = await storage.createPackage(validatedData);
      res.json(pkg);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/users/:userId/packages", async (req, res) => {
    const packages = await storage.getPackagesByUser(req.params.userId);
    res.json(packages);
  });

  app.patch("/api/packages/:id", async (req, res) => {
    try {
      const pkg = await storage.updatePackage(req.params.id, req.body);
      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }
      res.json(pkg);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
