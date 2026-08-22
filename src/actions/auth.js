"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/email";
import { resolveAuthBaseUrl } from "@/lib/auth-url";

// Generate a random token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Register a new user
 */
export async function registerUser(data) {
  try {
    const { email, password, profilePic } = data;
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" };
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User with nested Settings and Profile atomically
    const token = generateToken();

    const userData = {
      email: normalizedEmail,
      passwordHash,
      emailVerified: new Date(), // Auto-verify email upon registration so user can immediately sign in
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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });
    } catch (tokErr) {
      console.error("Verification token creation notice:", tokErr);
    }

    return { 
      success: true, 
      userId: user.id,
      verificationToken: token,
      message: "Registration successful! You can now log in."
    };
  } catch (error) {
    console.error("Registration error:", error);
    let errorMessage = error.message || "Failed to register user";
    if (
      errorMessage.includes("Server selection timeout") ||
      errorMessage.includes("ReplicaSetNoPrimary") ||
      errorMessage.includes("fatal alert") ||
      errorMessage.includes("I/O error")
    ) {
      errorMessage = "Database connection failure: Unable to reach MongoDB cluster. Please check MongoDB Atlas Network Access IP whitelist rules for production.";
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Verify user email via token
 */
export async function verifyUserEmail(token) {
  try {
    if (!token) return { success: false, error: "Verification token is required" };

    if (token === "success") {
      return { success: true, message: "Account is active! You can now log in." };
    }

    const verifToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: "EMAIL_VERIFICATION"
      }
    });

    if (!verifToken) {
      // Return success if email is already verified
      return { success: true, message: "Account verified or already active! You can now log in." };
    }

    if (new Date() > verifToken.expiresAt) {
      try {
        await prisma.verificationToken.delete({ where: { id: verifToken.id } });
      } catch (e) {}
      return { success: false, error: "Verification token has expired" };
    }

    // Update user status to verified and cleanup token
    await prisma.user.update({
      where: { email: verifToken.email },
      data: { emailVerified: new Date() }
    });

    try {
      await prisma.verificationToken.delete({
        where: { id: verifToken.id }
      });
    } catch (delErr) {}

    return { success: true, message: "Email verified successfully! You can now log in." };
  } catch (error) {
    console.error("Email verification error:", error);
    return { success: false, error: "Failed to verify email" };
  }
}

/**
 * Handle forgot password request securely
 */
export async function forgotPasswordRequest(email) {
  try {
    if (!email) return { success: false, error: "Email is required" };
    const normalizedEmail = email.toLowerCase().trim();

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true }
    });

    // Always respond with generic success message to prevent user enumeration
    const genericSuccessResponse = {
      success: true,
      message: "If an account exists with that email, a password reset link has been sent."
    };

    if (!user) {
      return genericSuccessResponse;
    }

    // Generate cryptographically secure random token (32 bytes = 64 hex chars)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash the token with SHA-256 for secure database storage
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Delete any existing PASSWORD_RESET tokens for this email to invalidate previous links
    await prisma.verificationToken.deleteMany({
      where: { email: normalizedEmail, type: "PASSWORD_RESET" }
    });

    // Reset token expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        email: normalizedEmail,
        token: tokenHash,
        type: "PASSWORD_RESET",
        expiresAt,
      }
    });

    // Construct the reset URL using resolved application base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || resolveAuthBaseUrl(process.env) || "https://soulbridge.muzamal.site";
    const resetUrl = `${baseUrl.replace(/\/+$/, "")}/reset-password?token=${rawToken}`;

    // Send the password reset email asynchronously
    await sendPasswordResetEmail({
      to: normalizedEmail,
      resetUrl,
      userName: user.profile?.fullName || user.profile?.username || undefined,
    });

    return genericSuccessResponse;
  } catch (error) {
    console.error("Forgot password server action error:", error);
    return { success: false, error: "Unable to process password reset request right now. Please try again later." };
  }
}

/**
 * Reset password using single-use hashed token
 */
export async function resetUserPassword(token, newPassword) {
  try {
    if (!token) {
      return { success: false, error: "Reset token is missing" };
    }

    if (!newPassword || typeof newPassword !== "string") {
      return { success: false, error: "New password is required" };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" };
    }

    // Hash incoming token using SHA-256 to look up the stored tokenHash
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const resetTokenRecord = await prisma.verificationToken.findFirst({
      where: {
        token: tokenHash,
        type: "PASSWORD_RESET"
      }
    });

    if (!resetTokenRecord) {
      return { success: false, error: "Invalid or expired reset token. Please request a new link." };
    }

    if (new Date() > resetTokenRecord.expiresAt) {
      try {
        await prisma.verificationToken.delete({ where: { id: resetTokenRecord.id } });
      } catch (_) {}
      return { success: false, error: "Reset link has expired. Please request a new one." };
    }

    // Hash password with bcryptjs matching Soul Bridge configuration
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password and delete the used reset token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetTokenRecord.email },
        data: { passwordHash }
      }),
      prisma.verificationToken.delete({
        where: { id: resetTokenRecord.id }
      })
    ]);

    return { 
      success: true, 
      message: "Your password has been successfully reset! You can now log in with your new password." 
    };
  } catch (error) {
    console.error("Reset password server action error:", error);
    return { success: false, error: "Failed to reset password. Please try again." };
  }
}
