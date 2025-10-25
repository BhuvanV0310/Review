# 🚀 Complete Setup Checklist

This is your step-by-step guide to get the entire application running with all features enabled.

---

## ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] PostgreSQL database (or Neon/Supabase account)
- [ ] Stripe account (free at stripe.com)
- [ ] Code editor (VS Code recommended)

---

## 📋 Step-by-Step Setup

### 1. Clone & Install

```bash
# If not already cloned
git clone https://github.com/BhuvanV0310/Review.git
cd Review
git checkout market-ready-upgrade

# Install dependencies
npm install
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### 2. Database Setup

#### Option A: Neon.tech (Recommended - Free)
1. Go to https://neon.tech
2. Sign up / Login
3. Create new project
4. Copy connection string

#### Option B: Supabase
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection pooling string

#### Option C: Railway
1. Go to https://railway.app
2. New Project → Add PostgreSQL
3. Copy DATABASE_URL from Variables

```bash
# Update .env file with your database URL
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### 3. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Seed sample data
npm run db:seed

# Test connection (optional)
npm run db:test
```

**Expected Output**:
```
✅ Database connection successful
✅ Prisma client initialized
✅ Sample data created
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### 4. NextAuth Configuration

```bash
# Generate secret key
openssl rand -base64 32

# Or use online generator:
# https://generate-secret.vercel.app/32
```

Update `.env`:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
```

**Optional: Google OAuth**
1. Go to https://console.cloud.google.com
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add to `.env`:
```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### 5. Create Test Users

```bash
npm run auth:test
```

**Test Credentials Created**:
- Admin: `admin@test.com` / `admin123`
- Customer: `customer@test.com` / `customer123`
- Partner: `partner@test.com` / `partner123`

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### 6. Stripe Setup

#### Get API Keys
1. Go to https://dashboard.stripe.com
2. Sign up / Login
3. Navigate to Developers → API Keys
4. **Use Test Mode** (toggle in top right)
5. Copy keys

Update `.env`:
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### 7. Sync Plans with Stripe

This creates Stripe products for your database plans:

```bash
npm run stripe:sync-plans
```

**Expected Output**:
```
🔄 Starting Stripe plan synchronization...
📦 Processing: Basic Plan ($9.99/month)
   ✅ Created Stripe product: prod_...
   ✅ Created Stripe price: price_...
🎉 Stripe synchronization completed!
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### 8. Stripe Webhook Setup (Development)

#### Install Stripe CLI

**Windows (Scoop)**:
```bash
scoop install stripe
```

**macOS (Homebrew)**:
```bash
brew install stripe/stripe-cli/stripe
```

**Linux**:
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

#### Configure Webhook Forwarding

```bash
# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Copy webhook secret** from CLI output:
```
Your webhook signing secret is whsec_...
```

Update `.env`:
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### 9. AI Review System Setup (Optional)

For AI-powered sentiment analysis on customer reviews:

#### Get API Keys

**OpenAI** (Recommended for best accuracy):
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy key (starts with `sk-`)

**HuggingFace** (Free alternative):
1. Go to https://huggingface.co/settings/tokens
2. Create new token
3. Copy token (starts with `hf_`)

Update `.env`:
```env
OPENAI_API_KEY="sk-..."
HF_ACCESS_TOKEN="hf_..."
```

> **Note**: Both keys are optional. Without them, the system uses keyword-based sentiment analysis (less accurate but functional).

#### Test Review Submission

```bash
# Start dev server first
npm run dev

# In another terminal, submit test review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"text": "This product is amazing!", "rating": 5}'
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### 10. Start Development Server

**Terminal 1** (App):
```bash
npm run dev
```

**Terminal 2** (Webhook Forwarding):
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Open Browser**:
- http://localhost:3000

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### 11. Test Complete Flow

#### A. Test Authentication
1. Go to http://localhost:3000/auth/login
2. Login with: `customer@test.com` / `customer123`
3. Verify redirect to dashboard

#### B. Test Payment Flow
1. Go to http://localhost:3000/pricing
2. Click "Subscribe" on any plan
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. ZIP: Any 5 digits
7. Complete payment
8. Verify redirect to success page

#### C. Test Review System
1. Go to http://localhost:3000/reviews
2. Submit a review with positive text (e.g., "Excellent service!")
3. Verify sentiment badge appears (POSITIVE/NEGATIVE/NEUTRAL)
4. Logout and login as admin (`admin@test.com` / `admin123`)
5. Go to `/reviews` - verify Analytics section appears with charts
6. Submit more reviews with different sentiments to populate charts

#### D. Verify Database Updates
```bash
npm run db:studio
```
- Check `Payment` table → Status should be `COMPLETED`
- Check `User` table → `activePlanId` should be set
- Check `Review` table → Reviews should have sentiment fields populated

#### E. Test Admin Features
1. Logout
2. Login with: `admin@test.com` / `admin123`
3. Go to `/dashboard` - should see admin features
4. Go to `/plans` - should see Add/Edit options
5. Go to `/reviews` - should see Analytics dashboard

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## 🎯 Verification Checklist

### Core Functionality
- [ ] App runs on http://localhost:3000
- [ ] Can login with test credentials
- [ ] Dashboard loads without errors
- [ ] Database connection working

### Authentication
- [ ] Login page accessible
- [ ] Signup page accessible
- [ ] User can login successfully
- [ ] Session persists on refresh
- [ ] Logout works correctly
- [ ] Protected routes redirect to login

### Role-Based Access Control
- [ ] Admin can access `/admin` routes
- [ ] Customer cannot access `/admin` routes
- [ ] Different sidebar based on role
- [ ] Middleware blocks unauthorized access

### Payment System
- [ ] Pricing page displays plans
- [ ] Subscribe button works
- [ ] Redirects to Stripe Checkout
- [ ] Test payment succeeds
- [ ] Webhook receives event
- [ ] Database updates correctly
- [ ] User redirected to success page
- [ ] `activePlanId` set on user

### Database
- [ ] All tables created
- [ ] Sample data seeded
- [ ] Prisma Studio accessible
- [ ] Queries execute successfully

### Review & Sentiment System
- [ ] Can submit reviews at `/reviews`
- [ ] Sentiment analysis runs automatically
- [ ] Sentiment badges display correctly
- [ ] Admin sees Analytics dashboard
- [ ] Charts populate with review data
- [ ] AI confidence scores visible
- [ ] Rate limiting works (try 6 rapid submissions)

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"
**Solution**: Check `DATABASE_URL` in `.env`
```bash
# Test connection
npm run db:test
```

### Issue: "Prisma client not generated"
**Solution**: 
```bash
npm run db:generate
```

### Issue: "NextAuth session not working"
**Solutions**:
1. Check `NEXTAUTH_URL` matches your local URL
2. Ensure `NEXTAUTH_SECRET` is set
3. Clear browser cookies for localhost
4. Restart dev server

### Issue: "Stripe webhook not receiving events"
**Solutions**:
1. Ensure Stripe CLI is running:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. Check `STRIPE_WEBHOOK_SECRET` in `.env`
3. Verify webhook signature in server logs

### Issue: "Cannot find module '@prisma/client'"
**Solution**:
```bash
npm run db:generate
npm install
```

### Issue: "Plans don't have Stripe IDs"
**Solution**:
```bash
npm run stripe:sync-plans
```

### Issue: "Cannot find module 'recharts'"
**Solution**:
```bash
npm install
```

### Issue: "AI sentiment analysis not working"
**Solutions**:
1. Check if `OPENAI_API_KEY` or `HF_ACCESS_TOKEN` is set
2. Verify API keys are valid
3. Check server logs for AI errors
4. System will fall back to heuristic analysis if APIs fail

---

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| `PAYMENT_SETUP.md` | Complete Stripe integration guide |
| `NEXTAUTH_SETUP.md` | Authentication & RBAC setup |
| `DATABASE_SETUP.md` | PostgreSQL & Prisma configuration |
| `MIGRATION_GUIDE.md` | Upgrade from demo to production |
| `STRIPE_INTEGRATION_SUMMARY.md` | Quick reference for Stripe features |
| `REVIEW_ANALYTICS_SETUP.md` | AI review system setup and usage |
| `SENTIMENT_LOGIC.md` | Deep dive into sentiment analysis |
| `REVIEW_SYSTEM_SUMMARY.md` | Review system architecture overview |

---

## 🌐 Production Deployment

Ready to deploy? See separate deployment guides:

### Vercel (Frontend)
1. Connect GitHub repository
2. Select `market-ready-upgrade` branch
3. Add environment variables
4. Deploy!

### Railway/Render (Database)
- PostgreSQL already hosted on Neon/Supabase
- Update `DATABASE_URL` to production URL

### Stripe Production
1. Switch to Live Mode in Stripe Dashboard
2. Get live keys (`sk_live_`, `pk_live_`)
3. Update environment variables
4. Configure production webhook endpoint
5. Test with real card (refund immediately)

---

## 🎉 Success!

If all checkboxes are ✅, you have:
- ✅ Running Next.js application
- ✅ PostgreSQL database with Prisma
- ✅ NextAuth authentication with RBAC
- ✅ Stripe payment integration
- ✅ AI-powered review & sentiment system
- ✅ Admin analytics dashboard
- ✅ Complete test data
- ✅ Working webhook handling
- ✅ Production-ready architecture

**You're ready to accept real payments!** 🚀

---

## 📞 Need Help?

- Check troubleshooting section above
- Review relevant documentation files
- Check server logs for errors
- Verify all environment variables are set
- Ensure database is accessible
- Test Stripe connection with CLI

---

**Current Status**: Check your progress above and mark completed steps!

**Last Updated**: October 25, 2025
