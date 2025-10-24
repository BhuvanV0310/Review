import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "./db";
import { Role } from "@prisma/client";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      branchId?: string | null;
    };
  }

  interface User {
    role: Role;
    branchId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    branchId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Use JWT for better performance and scalability
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login", // Error code passed in query string as ?error=
  },
  providers: [
    // Credentials Provider (Email + Password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Return user object with role and branchId
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          branchId: user.branchId,
        };
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    // JWT Callback: Add custom fields to JWT token
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.branchId = user.branchId;
      }

      // OAuth sign in - set default role for new users
      if (account?.provider === "google" && user) {
        // Check if user already exists in database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          token.role = existingUser.role;
          token.branchId = existingUser.branchId;
        } else {
          // New OAuth user - set default role as CUSTOMER
          token.role = "CUSTOMER";
        }
      }

      return token;
    },

    // Session Callback: Add custom fields to session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.branchId = token.branchId;
      }
      return session;
    },

    // Sign In Callback: Control who can sign in
    async signIn({ user, account, profile }) {
      // For OAuth providers, create user if doesn't exist
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: "CUSTOMER", // Default role for OAuth users
              emailVerified: new Date(),
            },
          });
        }
      }

      return true; // Allow sign in
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token.email}`);
    },
  },

  debug: process.env.NODE_ENV === "development",
};
