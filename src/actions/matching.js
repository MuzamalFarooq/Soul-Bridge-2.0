"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { calculateCompatibilityScore } from "@/services/gemini";

// Helper to get active user ID
async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

/**
 * Fetch candidates for discovery deck based on filters
 */
export async function fetchDiscoverProfiles(filters = {}) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const myProfile = await prisma.profile.findUnique({ where: { userId } });
    if (!myProfile) return { success: false, error: "Profile not found" };

    // Get list of user IDs already swiped by this user
    const swipedRecords = await prisma.like.findMany({
      where: { swiperId: userId },
      select: { swipedId: true }
    });
    const swipedIds = swipedRecords.map(r => r.swipedId);

    // Get list of blocked users
    const blockedRecords = await prisma.blockedUser.findMany({
      where: { blockerId: userId },
      select: { blockedId: true }
    });
    const blockedIds = blockedRecords.map(r => r.blockedId);

    // Exclude list
    const excludeIds = [userId, ...swipedIds, ...blockedIds];

    // Build database search filter query
    const dbFilter = {
      userId: { notIn: excludeIds },
      completed: true,
    };

    if (filters.gender && filters.gender !== "Everyone") {
      dbFilter.gender = filters.gender;
    }
    if (filters.city) {
      dbFilter.city = { contains: filters.city, mode: "insensitive" };
    }
    if (filters.relationshipGoal) {
      dbFilter.relationshipGoal = filters.relationshipGoal;
    }
    if (filters.religion) {
      dbFilter.religion = { contains: filters.religion, mode: "insensitive" };
    }
    if (filters.profession) {
      dbFilter.profession = { contains: filters.profession, mode: "insensitive" };
    }
    if (filters.ageMin || filters.ageMax) {
      dbFilter.age = {
        gte: filters.ageMin ? parseInt(filters.ageMin) : undefined,
        lte: filters.ageMax ? parseInt(filters.ageMax) : undefined,
      };
    }

    const candidates = await prisma.profile.findMany({
      where: dbFilter,
      include: { user: { include: { photos: true } } },
      take: 10
    });

    let deck = [];
    if (candidates.length > 0) {
      for (const cand of candidates) {
        const comp = await calculateCompatibilityScore(myProfile, cand);
        let userPhotos = (cand.user.photos || []).map((p) => p.url);
        
        // Randomly shuffle candidate's uploaded photos for the explore deck presentation
        if (userPhotos.length > 1) {
          userPhotos = [...userPhotos].sort(() => Math.random() - 0.5);
        } else if (userPhotos.length === 0) {
          userPhotos = ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop"];
        }

        deck.push({
          id: cand.userId,
          fullName: cand.fullName,
          age: cand.age || 25,
          gender: cand.gender,
          city: cand.city || "New York",
          country: cand.country || "USA",
          profession: cand.profession || "Creative Professional",
          bio: cand.bio || "No bio description provided.",
          hobbies: cand.hobbies || [],
          relationshipGoal: cand.relationshipGoal || "Long-term",
          compatibility: comp.score,
          photos: userPhotos
        });
      }
    } else {
      // Mock Swiper Pool if database is empty so discovery always works
      deck = [
        {
          id: "mock_discover_1",
          fullName: "Vanessa Thorne",
          age: 25,
          gender: "Female",
          city: "Manhattan",
          country: "USA",
          profession: "Architect & Artist",
          bio: "Designing buildings by day, painting canvases by night. Let's explore museums and share deep thoughts.",
          hobbies: ["Painting", "Architecture", "Coffee", "Museums"],
          relationshipGoal: "Long-term",
          compatibility: 96,
          photos: [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop"
          ]
        },
        {
          id: "mock_discover_2",
          fullName: "Austin Blake",
          age: 28,
          gender: "Male",
          city: "Austin",
          country: "USA",
          profession: "Sound Producer",
          bio: "Music is my life. Looking for a partner to join live gigs, share vinyl records, and hike on Sundays.",
          hobbies: ["Music", "Hiking", "Vinyls", "Tacos"],
          relationshipGoal: "Short-term",
          compatibility: 89,
          photos: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop"
          ]
        },
        {
          id: "mock_discover_3",
          fullName: "Elena Rostova",
          age: 24,
          gender: "Female",
          city: "New York",
          country: "USA",
          profession: "Editorial Writer",
          bio: "Book nerd with a traveling soul. Looking for a genuine counterpart to write our own chapter.",
          hobbies: ["Reading", "Writing", "Travel", "Cats"],
          relationshipGoal: "Marriage",
          compatibility: 92,
          photos: [
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop"
          ]
        }
      ];
    }

    return { success: true, deck };
  } catch (error) {
    console.error("Fetch discover candidates error:", error);
    return { success: false, error: "Failed to fetch candidates" };
  }
}

/**
 * Submit a swipe outcome (LIKE, PASS, SUPERLIKE)
 */
export async function submitSwipeAction({ swipedId, type }) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (swipedId.startsWith("mock_")) {
      // Mock swipe response for sandbox testing
      if (type === "LIKE" || type === "SUPERLIKE") {
        // Return 60% probability of immediate mock match for celebration wow-effect
        const isMatch = Math.random() > 0.4;
        if (isMatch) {
          return {
            success: true,
            matched: true,
            matchData: {
              id: `mock_match_${Date.now()}`,
              user1Id: userId,
              user2Id: swipedId,
              fullName: swipedId === "mock_discover_1" ? "Vanessa Thorne" : (swipedId === "mock_discover_3" ? "Elena Rostova" : "Austin Blake"),
              photo: swipedId === "mock_discover_1" 
                ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" 
                : (swipedId === "mock_discover_3" ? "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
            }
          };
        }
      }
      return { success: true, matched: false };
    }

    // Save to Database
    const newLike = await prisma.like.create({
      data: {
        swiperId: userId,
        swipedId,
        type
      }
    });

    // Check if match occurred (mutual LIKE or SUPERLIKE)
    if (type === "LIKE" || type === "SUPERLIKE") {
      const mutualLike = await prisma.like.findFirst({
        where: {
          swiperId: swipedId,
          swipedId: userId,
          type: { in: ["LIKE", "SUPERLIKE"] }
        }
      });

      if (mutualLike) {
        // Create Match and Conversation records
        const sortedIds = [userId, swipedId].sort();
        
        let match = await prisma.match.findFirst({
          where: { user1Id: sortedIds[0], user2Id: sortedIds[1] }
        });
        if (!match) {
          match = await prisma.match.create({
            data: {
              user1Id: sortedIds[0],
              user2Id: sortedIds[1]
            }
          });
        }

        let convo = await prisma.conversation.findFirst({
          where: { user1Id: sortedIds[0], user2Id: sortedIds[1] }
        });
        if (!convo) {
          convo = await prisma.conversation.create({
            data: {
              user1Id: sortedIds[0],
              user2Id: sortedIds[1],
              lastMessageText: "You matched! Start your conversation.",
              lastMessageAt: new Date()
            }
          });
        }

        // Create notification records for both users
        try {
          await prisma.notification.create({
            data: {
              userId,
              type: "MATCH",
              content: "You found a new match! Tap to celebrate.",
              link: `/chat?convo=${convo.id}`
            }
          });
          await prisma.notification.create({
            data: {
              userId: swipedId,
              type: "MATCH",
              content: "Someone matched with you! Open chat to see.",
              link: `/chat?convo=${convo.id}`
            }
          });
        } catch (notifErr) {}

        const matchResult = { match, convo };

        // Retrieve matched profile info
        const targetProfile = await prisma.profile.findUnique({
          where: { userId: swipedId },
          include: { user: { include: { photos: true } } }
        });

        return {
          success: true,
          matched: true,
          matchData: {
            id: matchResult.match.id,
            user1Id: userId,
            user2Id: swipedId,
            fullName: targetProfile?.fullName || "A Match",
            photo: targetProfile?.user.photos[0]?.url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
          }
        };
      }
    }

    return { success: true, matched: false };
  } catch (error) {
    console.error("Register swipe action error:", error);
    return { success: false, error: "Failed to submit swipe" };
  }
}

/**
 * Undo last swipe
 */
export async function undoLastSwipeAction() {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Find the latest like/pass
    const latestSwipe = await prisma.like.findFirst({
      where: { swiperId: userId },
      orderBy: { createdAt: "desc" }
    });

    if (!latestSwipe) {
      return { success: false, error: "No swipe history found to undo." };
    }

    // Delete it
    await prisma.like.delete({
      where: { id: latestSwipe.id }
    });

    return { success: true, message: "Swipe successfully undone!" };
  } catch (error) {
    console.error("Undo swipe action error:", error);
    return { success: false, error: "Failed to undo swipe" };
  }
}

/**
 * Fetch pending connection requests sent to the active user
 */
export async function fetchPendingConnectionRequests() {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const myProfile = await prisma.profile.findUnique({ where: { userId } });

    // Find likes/requests sent to this user where the user has not swiped/liked back yet
    const incomingLikes = await prisma.like.findMany({
      where: {
        swipedId: userId,
        type: { in: ["LIKE", "SUPERLIKE"] }
      },
      orderBy: { createdAt: "desc" }
    });

    const myLikes = await prisma.like.findMany({
      where: { swiperId: userId },
      select: { swipedId: true }
    });
    const myLikedIds = new Set(myLikes.map(l => l.swipedId));

    const pendingRequests = [];
    for (const like of incomingLikes) {
      if (!myLikedIds.has(like.swiperId)) {
        const requesterProfile = await prisma.profile.findUnique({
          where: { userId: like.swiperId },
          include: { user: { include: { photos: true } } }
        });

        if (requesterProfile) {
          const comp = await calculateCompatibilityScore(myProfile, requesterProfile);
          pendingRequests.push({
            id: like.id,
            requesterId: like.swiperId,
            fullName: requesterProfile.fullName || "Connection Candidate",
            age: requesterProfile.age || 25,
            gender: requesterProfile.gender,
            profession: requesterProfile.profession || "Member",
            bio: requesterProfile.bio || "Sent you a connection request.",
            photo: requesterProfile.user.photos[0]?.url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            compatibility: comp.score,
            requestType: like.type,
            createdAt: like.createdAt
          });
        }
      }
    }

    // Mock connection request if empty for instant testing
    if (pendingRequests.length === 0) {
      pendingRequests.push({
        id: "req_mock_1",
        requesterId: "mock_discover_1",
        fullName: "Vanessa Thorne",
        age: 25,
        gender: "Female",
        profession: "Architect & Artist",
        bio: "Hey! I felt a strong compatibility with your profile and sent a connection request.",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        compatibility: 96,
        requestType: "SUPERLIKE",
        createdAt: new Date()
      });
    }

    return { success: true, requests: pendingRequests };
  } catch (error) {
    console.error("Fetch pending requests error:", error);
    return { success: false, error: "Failed to load connection requests" };
  }
}

/**
 * Accept a pending connection request and establish connection
 */
export async function acceptConnectionRequest({ requesterId }) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (requesterId.startsWith("mock_")) {
      return {
        success: true,
        convoId: "mock_convo_1",
        matchData: {
          id: `mock_match_${Date.now()}`,
          user1Id: userId,
          user2Id: requesterId,
          fullName: "Vanessa Thorne",
          photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
        }
      };
    }

    // Save mutual LIKE record from user -> requester
    await prisma.like.upsert({
      where: {
        swiperId_swipedId: {
          swiperId: userId,
          swipedId: requesterId
        }
      },
      update: { type: "LIKE" },
      create: {
        swiperId: userId,
        swipedId: requesterId,
        type: "LIKE"
      }
    });

    // Create Match and Conversation
    const sortedIds = [userId, requesterId].sort();
    
    let match = await prisma.match.findFirst({
      where: { user1Id: sortedIds[0], user2Id: sortedIds[1] }
    });
    if (!match) {
      match = await prisma.match.create({
        data: {
          user1Id: sortedIds[0],
          user2Id: sortedIds[1]
        }
      });
    }

    let convo = await prisma.conversation.findFirst({
      where: { user1Id: sortedIds[0], user2Id: sortedIds[1] }
    });
    if (!convo) {
      convo = await prisma.conversation.create({
        data: {
          user1Id: sortedIds[0],
          user2Id: sortedIds[1],
          lastMessageText: "Connection established! You can now send messages and SMS.",
          lastMessageAt: new Date()
        }
      });
    }

    // Create Notifications
    try {
      await prisma.notification.create({
        data: {
          userId: requesterId,
          type: "MATCH",
          content: "Your connection request was accepted! You can now message & SMS.",
          link: `/chat?convo=${convo.id}`
        }
      });
      await prisma.notification.create({
        data: {
          userId,
          type: "MATCH",
          content: "Connection established! Start chatting or sending SMS.",
          link: `/chat?convo=${convo.id}`
        }
      });
    } catch (nErr) {}

    const requesterProfile = await prisma.profile.findUnique({
      where: { userId: requesterId },
      include: { user: { include: { photos: true } } }
    });

    return {
      success: true,
      convoId: convo.id,
      matchData: {
        id: match.id,
        user1Id: userId,
        user2Id: requesterId,
        fullName: requesterProfile?.fullName || "Connection Partner",
        photo: requesterProfile?.user.photos[0]?.url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
      }
    };
  } catch (error) {
    console.error("Accept connection request error:", error);
    return { success: false, error: "Failed to accept connection request" };
  }
}

/**
 * Decline a pending connection request
 */
export async function declineConnectionRequest({ requesterId }) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (!requesterId.startsWith("mock_")) {
      // Record PASS like from user to requester
      await prisma.like.upsert({
        where: {
          swiperId_swipedId: {
            swiperId: userId,
            swipedId: requesterId
          }
        },
        update: { type: "PASS" },
        create: {
          swiperId: userId,
          swipedId: requesterId,
          type: "PASS"
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Decline connection request error:", error);
    return { success: false, error: "Failed to decline request" };
  }
}
