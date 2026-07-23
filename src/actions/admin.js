"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Helper to verify admin access
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden: Admin access required");
  return session.user;
}

/**
 * Get platform-wide statistics for the admin dashboard
 */
export async function getAdminStats() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      verifiedUsers,
      totalMatches,
      totalMessages,
      totalLikes,
      premiumUsers,
      recentSignups
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "BANNED" } }),
      prisma.user.count({ where: { emailVerified: { not: null } } }),
      prisma.match.count(),
      prisma.message.count(),
      prisma.like.count({ where: { type: "LIKE" } }),
      prisma.profile.count({ where: { premiumStatus: { not: "FREE" } } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 7,
        select: { createdAt: true }
      })
    ]);

    // Build signup trend (last 7 days)
    const signupTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      const count = recentSignups.filter(u => {
        const d = new Date(u.createdAt);
        return d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
      }).length;
      return { day: dayLabel, count };
    });

    return {
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        bannedUsers,
        verifiedUsers,
        totalMatches,
        totalMessages,
        totalLikes,
        premiumUsers,
        signupTrend
      }
    };
  } catch (error) {
    console.error("Admin stats error:", error);
    return { success: false, error: error.message || "Failed to load admin stats" };
  }
}

/**
 * Get paginated user list for management
 */
export async function getAdminUsers({ page = 1, search = "", status = "" } = {}) {
  try {
    await requireAdmin();

    const pageSize = 15;
    const skip = (page - 1) * pageSize;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { profile: { fullName: { contains: search, mode: "insensitive" } } },
        { profile: { username: { contains: search, mode: "insensitive" } } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: { select: { fullName: true, username: true, premiumStatus: true, completed: true } },
          _count: { select: { likesSent: true, matches1: true, messagesSent: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize
      }),
      prisma.user.count({ where })
    ]);

    return {
      success: true,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.status,
        emailVerified: u.emailVerified,
        isOnline: u.isOnline,
        lastActive: u.lastActive,
        createdAt: u.createdAt,
        fullName: u.profile?.fullName || null,
        username: u.profile?.username || null,
        premiumStatus: u.profile?.premiumStatus || "FREE",
        profileCompleted: u.profile?.completed || false,
        likesCount: u._count.likesSent,
        matchesCount: u._count.matches1,
        messagesCount: u._count.messagesSent
      })),
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    console.error("Admin users error:", error);
    return { success: false, error: error.message || "Failed to load users" };
  }
}

/**
 * Update a user's account status (ACTIVE / BANNED)
 */
export async function updateUserStatusAction(userId, status) {
  try {
    await requireAdmin();

    if (!["ACTIVE", "BANNED"].includes(status)) {
      return { success: false, error: "Invalid status value" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    return { success: true, message: `User ${status === "BANNED" ? "banned" : "unbanned"} successfully.` };
  } catch (error) {
    console.error("Update user status error:", error);
    return { success: false, error: error.message || "Failed to update user status" };
  }
}

/**
 * Update a user's role (USER / ADMIN)
 */
export async function updateUserRoleAction(userId, role) {
  try {
    await requireAdmin();

    if (!["USER", "ADMIN"].includes(role)) {
      return { success: false, error: "Invalid role value" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    return { success: true, message: `User role updated to ${role}.` };
  } catch (error) {
    console.error("Update user role error:", error);
    return { success: false, error: error.message || "Failed to update user role" };
  }
}

/**
 * Get recent activity logs across all users
 */
export async function getAdminActivityLogs({ limit = 20 } = {}) {
  try {
    await requireAdmin();

    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          include: {
            profile: { select: { fullName: true, username: true } }
          }
        }
      }
    });

    return {
      success: true,
      logs: logs.map(l => ({
        id: l.id,
        action: l.action,
        details: l.details,
        createdAt: l.createdAt,
        userEmail: l.user.email,
        userName: l.user.profile?.fullName || l.user.email
      }))
    };
  } catch (error) {
    console.error("Admin activity logs error:", error);
    return { success: false, error: "Failed to load activity logs" };
  }
}
