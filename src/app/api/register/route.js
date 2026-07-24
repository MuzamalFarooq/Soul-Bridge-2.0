import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 1. Create User with nested Settings (compatible with all MongoDB deployments)
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        emailVerified: new Date(), // Mark email verified for immediate production access
        settings: {
          create: {
            darkMode: true,
            pushNotifications: true,
            emailNotifications: true,
            invisibleMode: false,
            privatePhotos: false
          }
        }
      }
    });

    // 2. Create Profile for user
    try {
      await prisma.profile.create({
        data: {
          userId: user.id,
          completed: false,
          premiumStatus: "FREE"
        }
      });
    } catch (profileErr) {
      console.error("Notice: Profile auto-creation during registration:", profileErr);
    }

    // 3. Create Verification Token record
    const token = generateToken();
    try {
      await prisma.verificationToken.create({
        data: {
          email: normalizedEmail,
          token,
          type: "EMAIL_VERIFICATION",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });
    } catch (tokenErr) {
      console.error("Notice: Token creation during registration:", tokenErr);
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      verificationToken: token,
      message: "Account created successfully! You can now log in."
    });
  } catch (error) {
    console.error("API /api/register error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register account" },
      { status: 500 }
    );
  }
}
