import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Dynamically handle Vercel deployment URLs if NEXTAUTH_URL is not set or defaults to localhost in production
if (process.env.NODE_ENV === "production" && process.env.VERCEL_URL && (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost"))) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { profile: true }
        });

        if (!user || !user.passwordHash) {
          throw new Error("No account found with this email");
        }

        if (user.status === "BANNED") {
          throw new Error("Your account has been suspended by administration");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Invalid password credentials");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.profile?.username || null,
          fullName: user.profile?.fullName || null,
          completed: user.profile?.completed || false,
          premiumStatus: user.profile?.premiumStatus || "FREE",
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.fullName = user.fullName;
        token.completed = user.completed;
        token.premiumStatus = user.premiumStatus;
      }
      
      // Dynamic profile updates during user session
      if (trigger === "update" && session) {
        if (session.completed !== undefined) token.completed = session.completed;
        if (session.username !== undefined) token.username = session.username;
        if (session.fullName !== undefined) token.fullName = session.fullName;
        if (session.premiumStatus !== undefined) token.premiumStatus = session.premiumStatus;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.fullName = token.fullName;
        session.user.completed = token.completed;
        session.user.premiumStatus = token.premiumStatus;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "soul-bridge-jwt-super-secret-key-development-2026",
};

