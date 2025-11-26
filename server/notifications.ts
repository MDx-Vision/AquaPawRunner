import type { Booking, Pet, User, Session } from "@shared/schema";
import { formatDate } from "date-fns";

export interface NotificationService {
  sendBookingConfirmation(booking: Booking, pet: Pet, user: User): Promise<void>;
  sendBookingReminder(booking: Booking, pet: Pet, user: User): Promise<void>;
  sendSessionComplete(booking: Booking, pet: Pet, user: User, mediaUrl?: string): Promise<void>;
  sendCancellationConfirmation(booking: Booking, pet: Pet, user: User, refundAmount?: number): Promise<void>;
  sendRescheduleConfirmation(booking: Booking, pet: Pet, user: User, oldDate: Date): Promise<void>;
  sendMediaSharedNotification(booking: Booking, session: Session, pet: Pet, user: User, mediaCount: number): Promise<void>;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface SMSPayload {
  to: string;
  body: string;
}

export class NotificationManager implements NotificationService {
  private emailEnabled: boolean;
  private smsEnabled: boolean;

  constructor() {
    // Check if notification services are configured
    this.emailEnabled = !!process.env.RESEND_API_KEY;
    this.smsEnabled = !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN;
  }

  async sendBookingConfirmation(booking: Booking, pet: Pet, user: User): Promise<void> {
    const formattedDate = formatDate(new Date(booking.date), "MMMM d, yyyy 'at' h:mm a");
    
    const emailPayload: EmailPayload = {
      to: user.email,
      subject: `Booking Confirmed - ${pet.name}'s Session`,
      html: this.getBookingConfirmationHTML(booking, pet, user, formattedDate),
      text: this.getBookingConfirmationText(booking, pet, user, formattedDate)
    };

    const smsPayload: SMSPayload = {
      to: user.phone || "",
      body: `GoPAWZ: ${pet.name}'s session is confirmed for ${formattedDate}. You'll receive a QR code 24hrs before. Reply STOP to opt out.`
    };

    await this.send(emailPayload, smsPayload, user.phone);
  }

  async sendBookingReminder(booking: Booking, pet: Pet, user: User): Promise<void> {
    const formattedDate = formatDate(new Date(booking.date), "MMMM d, yyyy 'at' h:mm a");
    
    const emailPayload: EmailPayload = {
      to: user.email,
      subject: `Reminder: ${pet.name}'s Session Tomorrow`,
      html: this.getReminderHTML(booking, pet, user, formattedDate),
      text: this.getReminderText(booking, pet, user, formattedDate)
    };

    const smsPayload: SMSPayload = {
      to: user.phone || "",
      body: `GoPAWZ Reminder: ${pet.name}'s session is tomorrow at ${formattedDate}. Generate your QR code at gopawz.com/portal. Reply STOP to opt out.`
    };

    await this.send(emailPayload, smsPayload, user.phone);
  }

  async sendSessionComplete(booking: Booking, pet: Pet, user: User, mediaUrl?: string): Promise<void> {
    const formattedDate = formatDate(new Date(booking.date), "MMMM d, yyyy");
    
    const emailPayload: EmailPayload = {
      to: user.email,
      subject: `${pet.name}'s Session Complete!`,
      html: this.getSessionCompleteHTML(booking, pet, user, formattedDate, mediaUrl),
      text: this.getSessionCompleteText(booking, pet, user, formattedDate, mediaUrl)
    };

    const smsPayload: SMSPayload = {
      to: user.phone || "",
      body: `GoPAWZ: ${pet.name} had a great session! Check your email for photos and videos. Reply STOP to opt out.`
    };

    await this.send(emailPayload, smsPayload, user.phone);
  }

  async sendCancellationConfirmation(booking: Booking, pet: Pet, user: User, refundAmount?: number): Promise<void> {
    const formattedDate = formatDate(new Date(booking.date), "MMMM d, yyyy 'at' h:mm a");
    
    const emailPayload: EmailPayload = {
      to: user.email,
      subject: `Cancellation Confirmed - ${pet.name}'s Session`,
      html: this.getCancellationHTML(booking, pet, user, formattedDate, refundAmount),
      text: this.getCancellationText(booking, pet, user, formattedDate, refundAmount)
    };

    await this.send(emailPayload, null, user.phone);
  }

  async sendRescheduleConfirmation(booking: Booking, pet: Pet, user: User, oldDate: Date): Promise<void> {
    const newFormattedDate = formatDate(new Date(booking.date), "MMMM d, yyyy 'at' h:mm a");
    const oldFormattedDate = formatDate(oldDate, "MMMM d, yyyy 'at' h:mm a");
    
    const emailPayload: EmailPayload = {
      to: user.email,
      subject: `Booking Rescheduled - ${pet.name}'s Session`,
      html: this.getRescheduleHTML(booking, pet, user, oldFormattedDate, newFormattedDate),
      text: this.getRescheduleText(booking, pet, user, oldFormattedDate, newFormattedDate)
    };

    const smsPayload: SMSPayload = {
      to: user.phone || "",
      body: `GoPAWZ: ${pet.name}'s session rescheduled to ${newFormattedDate}. Reply STOP to opt out.`
    };

    await this.send(emailPayload, smsPayload, user.phone);
  }

  async sendMediaSharedNotification(booking: Booking, session: Session, pet: Pet, user: User, mediaCount: number): Promise<void> {
    const formattedDate = formatDate(new Date(booking.date), "MMMM d, yyyy");
    
    const emailPayload: EmailPayload = {
      to: user.email,
      subject: `📸 New Photos & Videos from ${pet.name}'s Session!`,
      html: this.getMediaSharedHTML(booking, session, pet, user, formattedDate, mediaCount),
      text: this.getMediaSharedText(booking, session, pet, user, formattedDate, mediaCount)
    };

    const smsPayload: SMSPayload = {
      to: user.phone || "",
      body: `GoPAWZ: ${mediaCount} new ${mediaCount === 1 ? 'photo/video' : 'photos/videos'} from ${pet.name}'s session! View them at gopawz.com/portal. Reply STOP to opt out.`
    };

    await this.send(emailPayload, smsPayload, user.phone);
  }

  private async send(emailPayload: EmailPayload, smsPayload: SMSPayload | null, phone?: string | null): Promise<void> {
    const promises: Promise<void>[] = [];

    // Send email if configured
    if (this.emailEnabled) {
      promises.push(this.sendEmail(emailPayload));
    } else {
      console.log("[Notifications] Email not configured, skipping:", emailPayload.subject);
    }

    // Send SMS if configured and phone provided
    if (this.smsEnabled && smsPayload && phone) {
      promises.push(this.sendSMS(smsPayload));
    } else if (smsPayload && phone) {
      console.log("[Notifications] SMS not configured, skipping:", smsPayload.body.substring(0, 50));
    }

    await Promise.all(promises);
  }

  private async sendEmail(payload: EmailPayload): Promise<void> {
    try {
      // Use Resend API
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "GoPAWZ <noreply@gopawz.com>",
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text
        })
      });

      if (!response.ok) {
        throw new Error(`Email send failed: ${response.statusText}`);
      }

      console.log(`[Notifications] Email sent to ${payload.to}: ${payload.subject}`);
    } catch (error) {
      console.error("[Notifications] Email send error:", error);
      throw error;
    }
  }

  private async sendSMS(payload: SMSPayload): Promise<void> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error("Twilio credentials not configured");
      }

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            To: payload.to,
            From: fromNumber,
            Body: payload.body
          })
        }
      );

      if (!response.ok) {
        throw new Error(`SMS send failed: ${response.statusText}`);
      }

      console.log(`[Notifications] SMS sent to ${payload.to}`);
    } catch (error) {
      console.error("[Notifications] SMS send error:", error);
      throw error;
    }
  }

  // Email Templates
  private getBookingConfirmationHTML(booking: Booking, pet: Pet, user: User, formattedDate: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background: linear-gradient(135deg, #06B6D4 0%, #FF6B35 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 30px; }
          .booking-details { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .booking-details h2 { margin-top: 0; color: #06B6D4; }
          .detail-row { margin: 10px 0; }
          .detail-label { font-weight: bold; color: #555; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🐾 Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>Great news! ${pet.name}'s session has been confirmed.</p>
          
          <div class="booking-details">
            <h2>Session Details</h2>
            <div class="detail-row">
              <span class="detail-label">Pet:</span> ${pet.name}
            </div>
            <div class="detail-row">
              <span class="detail-label">Date & Time:</span> ${formattedDate}
            </div>
            <div class="detail-row">
              <span class="detail-label">Service Type:</span> ${booking.serviceType}
            </div>
            <div class="detail-row">
              <span class="detail-label">Time Slot:</span> ${booking.timeSlot}
            </div>
          </div>

          <p><strong>What's Next?</strong></p>
          <ul>
            <li>You'll receive a QR code 24 hours before your session</li>
            <li>Show the QR code to staff when you arrive for touchless check-in</li>
            <li>We'll send you photos and videos after the session!</li>
          </ul>

          <a href="${process.env.VITE_APP_URL || 'http://localhost:5000'}/portal" class="btn">View in Portal</a>

          <p>See you soon!</p>
          <p>— The GoPAWZ Team</p>
        </div>
        <div class="footer">
          <p>GoPAWZ Mobile Dog Gym | Questions? Reply to this email</p>
        </div>
      </body>
      </html>
    `;
  }

  private getBookingConfirmationText(booking: Booking, pet: Pet, user: User, formattedDate: string): string {
    return `
🐾 Booking Confirmed!

Hi ${user.name},

Great news! ${pet.name}'s session has been confirmed.

SESSION DETAILS:
- Pet: ${pet.name}
- Date & Time: ${formattedDate}
- Service Type: ${booking.serviceType}
- Time Slot: ${booking.timeSlot}

WHAT'S NEXT:
- You'll receive a QR code 24 hours before your session
- Show the QR code to staff when you arrive for touchless check-in
- We'll send you photos and videos after the session!

View in Portal: ${process.env.VITE_APP_URL || 'http://localhost:5000'}/portal

See you soon!
— The GoPAWZ Team
    `.trim();
  }

  private getReminderHTML(booking: Booking, pet: Pet, user: User, formattedDate: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background: linear-gradient(135deg, #06B6D4 0%, #FF6B35 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 30px; }
          .reminder-box { background: #FFF7ED; border-left: 4px solid #FF6B35; padding: 20px; margin: 20px 0; }
          .btn { display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .btn-secondary { background: #06B6D4; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏰ Session Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          
          <div class="reminder-box">
            <h2 style="margin-top: 0; color: #FF6B35;">Tomorrow's Session</h2>
            <p><strong>${pet.name}</strong>'s session is tomorrow!</p>
            <p><strong>When:</strong> ${formattedDate}</p>
            <p><strong>Type:</strong> ${booking.serviceType} (${booking.timeSlot})</p>
          </div>

          <p><strong>Ready to Check In?</strong></p>
          <p>Generate your QR code now and save it to your phone:</p>

          <div style="text-align: center;">
            <a href="${process.env.VITE_APP_URL || 'http://localhost:5000'}/portal" class="btn">Generate QR Code</a>
          </div>

          <p style="margin-top: 30px;"><strong>Need to make changes?</strong></p>
          <div style="text-align: center;">
            <a href="${process.env.VITE_APP_URL || 'http://localhost:5000'}/portal" class="btn btn-secondary">Reschedule or Cancel</a>
          </div>

          <p style="margin-top: 30px;">Looking forward to seeing ${pet.name}!</p>
          <p>— The GoPAWZ Team</p>
        </div>
        <div class="footer">
          <p>GoPAWZ Mobile Dog Gym | Questions? Reply to this email</p>
        </div>
      </body>
      </html>
    `;
  }

  private getReminderText(booking: Booking, pet: Pet, user: User, formattedDate: string): string {
    return `
⏰ Session Reminder

Hi ${user.name},

${pet.name}'s session is tomorrow!

WHEN: ${formattedDate}
TYPE: ${booking.serviceType} (${booking.timeSlot})

READY TO CHECK IN?
Generate your QR code: ${process.env.VITE_APP_URL || 'http://localhost:5000'}/portal

NEED TO MAKE CHANGES?
Reschedule or cancel: ${process.env.VITE_APP_URL || 'http://localhost:5000'}/portal

Looking forward to seeing ${pet.name}!
— The GoPAWZ Team
    `.trim();
  }

  private getSessionCompleteHTML(booking: Booking, pet: Pet, user: User, formattedDate: string, mediaUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background: linear-gradient(135deg, #06B6D4 0%, #FF6B35 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 30px; }
          .success-box { background: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; }
          .btn { display: inline-block; background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Session Complete!</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          
          <div class="success-box">
            <h2 style="margin-top: 0; color: #10B981;">${pet.name} Had a Great Session!</h2>
            <p>Session completed on ${formattedDate}</p>
          </div>

          ${mediaUrl ? `
            <p><strong>📸 Photos & Videos</strong></p>
            <p>We captured some great moments from ${pet.name}'s session!</p>
            <a href="${mediaUrl}" class="btn">View Media</a>
          ` : `
            <p>We'll be uploading photos and videos from the session soon. Check back in your portal!</p>
          `}

          <p style="margin-top: 30px;"><strong>Want to book another session?</strong></p>
          <a href="${process.env.VITE_APP_URL || 'http://localhost:5000'}/booking" class="btn">Book Now</a>

          <p style="margin-top: 30px;">Thanks for trusting us with ${pet.name}!</p>
          <p>— The GoPAWZ Team</p>
        </div>
        <div class="footer">
          <p>GoPAWZ Mobile Dog Gym | Questions? Reply to this email</p>
        </div>
      </body>
      </html>
    `;
  }

  private getSessionCompleteText(booking: Booking, pet: Pet, user: User, formattedDate: string, mediaUrl?: string): string {
    return `
✅ Session Complete!

Hi ${user.name},

${pet.name} had a great session!

SESSION COMPLETED: ${formattedDate}

${mediaUrl ? `
📸 PHOTOS & VIDEOS
View media: ${mediaUrl}
` : `
We'll be uploading photos and videos soon. Check your portal!
`}

WANT TO BOOK ANOTHER SESSION?
Book now: ${process.env.VITE_APP_URL || 'http://localhost:5000'}/booking

Thanks for trusting us with ${pet.name}!
— The GoPAWZ Team
    `.trim();
  }

  private getCancellationHTML(booking: Booking, pet: Pet, user: User, formattedDate: string, refundAmount?: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background: #6B7280; padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 30px; }
          .cancellation-box { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 20px 0; }
          .refund-info { background: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }
          .btn { display: inline-block; background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          
          <div class="cancellation-box">
            <h2 style="margin-top: 0; color: #EF4444;">Cancellation Confirmed</h2>
            <p>Your booking for ${pet.name} has been cancelled.</p>
            <p><strong>Original Date:</strong> ${formattedDate}</p>
          </div>

          ${refundAmount ? `
            <div class="refund-info">
              <h3 style="margin-top: 0; color: #10B981;">💰 Refund Processed</h3>
              <p><strong>Amount:</strong> $${(refundAmount / 100).toFixed(2)}</p>
              <p>The refund will appear in your account within 5-10 business days.</p>
            </div>
          ` : `
            <p><strong>Note:</strong> No refund was issued based on our cancellation policy (bookings cancelled within 2 hours of start time are non-refundable).</p>
          `}

          <p style="margin-top: 30px;">We're sorry to see this booking cancelled. We hope to see ${pet.name} again soon!</p>

          <a href="${process.env.VITE_APP_URL || 'http://localhost:5000'}/booking" class="btn">Book Another Session</a>

          <p>— The GoPAWZ Team</p>
        </div>
        <div class="footer">
          <p>GoPAWZ Mobile Dog Gym | Questions? Reply to this email</p>
        </div>
      </body>
      </html>
    `;
  }

  private getCancellationText(booking: Booking, pet: Pet, user: User, formattedDate: string, refundAmount?: number): string {
    return `
Booking Cancelled

Hi ${user.name},

Your booking for ${pet.name} has been cancelled.

ORIGINAL DATE: ${formattedDate}

${refundAmount ? `
💰 REFUND PROCESSED
Amount: $${(refundAmount / 100).toFixed(2)}
The refund will appear in your account within 5-10 business days.
` : `
NOTE: No refund was issued based on our cancellation policy (bookings cancelled within 2 hours of start time are non-refundable).
`}

We're sorry to see this booking cancelled. We hope to see ${pet.name} again soon!

Book another session: ${process.env.VITE_APP_URL || 'http://localhost:5000'}/booking

— The GoPAWZ Team
    `.trim();
  }

  private getRescheduleHTML(booking: Booking, pet: Pet, user: User, oldDate: string, newDate: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background: linear-gradient(135deg, #06B6D4 0%, #FF6B35 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 30px; }
          .reschedule-box { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0; }
          .date-change { margin: 15px 0; }
          .old-date { text-decoration: line-through; color: #999; }
          .new-date { color: #3B82F6; font-weight: bold; font-size: 18px; }
          .btn { display: inline-block; background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔄 Booking Rescheduled</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          
          <div class="reschedule-box">
            <h2 style="margin-top: 0; color: #3B82F6;">Session Rescheduled</h2>
            <p>We've updated ${pet.name}'s session:</p>
            
            <div class="date-change">
              <div class="old-date">Previous: ${oldDate}</div>
              <div class="new-date">New: ${newDate}</div>
            </div>
          </div>

          <p><strong>What's Next?</strong></p>
          <ul>
            <li>You'll receive a QR code 24 hours before your new session time</li>
            <li>Show the QR code to staff when you arrive</li>
          </ul>

          <a href="${process.env.VITE_APP_URL || 'http://localhost:5000'}/portal" class="btn">View in Portal</a>

          <p>Looking forward to seeing ${pet.name}!</p>
          <p>— The GoPAWZ Team</p>
        </div>
        <div class="footer">
          <p>GoPAWZ Mobile Dog Gym | Questions? Reply to this email</p>
        </div>
      </body>
      </html>
    `;
  }

  private getRescheduleText(booking: Booking, pet: Pet, user: User, oldDate: string, newDate: string): string {
    return `
🔄 Booking Rescheduled

Hi ${user.name},

We've updated ${pet.name}'s session:

PREVIOUS: ${oldDate}
NEW: ${newDate}

WHAT'S NEXT:
- You'll receive a QR code 24 hours before your new session time
- Show the QR code to staff when you arrive

View in Portal: ${process.env.VITE_APP_URL || 'http://localhost:5000'}/portal

Looking forward to seeing ${pet.name}!
— The GoPAWZ Team
    `.trim();
  }

  private getMediaSharedHTML(booking: Booking, session: Session, pet: Pet, user: User, date: string, mediaCount: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Open Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .media-box { background: #f0fdff; border-left: 4px solid #06B6D4; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .btn { display: inline-block; background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📸 New Photos & Videos!</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          
          <div class="media-box">
            <h2 style="margin-top: 0; color: #06B6D4;">${mediaCount} New ${mediaCount === 1 ? 'Photo/Video' : 'Photos/Videos'} Available!</h2>
            <p>We've just uploaded ${mediaCount} ${mediaCount === 1 ? 'photo/video' : 'photos/videos'} from ${pet.name}'s session on ${date}.</p>
          </div>

          <p><strong>View your session media:</strong></p>
          <ul>
            <li>See all photos and videos from the session</li>
            <li>Download your favorites to keep forever</li>
            <li>Share with friends and family</li>
          </ul>

          <a href="${process.env.VITE_APP_URL || 'http://localhost:5000'}/portal" class="btn">View Media</a>

          <p>${pet.name} had an amazing session!</p>
          <p>— The GoPAWZ Team</p>
        </div>
        <div class="footer">
          <p>GoPAWZ Mobile Dog Gym | Questions? Reply to this email</p>
        </div>
      </body>
      </html>
    `;
  }

  private getMediaSharedText(booking: Booking, session: Session, pet: Pet, user: User, date: string, mediaCount: number): string {
    return `
📸 New Photos & Videos!

Hi ${user.name},

We've just uploaded ${mediaCount} ${mediaCount === 1 ? 'photo/video' : 'photos/videos'} from ${pet.name}'s session on ${date}.

VIEW YOUR SESSION MEDIA:
- See all photos and videos from the session
- Download your favorites to keep forever
- Share with friends and family

View Media: ${process.env.VITE_APP_URL || 'http://localhost:5000'}/portal

${pet.name} had an amazing session!
— The GoPAWZ Team
    `.trim();
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();
