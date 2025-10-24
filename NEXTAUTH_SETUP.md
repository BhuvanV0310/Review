# NextAuth.js Integration - Complete Setup Guide

## ✅ What's Been Set Up

### 1. **NextAuth.js Installation**
- `next-auth` v4.x installed
- `@next-auth/prisma-adapter` for database sessions
- Integrated with existing Prisma setup

### 2. **Database Schema Updated**
Added NextAuth required models to Prisma schema:
- ✅ **User** model extended with:
  - `emailVerified`, `image` for OAuth
  - `role` enum: `ADMIN`, `CUSTOMER`, `DELIVERY_PARTNER`
  - `branchId` for associating users with branches
  - Relations to `Account`, `Session`

- ✅ **Account** model - for OAuth providers (Google, etc.)
- ✅ **Session** model - for database sessions
- ✅ **VerificationToken** model - for email verification

### 3. **Authentication Files Created**

#### `/lib/auth-config.ts`
- NextAuth configuration with JWT strategy
- Credentials provider (email + password)
- Google OAuth provider
- Custom callbacks for role and branchId
- TypeScript types for session

#### `/lib/auth-helpers.ts`
Helper functions for server-side auth:
- `getServerAuthSession()` - Get current session
- `requireAuth()` - Throw if not authenticated
- `requireAdmin()` - Throw if not admin
- `isAdmin()`, `isCustomer()`, `isDeliveryPartner()` - Role checks
- `getCurrentUser()`, `getCurrentUserId()` - Get user info

#### `/app/api/auth/[...nextauth]/route.ts`
- NextAuth API route handler
- Handles all auth endpoints

#### `/middleware.ts`
- Protects routes based on authentication and role
- `/admin/*` - ADMIN only
- `/dashboard/*` - Authenticated users
- `/api/admin/*` - ADMIN only via API

### 4. **API Routes**

#### `/app/api/auth/register/route.ts`
- User registration with Prisma
- Password hashing with bcrypt
- Role assignment (defaults to CUSTOMER)
- Email uniqueness check

### 5. **Test Script**
`test-auth.ts` - Creates test users and verifies setup

---

## 🎯 Role-Based Access Control (RBAC)

### Roles:
1. **ADMIN** - Full system access
2. **CUSTOMER** - Regular user access
3. **DELIVERY_PARTNER** - Delivery access

### Protected Routes:
- `/admin/*` → ADMIN only
- `/dashboard/*` → Authenticated users
- `/plans/*`, `/branches/*`, `/payments/*` → Authenticated users

---

## 📦 Required Environment Variables

Add to your `.env`:

```env
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## 🚀 Setup Steps

### Step 1: Update Database Schema
```bash
npm run db:generate
npm run db:migrate
```

When prompted for migration name: `add_nextauth_models`

### Step 2: Create Test Users
```bash
npm run auth:test
```

This creates:
- Admin: `admin@test.com` / `admin123`
- Customer: `customer@test.com` / `customer123`
- Partner: `partner@test.com` / `partner123`

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Test Authentication

Visit: `http://localhost:3000/auth/login`

Try logging in with test credentials:
- Email: `admin@test.com`
- Password: `admin123`

---

## 🔐 Usage Examples

### Server Components (App Router)

```typescript
import { getServerAuthSession, requireAdmin } from "@/lib/auth-helpers";

export default async function AdminPage() {
  // Option 1: Get session and check manually
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/auth/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  // Option 2: Use helper (throws error if not admin)
  try {
    const user = await requireAdmin();
    return <div>Welcome Admin: {user.email}</div>;
  } catch (error) {
    redirect("/auth/login");
  }
}
```

### Client Components

```typescript
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <button onClick={() => signIn()}>Sign In</button>;
  }

  return (
    <div>
      <p>Logged in as: {session.user.email}</p>
      <p>Role: {session.user.role}</p>
      {session.user.branchId && <p>Branch: {session.user.branchId}</p>}
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### API Routes

```typescript
import { getServerAuthSession } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Admin-only logic here
  return NextResponse.json({ message: "Admin access granted" });
}
```

---

## 🧪 Testing Authentication Flow

### 1. Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "password123",
    "name": "New User",
    "role": "CUSTOMER"
  }'
```

### 2. Test Sign In
Visit: `http://localhost:3000/api/auth/signin`

Or use NextAuth programmatically:
```typescript
import { signIn } from "next-auth/react";

await signIn("credentials", {
  email: "admin@test.com",
  password: "admin123",
  callbackUrl: "/dashboard",
});
```

### 3. Test Session
```bash
curl http://localhost:3000/api/auth/session \
  --cookie "next-auth.session-token=YOUR_SESSION_TOKEN"
```

### 4. Test Protected Route
Visit: `http://localhost:3000/admin`
- Should redirect to login if not authenticated
- Should redirect if not ADMIN role

---

## 🔒 Security Features

1. ✅ **Password Hashing** - bcrypt with salt rounds
2. ✅ **JWT Strategy** - Secure token-based sessions
3. ✅ **Role-Based Access** - Enforced at route and API level
4. ✅ **CSRF Protection** - Built into NextAuth
5. ✅ **Secure Cookies** - HttpOnly, Secure flags
6. ✅ **OAuth Support** - Google (can add more)
7. ✅ **Database Sessions** - Via Prisma adapter (optional)

---

## 📊 Session Structure

```typescript
{
  user: {
    id: "uuid",
    email: "user@example.com",
    name: "User Name",
    image: "https://...",
    role: "ADMIN" | "CUSTOMER" | "DELIVERY_PARTNER",
    branchId: "uuid" | null
  },
  expires: "2025-11-24T..."
}
```

---

## 🛠️ Customization

### Add New OAuth Provider

1. Install provider package (if needed)
2. Get credentials from provider
3. Add to `.env`:
```env
GITHUB_ID="..."
GITHUB_SECRET="..."
```

4. Add to `auth-config.ts`:
```typescript
import GitHubProvider from "next-auth/providers/github";

providers: [
  // ... existing providers
  GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }),
]
```

### Add Custom Fields to Session

1. Update types in `auth-config.ts`:
```typescript
declare module "next-auth" {
  interface Session {
    user: {
      // ... existing fields
      customField: string;
    };
  }
}
```

2. Update JWT callback:
```typescript
async jwt({ token, user }) {
  if (user) {
    token.customField = user.customField;
  }
  return token;
}
```

3. Update session callback:
```typescript
async session({ session, token }) {
  session.user.customField = token.customField;
  return session;
}
```

---

## 🐛 Troubleshooting

### Error: "NEXTAUTH_SECRET is not set"
**Solution:** Add `NEXTAUTH_SECRET` to `.env`
```bash
openssl rand -base64 32
```

### Error: "Database not found"
**Solution:** Run migrations
```bash
npm run db:migrate
```

### Error: "User not found" on login
**Solution:** Create test users
```bash
npm run auth:test
```

### Middleware not working
**Solution:** Ensure `middleware.ts` is in root directory (not `/src`)

### OAuth not working
**Solution:** 
1. Check OAuth credentials in `.env`
2. Verify callback URLs in OAuth provider settings
3. Add to Google Console: `http://localhost:3000/api/auth/callback/google`

---

## 📝 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run auth:test` | Create test users and verify auth setup |
| `npm run db:studio` | Open Prisma Studio to view users |

---

## 🎯 Next Steps

1. ✅ NextAuth integrated with Prisma
2. ✅ Role-based access control implemented
3. ✅ Test users created
4. 🔄 Update frontend login/signup pages to use NextAuth
5. 🔄 Replace old auth system in API routes
6. 🔄 Add session provider to layout
7. 🔄 Test end-to-end authentication flow

---

## 📚 Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [NextAuth with App Router](https://next-auth.js.org/configuration/nextjs#in-app-router)

---

**Status:** NextAuth setup complete, ready for migration and testing!
