# 💳 Stripe Payment Flow Diagram

## Complete Payment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STRIPE PAYMENT SYSTEM                              │
│                     Next.js + Prisma + PostgreSQL + Stripe                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: User Browses Plans                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Browser                  Next.js Frontend                Database          │
│  ───────                  ─────────────────               ────────          │
│                                                                              │
│    │                            │                            │               │
│    │  GET /pricing              │                            │               │
│    │───────────────────────────>│                            │               │
│    │                            │                            │               │
│    │                            │  SELECT * FROM "Plan"      │               │
│    │                            │  WHERE status = 'ACTIVE'   │               │
│    │                            │───────────────────────────>│               │
│    │                            │                            │               │
│    │                            │<───────────────────────────│               │
│    │                            │  Returns: Plans with       │               │
│    │  HTML with Plan Cards     │  stripePriceId             │               │
│    │<───────────────────────────│                            │               │
│    │                                                                          │
│    │  ┌──────────────────────────────────────────┐                          │
│    │  │  Pricing Page                            │                          │
│    │  │  ┌────────┐  ┌────────┐  ┌────────┐     │                          │
│    │  │  │ Basic  │  │  Pro   │  │ Enter  │     │                          │
│    │  │  │ $9.99  │  │ $29.99 │  │ $99.99 │     │                          │
│    │  │  └────────┘  └────────┘  └────────┘     │                          │
│    │  │  [Subscribe] [Subscribe] [Subscribe]    │                          │
│    │  └──────────────────────────────────────────┘                          │
│    │                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: User Clicks "Subscribe"                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Browser         Next.js API              Stripe API        Database        │
│  ───────         ───────────              ──────────        ────────        │
│                                                                              │
│    │                  │                        │                │            │
│    │  POST /api/stripe/create-checkout-session│                │            │
│    │  { planId }      │                        │                │            │
│    │─────────────────>│                        │                │            │
│    │                  │                        │                │            │
│    │                  │ 1. Validate Session    │                │            │
│    │                  │    (NextAuth)          │                │            │
│    │                  │                        │                │            │
│    │                  │ 2. Get User from DB    │                │            │
│    │                  │───────────────────────────────────────>│            │
│    │                  │<───────────────────────────────────────│            │
│    │                  │                        │                │            │
│    │                  │ 3. Get/Create Stripe Customer           │            │
│    │                  │────────────────────────>                │            │
│    │                  │ stripe.customers.list()│                │            │
│    │                  │<────────────────────────                │            │
│    │                  │                        │                │            │
│    │                  │ 4. Update User with stripeCustomerId   │            │
│    │                  │───────────────────────────────────────>│            │
│    │                  │                        │                │            │
│    │                  │ 5. Create Checkout Session              │            │
│    │                  │────────────────────────>                │            │
│    │                  │ stripe.checkout.sessions.create()       │            │
│    │                  │<────────────────────────                │            │
│    │                  │                        │                │            │
│    │                  │ 6. Create Payment Record (PENDING)     │            │
│    │                  │───────────────────────────────────────>│            │
│    │                  │                        │                │            │
│    │  { url, sessionId }                      │                │            │
│    │<─────────────────│                        │                │            │
│    │                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Redirect to Stripe Checkout                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    │                                                                          │
│    │  window.location.href = checkout_url                                    │
│    │─────────────────────────────────────────────────────────>              │
│    │                                                                          │
│    │                       Stripe Checkout Page                              │
│    │  ┌─────────────────────────────────────────────────────┐               │
│    │  │  🔒 Secure Payment (checkout.stripe.com)            │               │
│    │  │                                                      │               │
│    │  │  Order Summary:                                     │               │
│    │  │  Pro Plan - $29.99/month                            │               │
│    │  │                                                      │               │
│    │  │  Card Information:                                  │               │
│    │  │  [4242 4242 4242 4242]                              │               │
│    │  │  Expiry: [12/25]  CVC: [123]                        │               │
│    │  │  ZIP: [12345]                                       │               │
│    │  │                                                      │               │
│    │  │  [Pay $29.99]                                       │               │
│    │  └─────────────────────────────────────────────────────┘               │
│    │                                                                          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Stripe Processes Payment                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Action         Stripe System            Stripe Backend                │
│  ───────────         ─────────────            ───────────────               │
│                                                                              │
│      │                     │                         │                       │
│      │  Clicks "Pay"       │                         │                       │
│      │────────────────────>│                         │                       │
│      │                     │                         │                       │
│      │                     │  1. Validate Card       │                       │
│      │                     │────────────────────────>│                       │
│      │                     │                         │                       │
│      │                     │  2. Check Fraud (Radar) │                       │
│      │                     │────────────────────────>│                       │
│      │                     │                         │                       │
│      │                     │  3. Process Payment     │                       │
│      │                     │────────────────────────>│                       │
│      │                     │                         │                       │
│      │                     │  4. Create Subscription │                       │
│      │                     │────────────────────────>│                       │
│      │                     │                         │                       │
│      │  ✅ Payment Success │                         │                       │
│      │<────────────────────│                         │                       │
│      │                                                                        │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Stripe Sends Webhook                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Stripe API          Webhook Handler          Database                      │
│  ──────────          ───────────────          ────────                      │
│                                                                              │
│      │                     │                      │                          │
│      │  POST /api/stripe/webhook                 │                          │
│      │  Event: checkout.session.completed        │                          │
│      │  Signature: stripe-signature              │                          │
│      │────────────────────>│                      │                          │
│      │                     │                      │                          │
│      │                     │ 1. Verify Signature  │                          │
│      │                     │    (STRIPE_WEBHOOK_SECRET)                     │
│      │                     │                      │                          │
│      │                     │ 2. Parse Event Data  │                          │
│      │                     │    - userId          │                          │
│      │                     │    - planId          │                          │
│      │                     │    - sessionId       │                          │
│      │                     │    - paymentIntentId │                          │
│      │                     │                      │                          │
│      │                     │ 3. Update Payment Record                       │
│      │                     │    status = 'COMPLETED'                        │
│      │                     │─────────────────────>│                          │
│      │                     │                      │                          │
│      │                     │ 4. Set User activePlanId                       │
│      │                     │─────────────────────>│                          │
│      │                     │                      │                          │
│      │  { received: true } │                      │                          │
│      │<────────────────────│                      │                          │
│      │                                                                        │
│                                                                               │
│  Database Changes:                                                           │
│  ┌────────────────────────────────────────────┐                             │
│  │ Payment Table:                              │                             │
│  │   status: PENDING → COMPLETED ✅            │                             │
│  │   stripePaymentIntentId: pi_...            │                             │
│  │   metadata: { subscriptionId, ... }        │                             │
│  │                                             │                             │
│  │ User Table:                                 │                             │
│  │   activePlanId: null → plan-uuid ✅         │                             │
│  └────────────────────────────────────────────┘                             │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: User Redirected to Success Page                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Stripe           Browser                Next.js                            │
│  ──────           ───────                ───────                            │
│                                                                              │
│     │                │                       │                               │
│     │  Redirect to:  │                       │                               │
│     │  /payments/success?session_id=...      │                               │
│     │───────────────>│                       │                               │
│     │                │                       │                               │
│     │                │  GET /payments/success│                               │
│     │                │──────────────────────>│                               │
│     │                │                       │                               │
│     │                │  Success Page HTML    │                               │
│     │                │<──────────────────────│                               │
│     │                │                       │                               │
│     │                │                                                        │
│     │  ┌─────────────────────────────────────────────┐                      │
│     │  │  ✅ Payment Successful!                     │                      │
│     │  │                                             │                      │
│     │  │  Thank you for subscribing!                │                      │
│     │  │  Your account has been upgraded.           │                      │
│     │  │                                             │                      │
│     │  │  [Go to Dashboard] [View Payment History]  │                      │
│     │  └─────────────────────────────────────────────┘                      │
│     │                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ ONGOING: Subscription Management                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Stripe (Monthly)    Webhook Handler          Database                      │
│  ────────────────    ───────────────          ────────                      │
│                                                                              │
│      │                     │                      │                          │
│      │  EVERY MONTH:       │                      │                          │
│      │                     │                      │                          │
│      │  Event: invoice.payment_succeeded          │                          │
│      │────────────────────>│                      │                          │
│      │                     │                      │                          │
│      │                     │  Create Payment Record                         │
│      │                     │  (Subscription Renewal)                        │
│      │                     │─────────────────────>│                          │
│      │                     │                      │                          │
│      │  { received: true } │                      │                          │
│      │<────────────────────│                      │                          │
│      │                                                                        │
│      │  IF CARD FAILS:     │                      │                          │
│      │                     │                      │                          │
│      │  Event: invoice.payment_failed             │                          │
│      │────────────────────>│                      │                          │
│      │                     │                      │                          │
│      │                     │  Create Failed Payment│                         │
│      │                     │  Remove activePlanId │                          │
│      │                     │─────────────────────>│                          │
│      │                     │                      │                          │
│      │  IF USER CANCELS:   │                      │                          │
│      │                     │                      │                          │
│      │  Event: customer.subscription.deleted      │                          │
│      │────────────────────>│                      │                          │
│      │                     │                      │                          │
│      │                     │  Remove activePlanId │                          │
│      │                     │─────────────────────>│                          │
│      │                                                                        │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ SECURITY LAYERS                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🔒 Layer 1: NextAuth Session Validation                                    │
│     ├─ All payment endpoints require authentication                         │
│     ├─ JWT/Session token verified                                           │
│     └─ User identity confirmed                                              │
│                                                                              │
│  🔒 Layer 2: Stripe Webhook Signature                                       │
│     ├─ Verifies event came from Stripe                                      │
│     ├─ Uses STRIPE_WEBHOOK_SECRET                                           │
│     └─ Prevents webhook spoofing                                            │
│                                                                              │
│  🔒 Layer 3: No Credit Card Storage                                         │
│     ├─ Cards processed by Stripe (PCI compliant)                            │
│     ├─ Only store Stripe IDs (tokens)                                       │
│     └─ Zero PCI compliance burden                                           │
│                                                                              │
│  🔒 Layer 4: Environment Variable Protection                                │
│     ├─ Secrets in .env (not committed)                                      │
│     ├─ Server-side keys never exposed                                       │
│     └─ .gitignore prevents accidental commits                               │
│                                                                              │
│  🔒 Layer 5: Prisma Transaction Safety                                      │
│     ├─ Atomic database operations                                           │
│     ├─ Rollback on errors                                                   │
│     └─ Data consistency guaranteed                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ DATA FLOW SUMMARY                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Journey:                                                               │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐     │
│  │   Browse   │───>│  Subscribe │───>│  Pay with  │───>│  Success   │     │
│  │   Plans    │    │   Button   │    │   Stripe   │    │   Page     │     │
│  └────────────┘    └────────────┘    └────────────┘    └────────────┘     │
│                                                                              │
│  System Journey:                                                             │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐     │
│  │   Create   │───>│  Redirect  │───>│  Webhook   │───>│  Activate  │     │
│  │  Session   │    │  to Stripe │    │  Updates   │    │    Plan    │     │
│  └────────────┘    └────────────┘    └────────────┘    └────────────┘     │
│                                                                              │
│  Database Updates:                                                           │
│  Payment.status:     PENDING → COMPLETED                                    │
│  User.activePlanId:  null → plan-uuid                                       │
│  User.stripeCustomerId: Created on first payment                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ ERROR HANDLING                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ❌ User Not Authenticated:                                                  │
│     → Return 401 Unauthorized                                               │
│     → Redirect to /auth/login                                               │
│                                                                              │
│  ❌ Plan Not Found:                                                          │
│     → Return 404 Not Found                                                  │
│     → Show error message                                                    │
│                                                                              │
│  ❌ Plan Missing Stripe ID:                                                  │
│     → Return 400 Bad Request                                                │
│     → Message: "Plan not configured for payments"                           │
│                                                                              │
│  ❌ Stripe API Error:                                                        │
│     → Catch exception                                                       │
│     → Log error details                                                     │
│     → Return user-friendly message                                          │
│                                                                              │
│  ❌ Webhook Signature Invalid:                                               │
│     → Return 400 Bad Request                                                │
│     → Log suspicious activity                                               │
│     → Do not process event                                                  │
│                                                                              │
│  ❌ Database Connection Failed:                                              │
│     → Retry with exponential backoff                                        │
│     → Log error for monitoring                                              │
│     → Return 500 Internal Server Error                                      │
│                                                                              │
│  ❌ Payment Cancelled:                                                       │
│     → Redirect to /pricing?canceled=true                                    │
│     → Show "Payment cancelled" message                                      │
│     → Allow retry                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│ KEY COMPONENTS                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📁 lib/stripe.ts                                                            │
│     ├─ Stripe client initialization                                         │
│     ├─ Helper functions (customer, session, product)                        │
│     └─ Webhook signature verification                                       │
│                                                                              │
│  📁 app/api/stripe/create-checkout-session/route.ts                         │
│     ├─ POST endpoint for session creation                                   │
│     ├─ NextAuth session validation                                          │
│     ├─ Plan validation & Stripe customer handling                           │
│     └─ Payment record creation                                              │
│                                                                              │
│  📁 app/api/stripe/webhook/route.ts                                         │
│     ├─ POST endpoint for Stripe events                                      │
│     ├─ Signature verification                                               │
│     ├─ Event type handling (6 event types)                                  │
│     └─ Database updates via Prisma                                          │
│                                                                              │
│  📁 app/pricing/page.tsx                                                     │
│     ├─ Pricing display component                                            │
│     ├─ Subscribe button handler                                             │
│     ├─ Loading & error states                                               │
│     └─ Stripe Checkout redirect                                             │
│                                                                              │
│  📁 app/payments/success/page.tsx                                            │
│     ├─ Success confirmation page                                            │
│     ├─ Session ID display                                                   │
│     └─ Navigation to dashboard/payments                                     │
│                                                                              │
│  📁 prisma/schema.prisma                                                     │
│     ├─ User model with Stripe fields                                        │
│     ├─ Plan model with Stripe IDs                                           │
│     └─ Payment model with transaction data                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


This architecture ensures:
✅ Secure payment processing
✅ Automatic plan activation
✅ Complete transaction tracking
✅ TypeScript type safety
✅ Production-ready reliability
```
