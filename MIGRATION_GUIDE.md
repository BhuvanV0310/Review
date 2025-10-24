# Database Migration Guide

This guide will help you migrate from JSON/CSV-based storage to PostgreSQL.

## What's Been Set Up

✅ Prisma ORM installed and configured
✅ Database schema created with models for:
   - Users (with authentication and roles)
   - Plans (subscription plans)
   - Branches (business locations)
   - Payments (transaction history)
   - Reviews (with sentiment data)

✅ Database utility file created at `lib/db.ts`
✅ Seed file created with sample data
✅ NPM scripts added for database operations

## Step-by-Step Migration Process

### 1. Set Up Your PostgreSQL Database

Follow the instructions in `DATABASE_SETUP.md` to:
- Choose a provider (Neon, Supabase, or Railway)
- Get your connection string
- Update the `.env` file

### 2. Generate Prisma Client

```bash
npm run db:generate
```

This creates the TypeScript types and client for your database.

### 3. Run the Initial Migration

```bash
npm run db:migrate
```

When prompted for a migration name, enter: `init`

This will:
- Create all tables in your database
- Set up relationships and indexes
- Create a migration history

### 4. Seed Initial Data (Optional)

```bash
npm run db:seed
```

This will populate your database with:
- Admin user (admin@example.com / admin123)
- Regular user (user@example.com / user123)
- Sample subscription plans
- Sample branches
- Sample payments
- Sample reviews

### 5. View Your Data

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555 where you can view and edit data.

## Files That Need to Be Updated

After migration, these files need to be refactored to use Prisma instead of JSON/CSV:

### Authentication Files
- [ ] `app/api/auth/login/route.ts` - Use Prisma to query users
- [ ] `app/api/auth/register/route.ts` - Use Prisma to create users
- [ ] `data/users.json` - DELETE (replaced by database)

### Plans Management
- [ ] `app/api/plans/route.ts` - Create CRUD endpoints using Prisma
- [ ] `app/plans/services/plans.ts` - Replace with Prisma queries
- [ ] Any JSON files storing plan data - DELETE

### Branches Management
- [ ] `app/api/branches/route.ts` - Create CRUD endpoints using Prisma
- [ ] `app/branches/services/branches.ts` - Replace with Prisma queries

### Payments Management
- [ ] `app/api/payments/route.ts` - Create CRUD endpoints using Prisma
- [ ] `app/payments/services/payments.ts` - Replace with Prisma queries

### Reviews & Sentiment Analysis
- [ ] Keep Python models for ML processing
- [ ] Store results in database instead of CSV
- [ ] Update review upload endpoints to save to database

## Example Usage

### Querying Users
```typescript
import prisma from '@/lib/db';

// Find user by email
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});

// Get all users
const users = await prisma.user.findMany();

// Create a user
const newUser = await prisma.user.create({
  data: {
    email: 'new@example.com',
    password: hashedPassword,
    name: 'New User',
    role: 'USER'
  }
});
```

### Querying Plans
```typescript
// Get all active plans
const plans = await prisma.plan.findMany({
  where: { status: 'ACTIVE' }
});

// Create a plan
const plan = await prisma.plan.create({
  data: {
    name: 'Starter',
    price: 29.99,
    description: 'For individuals',
    features: ['Feature 1', 'Feature 2'],
    status: 'ACTIVE'
  }
});
```

### Querying with Relations
```typescript
// Get user with their branches
const userWithBranches = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    branches: true,
    payments: true,
    reviews: true
  }
});
```

## Database Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run migrations (development) |
| `npm run db:push` | Push schema changes without migration |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed database with sample data |

## Next Steps

1. ✅ Set up PostgreSQL database
2. ✅ Run migrations
3. ✅ Seed initial data
4. 🔄 Refactor API routes to use Prisma (Next task)
5. 🔄 Update frontend components to use new API
6. 🔄 Remove old JSON/CSV files
7. 🔄 Test all functionality

## Troubleshooting

### Migration Fails
- Check DATABASE_URL is correct
- Ensure database is accessible
- Try `npm run db:push` instead for quick schema updates during development

### Connection Issues
- Verify your IP is whitelisted
- Check SSL mode is correct for your provider
- Test connection string in Prisma Studio

### Seed Fails
- Make sure migrations ran successfully first
- Check for duplicate data (seed uses upsert for safety)
- Clear database and try again: `npx prisma migrate reset`
