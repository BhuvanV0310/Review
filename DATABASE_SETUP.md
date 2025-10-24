# PostgreSQL Database Setup Guide

## Step 1: Choose a PostgreSQL Provider

We recommend using one of these cloud PostgreSQL services:

### Option A: Neon (Recommended - Free tier available)
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy your connection string
5. It will look like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

### Option B: Supabase (Free tier available)
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Go to Settings > Database
4. Copy the connection string (URI format)
5. It will look like: `postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres`

### Option C: Railway (Simple deployment)
1. Go to [https://railway.app](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection string from the Variables tab

## Step 2: Update Your .env File

1. Open the `.env` file in your project root
2. Replace the `DATABASE_URL` with your actual connection string:

```env
DATABASE_URL="postgresql://your-actual-connection-string-here"
```

**Important:** Never commit the `.env` file to git! It's already in `.gitignore`.

## Step 3: Generate Prisma Client

Run this command to generate the Prisma client:

```bash
npx prisma generate
```

## Step 4: Run Database Migration

This will create all the tables in your database:

```bash
npx prisma migrate dev --name init
```

## Step 5: (Optional) Seed Initial Data

After migration, you can optionally seed your database with initial data.

## Step 6: View Your Database

You can use Prisma Studio to view and edit data:

```bash
npx prisma studio
```

This will open a web interface at `http://localhost:5555`

## Next Steps

After setting up the database:
1. The Prisma client will be available at `@/lib/db`
2. You can now use it in your API routes
3. All JSON/CSV-based data logic will be replaced with database queries

## Troubleshooting

- If you get connection errors, check that your DATABASE_URL is correct
- Make sure your IP is whitelisted in your database provider's settings
- For Neon/Supabase, SSL mode is usually required
- Check that your database provider's free tier limits aren't exceeded
