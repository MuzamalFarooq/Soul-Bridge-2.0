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

// In-memory persistent mock storage for session likes
const memoryFeedLikes = new Set();

// Initial seed comments for mock posts if database has no comments yet
const initialSeedComments = {
  mock_discover_1: [
    {
      authorName: "Hamza Chaudhry",
      authorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      text: "Stunning fashion work! Loved the ethnic collection 🎨"
    },
    {
      authorName: "Fatima Zahra",
      authorPhoto: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100",
      text: "Lahore street food visits are the best! Let's grab chai sometime."
    }
  ],
  mock_discover_2: [
    {
      authorName: "Ayesha Khan",
      authorPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
      text: "Old Anarkali street food is unmatched! Best of luck with your startup."
    }
  ],
  mock_discover_3: [
    {
      authorName: "Zainab Malik",
      authorPhoto: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100",
      text: "Margalla Hills hiking trail 3 is so peaceful! Love your vibe."
    }
  ]
};

// Format relative time helper
function formatTimeAgo(date) {
  if (!date) return "Just now";
  const diffInSeconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

/**
 * Retrieve database comments for a target user / post ID.
 * Seeds initial mock comments if DB is empty for a mock post.
 */
export async function getPostCommentsFromDb(targetId) {
  try {
    let dbComments = await prisma.comment.findMany({
      where: { targetId: String(targetId) },
      orderBy: { createdAt: "desc" }
    });

    // Seed mock comments into database if empty for mock posts
    if (dbComments.length === 0 && initialSeedComments[targetId]) {
      const seedData = initialSeedComments[targetId];
      for (const item of seedData) {
        await prisma.comment.create({
          data: {
            targetId: String(targetId),
            authorName: item.authorName,
            authorPhoto: item.authorPhoto,
            text: item.text
          }
        }).catch(() => {});
      }

      // Re-fetch after seeding
      dbComments = await prisma.comment.findMany({
        where: { targetId: String(targetId) },
        orderBy: { createdAt: "desc" }
      });
    }

    return dbComments.map((c) => ({
      id: c.id,
      userName: c.authorName || "Soul Bridge Member",
      userPhoto: c.authorPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      text: c.text,
      createdAt: formatTimeAgo(c.createdAt),
      authorId: c.authorId
    }));
  } catch (error) {
    console.error("Error fetching post comments from DB:", error);
    return [];
  }
}

/**
 * Fetch discovery feed items for vertical feed
 */
export async function fetchDiscoverFeed(filters = {}) {
  try {
    const userId = await getUserId();
    
    let candidates = [];
    let myProfile = null;

    if (userId) {
      myProfile = await prisma.profile.findUnique({ where: { userId } }).catch(() => null);

      const dbFilter = { completed: true, userId: { not: userId } };

      if (filters.gender && filters.gender !== "Everyone") {
        dbFilter.gender = filters.gender;
      }
      if (filters.city) {
        dbFilter.city = { contains: filters.city, mode: "insensitive" };
      }
      if (filters.relationshipGoal) {
        dbFilter.relationshipGoal = filters.relationshipGoal;
      }

      const dbProfiles = await prisma.profile.findMany({
        where: dbFilter,
        include: { user: { include: { photos: true } } },
        take: 15
      }).catch(() => []);

      for (const cand of dbProfiles) {
        const comp = myProfile ? await calculateCompatibilityScore(myProfile, cand) : { score: 92 };
        let photos = (cand.user.photos || []).map(p => p.url);
        if (photos.length === 0) {
          photos = ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop"];
        }

        const candId = cand.userId;
        const isLiked = memoryFeedLikes.has(`${userId}_${candId}`);
        const comments = await getPostCommentsFromDb(candId);

        candidates.push({
          id: candId,
          userId: cand.userId,
          fullName: cand.fullName || "Soul Bridge Member",
          age: cand.age || 25,
          gender: cand.gender || "Female",
          city: cand.city || "Lahore",
          country: cand.country || "Pakistan",
          profession: cand.profession || "Creative Professional",
          bio: cand.bio || "Passionate about meaningful connections and shared moments.",
          hobbies: cand.hobbies || ["Travel", "Music", "Coffee"],
          relationshipGoal: cand.relationshipGoal || "Long-term",
          compatibility: comp.score,
          photos: photos,
          likesCount: 124 + (isLiked ? 1 : 0),
          isLiked: isLiked,
          comments: comments,
          postedAt: "Just now"
        });
      }
    }

    // Fallback Mock Pakistani feed pool if candidates are low or unauthenticated
    if (candidates.length === 0) {
      const mockPool = [
        {
          id: "mock_discover_1",
          userId: "mock_discover_1",
          fullName: "Ayesha Khan",
          age: 25,
          gender: "Female",
          city: "Lahore",
          country: "Pakistan",
          profession: "Fashion Designer & Stylist",
          bio: "Designing contemporary ethnic wear by day 👗, exploring Lahore's culinary scenes by night ☕. Looking for a respectful & ambitious partner.",
          hobbies: ["Fashion Design", "Culinary Arts", "Coffee", "Museums"],
          relationshipGoal: "Long-term",
          compatibility: 96,
          photos: [
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=750&h=950&fit=crop",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=750&h=950&fit=crop",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=750&h=950&fit=crop"
          ],
          likesCount: 148,
          postedAt: "2 hours ago"
        },
        {
          id: "mock_discover_2",
          userId: "mock_discover_2",
          fullName: "Hamza Chaudhry",
          age: 28,
          gender: "Male",
          city: "Lahore",
          country: "Pakistan",
          profession: "Tech Entrepreneur & Founder",
          bio: "Building tech startups by day, playing squash on weekends 🎾. Big fan of Sufi music, street food in Old Anarkali, and road trips.",
          hobbies: ["Startups", "Squash", "Sufi Music", "Foodie Trips"],
          relationshipGoal: "Marriage",
          compatibility: 93,
          photos: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=750&h=950&fit=crop",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=750&h=950&fit=crop",
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=750&h=950&fit=crop"
          ],
          likesCount: 192,
          postedAt: "4 hours ago"
        },
        {
          id: "mock_discover_3",
          userId: "mock_discover_3",
          fullName: "Fatima Zahra",
          age: 26,
          gender: "Female",
          city: "Islamabad",
          country: "Pakistan",
          profession: "Software Engineer",
          bio: "Architecting cloud systems 💻 and hiking Margalla Hills Trail 3 on crisp Sunday mornings 🏔️. Chai enthusiast & fiction book nerd.",
          hobbies: ["Cloud Computing", "Hiking", "Chai", "Reading"],
          relationshipGoal: "Marriage",
          compatibility: 91,
          photos: [
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=750&h=950&fit=crop",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=750&h=950&fit=crop",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=750&h=950&fit=crop"
          ],
          likesCount: 167,
          postedAt: "6 hours ago"
        },
        {
          id: "mock_discover_4",
          userId: "mock_discover_4",
          fullName: "Zainab Malik",
          age: 24,
          gender: "Female",
          city: "Karachi",
          country: "Pakistan",
          profession: "Clinical Psychologist",
          bio: "Deep believer in empathy and mental wellness 🌿. Love sunset breezes at Clifton beach, classical music, and handwritten poetry.",
          hobbies: ["Psychology", "Poetry", "Beach Walks", "Writing"],
          relationshipGoal: "Long-term",
          compatibility: 89,
          photos: [
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=750&h=950&fit=crop",
            "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=750&h=950&fit=crop"
          ],
          likesCount: 135,
          postedAt: "8 hours ago"
        }
      ];

      for (const item of mockPool) {
        const isLiked = memoryFeedLikes.has(`${userId || 'anon'}_${item.id}`);
        const comments = await getPostCommentsFromDb(item.id);
        candidates.push({
          ...item,
          likesCount: item.likesCount + (isLiked ? 1 : 0),
          isLiked: isLiked,
          comments: comments
        });
      }
    }

    return { success: true, feed: candidates };
  } catch (error) {
    console.error("Fetch discover feed error:", error);
    return { success: false, error: "Failed to load discovery feed" };
  }
}

/**
 * Toggle like status on a feed post
 */
export async function togglePostLikeAction({ targetUserId }) {
  try {
    const userId = (await getUserId()) || "guest_user";
    const key = `${userId}_${targetUserId}`;

    let isLiked = false;
    if (memoryFeedLikes.has(key)) {
      memoryFeedLikes.delete(key);
      isLiked = false;
    } else {
      memoryFeedLikes.add(key);
      isLiked = true;
    }

    // Save swipe/like to DB if real IDs exist
    if (userId !== "guest_user" && !targetUserId.startsWith("mock_")) {
      if (isLiked) {
        await prisma.like.upsert({
          where: { swiperId_swipedId: { swiperId: userId, swipedId: targetUserId } },
          update: { type: "LIKE" },
          create: { swiperId: userId, swipedId: targetUserId, type: "LIKE" }
        }).catch(() => {});
      }
    }

    return { success: true, isLiked };
  } catch (error) {
    console.error("Toggle post like error:", error);
    return { success: false, error: "Failed to update like status" };
  }
}

/**
 * Add a comment to a user feed post & persist directly in Prisma database
 */
export async function addPostCommentAction({ targetUserId, commentText }) {
  try {
    const userId = await getUserId();
    const cleanText = commentText?.trim();
    if (!cleanText) return { success: false, error: "Comment text cannot be empty." };

    let authorName = "Soul Bridge Member";
    let authorPhoto = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100";
    let authorId = null;

    if (userId) {
      authorId = userId;
      const myProf = await prisma.profile.findUnique({
        where: { userId },
        include: { user: { include: { photos: true } } }
      }).catch(() => null);

      if (myProf) {
        authorName = myProf.fullName || "Soul Bridge Member";
        if (myProf.user?.photos && myProf.user.photos.length > 0) {
          authorPhoto = myProf.user.photos[0].url;
        }
      }
    }

    // Save comment directly into database Comment model
    const newCommentDb = await prisma.comment.create({
      data: {
        targetId: String(targetUserId),
        authorId: authorId,
        authorName: authorName,
        authorPhoto: authorPhoto,
        text: cleanText
      }
    });

    const newCommentFormatted = {
      id: newCommentDb.id,
      userName: newCommentDb.authorName,
      userPhoto: newCommentDb.authorPhoto,
      text: newCommentDb.text,
      createdAt: "Just now",
      authorId: newCommentDb.authorId
    };

    return { success: true, comment: newCommentFormatted };
  } catch (error) {
    console.error("Add post comment error:", error);
    return { success: false, error: "Failed to post comment to database" };
  }
}

/**
 * Get or create a conversation for direct messaging a feed candidate
 */
export async function getOrCreateConversationForUser({ targetUserId }) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return {
        success: true,
        conversationId: "mock_convo_1",
        targetUserId
      };
    }

    if (targetUserId.startsWith("mock_")) {
      const mockConvoId = targetUserId === "mock_discover_1" ? "mock_convo_1" : "mock_convo_2";
      return {
        success: true,
        conversationId: mockConvoId,
        targetUserId
      };
    }

    const sortedIds = [userId, targetUserId].sort();
    let convo = await prisma.conversation.findFirst({
      where: { user1Id: sortedIds[0], user2Id: sortedIds[1] }
    });

    if (!convo) {
      convo = await prisma.conversation.create({
        data: {
          user1Id: sortedIds[0],
          user2Id: sortedIds[1],
          lastMessageText: "Conversation initiated from Discover feed",
          lastMessageAt: new Date()
        }
      });
    }

    return {
      success: true,
      conversationId: convo.id,
      targetUserId
    };
  } catch (error) {
    console.error("Get or create conversation error:", error);
    return { success: false, error: "Failed to initialize conversation" };
  }
}
