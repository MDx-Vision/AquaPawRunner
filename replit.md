# GoPAWZ - Mobile Dog Gym Platform

## Project Overview
GoPAWZ is a comprehensive platform for a mobile dog gym business combining features from Gingr (automation, scheduling) and RunLoyal (branded app, QR check-in). The system includes a public website, client portal for booking/management, and will include a mobile app.

**Brand Colors:** Aqua/Turquoise (#06B6D4) and Orange (#FF6B35)  
**Design:** 3D paw print imagery, modern/playful aesthetic  
**Fonts:** Montserrat (headings) + Open Sans (body)

## Core Requirements
1. **Eliminate phone calls** through automation and self-service
2. **QR-based touchless check-in** for staff efficiency
3. **Session media sharing** (photos/videos from sessions)
4. **Referral program** for customer acquisition
5. **Stripe payment integration** with refund policies

## Implementation Status

### Phase 1: Core Automation (2 of 3 Complete)
✅ **QR Check-In System** - COMPLETE
- Token generation with 128-bit security, server-side hashing
- 30-minute expiry window before booking time
- Owner QR display with countdown timer and force regeneration
- Staff scanner interface with camera-based validation
- Audit logging via booking_checkins table
- Terminal state protection (blocks after check-in, cancellation, completion)

✅ **Self-Service Booking Lifecycle** - COMPLETE
- Reschedule with 12-hour advance policy
- Cancel with automatic Stripe refunds:
  - >24 hours = 100% refund
  - 24hrs-2hrs = 50% refund
  - <2 hours = 0% refund
- Idempotent refund processing
- Terminal state protection
- Comprehensive error handling and UX feedback

✅ **Automated Notifications** - INFRASTRUCTURE COMPLETE (ready for API keys)
- Complete notification system built (`server/notifications.ts`)
- Email/SMS templates for: booking confirmation, 24hr reminder, session completion, cancellation, reschedule
- **INTEGRATED:** Booking confirmation (payment webhook), cancel, reschedule, session completion
- **PENDING:** 24-hour reminder (requires cron job/scheduler - see setup below)
- Graceful degradation when services not configured
- **TO ACTIVATE:** Need Resend API key and Twilio credentials (see setup below)

### Phase 2: Media & Engagement (Pending)
- Session media upload/sharing
- Referral program implementation
- Customer feedback collection

### Phase 3: Advanced Features (Pending)
- Package/membership system
- Waitlist management
- Multi-staff scheduling
- Advanced analytics

## Technical Architecture

### Database Schema (`shared/schema.ts`)
- **users** - Customer accounts with referral codes
- **pets** - Pet profiles with breed, age, weight, notes
- **vaccinations** - Vaccination records with expiry tracking
- **bookings** - Sessions with QR tokens, check-in status
- **booking_checkins** - Audit log for QR scans
- **payments** - Stripe payment records with refund tracking
- **sessions** - Session details and staff assignments
- **session_media** - Photos/videos from sessions
- **packages** - Multi-session packages/memberships
- **referrals** - Referral tracking and rewards
- **notification_logs** - Email/SMS delivery tracking
- **feedback** - Post-session customer feedback

### Key Files
- `server/routes.ts` - API endpoints for all operations
- `server/storage.ts` - Database interface layer
- `server/qr-utils.ts` - QR token generation and validation
- `server/notifications.ts` - Email/SMS notification system
- `server/stripeService.ts` - Payment and refund processing
- `client/src/components/qr-checkin.tsx` - Owner QR display
- `client/src/components/qr-scanner.tsx` - Staff scanner UI
- `client/src/components/booking-actions.tsx` - Reschedule/Cancel UI
- `client/src/pages/portal/dashboard.tsx` - Customer portal
- `client/src/pages/staff/scanner.tsx` - Staff check-in page

## Notification System Setup (When Ready)

### Resend (Email) Setup
1. Create free account at https://resend.com (3,000 emails/month free)
2. Get API key from dashboard
3. Store as secret:
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   ```
4. (Optional) Add custom domain for professional emails:
   - Use subdomain like `mail.gopawz.com`
   - Add DNS records from Resend dashboard
   - Verify domain

### Twilio (SMS) Setup
1. Create account at https://twilio.com
2. Get credentials from console:
   ```bash
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Store as secrets

### Integration Points

**✅ IMPLEMENTED:**
- **Booking created** (Stripe webhook) → Confirmation email/SMS
- **Booking cancelled** → Cancellation confirmation with refund info
- **Booking rescheduled** → Reschedule confirmation
- **Session completed** (POST /api/bookings/:id/complete) → Completion email with optional media link

**✅ 24-HOUR REMINDER (requires external cron trigger):**
- **Endpoint:** POST /api/cron/send-reminders
- **Function:** Queries bookings 23-25 hours away and sends reminders
- **Setup:** Configure external cron to call this endpoint daily
  - Replit Cron: `0 10 * * *` (10 AM daily)
  - curl command: `curl -X POST https://your-app.replit.app/api/cron/send-reminders`
  - Returns: JSON with count of reminders sent
- **Note:** Endpoint is fully implemented and testable - just needs cron trigger

**Note:** Notifications log to console when API keys not configured. System works fully without them - they enhance customer experience.

## Refund Policy Implementation
- **>24 hours before:** 100% refund via Stripe
- **24-2 hours before:** 50% refund via Stripe
- **<2 hours before:** No refund (non-refundable)
- Idempotent processing prevents double refunds
- Refund status tracked in payments table

## QR Check-In Security
- 128-bit random tokens generated per booking
- SHA-256 hashing (only hash stored in database)
- 30-minute expiry before booking time
- Force regeneration option for lost codes
- Prevents unlimited token rotation
- Audit trail in booking_checkins table

## Terminal States
Certain booking states are "terminal" and block modifications:
- **checked_in** - Cannot cancel, reschedule, or generate QR
- **cancelled** - Cannot reschedule, check in, or generate QR
- **completed** - Cannot modify in any way

## Development Notes
- Stack: React + Express + PostgreSQL + Drizzle ORM
- Payment: Stripe integration with refund support
- Auth: Session-based (can add OAuth later)
- Frontend routing: Wouter
- UI: Tailwind CSS + Radix UI components
- Deployment: Replit publishing ready

## User Preferences
- Focus on professional, modern design
- Prioritize automation over manual processes
- Mobile-first thinking (dog owners on the go)
- Clean, simple UX with clear feedback
- Aqua/turquoise and orange brand colors throughout

## Recent Changes
- 2025-11-26: Completed QR check-in system with force regeneration
- 2025-11-26: Completed booking lifecycle (reschedule/cancel) with Stripe refunds
- 2025-11-26: Built complete notification infrastructure (email/SMS templates)

## Next Steps
1. Test Phase 1 end-to-end (QR check-in, booking lifecycle)
2. Implement Phase 2: Session media sharing
3. Implement Phase 2: Referral program
4. Set up automated reminder cron job (24hrs before bookings)
5. Add notification credentials when ready to go live
