"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateIceBreakersText, calculateCompatibilityScore } from "@/services/gemini";

// Helper to get active user ID
async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

/**
 * Action to get AI Ice Breakers for a match
 */
export async function getMatchIceBreakers(matchId) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const userProfile = await prisma.profile.findUnique({ where: { userId } });
    
    let matchProfile = null;
    if (matchId.startsWith("mock_")) {
      // Mock data lookup
      matchProfile = {
        fullName: matchId === "mock_discover_1" ? "Vanessa Thorne" : (matchId === "mock_discover_3" ? "Elena Rostova" : "Austin Blake"),
        profession: matchId === "mock_discover_1" ? "Architect & Artist" : (matchId === "mock_discover_3" ? "Editorial Writer" : "Sound Producer"),
        hobbies: matchId === "mock_discover_1" 
          ? ["Painting", "Architecture", "Coffee"] 
          : (matchId === "mock_discover_3" ? ["Reading", "Writing", "Travel"] : ["Music", "Hiking", "Vinyls"]),
        bio: matchId === "mock_discover_1" 
          ? "Designing buildings by day, painting canvases by night." 
          : (matchId === "mock_discover_3" ? "Book nerd with a traveling soul." : "Music is my life.")
      };
    } else {
      matchProfile = await prisma.profile.findUnique({ where: { userId: matchId } });
    }

    if (!userProfile || !matchProfile) {
      return { success: false, error: "Profiles not found" };
    }

    const icebreakers = await generateIceBreakersText(userProfile, matchProfile);
    return { success: true, icebreakers };
  } catch (error) {
    console.error("Fetch icebreakers error:", error);
    return { success: false, error: "Failed to generate icebreakers" };
  }
}

/**
 * Action to get Compatibility Score and Rationale
 */
export async function getCompatibilityReport(matchId) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const userProfile = await prisma.profile.findUnique({ where: { userId } });
    
    let matchProfile = null;
    if (matchId.startsWith("mock_")) {
      matchProfile = {
        gender: "Female",
        interestedIn: "Male",
        religion: "Christian",
        relationshipGoal: "Long-term",
        hobbies: matchId === "mock_discover_1" 
          ? ["Painting", "Architecture", "Coffee"] 
          : (matchId === "mock_discover_3" ? ["Reading", "Writing", "Travel"] : ["Music", "Hiking", "Vinyls"]),
        bio: matchId === "mock_discover_1" 
          ? "Designing buildings by day, painting canvases by night." 
          : (matchId === "mock_discover_3" ? "Book nerd with a traveling soul." : "Music is my life.")
      };
    } else {
      matchProfile = await prisma.profile.findUnique({ where: { userId: matchId } });
    }

    if (!userProfile || !matchProfile) {
      return { success: false, error: "Profiles not found" };
    }

    const report = await calculateCompatibilityScore(userProfile, matchProfile);
    return { success: true, report };
  } catch (error) {
    console.error("Calculate compatibility error:", error);
    return { success: false, error: "Failed to calculate compatibility" };
  }
}
