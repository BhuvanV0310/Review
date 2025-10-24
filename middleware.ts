import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protect /admin routes - only ADMIN role can access
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login?error=AdminAccessRequired", req.url));
    }

    // Protect /dashboard routes - authenticated users only
    if (path.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Protect /api/admin routes
    if (path.startsWith("/api/admin") && token?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // User must be authenticated
    },
  }
);

// Specify which routes to protect
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/plans/:path*",
    "/branches/:path*",
    "/payments/:path*",
    "/reviews/:path*",
  ],
};
