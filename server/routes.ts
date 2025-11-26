import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { notificationManager } from "./notifications";
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
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Block cancellation for terminal states
      if (booking.status === "cancelled") {
        return res.status(400).json({ error: "Booking is already cancelled" });
      }
      if (booking.status === "completed") {
        return res.status(400).json({ error: "Cannot cancel a completed booking" });
      }
      if (booking.status === "checked_in") {
        return res.status(400).json({ error: "Cannot cancel a booking that's checked in" });
      }

      // Check cancellation policy (24 hours before booking)
      const bookingDate = new Date(booking.date);
      const now = new Date();
      const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilBooking < 24) {
        return res.status(400).json({ 
          error: "Cancellations must be made at least 24 hours in advance",
          hoursRemaining: Math.round(hoursUntilBooking * 10) / 10
        });
      }

      // Process refund if payment exists
      let refundResult = null;
      if (booking.paymentId) {
        const stripe = (await import("./stripeClient")).default;
        const payment = await storage.getPayment(booking.paymentId);
        
        if (payment?.stripePaymentIntentId) {
          // Check if already refunded (idempotency)
          if (payment.status === "refunded" && payment.refundId) {
            refundResult = {
              refundId: payment.refundId,
              amount: payment.amount,
              status: "already_refunded"
            };
          } else {
            try {
              const refund = await stripe.refunds.create({
                payment_intent: payment.stripePaymentIntentId,
                reason: "requested_by_customer"
              });
              
              await storage.updatePayment(payment.id, { 
                status: "refunded",
                refundId: refund.id
              });
              
              refundResult = {
                refundId: refund.id,
                amount: refund.amount / 100,
                status: refund.status
              };
            } catch (err: any) {
              console.error("Refund error:", err);
              // If refund fails, don't cancel the booking
              return res.status(500).json({ 
                error: "Failed to process refund. Please contact support.",
                details: err.message
              });
            }
          }
        }
      }

      // Cancel the booking
      const cancelledBooking = await storage.cancelBooking(req.params.id);

      // Send cancellation confirmation notification
      try {
        const user = await storage.getUser(booking.userId);
        const pet = await storage.getPet(booking.petId);
        if (user && pet) {
          const refundAmount = refundResult?.amount ? Math.round(refundResult.amount * 100) : undefined;
          await notificationManager.sendCancellationConfirmation(cancelledBooking, pet, user, refundAmount);
        }
      } catch (err: any) {
        console.error('[Cancel] Failed to send notification:', err.message);
      }

      res.json({
        booking: cancelledBooking,
        refund: refundResult,
        message: refundResult 
          ? `Booking cancelled. Refund of $${refundResult.amount} will be processed within 5-10 business days.`
          : "Booking cancelled successfully."
      });
    } catch (error: any) {
      console.error("Cancel booking error:", error);
      res.status(500).json({ error: error.message || "Failed to cancel booking" });
    }
  });

  app.post("/api/bookings/:id/complete", async (req, res) => {
    try {
      const { mediaUrl } = req.body; // Optional media URL for photos/videos
      
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Block completion for terminal states
      if (booking.status === "cancelled") {
        return res.status(400).json({ error: "Cannot complete a cancelled booking" });
      }
      if (booking.status === "completed") {
        return res.status(400).json({ error: "Booking is already completed" });
      }

      // Mark booking as completed
      const completedBooking = await storage.updateBooking(req.params.id, {
        status: "completed"
      });

      // Send session complete notification
      try {
        const user = await storage.getUser(booking.userId);
        const pet = await storage.getPet(booking.petId);
        if (user && pet && completedBooking) {
          await notificationManager.sendSessionComplete(completedBooking, pet, user, mediaUrl);
        }
      } catch (err: any) {
        console.error('[Complete] Failed to send notification:', err.message);
      }

      res.json({
        booking: completedBooking,
        message: "Session marked as completed"
      });
    } catch (error: any) {
      console.error("Complete booking error:", error);
      res.status(500).json({ error: error.message || "Failed to complete booking" });
    }
  });

  app.post("/api/bookings/:id/reschedule", async (req, res) => {
    try {
      const { newDate, newTimeSlot } = req.body;
      
      if (!newDate || !newTimeSlot) {
        return res.status(400).json({ error: "New date and time slot are required" });
      }

      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Block rescheduling for terminal states
      if (booking.status === "cancelled") {
        return res.status(400).json({ error: "Cannot reschedule a cancelled booking" });
      }
      if (booking.status === "completed") {
        return res.status(400).json({ error: "Cannot reschedule a completed booking" });
      }
      if (booking.status === "checked_in") {
        return res.status(400).json({ error: "Cannot reschedule a booking that's already checked in" });
      }

      // Check rescheduling policy (at least 12 hours before original booking)
      const originalDate = new Date(booking.date);
      const now = new Date();
      const hoursUntilBooking = (originalDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilBooking < 12) {
        return res.status(400).json({ 
          error: "Rescheduling must be done at least 12 hours in advance",
          hoursRemaining: Math.round(hoursUntilBooking * 10) / 10
        });
      }

      // Update the booking with new date/time
      const oldDate = originalDate;
      const updatedBooking = await storage.updateBooking(req.params.id, {
        date: new Date(newDate),
        timeSlot: newTimeSlot,
        status: "scheduled"
      });

      // Send reschedule confirmation notification
      try {
        const user = await storage.getUser(booking.userId);
        const pet = await storage.getPet(booking.petId);
        if (user && pet && updatedBooking) {
          await notificationManager.sendRescheduleConfirmation(updatedBooking, pet, user, oldDate);
        }
      } catch (err: any) {
        console.error('[Reschedule] Failed to send notification:', err.message);
      }

      res.json({
        booking: updatedBooking,
        message: "Booking rescheduled successfully"
      });
    } catch (error: any) {
      console.error("Reschedule booking error:", error);
      res.status(500).json({ error: error.message || "Failed to reschedule booking" });
    }
  });

  // QR Code Check-in (Legacy)
  app.post("/api/check-in/:qrCode", async (req, res) => {
    const booking = await storage.checkInBooking(req.params.qrCode);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found or invalid QR code" });
    }
    res.json(booking);
  });

  // QR Token System - Generate/Refresh QR token for a booking
  app.post("/api/bookings/:id/qr-token", async (req, res) => {
    const { generateQRToken, canIssueToken, generateQRCodeImage, isTokenExpired } = await import("./qr-utils");
    const { forceRegenerate } = req.body;
    
    const booking = await storage.getBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Block token generation for terminal states
    if (booking.status === "checked_in") {
      return res.status(400).json({ error: "Booking is already checked in" });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Booking is cancelled" });
    }
    if (booking.status === "completed") {
      return res.status(400).json({ error: "Booking is already completed" });
    }

    // Check if token can be issued (within 24 hours of booking)
    if (!canIssueToken(new Date(booking.date))) {
      return res.status(400).json({ 
        error: "QR tokens can only be issued within 24 hours of your booking time",
        availableAt: new Date(new Date(booking.date).getTime() - 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Check for existing active token
    if (booking.qrTokenHash && booking.qrTokenExpiresAt && booking.qrTokenIssuedAt && !forceRegenerate) {
      const existingTokenExpired = isTokenExpired(new Date(booking.qrTokenExpiresAt));
      if (!existingTokenExpired) {
        // Inform user they have an active token and need to force regenerate if lost
        return res.status(409).json({ 
          error: "Active QR code already exists",
          message: "You already have an active QR code. If you've lost it, click 'Regenerate' to create a new one (this will invalidate the previous code).",
          issuedAt: booking.qrTokenIssuedAt,
          expiresAt: booking.qrTokenExpiresAt,
          hasActiveToken: true,
          canForceRegenerate: true
        });
      }
    }

    // Generate new token (either first time, expired, or force regenerate)
    const qrToken = generateQRToken(new Date(booking.date));
    
    // Update booking with token hash
    await storage.updateBookingQRToken(
      booking.id,
      qrToken.hash,
      qrToken.issuedAt,
      qrToken.expiresAt
    );

    // Generate QR code image
    const qrCodeDataUrl = await generateQRCodeImage(qrToken.token, booking.id);

    res.json({
      token: qrToken.token,
      qrCodeImage: qrCodeDataUrl,
      issuedAt: qrToken.issuedAt,
      expiresAt: qrToken.expiresAt,
      hasActiveToken: false
    });
  });

  // QR Token Validation - Scan and check in
  app.post("/api/check-in/scan", async (req, res) => {
    const { hashToken, isTokenExpired } = await import("./qr-utils");
    const { token, scannerUserId, scannerLocation } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Hash the token
    const tokenHash = hashToken(token);

    // Find booking by token hash
    const booking = await storage.getBookingByQRTokenHash(tokenHash);
    if (!booking) {
      return res.status(404).json({ error: "Invalid QR code" });
    }

    // Check if already checked in
    if (booking.status === "checked_in") {
      return res.status(400).json({ 
        error: "Already checked in",
        checkedInAt: booking.checkedInAt
      });
    }

    // Check if token is expired
    if (!booking.qrTokenExpiresAt || isTokenExpired(new Date(booking.qrTokenExpiresAt))) {
      // Log failed check-in attempt
      await storage.createBookingCheckin({
        bookingId: booking.id,
        qrTokenHash: tokenHash,
        status: "expired",
        scannerUserId: scannerUserId || null,
        scannerLocation: scannerLocation || null
      });
      
      return res.status(400).json({ error: "QR code has expired. Please generate a new one." });
    }

    // Process check-in
    const checkedInBooking = await storage.checkInBookingWithToken(
      booking.id,
      scannerUserId || "system"
    );

    // Log successful check-in
    await storage.createBookingCheckin({
      bookingId: booking.id,
      qrTokenHash: tokenHash,
      status: "validated",
      scannerUserId: scannerUserId || null,
      scannerLocation: scannerLocation || null
    });

    // Get pet details for confirmation
    const pet = await storage.getPet(booking.petId);

    res.json({
      success: true,
      booking: checkedInBooking,
      pet: pet,
      message: `${pet?.name} checked in successfully!`
    });
  });

  // Get QR token status for a booking
  app.get("/api/bookings/:id/qr-status", async (req, res) => {
    const { isTokenExpired, canIssueToken } = await import("./qr-utils");
    
    const booking = await storage.getBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Block token issuance for terminal states
    const isTerminalState = ["checked_in", "cancelled", "completed"].includes(booking.status);
    const canIssue = !isTerminalState && canIssueToken(new Date(booking.date));
    const hasToken = !!booking.qrTokenHash;
    const isExpired = booking.qrTokenExpiresAt ? isTokenExpired(new Date(booking.qrTokenExpiresAt)) : true;

    res.json({
      canIssueToken: canIssue,
      hasActiveToken: hasToken && !isExpired,
      tokenExpiresAt: booking.qrTokenExpiresAt,
      tokenIssuedAt: booking.qrTokenIssuedAt,
      bookingStatus: booking.status,
      checkedInAt: booking.checkedInAt,
      isTerminalState: isTerminalState
    });
  });

  app.get("/api/check-in/:qrCode", async (req, res) => {
    const booking = await storage.getBookingByQRCode(req.params.qrCode);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  });

  // Cron/Scheduler Endpoints
  app.post("/api/cron/send-reminders", async (req, res) => {
    try {
      // Query bookings happening in approximately 24 hours (23-25 hour window)
      const now = new Date();
      const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
      
      const allBookings = await storage.getAllBookings();
      const upcomingBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= windowStart && 
               bookingDate <= windowEnd && 
               booking.status === "scheduled";
      });

      const results = [];
      for (const booking of upcomingBookings) {
        try {
          const user = await storage.getUser(booking.userId);
          const pet = await storage.getPet(booking.petId);
          
          if (user && pet) {
            await notificationManager.sendBookingReminder(booking, pet, user);
            results.push({ bookingId: booking.id, status: "sent" });
          }
        } catch (err: any) {
          console.error(`[Cron] Failed to send reminder for booking ${booking.id}:`, err.message);
          results.push({ bookingId: booking.id, status: "failed", error: err.message });
        }
      }

      res.json({
        processed: upcomingBookings.length,
        results: results,
        message: `Processed ${upcomingBookings.length} booking reminders`
      });
    } catch (error: any) {
      console.error("[Cron] Send reminders error:", error);
      res.status(500).json({ error: error.message || "Failed to send reminders" });
    }
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
