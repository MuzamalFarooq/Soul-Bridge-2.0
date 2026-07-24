const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log("Testing MongoDB database connection...");
  
  const email = "testuser@soulbridge.love";
  const plainPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 1. Check if user exists
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    console.log("User testuser@soulbridge.love already exists with ID:", user.id);
  } else {
    // 2. Create User and attached Profile
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: "USER",
        status: "ACTIVE",
        profile: {
          create: {
            fullName: "Alex Morgan",
            username: "alexmorgan",
            gender: "Female",
            interestedIn: "Male",
            dob: new Date("1998-05-15"),
            age: 28,
            height: 172,
            profession: "Architect & Interior Designer",
            education: "Master's in Architecture",
            country: "United States",
            city: "San Francisco",
            relationshipGoal: "Long-term",
            bio: "Passionate about modern architecture, coffee roasting, and weekend gallery walks. Looking for a genuine connection.",
            hobbies: ["Architecture", "Coffee", "Photography", "Art Galleries"],
            languages: ["English", "French"],
            completed: true,
            premiumStatus: "GOLD"
          }
        },
        photos: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop",
              publicId: "seed_photo_1",
              isProfile: true
            },
            {
              url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop",
              publicId: "seed_photo_2",
              isProfile: false
            }
          ]
        }
      },
      include: {
        profile: true
      }
    });

    console.log("✅ Successfully created user:", user.email, "| Profile Name:", user.profile?.fullName, "| ID:", user.id);
  }
}

main()
  .catch((e) => {
    console.error("❌ Database connection error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
