import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const fallbackSecret = "soul-bridge-jwt-super-secret-key-development-2026";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email?.toLowerCase().trim();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "No account found with this email" },
        { status: 401 }
      );
    }

    if (user.status === "BANNED") {
      return NextResponse.json(
        { success: false, error: "Your account has been suspended by administration" },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email address or password" },
        { status: 401 }
      );
    }

    const tokenPayload = {
      sub: user.id,
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.profile?.fullName || user.email,
      username: user.profile?.username || null,
      fullName: user.profile?.fullName || null,
      completed: user.profile?.completed || false,
      premiumStatus: user.profile?.premiumStatus || "FREE",
    };

    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || fallbackSecret;
    const encodedToken = await encode({
      token: tokenPayload,
      secret,
      maxAge: 30 * 24 * 60 * 60,
    });

    const response = NextResponse.json({ success: true, message: "Signed in successfully" });
    const cookieNames = process.env.NODE_ENV === "production"
      ? ["__Secure-authjs.session-token", "authjs.session-token", "next-auth.session-token", "__Secure-next-auth.session-token"]
      : ["authjs.session-token", "next-auth.session-token"];

    for (const cookieName of cookieNames) {
      response.cookies.set(cookieName, encodedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to sign in right now. Please try again." },
      { status: 500 }
    );
  }
}
