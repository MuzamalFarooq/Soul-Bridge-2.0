"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getConversationSuggestionsText } from "@/services/groq";

// Helper to get active user ID
async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

// In-memory store for mock conversation messages & rooms during session
const mockMessagesStore = {
  ai_companion: [
    { id: "ai_m0", conversationId: "ai_companion", senderId: "ai_companion", text: "Hey there! I'm so happy you're here with me. How has your day been treating you? ❤️", createdAt: new Date(Date.now() - 300000), status: "READ" }
  ],
  mock_convo_1: [
    { id: "m1", conversationId: "mock_convo_1", senderId: "mock_discover_1", text: "Hey there! I saw you matched with me. I love your profile bio!", createdAt: new Date(Date.now() - 3600000), status: "READ" },
    { id: "m2", conversationId: "mock_convo_1", senderId: "user_me", text: "Thanks Vanessa! I really liked your art previews. Do you paint often?", createdAt: new Date(Date.now() - 1800000), status: "READ" },
    { id: "m3", conversationId: "mock_convo_1", senderId: "mock_discover_1", text: "Hey! I'd love to chat about painting sometime.", createdAt: new Date(Date.now() - 600000), status: "SENT" }
  ],
  mock_convo_2: [
    { id: "m4", conversationId: "mock_convo_2", senderId: "mock_discover_2", text: "Hi! Loved your music interests in your onboarding profile.", createdAt: new Date(Date.now() - 7200000), status: "READ" },
    { id: "m5", conversationId: "mock_convo_2", senderId: "user_me", text: "Hey Austin! Thanks, yes, I'm super into indie records.", createdAt: new Date(Date.now() - 3600000), status: "READ" },
    { id: "m6", conversationId: "mock_convo_2", senderId: "mock_discover_2", text: "Did you listen to that new record yet?", createdAt: new Date(Date.now() - 1000000), status: "SENT" }
  ],
  mock_convo_3: [
    { id: "m7", conversationId: "mock_convo_3", senderId: "mock_discover_3", text: "Hi! Margalla Hills hiking Trail 3 is so serene! Let's connect.", createdAt: new Date(Date.now() - 1200000), status: "SENT" }
  ],
  mock_convo_4: [
    { id: "m8", conversationId: "mock_convo_4", senderId: "mock_discover_4", text: "Sunset breezes at Clifton beach are amazing. Hello!", createdAt: new Date(Date.now() - 1500000), status: "SENT" }
  ]
};

const mockRoomsMeta = {
  ai_companion: { recipientId: "ai_companion", fullName: "Aria (AI Romantic Companion)", phoneNumber: "AI Companion", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop", isOnline: true, isAI: true },
  mock_convo_1: { recipientId: "mock_discover_1", fullName: "Ayesha Khan", phoneNumber: "+92 300 1234567", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop", isOnline: true, isAI: false },
  mock_convo_2: { recipientId: "mock_discover_2", fullName: "Hamza Chaudhry", phoneNumber: "+92 301 2345678", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", isOnline: false, isAI: false },
  mock_convo_3: { recipientId: "mock_discover_3", fullName: "Fatima Zahra", phoneNumber: "+92 302 3456789", photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop", isOnline: true, isAI: false },
  mock_convo_4: { recipientId: "mock_discover_4", fullName: "Zainab Malik", phoneNumber: "+92 303 4567890", photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop", isOnline: true, isAI: false }
};

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
        phoneNumber: otherProfile?.phoneNumber || "+92 (300) 000-0000",
        photo: otherProfile?.user?.photos[0]?.url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80",
        isOnline: otherProfile?.user?.isOnline || false,
        isAI: false
      });
    }

    const mockList = Object.keys(mockRoomsMeta).map((convoId) => {
      const meta = mockRoomsMeta[convoId];
      const msgs = mockMessagesStore[convoId] || [];
      const lastMsg = msgs[msgs.length - 1];
      return {
        id: convoId,
        lastMessageText: lastMsg ? lastMsg.text : "Start your conversation.",
        lastMessageAt: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
        recipientId: meta.recipientId,
        fullName: meta.fullName,
        phoneNumber: meta.phoneNumber,
        photo: meta.photo,
        isOnline: meta.isOnline,
        isAI: meta.isAI || false
      };
    });

    // Combine real database conversations with mock candidate conversations
    const combinedConvos = [...detailedConv];
    for (const mockItem of mockList) {
      if (!combinedConvos.some(c => c.id === mockItem.id || c.recipientId === mockItem.recipientId)) {
        combinedConvos.push(mockItem);
      }
    }

    return { success: true, conversations: combinedConvos };
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

    if (conversationId.startsWith("mock_") || conversationId === "ai_companion" || conversationId.startsWith("ai_")) {
      const msgs = mockMessagesStore[conversationId] || [];
      return {
        success: true,
        messages: msgs.map(m => ({ ...m, senderId: m.senderId === "user_me" ? userId : m.senderId }))
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

    if (conversationId.startsWith("mock_") || conversationId === "ai_companion" || conversationId.startsWith("ai_")) {
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
      
      if (!mockMessagesStore[conversationId]) {
        mockMessagesStore[conversationId] = [];
      }
      mockMessagesStore[conversationId].push(msg);

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
 * Save AI generated response message
 */
export async function saveAiMessageAction({ conversationId, text }) {
  try {
    const msg = {
      id: `ai_${Date.now()}`,
      conversationId,
      senderId: "ai_companion",
      text,
      status: "DELIVERED",
      createdAt: new Date(),
      reactions: []
    };

    if (!mockMessagesStore[conversationId]) {
      mockMessagesStore[conversationId] = [];
    }
    mockMessagesStore[conversationId].push(msg);

    return { success: true, message: msg };
  } catch (error) {
    console.error("Save AI message action error:", error);
    return { success: false, error: "Failed to save AI message" };
  }
}

/**
 * Mark messages in conversation as READ
 */
export async function markMessagesReadAction(conversationId) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false };

    if (conversationId.startsWith("mock_") || conversationId === "ai_companion" || conversationId.startsWith("ai_")) return { success: true };

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
 * Call Groq AI to get conversation reply advice
 */
export async function getConversationSuggestionsAction(conversationId) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const msgsRes = await fetchMessages(conversationId);
    if (!msgsRes.success) return { success: false, error: "Could not load messages" };

    const messages = msgsRes.messages;
    
    // Map sender ID for Groq AI context
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

/**
 * Send SMS message to connected user
 */
export async function sendSmsAction({ conversationId, text, recipientPhone }) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const formattedSms = text.trim();
    if (!formattedSms) return { success: false, error: "Message text is required" };

    if (conversationId.startsWith("mock_")) {
      const msg = {
        id: `sms_${Date.now()}`,
        conversationId,
        senderId: userId,
        text: formattedSms,
        isSms: true,
        status: "DELIVERED",
        createdAt: new Date(),
        reactions: []
      };
      return { success: true, message: msg };
    }

    // Save SMS message to database
    const msg = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        text: formattedSms,
        isSms: true,
        status: "SENT"
      }
    });

    // Update conversation last message
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageText: `[SMS] ${formattedSms}`,
          lastMessageAt: new Date()
        }
      });
    } catch (cErr) {}

    console.log(`[SMS Gateway Dispatch] To ${recipientPhone || 'Recipient'}: "${formattedSms}"`);

    return { success: true, message: msg };
  } catch (error) {
    console.error("Send SMS action error:", error);
    return { success: false, error: "Failed to send SMS" };
  }
}
