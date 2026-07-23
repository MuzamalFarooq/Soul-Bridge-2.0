"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateBioText, getProfileReviewText } from "@/services/gemini";

/**
 * Helper to get current authenticated user ID
 */
async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

/**
 * Save user profile onboarding/edit data
 */
export async function saveUserProfile(data) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized access" };

    // Format DOB if present
    let dobParsed = undefined;
    let calculatedAge = undefined;
    if (data.dob) {
      dobParsed = new Date(data.dob);
      // Calculate age
      const diffMs = Date.now() - dobParsed.getTime();
      const ageDate = new Date(diffMs);
      calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    const {
      fullName,
      username,
      gender,
      interestedIn,
      height,
      weight,
      religion,
      profession,
      education,
      country,
      city,
      languages,
      relationshipGoal,
      bio,
      hobbies,
      smoking,
      drinking,
      pets,
      favoriteMusic,
      favoriteMovies,
      instagram,
      facebook,
      occupation,
      lookingFor,
      personalityType,
      photos // Array of photo URLs or objects [{url, publicId, isProfile}]
    } = data;

    // Check if username is taken (excluding current user)
    if (username) {
      const existingUser = await prisma.profile.findFirst({
        where: {
          username: username.toLowerCase().trim(),
          NOT: { userId }
        }
      });
      if (existingUser) {
        return { success: false, error: "Username is already taken" };
      }
    }

    // Save profile and photos inside transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update/create profile
      await tx.profile.update({
        where: { userId },
        data: {
          fullName,
          username: username ? username.toLowerCase().trim() : undefined,
          gender,
          interestedIn,
          dob: dobParsed,
          age: calculatedAge || undefined,
          height: height ? parseFloat(height) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          religion,
          profession,
          education,
          country,
          city,
          languages: languages || [],
          relationshipGoal,
          bio,
          hobbies: hobbies || [],
          smoking,
          drinking,
          pets: pets || [],
          favoriteMusic: favoriteMusic || [],
          favoriteMovies: favoriteMovies || [],
          instagram,
          facebook,
          occupation,
          lookingFor,
          personalityType,
          completed: true
        }
      });

      // 2. Clear old profile photos if updating, and insert new ones
      if (photos && photos.length > 0) {
        await tx.photo.deleteMany({ where: { userId } });
        
        await tx.photo.createMany({
          data: photos.map((p, idx) => ({
            userId,
            url: p.url || p,
            publicId: p.publicId || `mock_cloudinary_${Date.now()}_${idx}`,
            isProfile: idx === 0, // Mark first photo as profile photo
            isPrivate: p.isPrivate || false
          }))
        });
      }
    });

    return { success: true, message: "Profile saved successfully!" };
  } catch (error) {
    console.error("Save profile error:", error);
    return { success: false, error: error.message || "Failed to save profile" };
  }
}

/**
 * Action to trigger AI Bio Generation
 */
export async function getAIBioAction(keywords) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const { hobbies, relationshipGoal, profession, gender } = keywords;
    const bio = await generateBioText({ hobbies, relationshipGoal, profession, gender });

    return { success: true, bio };
  } catch (error) {
    console.error("AI Bio Generation error:", error);
    return { success: false, error: "Failed to generate AI bio" };
  }
}

/**
 * Action to trigger AI Profile Review
 */
export async function getProfileReviewAction() {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) return { success: false, error: "Profile not found" };

    const tips = await getProfileReviewText(profile);
    return { success: true, tips };
  } catch (error) {
    console.error("AI Profile Review error:", error);
    return { success: false, error: "Failed to review profile" };
  }
}
