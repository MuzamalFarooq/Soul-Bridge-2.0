"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getConversationSuggestionsText } from "@/services/gemini";

// Helper to get active user ID
async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

/**
 * Fetch all conversations for active user
 */
export async function fetchConversations() {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const convos = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      orderBy: { lastMessageAt: "desc" }
    });

    const detailedConv = [];
    
    for (const c of convos) {
      const matchUserId = c.user1Id === userId ? c.user2Id : c.user1Id;
      const otherProfile = await prisma.profile.findUnique({
        where: { userId: matchUserId },
        include: { user: { include: { photos: true } } }
      });

      detailedConv.push({
        id: c.id,
        lastMessageText: c.lastMessageText,
        lastMessageAt: new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recipientId: matchUserId,
        fullName: otherProfile?.fullName || "Soul Bridge Match",
        photo: otherProfile?.user?.photos[0]?.url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80",
        isOnline: otherProfile?.user?.isOnline || false
      });
    }

    // Return mock rooms if empty for easy testing
    if (detailedConv.length === 0) {
      return {
        success: true,
        conversations: [
          {
            id: "mock_convo_1",
            lastMessageText: "Hey! I'd love to chat about painting sometime.",
            lastMessageAt: "10:34 AM",
            recipientId: "mock_discover_1",
            fullName: "Vanessa Thorne",
            photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
            isOnline: true
          },
          {
            id: "mock_convo_2",
            lastMessageText: "Did you listen to that new record yet?",
            lastMessageAt: "Yesterday",
            recipientId: "mock_discover_2",
            fullName: "Austin Blake",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
            isOnline: false
          }
        ]
      };
    }

    return { success: true, conversations: detailedConv };
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return { success: false, error: "Failed to load chats" };
  }
}

/**
 * Fetch messages for a conversation
 */
export async function fetchMessages(conversationId) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (conversationId.startsWith("mock_")) {
      // Return mock message history
      if (conversationId === "mock_convo_1") {
        return {
          success: true,
          messages: [
            { id: "m1", senderId: "mock_discover_1", text: "Hey there! I saw you matched with me. I love your profile bio!", createdAt: new Date(Date.now() - 3600000), status: "READ" },
            { id: "m2", senderId: userId, text: "Thanks Vanessa! I really liked your art previews. Do you paint often?", createdAt: new Date(Date.now() - 1800000), status: "READ" },
            { id: "m3", senderId: "mock_discover_1", text: "Hey! I'd love to chat about painting sometime.", createdAt: new Date(Date.now() - 600000), status: "SENT" }
          ]
        };
      }
      return {
        success: true,
        messages: [
          { id: "m4", senderId: "mock_discover_2", text: "Hi! Loved your music interests in your onboarding profile.", createdAt: new Date(Date.now() - 7200000), status: "READ" },
          { id: "m5", senderId: userId, text: "Hey Austin! Thanks, yes, I'm super into indie records.", createdAt: new Date(Date.now() - 3600000), status: "READ" },
          { id: "m6", senderId: "mock_discover_2", text: "Did you listen to that new record yet?", createdAt: new Date(Date.now() - 1000000), status: "SENT" }
        ]
      };
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" }
    });

    return { success: true, messages };
  } catch (error) {
    console.error("Fetch messages error:", error);
    return { success: false, error: "Failed to load messages" };
  }
}

/**
 * Save a sent message
 */
export async function sendMessageAction({ conversationId, text, imageUrl, audioUrl, repliedToId }) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (conversationId.startsWith("mock_")) {
      // Mock echo handler for testing
      const msg = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId: userId,
        text,
        imageUrl,
        audioUrl,
        status: "SENT",
        createdAt: new Date(),
        repliedToId
      };
      return { success: true, message: msg };
    }

    // Create Message
    const msg = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        text,
        imageUrl,
        audioUrl,
        repliedToId
      }
    });

    // Update Conversation last message
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageText: text || "Sent an attachment",
          lastMessageAt: new Date()
        }
      });
    } catch (convoErr) {}

    const result = msg;

    return { success: true, message: result };
  } catch (error) {
    console.error("Send message action error:", error);
    return { success: false, error: "Failed to send message" };
  }
}

/**
 * Mark messages in conversation as READ
 */
export async function markMessagesReadAction(conversationId) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false };

    if (conversationId.startsWith("mock_")) return { success: true };

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: "READ" }
      },
      data: { status: "READ" }
    });

    return { success: true };
  } catch (error) {
    console.error("Mark read action error:", error);
    return { success: false };
  }
}

/**
 * Add reaction to a message
 */
export async function addMessageReactionAction({ messageId, reaction }) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false };

    if (messageId.startsWith("mock_")) return { success: true };

    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) return { success: false };

    // Format reaction string e.g. "❤️:userId"
    const reactionString = `${reaction}:${userId}`;
    let updatedReactions = [...msg.reactions];

    if (updatedReactions.includes(reactionString)) {
      // Remove reaction if exists
      updatedReactions = updatedReactions.filter(r => r !== reactionString);
    } else {
      // Add reaction
      updatedReactions.push(reactionString);
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { reactions: updatedReactions }
    });

    return { success: true, reactions: updatedReactions };
  } catch (error) {
    console.error("Add reaction action error:", error);
    return { success: false };
  }
}

/**
 * Call Gemini AI to get conversation reply advice
 */
export async function getConversationSuggestionsAction(conversationId) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const msgsRes = await fetchMessages(conversationId);
    if (!msgsRes.success) return { success: false, error: "Could not load messages" };

    const messages = msgsRes.messages;
    
    // Map sender ID for Gemini context
    const mapped = messages.map(m => ({
      senderId: m.senderId === userId ? "me" : "match",
      text: m.text || "Sent an attachment"
    }));

    const suggestions = await getConversationSuggestionsText(mapped);
    return { success: true, suggestions };
  } catch (error) {
    console.error("AI Suggestions action error:", error);
    return { success: false, error: "AI Suggestions failed" };
  }
}
