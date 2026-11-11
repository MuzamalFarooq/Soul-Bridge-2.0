import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const input = body?.email?.toLowerCase().trim();
    const password = body?.password;

    if (!input || !password) {
      return NextResponse.json(
        { success: false, error: "Email/username and password are required" },
        { status: 400 }
      );
    }

    const envAdminEmail = (process.env.ADMIN_EMAIL || "admin@soulbridge.pk").toLowerCase().trim();
    const envAdminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase().trim();
    const envAdminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

    let user;

    // Check if credentials match admin configuration from .env
    const isAdminMatch = (input === envAdminEmail || input === envAdminUsername) && password === envAdminPassword;

    if (isAdminMatch) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: envAdminEmail },
            { profile: { username: envAdminUsername } }
          ]
        },
        include: { profile: true, photos: { where: { isProfile: true }, take: 1 } }
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash(envAdminPassword, 10);
        user = await prisma.user.create({
          data: {
            email: envAdminEmail,
            passwordHash: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
            profile: {
              create: {
                fullName: "Soul Bridge Administrator",
                username: envAdminUsername,
                completed: true,
                premiumStatus: "PLATINUM"
              }
            }
          },
          include: { profile: true, photos: { where: { isProfile: true }, take: 1 } }
        });
      } else if (user.role !== "ADMIN") {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
          include: { profile: true, photos: { where: { isProfile: true }, take: 1 } }
        });
      }
    } else {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: input },
            { profile: { username: input } }
          ]
        },
        include: { profile: true, photos: { where: { isProfile: true }, take: 1 } }
      });

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { success: false, error: "No account found with this email or username" },
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
    }

    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.upsert({
      where: { sessionToken },
      update: {
        userId: user.id,
        expires,
      },
      create: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    const response = NextResponse.json({ success: true, message: "Signed in successfully" });
    const isProduction = process.env.NODE_ENV === "production";
    const sessionCookieName = isProduction
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";
    const legacyCookieNames = [
      "__Secure-authjs.session-token",
      "authjs.session-token",
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "__Host-next-auth.session-token",
    ].filter((cookieName) => cookieName !== sessionCookieName);

    response.cookies.set(sessionCookieName, sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    for (const cookieName of legacyCookieNames) {
      response.cookies.delete(cookieName);
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
