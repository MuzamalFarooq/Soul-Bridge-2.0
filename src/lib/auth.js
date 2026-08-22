import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { resolveAuthBaseUrl } from "./auth-url";

const resolvedAuthBaseUrl = resolveAuthBaseUrl(process.env);

if (process.env.NODE_ENV === "production" && resolvedAuthBaseUrl) {
  process.env.NEXTAUTH_URL = resolvedAuthBaseUrl;
  process.env.AUTH_URL = resolvedAuthBaseUrl;
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

        const input = credentials.email.toLowerCase().trim();
        const inputPassword = credentials.password;

        const envAdminEmail = (process.env.ADMIN_EMAIL || "admin@soulbridge.pk").toLowerCase().trim();
        const envAdminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase().trim();
        const envAdminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

        // Check if credentials match the configured admin credentials from .env
        const isAdminMatch = (input === envAdminEmail || input === envAdminUsername) && inputPassword === envAdminPassword;

        if (isAdminMatch) {
          let adminUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: envAdminEmail },
                { profile: { username: envAdminUsername } }
              ]
            },
            include: { profile: true, photos: { where: { isProfile: true }, take: 1 } }
          });

          if (!adminUser) {
            const hashedPassword = await bcrypt.hash(envAdminPassword, 10);
            adminUser = await prisma.user.create({
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
          } else if (adminUser.role !== "ADMIN") {
            adminUser = await prisma.user.update({
              where: { id: adminUser.id },
              data: { role: "ADMIN" },
              include: { profile: true, photos: { where: { isProfile: true }, take: 1 } }
            });
          }

          const primaryImage = adminUser.photos?.[0]?.url || null;

          return {
            id: adminUser.id,
            email: adminUser.email,
            role: "ADMIN",
            username: adminUser.profile?.username || envAdminUsername,
            fullName: adminUser.profile?.fullName || "Soul Bridge Administrator",
            completed: true,
            premiumStatus: adminUser.profile?.premiumStatus || "PLATINUM",
            image: primaryImage,
          };
        }

        // Standard user lookup by email OR username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: input },
              { profile: { username: input } }
            ]
          },
          include: { profile: true, photos: { where: { isProfile: true }, take: 1 } }
        });

        if (!user || !user.passwordHash) {
          throw new Error("No account found with this email or username");
        }

        if (user.status === "BANNED") {
          throw new Error("Your account has been suspended by administration");
        }

        const isPasswordValid = await bcrypt.compare(inputPassword, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Invalid password credentials");
        }

        const primaryImage = user.photos?.[0]?.url || null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.profile?.username || null,
          fullName: user.profile?.fullName || null,
          completed: user.profile?.completed || false,
          premiumStatus: user.profile?.premiumStatus || "FREE",
          image: primaryImage,
        };
      }
    })
  ],
  trustHost: true,
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (!url) {
        return baseUrl;
      }

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.origin === baseUrl) {
          return url;
        }
      } catch (_) {}

      return baseUrl;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.fullName = user.fullName;
        token.completed = user.completed;
        token.premiumStatus = user.premiumStatus;
        token.image = user.image;
      }
      
      // Dynamic profile updates during user session
      if (trigger === "update" && session) {
        if (session.completed !== undefined) token.completed = session.completed;
        if (session.username !== undefined) token.username = session.username;
        if (session.fullName !== undefined) token.fullName = session.fullName;
        if (session.premiumStatus !== undefined) token.premiumStatus = session.premiumStatus;
        if (session.image !== undefined) token.image = session.image;
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
        session.user.image = token.image;
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

