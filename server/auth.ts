import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Extend Express types to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      phone: string | null;
      referralCode: string | null;
      referredBy: string | null;
      stripeCustomerId: string | null;
      createdAt: Date;
    }
  }
}

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function setupAuth(app: Express): void {
  // Configure Passport Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmailWithPassword(email);

          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          if (!user.passwordHash) {
            return done(null, false, { message: "Account not set up for password login" });
          }

          const isValid = await comparePasswords(password, user.passwordHash);

          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // Don't include passwordHash in the user object
          const { passwordHash, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword as Express.User);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user to session (store user ID)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session (fetch user by ID)
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user as Express.User);
    } catch (error) {
      done(error);
    }
  });

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
}

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

// Middleware to optionally get user (doesn't fail if not authenticated)
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  // Just continue - user will be available on req.user if logged in
  next();
}
