import { prisma } from "@/lib/prisma";

const toText = (value) => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

export async function getAiCompanionContext(userId) {
  if (!userId) {
    return {
      memorySummary: "",
      preferredNickname: "sweetheart",
      communicationStyle: "romantic",
      proactiveMessaging: true
    };
  }

  const [memory, preference] = await Promise.all([
    prisma.aiCompanionMemory.findUnique({ where: { userId } }),
    prisma.aiCompanionPreference.findUnique({ where: { userId } })
  ]);

  return {
    memorySummary: memory?.summary || "",
    preferredNickname: preference?.preferredNickname || "sweetheart",
    communicationStyle: preference?.communicationStyle || "romantic",
    proactiveMessaging: preference?.proactiveMessaging ?? true
  };
}

export async function updateAiCompanionMemory(userId, messages = []) {
  if (!userId || !Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  const latestEntries = messages
    .map((message) => toText(message?.content || message?.text || ""))
    .filter(Boolean)
    .slice(-6);

  if (latestEntries.length === 0) {
    return null;
  }

  const summary = latestEntries.join(" | ");
  const uniqueMemories = Array.from(new Set([summary, ...(latestEntries || [])]));

  return prisma.aiCompanionMemory.upsert({
    where: { userId },
    update: {
      summary,
      memories: uniqueMemories.slice(0, 10),
      lastUpdated: new Date()
    },
    create: {
      userId,
      summary,
      memories: uniqueMemories.slice(0, 10)
    }
  });
}
