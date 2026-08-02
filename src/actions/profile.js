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

    // 1. Upsert profile safely for all MongoDB setups
    await prisma.profile.upsert({
      where: { userId },
      update: {
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
      },
      create: {
        userId,
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
        completed: true,
        premiumStatus: "FREE"
      }
    });

    // 2. Clear old profile photos if updating, and insert new ones sequentially
    if (photos && photos.length > 0) {
      try {
        await prisma.photo.deleteMany({ where: { userId } });
      } catch (delErr) {}
      
      for (let idx = 0; idx < photos.length; idx++) {
        const p = photos[idx];
        await prisma.photo.create({
          data: {
            userId,
            url: p.url || p,
            publicId: p.publicId || `mock_cloudinary_${Date.now()}_${idx}`,
            isProfile: idx === 0,
            isPrivate: p.isPrivate || false
          }
        });
      }
    }

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

/**
 * Delete a profile photo by ID
 */
export async function deleteProfilePhotoAction(photoId) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo || photo.userId !== userId) {
      return { success: false, error: "Photo not found or unauthorized" };
    }

    await prisma.photo.delete({ where: { id: photoId } });

    // If deleted photo was primary, assign first remaining photo as primary
    if (photo.isProfile) {
      const firstRemaining = await prisma.photo.findFirst({ where: { userId } });
      if (firstRemaining) {
        await prisma.photo.update({
          where: { id: firstRemaining.id },
          data: { isProfile: true }
        });
      }
    }

    return { success: true, message: "Photo deleted successfully" };
  } catch (error) {
    console.error("Delete photo error:", error);
    return { success: false, error: "Failed to delete photo" };
  }
}

/**
 * Set a photo as primary profile picture
 */
export async function setPrimaryProfilePhotoAction(photoId) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Reset all user's photos isProfile to false
    await prisma.photo.updateMany({
      where: { userId },
      data: { isProfile: false }
    });

    // Set selected photo isProfile to true
    await prisma.photo.update({
      where: { id: photoId },
      data: { isProfile: true }
    });

    return { success: true, message: "Primary photo updated successfully" };
  } catch (error) {
    console.error("Set primary photo error:", error);
    return { success: false, error: "Failed to set primary photo" };
  }
}

