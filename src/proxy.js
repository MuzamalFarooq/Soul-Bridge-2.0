import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/auth-secret";

/**
 * Robust session token retrieval
 * Checks both HTTPS secure cookie and standard cookie to guarantee
 * compatibility across local development, production, and reverse-proxy setups.
 */
async function getSessionToken(req) {
  const secret = getAuthSecret();

  // 1. Check secure cookie (__Secure-next-auth.session-token)
  let token = await getToken({
    req,
    secret,
    cookieName: "__Secure-next-auth.session-token",
  });

  // 2. Check standard cookie (next-auth.session-token)
  if (!token) {
    token = await getToken({
      req,
      secret,
      cookieName: "next-auth.session-token",
    });
  }

  // Clear compatibility path for sessions created by an older cookie policy.
  if (!token) {
    token = await getToken({
      req,
      secret,
      cookieName: "__Host-next-auth.session-token",
    });
  }

  // 3. Fallback to default auto-detection
  if (!token) {
    token = await getToken({ req, secret });
  }

  return token;
}

export default async function proxy(req) {
  const path = req.nextUrl.pathname;

  // Static assets and internal next routes: pass through immediately
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/images") ||
    path === "/favicon.ico" ||
    path === "/icon.png" ||
    path === "/apple-icon.png"
  ) {
    return NextResponse.next();
  }

  const token = await getSessionToken(req);
  const isAuth = !!token;

  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/verify-email") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");

  // Redirect authenticated users away from auth pages to /discover
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/discover", req.url));
  }

  // Allow public pages
  if (path === "/" || isAuthPage) {
    return NextResponse.next();
  }

  // Protected pages: redirect unauthenticated users to /login
  if (!isAuth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based authorization for Admin Console
  if (path.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/discover", req.url));
  }

  // Enforce profile completion, but allow /onboarding, /discover, and APIs
  if (!token.completed && path !== "/onboarding" && path !== "/discover" && !path.startsWith("/api")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
}

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
    "/profile/:path*",
    "/onboarding",
    "/admin",
    "/admin/:path*",
  ],
};
