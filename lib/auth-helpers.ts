import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";

/**
 * Get the current session on the server side
 * Use this in Server Components and API routes
 */
export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getServerAuthSession();
  return !!session?.user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string) {
  const session = await getServerAuthSession();
  return session?.user?.role === role;
}

/**
 * Check if user is an admin
 */
export async function isAdmin() {
  return await hasRole("ADMIN");
}

/**
 * Check if user is a customer
 */
export async function isCustomer() {
  return await hasRole("CUSTOMER");
}

/**
 * Check if user is a delivery partner
 */
export async function isDeliveryPartner() {
  return await hasRole("DELIVERY_PARTNER");
}

/**
 * Get current user ID
 */
export async function getCurrentUserId() {
  const session = await getServerAuthSession();
  return session?.user?.id;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const session = await getServerAuthSession();
  return session?.user;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    throw new Error("Unauthorized - Authentication required");
  }
  return session.user;
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden - Admin access required");
  }
  return user;
}

/**
 * Require specific role - throws error if role doesn't match
 */
export async function requireRole(role: string) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error(`Forbidden - ${role} role required`);
  }
  return user;
}
