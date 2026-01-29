# GoPAWZ - Mobile Dog Fitness Platform

## Business Overview

**GoPAWZ** is a mobile dog gym business providing door-to-door canine fitness services in Orange County, NY. The platform combines customer-facing booking/portal functionality with staff management capabilities.

- **Legal Entity:** Verdant Imperium LLC (DBA: GoPAWZ)
- **Domain:** https://go-pawz.com/
- **Contact:** admin@go-pawz.com | (845) 873-1034
- **Service Area:** Orange County, NY (Middletown, Bloomingburg, Wurtsboro, Otisville, Scotchtown, Pine Bush)

### Mission Statement
GoPAWZ exists to improve canine health and behavior by delivering door-to-door structured, purposeful fitness that allows dogs to move the way they were biologically designed to—creating balanced dogs and better households.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite 7** for builds
- **Wouter** for routing
- **TanStack React Query** for server state
- **Radix UI + shadcn/ui** for components
- **Tailwind CSS 4** for styling
- **React Hook Form + Zod** for forms

### Backend
- **Express 4** on Node.js 20
- **Passport.js** with LocalStrategy + bcrypt
- **PostgreSQL 16** via Neon serverless
- **Drizzle ORM** for database
- **Stripe** for payments
- **Multer** for file uploads

### Key Commands
```bash
npm run dev          # Start dev server with Vite HMR
npm run build        # Production build (client + server)
npm run start        # Run production bundle
npm run check        # TypeScript type check
npm run db:push      # Apply Drizzle migrations
```

## Project Structure

```
client/
├── src/
│   ├── App.tsx                 # Main router
│   ├── pages/
│   │   ├── portal/             # Customer dashboard (protected)
│   │   └── staff/              # Staff interfaces
│   ├── components/
│   │   └── ui/                 # Radix/shadcn components
│   ├── contexts/AuthContext.tsx
│   └── lib/api.ts              # API client
server/
├── app.ts                      # Express setup
├── auth.ts                     # Passport config
├── routes.ts                   # API endpoints
├── storage.ts                  # Database layer
└── stripeService.ts            # Payment logic
shared/
└── schema.ts                   # Drizzle + Zod schemas (single source of truth)
```

## Services & Pricing

### Session Types (Launch)
| Service | Duration | Price | Description |
|---------|----------|-------|-------------|
| **Standard Session** (Slatmill) | 30 min | $45 | Structured exercise, weight management, endurance training |
| **Pro Session** (Fly Chase Course) | 30 min | $35 | Lure-chase system up to 36 mph, 750 ft courses |

### Additional Pricing
- **Multi-Dog Discount:** 15% off additional dogs
- **Puppy/Senior/Special Needs:** $45
- **5-Session Package:** $200 (10% savings, 30-day expiration)
- **First-Time Discount:** 15% off first session

**IMPORTANT:** Use "slatmill" not "treadmill" throughout the app.

## Business Hours
- **Mon-Sat:** 8:00 AM - 5:30 PM
- **Sunday:** 9:00 AM - 1:00 PM
- **Closed:** Thanksgiving, Christmas, New Year's Day

### Available Time Slots
- **Morning:** 8:00, 8:30, 9:00, 9:30, 10:00, 10:30, 11:00 AM
- **Afternoon:** 12:30, 1:00, 1:30, 2:00, 2:30, 3:00, 3:30, 4:00, 4:30, 5:00, 5:30 PM
- **Buffer:** 30 minutes between appointments (travel time)

## Booking Policies

### Cancellation
| Time Before | Refund |
|-------------|--------|
| >24 hours | 100% |
| 12-24 hours | 100% |
| 2-12 hours | 0% |
| <2 hours | 0% |

### Reschedule
- **Minimum notice:** 24 hours
- **Max reschedules per booking:** 2
- **Fee:** None

### Booking Windows
- **Advance booking:** Up to 1 month
- **Minimum notice:** 24 hours

### No-Show Policy
1. First: Charge full amount
2. Second: Require prepayment for future
3. Third: Require prepayment

## Pet Requirements

### Required Vaccinations
- Rabies (required by law)
- DHPP/DAPP
- Bordetella
- Canine Influenza
- Leptospirosis

**Expiration warning:** 30 days before

### Restrictions
- **Minimum age:** 6 months
- **Minimum weight:** 2 lbs
- **No breed restrictions**
- Dogs must be on flea/tick prevention
- Dogs must be in good health
- Female dogs in heat cannot participate
- First session is an assessment
- Owner must disclose behavioral issues

## Referral Program

- **Referrer reward:** $15 credit toward future booking
- **Referred reward:** 100% off first booking
- **Completion trigger:** When new customer completes first booking
- **Max rewards:** Unlimited

## Brand Guidelines

### Colors (Updated from Questionnaire)
- **Primary (Aqua):** `#008E97` (Pantone PMS 321 C)
- **Secondary (Orange):** `#FC4C02` (Pantone PMS 1655 C)

### Brand Voice
Fun & Playful

### Social Media
- Instagram: https://instagram.com/gopawzny
- Facebook: https://facebook.com/gopawz
- TikTok: https://tiktok.com/gopawzny
- YouTube: https://youtube.com/@gopawz

## Legal Documents

Updated legal documents with correct entity name (Verdant Imperium LLC), all vaccination requirements, emergency vet authorization, and detailed policies.

| Document | Preview Link | Source |
|----------|--------------|--------|
| **Gap Analysis Report** | [View](https://mdx-vision.github.io/AquaPawRunner/legal/gap-analysis-report.html) | [GitHub](https://github.com/MDx-Vision/AquaPawRunner/blob/main/legal/gap-analysis-report.html) |
| **Liability Waiver** | [View](https://mdx-vision.github.io/AquaPawRunner/legal/liability-waiver.html) | [GitHub](https://github.com/MDx-Vision/AquaPawRunner/blob/main/legal/liability-waiver.html) |
| **Privacy Policy** | [View](https://mdx-vision.github.io/AquaPawRunner/legal/privacy-policy.html) | [GitHub](https://github.com/MDx-Vision/AquaPawRunner/blob/main/legal/privacy-policy.html) |
| **Terms of Service** | [View](https://mdx-vision.github.io/AquaPawRunner/legal/terms-of-service.html) | [GitHub](https://github.com/MDx-Vision/AquaPawRunner/blob/main/legal/terms-of-service.html) |

**Local paths:** `legal/` and `client/public/legal/`

## Authentication

### Login Methods (Planned)
- Email + Password (primary)
- Google Sign-In
- Apple Sign-In
- Facebook Sign-In
- Phone + SMS Code
- Magic Link

### Required Account Fields
- Phone Number
- Address
- Emergency Contact
- "How did you hear about us?"

## Notifications

### Email (Enabled)
**Transactional:** Booking confirmation, Payment receipt, 24hr reminder, Check-in confirmation, Session completed, Cancellation/Reschedule confirmation, Session photos ready

**Marketing:** Welcome series, Birthday/Gotcha day, Re-engagement (30+ days inactive)

### SMS (Enabled)
- Booking confirmation
- 24hr reminder
- Session photos ready

**From Name:** "GoPAWZ Team"
**Reply-To:** admin@go-pawz.com

## Payment

- **Provider:** Stripe
- **Methods:** Cards, Apple Pay, Google Pay, ACH
- **Tipping:** Enabled (10%, 15%, 20% suggested)

## Staff Accounts

| Name | Email | Role |
|------|-------|------|
| Manuel Acevedo JR | admin@go-pawz.com | Admin |
| Sorys Acevedo | sorysacevedo@icloud.com | Admin |
| Jalen Chapman | jalen.chapman@aol.com | Admin |

## Key Architecture Patterns

### Authentication Flow
1. POST `/api/auth/register` or `/api/auth/login`
2. Passport LocalStrategy validates (email + bcrypt)
3. Session stored in PostgreSQL via connect-pg-simple
4. Client checks `/api/auth/me` on load
5. Protected routes use `<ProtectedRoute>` wrapper

### QR Check-In System
1. Booking generates secure QR token (128-bit, hashed)
2. 30-minute expiry window before session
3. Staff scans with camera to validate
4. Audit trail in `booking_checkins` table

### Media Upload
- Multer handles validation
- Files stored in `/uploads`
- Served via `/uploads/*` route

## Database Schema

Key tables in `shared/schema.ts`:
- `users` - Customer accounts with referral codes, Stripe IDs
- `pets` - Pet profiles
- `bookings` - Sessions with QR tokens, status tracking
- `booking_checkins` - QR scan audit log
- `payments` - Stripe payment records
- `sessions` - Completed workout details
- `session_media` - Photos/videos
- `packages` - Multi-session packs
- `vaccinations` - Pet vaccination records
- `referrals` - Referral tracking
- `feedback` - Post-session reviews

## Launch Timeline

- **Soft Launch:** February 26, 2026
- **Public Launch:** March 12, 2026
- **Key Event:** July 23 - August 2, 2026

## Future Features (Priority Order)

**Priority 1:** Membership plans, Gift cards, Waitlist, Automated progress reports, Mobile app (iOS/Android)

**Priority 2:** Multi-location support, Dog fitness tracking, Group sessions

**Priority 3:** Live session video streaming

## Development Notes

- All schemas use Drizzle + Zod with shared types
- React Query caches server state
- Sessions are non-forced and dog-led
- The slatmill is non-motorized (dog controls pace)
- Van is climate-controlled for all-weather operation
