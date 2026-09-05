"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { calculateCompatibilityScore } from "@/services/groq";

// Helper to get active user
async function getActiveUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

/**
 * Fetch all dashboard metrics and datasets
 */
export async function getDashboardData() {
  try {
    const user = await getActiveUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const userId = user.id;

    // 1. Fetch current profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { include: { photos: true } } }
    });

    if (!profile) return { success: false, error: "Profile not found" };

    // 2. Calculate profile completion percentage
    let completedFields = 0;
    const fieldsToTrack = [
      "fullName", "username", "gender", "interestedIn", "dob", "height", "weight", 
      "religion", "profession", "education", "country", "city", "languages", 
      "relationshipGoal", "bio", "hobbies", "smoking", "drinking", "instagram", "personalityType"
    ];
    fieldsToTrack.forEach(f => {
      if (profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : true)) {
        completedFields++;
      }
    });
    // Add photos check
    const photoCount = await prisma.photo.count({ where: { userId } });
    if (photoCount > 0) completedFields += 2; // Weight photo more
    const totalPossible = fieldsToTrack.length + 2;
    const completionPercentage = Math.round((completedFields / totalPossible) * 100);

    // 3. Count likes, matches, and notifications
    const likesCount = await prisma.like.count({ where: { swipedId: userId, type: "LIKE" } });
    const matchesCount = await prisma.match.count({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    // 4. Fetch recent activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Create a mock log if empty
    if (activityLogs.length === 0) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: "PROFILE_UPDATE",
          details: "Completed onboarding registration wizard."
        }
      });
    }

    // 5. Fetch suggest matches
    // Find other profiles (not active user)
    const targetGender = profile.interestedIn === "Everyone" ? undefined : profile.interestedIn;
    
    const candidateProfiles = await prisma.profile.findMany({
      where: {
        userId: { not: userId },
        completed: true,
        gender: targetGender ? { equals: targetGender } : undefined
      },
      include: { user: { include: { photos: true } } },
      take: 5
    });

    // Dynamic suggestions (mock fallbacks if db is empty)
    let suggestions = [];
    if (candidateProfiles.length > 0) {
      for (const candidate of candidateProfiles) {
        const comp = await calculateCompatibilityScore(profile, candidate);
        suggestions.push({
          id: candidate.userId,
          fullName: candidate.fullName,
          username: candidate.username,
          age: candidate.age || 26,
          city: candidate.city || "New York",
          profession: candidate.profession || "Creative",
          bio: candidate.bio || "",
          compatibility: comp.score,
          photo: candidate.user.photos[0]?.url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
        });
      }
      suggestions.sort((a, b) => b.compatibility - a.compatibility);
    } else {
      // Return 3 beautiful mock suggestions
      suggestions = [
        {
          id: "mock_user_1",
          fullName: "Amara Vance",
          username: "amaravance",
          age: 26,
          city: "Los Angeles",
          profession: "Interior Designer",
          bio: "Art enthusiast, lover of mid-century design, and searcher of the perfect cup of coffee. Let's talk galleries!",
          compatibility: 94,
          photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
        },
        {
          id: "mock_user_2",
          fullName: "Liam Chen",
          username: "liamchen",
          age: 29,
          city: "Brooklyn",
          profession: "Software Engineer",
          bio: "Tech worker by day, runner by night. Looking for someone to explore food trucks and weekend trails with.",
          compatibility: 88,
          photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
        },
        {
          id: "mock_user_3",
          fullName: "Chloe Dubois",
          username: "chloedub",
          age: 24,
          city: "San Francisco",
          profession: "Chef de Partie",
          bio: "Food is my language, but travel is my fuel. Let's cook up something wonderful together.",
          compatibility: 82,
          photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop"
        }
      ];
    }

    // 6. Visitors list (mock views)
    const visitors = [
      { id: "v1", fullName: "Sophia Rose", time: "2 hours ago", photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80" },
      { id: "v2", fullName: "James Wilson", time: "Yesterday", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80" }
    ];

    return {
      success: true,
      data: {
        profile,
        completionPercentage,
        likesCount,
        matchesCount,
        suggestions,
        visitors,
        activityLogs: activityLogs.map(l => ({
          action: l.action,
          details: l.details,
          time: new Date(l.createdAt).toLocaleDateString()
        }))
      }
    };
  } catch (error) {
    console.error("Fetch dashboard metrics error:", error);
    return { success: false, error: "Failed to load dashboard data" };
  }
}
