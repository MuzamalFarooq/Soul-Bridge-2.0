"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Generate a random token
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Register a new user
 */
export async function registerUser(data) {
  try {
    const { email, password } = data;
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
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

    // Create User, Profile, and Settings inside a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          settings: {
            create: {}
          }
        }
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          completed: false,
          premiumStatus: "FREE"
        }
      });

      // Create a mock email verification token
      const token = generateToken();
      await tx.verificationToken.create({
        data: {
          email: normalizedEmail,
          token,
          type: "EMAIL_VERIFICATION",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      return { user, token };
    });

    return { 
      success: true, 
      userId: newUser.user.id,
      verificationToken: newUser.token, // Return for demo/sandbox purposes
      message: "Registration successful! Please verify your email."
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Failed to register user" };
  }
}

/**
 * Verify user email via token
 */
export async function verifyUserEmail(token) {
  try {
    if (!token) return { success: false, error: "Verification token is required" };

    const verifToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: "EMAIL_VERIFICATION"
      }
    });

    if (!verifToken) {
      return { success: false, error: "Invalid or expired token" };
    }

    if (new Date() > verifToken.expiresAt) {
      await prisma.verificationToken.delete({ where: { id: verifToken.id } });
      return { success: false, error: "Verification token has expired" };
    }

    // Update user status to verified
    await prisma.$transaction([
      prisma.user.update({
        where: { email: verifToken.email },
        data: { emailVerified: new Date() }
      }),
      prisma.verificationToken.delete({
        where: { id: verifToken.id }
      })
    ]);

    return { success: true, message: "Email verified successfully! You can now log in." };
  } catch (error) {
    console.error("Email verification error:", error);
    return { success: false, error: "Failed to verify email" };
  }
}

/**
 * Handle forgot password request
 */
export async function forgotPasswordRequest(email) {
  try {
    if (!email) return { success: false, error: "Email is required" };
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Return success to prevent email enumeration, but in sandbox let's be explicit or return positive
      return { success: true, message: "If that email exists, a reset link has been created." };
    }

    // Delete any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email: normalizedEmail, type: "PASSWORD_RESET" }
    });

    const token = generateToken();
    await prisma.verificationToken.create({
      data: {
        email: normalizedEmail,
        token,
        type: "PASSWORD_RESET",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }
    });

    return { 
      success: true, 
      resetToken: token, // Returned for testing / routing purposes
      message: "Reset token created successfully!" 
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { success: false, error: "Failed to process forgot password request" };
  }
}

/**
 * Reset password using token
 */
export async function resetUserPassword(token, newPassword) {
  try {
    if (!token || !newPassword) {
      return { success: false, error: "Token and password are required" };
    }

    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: "PASSWORD_RESET"
      }
    });

    if (!resetToken) {
      return { success: false, error: "Invalid or expired token" };
    }

    if (new Date() > resetToken.expiresAt) {
      await prisma.verificationToken.delete({ where: { id: resetToken.id } });
      return { success: false, error: "Reset token has expired" };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { passwordHash }
      }),
      prisma.verificationToken.delete({
        where: { id: resetToken.id }
      })
    ]);

    return { success: true, message: "Password updated successfully! Please login with your new password." };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Failed to reset password" };
  }
}
