import crypto from "crypto";
import QRCode from "qrcode";

export interface QRToken {
  token: string;
  hash: string;
  issuedAt: Date;
  expiresAt: Date;
}

/**
 * Generate a secure QR token for a booking
 * Tokens are 128-bit URL-safe random strings
 */
export function generateQRToken(bookingDate: Date): QRToken {
  // Generate 128-bit random token
  const token = crypto.randomBytes(16).toString("base64url");
  
  // Hash the token for storage
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  
  // Calculate expiration (30 minutes before booking start)
  const issuedAt = new Date();
  const expiresAt = new Date(bookingDate.getTime() - 30 * 60 * 1000);
  
  return {
    token,
    hash,
    issuedAt,
    expiresAt,
  };
}

/**
 * Hash a token to compare with stored hash
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate QR code image as base64 data URL
 */
export async function generateQRCodeImage(token: string, bookingId: string): Promise<string> {
  // Create deep link URL
  const checkInUrl = `${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000'}/check-in/${token}`;
  
  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 300,
    color: {
      dark: "#00CED1", // Primary aqua color
      light: "#FFFFFF",
    },
  });
  
  return qrCodeDataUrl;
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Check if token can be issued (within 24 hours of booking)
 */
export function canIssueToken(bookingDate: Date): boolean {
  const now = new Date();
  const twentyFourHoursBefore = new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000);
  return now >= twentyFourHoursBefore && now < bookingDate;
}
