import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { resolveAuthBaseUrl } from "./auth-url";
import { getAuthSecret } from "./auth-secret";

// Ensure reverse proxy headers are trusted for NextAuth
process.env.AUTH_TRUST_HOST = "true";

const resolvedAuthBaseUrl =
  resolveAuthBaseUrl(process.env) ||
  (process.env.NODE_ENV === "production" ? "https://soulbridge.muzamal.site" : undefined);

if (process.env.NODE_ENV === "production" && (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)) {
  console.error("Google OAuth is not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the deployment environment.");
}

if (resolvedAuthBaseUrl) {
  process.env.NEXTAUTH_URL = resolvedAuthBaseUrl;
  process.env.AUTH_URL = resolvedAuthBaseUrl;
}

const isProduction =
  process.env.NODE_ENV === "production" ||
  Boolean(resolvedAuthBaseUrl?.startsWith("https://")) ||
  Boolean(process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://"));

const useSecureCookies = Boolean(isProduction);
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostPrefix = useSecureCookies ? "__Host-" : "";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
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

        // Check if credentials match configured admin credentials from environment
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
  useSecureCookies,
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${hostPrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15,
      },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user?.email) return false;
        if (profile?.email_verified !== true) return false;
        const cleanEmail = user.email.toLowerCase().trim();

        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: cleanEmail },
            include: {
              profile: true,
              settings: true,
              photos: { where: { isProfile: true }, take: 1 }
            }
          });

          if (dbUser) {
            if (dbUser.status === "BANNED") {
              return "/login?error=GoogleAccountBlocked";
            }

            // Ensure verified email status from Google OAuth
            if (!dbUser.emailVerified) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { emailVerified: new Date() }
              });
            }

            // If account was created without a profile, guarantee profile exists
            if (!dbUser.profile) {
              const baseName = (user.name || cleanEmail.split("@")[0]).toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
              const uniqueSuffix = Math.random().toString(36).substring(2, 6);
              const fallbackUsername = `${baseName}_${uniqueSuffix}`;

              const createdProfile = await prisma.profile.create({
                data: {
                  userId: dbUser.id,
                  fullName: user.name || cleanEmail.split("@")[0],
                  username: fallbackUsername,
                  completed: false,
                  premiumStatus: "FREE",
                }
              });
              dbUser.profile = createdProfile;
            }

            if (!dbUser.settings) {
              await prisma.settings.create({
                data: {
                  userId: dbUser.id,
                  darkMode: true,
                  pushNotifications: true,
                  emailNotifications: true,
                  invisibleMode: false,
                  privatePhotos: false,
                }
              });
            }

            if (user.image && !dbUser.photos?.[0]) {
              const profilePhoto = await prisma.photo.create({
                data: {
                  userId: dbUser.id,
                  url: user.image,
                  isProfile: true,
                  publicId: `google_${dbUser.id}`,
                }
              });
              dbUser.photos = [profilePhoto];
            }

            if (user.name || user.image) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  ...(user.name ? { name: user.name } : {}),
                  ...(user.image ? { image: user.image } : {}),
                }
              });
            }

            user.id = dbUser.id;
            user.role = dbUser.role;
            user.username = dbUser.profile?.username || null;
            user.fullName = dbUser.profile?.fullName || user.name || null;
            user.completed = Boolean(dbUser.profile?.completed);
            user.premiumStatus = dbUser.profile?.premiumStatus || "FREE";
            user.image = dbUser.photos?.[0]?.url || user.image || null;
          } else {
            // Generate clean, collision-free username
            const baseClean = (user.name || cleanEmail.split("@")[0]).toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
            let username = baseClean;
            let counter = 1;
            while (await prisma.profile.findUnique({ where: { username } })) {
              const randomSuffix = Math.floor(1000 + Math.random() * 9000);
              username = `${baseClean}${randomSuffix}`;
              counter++;
              if (counter > 10) {
                username = `${baseClean}_${Date.now().toString(36)}`;
                break;
              }
            }

            const newUser = await prisma.user.create({
              data: {
                email: cleanEmail,
                emailVerified: new Date(),
                role: "USER",
                status: "ACTIVE",
                settings: {
                  create: {
                    darkMode: true,
                    pushNotifications: true,
                    emailNotifications: true,
                    invisibleMode: false,
                    privatePhotos: false,
                  }
                },
                profile: {
                  create: {
                    fullName: user.name || cleanEmail.split("@")[0],
                    username: username,
                    completed: false,
                    premiumStatus: "FREE",
                  }
                },
                ...(user.image ? {
                  photos: {
                    create: [
                      {
                        url: user.image,
                        isProfile: true,
                        publicId: `google_${Date.now()}`
                      }
                    ]
                  }
                } : {})
              },
              include: { profile: true, photos: { where: { isProfile: true }, take: 1 } }
            });

            user.id = newUser.id;
            user.role = newUser.role;
            user.username = newUser.profile?.username || null;
            user.fullName = newUser.profile?.fullName || user.name || null;
            user.completed = false;
            user.premiumStatus = "FREE";
            user.image = newUser.photos?.[0]?.url || user.image || null;
          }

          return true;
        } catch (err) {
          console.error("Google sign-in callback error:", err);
          return "/login?error=GoogleAccountSetup";
        }
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      const canonicalBase =
        (process.env.NODE_ENV === "production" ? "https://soulbridge.muzamal.site" : null) ||
        resolveAuthBaseUrl(process.env) ||
        baseUrl ||
        "https://soulbridge.muzamal.site";

      if (!url) {
        return `${canonicalBase}/discover`;
      }

      // Handle relative paths safely (e.g. "/discover" or "/onboarding")
      if (url.startsWith("/")) {
        return `${canonicalBase}${url}`;
      }

      // Handle absolute URLs matching canonical or baseUrl origin
      try {
        const parsedUrl = new URL(url);
        const parsedCanonical = new URL(canonicalBase);
        if (
          parsedUrl.origin === parsedCanonical.origin ||
          (baseUrl && parsedUrl.origin === new URL(baseUrl).origin)
        ) {
          return url;
        }
      } catch (_) {}

      return `${canonicalBase}/discover`;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.username = user.username;
        token.fullName = user.fullName;
        token.completed = user.completed;
        token.premiumStatus = user.premiumStatus;
        token.image = user.image;
      }

      // Always guarantee token.sub is the MongoDB ObjectId, not an external provider numeric id
      const tokenUserId = token.sub || token.id;
      const isObjectId = typeof tokenUserId === "string" && /^[0-9a-fA-F]{24}$/.test(tokenUserId);
      const userEmail = (user?.email || token.email || "").toLowerCase().trim();

      if ((!isObjectId || !token.username) && userEmail) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: userEmail },
            include: { profile: true, photos: { where: { isProfile: true }, take: 1 } }
          });
          if (dbUser) {
            token.sub = dbUser.id;
            token.role = dbUser.role;
            token.username = dbUser.profile?.username || null;
            token.fullName = dbUser.profile?.fullName || token.name || null;
            token.completed = Boolean(dbUser.profile?.completed);
            token.premiumStatus = dbUser.profile?.premiumStatus || "FREE";
            token.image = dbUser.photos?.[0]?.url || token.image || token.picture || null;
          }
        } catch (e) {
          console.error("JWT user fetch error:", e);
        }
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
        session.user.id = token.id || token.sub;
        session.user.role = token.role || "USER";
        session.user.username = token.username || null;
        session.user.fullName = token.fullName || session.user.name || null;
        session.user.completed = Boolean(token.completed);
        session.user.premiumStatus = token.premiumStatus || "FREE";
        session.user.image = token.image || session.user.image || null;
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
  secret: getAuthSecret(),
};
