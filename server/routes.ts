import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import {
  insertUserSchema,
  insertPetSchema,
  insertBookingSchema,
  insertSessionSchema,
  insertPackageSchema,
  insertVaccinationSchema,
  insertPaymentSchema,
  insertSessionMediaSchema,
  insertReferralSchema,
  insertNotificationLogSchema,
  insertFeedbackSchema,
} from "@shared/schema";
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

  app.post("/api/users/:id/referral-code", async (req, res) => {
    const user = await storage.generateReferralCodeForUser(req.params.id);
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

  // Vaccinations
  app.post("/api/vaccinations", async (req, res) => {
    try {
      const validatedData = insertVaccinationSchema.parse(req.body);
      const vaccination = await storage.createVaccination(validatedData);
      res.json(vaccination);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/pets/:petId/vaccinations", async (req, res) => {
    const vaccinations = await storage.getVaccinationsByPet(req.params.petId);
    res.json(vaccinations);
  });

  app.get("/api/pets/:petId/vaccinations/expiring", async (req, res) => {
    const daysAhead = parseInt(req.query.days as string) || 30;
    const vaccinations = await storage.getExpiringVaccinations(req.params.petId, daysAhead);
    res.json(vaccinations);
  });

  app.patch("/api/vaccinations/:id", async (req, res) => {
    try {
      const vaccination = await storage.updateVaccination(req.params.id, req.body);
      if (!vaccination) {
        return res.status(404).json({ error: "Vaccination not found" });
      }
      res.json(vaccination);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.delete("/api/vaccinations/:id", async (req, res) => {
    const success = await storage.deleteVaccination(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Vaccination not found" });
    }
    res.json({ success: true });
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

  // QR Code Check-in
  app.post("/api/check-in/:qrCode", async (req, res) => {
    const booking = await storage.checkInBooking(req.params.qrCode);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found or invalid QR code" });
    }
    res.json(booking);
  });

  app.get("/api/check-in/:qrCode", async (req, res) => {
    const booking = await storage.getBookingByQRCode(req.params.qrCode);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  });

  // Payments
  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/bookings/:bookingId/payments", async (req, res) => {
    const payments = await storage.getPaymentsByBooking(req.params.bookingId);
    res.json(payments);
  });

  app.get("/api/users/:userId/payments", async (req, res) => {
    const payments = await storage.getPaymentsByUser(req.params.userId);
    res.json(payments);
  });

  app.patch("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.updatePayment(req.params.id, req.body);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
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

  // Session Media (Photos/Videos)
  app.post("/api/session-media", async (req, res) => {
    try {
      const validatedData = insertSessionMediaSchema.parse(req.body);
      const media = await storage.createSessionMedia(validatedData);
      res.json(media);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/sessions/:sessionId/media", async (req, res) => {
    const media = await storage.getSessionMedia(req.params.sessionId);
    res.json(media);
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

  // Referrals
  app.post("/api/referrals", async (req, res) => {
    try {
      const validatedData = insertReferralSchema.parse(req.body);
      const referral = await storage.createReferral(validatedData);
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/users/:referrerId/referrals", async (req, res) => {
    const referrals = await storage.getReferralsByReferrer(req.params.referrerId);
    res.json(referrals);
  });

  app.get("/api/referrals/code/:code", async (req, res) => {
    const referral = await storage.getReferralByCode(req.params.code);
    if (!referral) {
      return res.status(404).json({ error: "Referral code not found" });
    }
    res.json(referral);
  });

  app.patch("/api/referrals/:id", async (req, res) => {
    try {
      const referral = await storage.updateReferral(req.params.id, req.body);
      if (!referral) {
        return res.status(404).json({ error: "Referral not found" });
      }
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  // Notifications
  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationLogSchema.parse(req.body);
      const log = await storage.createNotificationLog(validatedData);
      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/users/:userId/notifications", async (req, res) => {
    const notifications = await storage.getNotificationsByUser(req.params.userId);
    res.json(notifications);
  });

  // Feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      const fb = await storage.createFeedback(validatedData);
      res.json(fb);
    } catch (error: any) {
      res.status(400).json({ error: fromError(error).toString() });
    }
  });

  app.get("/api/users/:userId/feedback", async (req, res) => {
    const feedbacks = await storage.getFeedbackByUser(req.params.userId);
    res.json(feedbacks);
  });

  app.get("/api/feedback/all", async (req, res) => {
    const feedbacks = await storage.getAllFeedback();
    res.json(feedbacks);
  });

  // Stripe Payment Integration
  app.get("/api/stripe/config", async (req, res) => {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  });

  app.post("/api/stripe/create-payment-intent", async (req, res) => {
    try {
      // TODO: In production, get userId from authenticated session (req.user.id)
      // For prototype: accepting userId from request body
      const { bookingId, userId } = req.body;
      
      if (!bookingId || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized - booking does not belong to user" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(user.email, user.id, user.name);
        await storage.updateUser(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const paymentIntent = await stripeService.createPaymentIntent(
        booking.price,
        customerId,
        bookingId
      );

      await storage.createPayment({
        bookingId,
        userId,
        amount: booking.price,
        currency: 'usd',
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/payments/by-intent/:paymentIntentId", async (req, res) => {
    try {
      const payment = await storage.getPaymentByStripeIntent(req.params.paymentIntentId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stripe/refund", async (req, res) => {
    try {
      // TODO: In production, get userId from authenticated session (req.user.id)
      // For prototype: accepting userId from request body
      const { bookingId, userId } = req.body;
      
      if (!bookingId || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const payments = await storage.getPaymentsByBooking(bookingId);
      const successfulPayment = payments.find(p => p.status === 'succeeded');
      
      if (!successfulPayment || !successfulPayment.stripePaymentIntentId) {
        return res.status(404).json({ error: "No successful payment found for this booking" });
      }

      const refund = await stripeService.createRefund(successfulPayment.stripePaymentIntentId);
      
      await storage.updatePayment(successfulPayment.id, {
        status: 'refunded',
        refundedAmount: refund.amount,
      });

      res.json(refund);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
