import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { resolveAuthBaseUrl } from "@/lib/auth-url";

// Simple in-memory rate limiting map: ipOrEmail -> timestamp array
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(identifier) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(identifier) || [];
  const validTimestamps = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(identifier, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(identifier, validTimestamps);
  return false;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address format" },
        { status: 400 }
      );
    }

    // Rate limiting check
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || normalizedEmail;
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Too many reset requests. Please try again after 15 minutes." },
        { status: 429 }
      );
    }

    // Lookup user in database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true }
    });

    const genericSuccessResponse = {
      success: true,
      message: "If an account exists with that email, a password reset link has been sent."
    };

    // Generic response if user does not exist (prevents email enumeration)
    if (!user) {
      return NextResponse.json(genericSuccessResponse, { status: 200 });
    }

    // Generate cryptographically secure random token (32 bytes = 64 hex chars)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash the token with SHA-256 for database storage
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Delete existing PASSWORD_RESET tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email: normalizedEmail, type: "PASSWORD_RESET" }
    });

    // 30 minute expiry
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Save hashed token
    await prisma.verificationToken.create({
      data: {
        email: normalizedEmail,
        token: tokenHash,
        type: "PASSWORD_RESET",
        expiresAt,
      }
    });

    // Construct reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || resolveAuthBaseUrl(process.env) || "https://soulbridge.muzamal.site";
    const resetUrl = `${baseUrl.replace(/\/+$/, "")}/reset-password?token=${rawToken}`;

    // Send reset email
    await sendPasswordResetEmail({
      to: normalizedEmail,
      resetUrl,
      userName: user.profile?.fullName || user.profile?.username || undefined,
    });

    return NextResponse.json(genericSuccessResponse, { status: 200 });
  } catch (error) {
    console.error("API /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process request right now. Please try again later." },
      { status: 500 }
    );
  }
}
