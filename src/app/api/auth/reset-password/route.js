import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const token = body?.token;
    const newPassword = body?.newPassword || body?.password;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Reset token is missing or invalid" },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { success: false, error: "New password is required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Hash the token with SHA-256 to find matching database record
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const resetTokenRecord = await prisma.verificationToken.findFirst({
      where: {
        token: tokenHash,
        type: "PASSWORD_RESET"
      }
    });

    if (!resetTokenRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token. Please request a new link." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > resetTokenRecord.expiresAt) {
      try {
        await prisma.verificationToken.delete({ where: { id: resetTokenRecord.id } });
      } catch (_) {}

      return NextResponse.json(
        { success: false, error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password with bcryptjs salt 10
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user's password and delete the reset token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetTokenRecord.email },
        data: { passwordHash }
      }),
      prisma.verificationToken.delete({
        where: { id: resetTokenRecord.id }
      })
    ]);

    const response = NextResponse.json(
      { success: true, message: "Your password has been successfully reset! You can now log in with your new password." },
      { status: 200 }
    );

    // Clear any stale session cookies to enforce re-login with the new password
    const cookieNames = [
      "__Secure-authjs.session-token",
      "authjs.session-token",
      "next-auth.session-token",
      "__Secure-next-auth.session-token"
    ];

    for (const cookieName of cookieNames) {
      response.cookies.delete(cookieName);
    }

    return response;
  } catch (error) {
    console.error("API /api/auth/reset-password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
