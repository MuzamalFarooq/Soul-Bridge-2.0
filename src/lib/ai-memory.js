import { prisma } from "@/lib/prisma";

const toText = (value) => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

export async function getAiCompanionContext(userId) {
  if (!userId) {
    return {
      userName: "",
      memorySummary: "",
      preferredNickname: "",
      communicationStyle: "romantic",
      proactiveMessaging: true
    };
  }

  try {
    const [memory, preference, profile, user] = await Promise.all([
      prisma.aiCompanionMemory.findUnique({ where: { userId } }).catch(() => null),
      prisma.aiCompanionPreference.findUnique({ where: { userId } }).catch(() => null),
      prisma.profile.findUnique({ where: { userId } }).catch(() => null),
      prisma.user.findUnique({ where: { userId }, select: { name: true } }).catch(() => null)
    ]);

    const resolvedName = preference?.preferredNickname || profile?.fullName?.split(" ")[0] || user?.name?.split(" ")[0] || "";

    const profileBits = [];
    if (profile?.profession) profileBits.push(`Profession: ${profile.profession}`);
    if (profile?.hobbies && profile.hobbies.length > 0) profileBits.push(`Hobbies: ${profile.hobbies.join(", ")}`);
    if (profile?.city) profileBits.push(`City: ${profile.city}`);
    if (profile?.relationshipGoal) profileBits.push(`Goal: ${profile.relationshipGoal}`);

    let memorySummary = "";
    if (memory?.summary && memory.summary !== "Active conversation history") {
      memorySummary = memory.summary;
    }
    if (profileBits.length > 0) {
      memorySummary = memorySummary 
        ? `${memorySummary}\nProfile: ${profileBits.join(" | ")}`
        : `Profile: ${profileBits.join(" | ")}`;
    }

    return {
      userName: resolvedName,
      memorySummary,
      preferredNickname: resolvedName,
      communicationStyle: preference?.communicationStyle || "romantic",
      proactiveMessaging: preference?.proactiveMessaging ?? true
    };
  } catch (err) {
    console.warn("Error fetching AI companion context:", err.message);
    return {
      userName: "",
      memorySummary: "",
      preferredNickname: "",
      communicationStyle: "romantic",
      proactiveMessaging: true
    };
  }
}

export async function updateAiCompanionMemory(userId, messages = []) {
  if (!userId || !Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  try {
    const userTexts = messages
      .filter((m) => m.role === "user" || m.senderId === userId || m.senderId === "user_me")
      .map((m) => toText(m.content || m.text || ""))
      .filter((t) => t.length > 3);

    if (userTexts.length === 0) return null;

    // Extract significant statements (preferences, feelings, hobbies, facts)
    const significantPoints = userTexts.filter((t) => {
      const lower = t.toLowerCase();
      return (
        lower.includes("i love") ||
        lower.includes("my favorite") ||
        lower.includes("i like") ||
        lower.includes("i am") ||
        lower.includes("i'm") ||
        lower.includes("i work") ||
        lower.includes("i feel") ||
        lower.includes("my name is") ||
        lower.includes("remember")
      );
    });

    const recentPoints = significantPoints.length > 0 ? significantPoints.slice(-5) : userTexts.slice(-3);
    const summary = recentPoints.join(" | ");

    const existing = await prisma.aiCompanionMemory.findUnique({ where: { userId } }).catch(() => null);
    const existingMemories = Array.isArray(existing?.memories) ? existing.memories : [];

    // Filter out JSON-serialized message strings when building textual memory points
    const textMemories = existingMemories.filter((m) => !m.startsWith("{"));
    const combinedMemories = Array.from(new Set([...recentPoints, ...textMemories])).slice(0, 10);

    return await prisma.aiCompanionMemory.upsert({
      where: { userId },
      update: {
        summary: summary || existing?.summary || "Active conversation history",
        memories: combinedMemories,
        lastUpdated: new Date()
      },
      create: {
        userId,
        summary: summary || "Active conversation history",
        memories: combinedMemories
      }
    });
  } catch (err) {
    console.warn("Failed to update AI companion memory:", err.message);
    return null;
  }
}
