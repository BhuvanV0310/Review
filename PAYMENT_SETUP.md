# 💳 Stripe Payment Integration Setup Guide

This document provides comprehensive instructions for setting up and using the Stripe payment system integrated with your Next.js + Prisma + PostgreSQL application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Environment Configuration](#environment-configuration)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Payment Flow](#payment-flow)
6. [Webhook Configuration](#webhook-configuration)
7. [Testing Guide](#testing-guide)
8. [Security Features](#security-features)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Stripe payment integration provides:

- **Subscription Management**: Monthly recurring payments for plans
- **Secure Checkout**: Stripe-hosted checkout pages (PCI compliant)
- **Automatic Updates**: User plan activation via webhooks
- **Payment History**: Complete transaction tracking in database
- **TypeScript Safety**: Fully typed API with Prisma integration

### Technology Stack

- **Frontend**: Next.js 15.5.2 with App Router
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL with Prisma ORM
- **Payment Gateway**: Stripe API
- **Authentication**: NextAuth.js with session-based security

---

## 🔧 Environment Configuration

### 1. Get Your Stripe API Keys

1. Sign up at [stripe.com](https://stripe.com) (free)
2. Go to **Developers → API Keys**
3. Copy your keys (use Test mode for development)

### 2. Update `.env` File

Add the following to your `.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
```

**Important Notes:**
- Use `sk_test_` keys for development, `sk_live_` for production
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Webhook secret will be obtained after webhook setup (see [Webhook Configuration](#webhook-configuration))

### 3. Install Dependencies

Already installed in your project:
```bash
npm install stripe @stripe/stripe-js
```

---

## 🗄️ Database Schema

### Updated Models

**User Model** (with Stripe fields):
```prisma
model User {
  id               String    @id @default(uuid())
  email            String    @unique
  name             String?
  role             Role      @default(CUSTOMER)
  
  // Stripe Integration
  stripeCustomerId String?   @unique
  activePlanId     String?
  activePlan       Plan?     @relation(fields: [activePlanId], references: [id])
  
  payments         Payment[]
  // ... other relations
}
```

**Plan Model** (with Stripe fields):
```prisma
model Plan {
  id              String   @id @default(uuid())
  name            String
  price           Float
  description     String
  features        String[]
  
  // Stripe Integration
  stripePriceId   String?  @unique
  stripeProductId String?  @unique
  
  users           User[]
}
```

**Payment Model** (with Stripe fields):
```prisma
model Payment {
  id                    String        @id @default(uuid())
  userId                String
  planId                String?
  amount                Float
  status                PaymentStatus @default(PENDING)
  
  // Stripe Integration
  stripePaymentIntentId String?       @unique
  stripeSessionId       String?       @unique
  
  planName              String?
  metadata              Json?
  createdAt             DateTime      @default(now())
}
```

### Run Migration

After updating your schema:

```bash
npm run db:generate
npm run db:migrate
```

---

## 🔌 API Endpoints

### 1. Create Checkout Session

**Endpoint**: `POST /api/stripe/create-checkout-session`

**Purpose**: Creates a Stripe Checkout session for plan subscription

**Authentication**: Required (NextAuth session)

**Request Body**:
```typescript
{
  planId: string  // Plan ID from your database
}
```

**Response** (Success - 200):
```typescript
{
  sessionId: string  // Stripe session ID
  url: string        // Redirect URL to Stripe Checkout
}
```

**Response** (Error - 401/404/500):
```typescript
{
  error: string
  details?: string
}
```

**Flow**:
1. Validates user authentication via NextAuth
2. Fetches plan from database
3. Creates/retrieves Stripe customer
4. Creates Stripe Checkout session
5. Creates pending payment record
6. Returns checkout URL

**Example Usage** (Frontend):
```typescript
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId: 'plan-uuid-here' })
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe
```

---

### 2. Stripe Webhook Handler

**Endpoint**: `POST /api/stripe/webhook`

**Purpose**: Receives and processes Stripe events (post-payment updates)

**Authentication**: Stripe signature verification

**Handled Events**:

1. **`checkout.session.completed`**
   - Updates payment status to `COMPLETED`
   - Sets user's `activePlanId`
   - Records transaction details

2. **`customer.subscription.created`**
   - Logs subscription creation
   - Links subscription to user

3. **`customer.subscription.updated`**
   - Handles plan changes
   - Removes active plan if canceled/past_due

4. **`customer.subscription.deleted`**
   - Removes user's active plan
   - Updates payment records

5. **`invoice.payment_succeeded`**
   - Records successful recurring payments
   - Creates `COMPLETED` payment record

6. **`invoice.payment_failed`**
   - Records failed payments
   - Creates `FAILED` payment record

**Response**:
```typescript
{ received: true }
```

**Security**: Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`

---

### 3. Get Plans

**Endpoint**: `GET /api/plans`

**Purpose**: Fetches all active subscription plans

**Authentication**: None (public endpoint)

**Response**:
```typescript
{
  plans: Array<{
    id: string
    name: string
    price: number
    description: string
    features: string[]
    status: string
    stripePriceId?: string
    stripeProductId?: string
  }>
}
```

---

## 🔄 Payment Flow

### End-to-End Flow Diagram

```
User → Pricing Page → Select Plan → API Call → Stripe Checkout
                                                      ↓
User ← Dashboard ← Update User ← Webhook ← Payment Success
```

### Detailed Steps

1. **User Browses Plans**
   - Navigate to `/pricing`
   - View available subscription plans
   - See features, pricing, descriptions

2. **User Clicks "Subscribe"**
   - Frontend calls `POST /api/stripe/create-checkout-session`
   - Backend validates authentication
   - Creates Stripe customer (if new)
   - Creates checkout session
   - Creates pending payment record

3. **User Redirected to Stripe**
   - Secure Stripe-hosted checkout page
   - Enter payment details
   - Complete payment

4. **Stripe Processes Payment**
   - Payment succeeded or failed
   - Stripe sends webhook event to your server

5. **Webhook Updates Database**
   - Verify webhook signature
   - Update payment status to `COMPLETED`
   - Set user's `activePlanId`
   - Create transaction record

6. **User Redirected Back**
   - Stripe redirects to `/payments/success?session_id=...`
   - Success page displays confirmation
   - User can access dashboard with active plan

---

## 🪝 Webhook Configuration

### Local Development (Using Stripe CLI)

1. **Install Stripe CLI**:
   ```bash
   # Windows (via Scoop)
   scoop install stripe
   
   # macOS (via Homebrew)
   brew install stripe/stripe-cli/stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy Webhook Secret**:
   - Stripe CLI will output: `whsec_...`
   - Add to `.env` as `STRIPE_WEBHOOK_SECRET`

5. **Trigger Test Events**:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger invoice.payment_succeeded
   ```

### Production Setup

1. **Go to Stripe Dashboard**:
   - Navigate to **Developers → Webhooks**
   - Click **Add endpoint**

2. **Configure Endpoint**:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Get Webhook Secret**:
   - After creating, click **Reveal** under "Signing secret"
   - Copy `whsec_...` value
   - Add to production environment variables

4. **Test the Webhook**:
   - Stripe Dashboard → Send test webhook
   - Check your server logs for successful processing

---

## 🧪 Testing Guide

### 1. Create Test Plans in Database

You can create plans with Stripe products using the utility function:

```typescript
import { createStripeProduct } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// Create Stripe product and price
const { productId, priceId } = await createStripeProduct(
  'Pro Plan',
  'Advanced features for growing businesses',
  2999  // $29.99 in cents
);

// Create plan in database
await prisma.plan.create({
  data: {
    name: 'Pro Plan',
    price: 29.99,
    description: 'Advanced features for growing businesses',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    status: 'ACTIVE',
    stripePriceId: priceId,
    stripeProductId: productId,
  },
});
```

### 2. Use Stripe Test Cards

**Successful Payment**:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Declined Payment**:
- Card: `4000 0000 0000 0002`

**Requires Authentication (3D Secure)**:
- Card: `4000 0025 0000 3155`

Full list: [Stripe Testing Cards](https://stripe.com/docs/testing)

### 3. Test Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Start Stripe Webhook Forwarding**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Create Test User**:
   ```bash
   npm run auth:test
   ```
   Login with: `customer@test.com` / `customer123`

4. **Test Payment Flow**:
   - Navigate to `http://localhost:3000/pricing`
   - Click "Subscribe" on any plan
   - Use test card `4242 4242 4242 4242`
   - Complete checkout
   - Verify redirect to success page

5. **Verify Database Updates**:
   ```bash
   npm run db:studio
   ```
   - Check `Payment` table for completed payment
   - Check `User` table for updated `activePlanId`

### 4. Test Webhook Events

```bash
# Test checkout completion
stripe trigger checkout.session.completed

# Test subscription events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Test invoice events
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

---

## 🔒 Security Features

### 1. NextAuth Session Validation

All payment endpoints require authenticated users:

```typescript
const session = await getServerSession(authOptions);
if (!session || !session.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Webhook Signature Verification

Webhooks verify Stripe signatures to prevent forgery:

```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### 3. Environment Variable Protection

- `STRIPE_SECRET_KEY`: Server-side only (never exposed to client)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Client-side safe (read-only)
- Webhook secret protects against unauthorized webhook calls

### 4. Database Transaction Safety

All payment updates use Prisma transactions:

```typescript
await prisma.$transaction([
  prisma.payment.update(...),
  prisma.user.update(...)
]);
```

### 5. PCI Compliance

- No credit card data stored in your database
- All payment processing handled by Stripe
- Stripe Checkout handles PCI compliance

---

## 🐛 Troubleshooting

### Issue: "Stripe customer not found"

**Solution**: User's `stripeCustomerId` is missing or invalid.

```typescript
// Manually reset customer ID
await prisma.user.update({
  where: { id: userId },
  data: { stripeCustomerId: null }
});
// Next checkout will create new customer
```

---

### Issue: "Webhook signature verification failed"

**Causes**:
1. Wrong `STRIPE_WEBHOOK_SECRET` in `.env`
2. Body parser interfering (must use raw body)
3. Stripe CLI not running (local dev)

**Solution**:
```bash
# For local dev
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook secret printed by CLI
```

---

### Issue: "Plan not configured for Stripe"

**Cause**: Plan missing `stripePriceId`

**Solution**:
1. Create Stripe product/price:
   ```bash
   # Via Stripe Dashboard
   # Products → Add product → Create price
   ```
2. Update plan in database:
   ```typescript
   await prisma.plan.update({
     where: { id: planId },
     data: { 
       stripePriceId: 'price_...',
       stripeProductId: 'prod_...'
     }
   });
   ```

---

### Issue: "Payment completed but user plan not updated"

**Causes**:
1. Webhook not received
2. Webhook processing error
3. Metadata missing from checkout session

**Debugging**:
1. Check Stripe Dashboard → Webhooks → Events
2. Check server logs for webhook errors
3. Manually update user:
   ```typescript
   await prisma.user.update({
     where: { email: 'user@example.com' },
     data: { activePlanId: 'plan-id-here' }
   });
   ```

---

### Issue: "CORS error on checkout redirect"

**Cause**: Incorrect `NEXTAUTH_URL` or redirect URLs

**Solution**:
Update `.env`:
```env
NEXTAUTH_URL="http://localhost:3000"  # Local
NEXTAUTH_URL="https://yourdomain.com" # Production
```

---

### Issue: "Database connection failed during webhook"

**Cause**: Cold start or connection pool exhausted

**Solution**:
Prisma connection pooling is already configured in `lib/db.ts`. If issues persist:

```typescript
// Add connection timeout
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 📊 Monitoring & Logs

### View Stripe Events

Stripe Dashboard → Developers → Events

### View Webhook Deliveries

Stripe Dashboard → Developers → Webhooks → [Your Endpoint] → Attempts

### Database Queries

```bash
# Open Prisma Studio
npm run db:studio

# View payments
SELECT * FROM "Payment" WHERE status = 'COMPLETED' ORDER BY "createdAt" DESC;

# View active subscriptions
SELECT u.email, p.name, p.price 
FROM "User" u 
JOIN "Plan" p ON u."activePlanId" = p.id;
```

---

## 🚀 Deployment Checklist

### Before Going Live

- [ ] Switch to Stripe live keys (`sk_live_`, `pk_live_`)
- [ ] Configure production webhook endpoint
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Set `STRIPE_WEBHOOK_SECRET` from production webhook
- [ ] Test payment flow with real card (refund immediately)
- [ ] Enable Stripe Radar for fraud protection
- [ ] Set up email receipts in Stripe Dashboard
- [ ] Configure billing portal (for subscription management)
- [ ] Add terms of service and privacy policy links
- [ ] Test webhook delivery in production

---

## 📚 Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## 🎉 Summary

You now have a production-grade Stripe payment system with:

✅ Secure checkout sessions  
✅ Automated webhook handling  
✅ Database transaction integrity  
✅ NextAuth session protection  
✅ Comprehensive error handling  
✅ Complete payment history tracking  
✅ TypeScript type safety  

**Next Steps**:
1. Get PostgreSQL connection string (see `DATABASE_SETUP.md`)
2. Run database migrations
3. Set up Stripe account and get API keys
4. Configure webhook forwarding
5. Test payment flow with test cards
6. Deploy to production! 🚀

---

**Questions?** Check the troubleshooting section or refer to:
- `NEXTAUTH_SETUP.md` for authentication setup
- `DATABASE_SETUP.md` for database configuration
- `MIGRATION_GUIDE.md` for upgrade path
