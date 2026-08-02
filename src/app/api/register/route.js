import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, profilePic } = body || {};

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

    // Create User with nested Settings and Profile atomically
    const token = generateToken();

    const userData = {
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
      },
      profile: {
        create: {
          completed: false,
          premiumStatus: "FREE"
        }
      }
    };

    if (profilePic) {
      userData.photos = {
        create: [
          {
            url: profilePic,
            isProfile: true,
            publicId: `profile_reg_${Date.now()}`
          }
        ]
      };
    }

    const user = await prisma.user.create({
      data: userData
    });

    // Create Verification Token record
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
    let errorMessage = error.message || "Failed to register account";
    if (
      errorMessage.includes("Server selection timeout") ||
      errorMessage.includes("ReplicaSetNoPrimary") ||
      errorMessage.includes("fatal alert") ||
      errorMessage.includes("I/O error")
    ) {
      errorMessage = "Database connection failure: Unable to reach MongoDB cluster. Please check MongoDB Atlas Network Access IP whitelist rules for production.";
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
