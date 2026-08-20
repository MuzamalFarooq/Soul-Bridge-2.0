import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const path = req.nextUrl.pathname;

    const isAuthPage = 
      path.startsWith("/login") || 
      path.startsWith("/register") || 
      path.startsWith("/verify-email") || 
      path.startsWith("/forgot-password") || 
      path.startsWith("/reset-password");
    
    // Redirect logged-in users away from auth pages
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL("/discover", req.url));
    }

    // Enforce onboarding profile completion
    if (isAuth && !token.completed && path !== "/onboarding" && path !== "/discover" && !path.startsWith("/api")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Role-based authorization for the Admin Console
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/discover", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Public pages do not require strict authentication token
        if (
          path === "/" ||
          path.startsWith("/login") ||
          path.startsWith("/register") ||
          path.startsWith("/verify-email") ||
          path.startsWith("/forgot-password") ||
          path.startsWith("/reset-password") ||
          path.startsWith("/api/auth")
        ) {
          return true;
        }
        // Private pages require user authentication session token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/dashboard",
    "/dashboard/:path*",
    "/discover",
    "/discover/:path*",
    "/chat",
    "/chat/:path*",
    "/profile",
    "/onboarding",
    "/admin",
    "/admin/:path*",
  ],
};
