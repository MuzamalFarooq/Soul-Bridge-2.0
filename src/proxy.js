import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const sessionCookieNames = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
  "__Host-next-auth.session-token",
  "__Secure-authjs.session-token",
  "authjs.session-token",
];

async function getDatabaseSession(req) {
  const sessionToken = sessionCookieNames
    .map((cookieName) => req.cookies.get(cookieName)?.value)
    .find(Boolean);

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        include: {
          profile: true,
          photos: { where: { isProfile: true }, take: 1 },
        },
      },
    },
  });

  if (!session || session.expires <= new Date()) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    username: session.user.profile?.username || null,
    fullName: session.user.profile?.fullName || session.user.name || null,
    completed: Boolean(session.user.profile?.completed),
    premiumStatus: session.user.profile?.premiumStatus || "FREE",
    image: session.user.photos?.[0]?.url || session.user.image || null,
  };
}

export default async function proxy(req) {
  const path = req.nextUrl.pathname;

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

  const session = await getDatabaseSession(req);
  const isAuth = !!session;

  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/verify-email") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/discover", req.url));
  }

  if (path === "/" || isAuthPage) {
    return NextResponse.next();
  }

  if (!isAuth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/discover", req.url));
  }

  if (!session.completed && path !== "/onboarding" && path !== "/discover" && !path.startsWith("/api")) {
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
