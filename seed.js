const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const PAKISTANI_USERS = [
  // --- 10 FEMALES ---
  {
    email: "ayesha.khan@soulbridge.pk",
    fullName: "Ayesha Khan",
    username: "ayeshakhan_lh",
    gender: "Female",
    interestedIn: "Male",
    age: 25,
    city: "Lahore",
    country: "Pakistan",
    profession: "Fashion Designer & Stylist",
    education: "Bachelors in Fashion Design (NCA)",
    relationshipGoal: "Long-term",
    bio: "Designing contemporary ethnic wear by day, exploring Lahore's culinary scenes by night. Looking for a respectful partner.",
    hobbies: ["Fashion Design", "Culinary Arts", "Coffee", "Museums"],
    phoneNumber: "+92 300 4567891",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "fatima.zahra@soulbridge.pk",
    fullName: "Fatima Zahra",
    username: "fatima_isb",
    gender: "Female",
    interestedIn: "Male",
    age: 26,
    city: "Islamabad",
    country: "Pakistan",
    profession: "Software Engineer",
    education: "BS Computer Science (NUST)",
    relationshipGoal: "Marriage",
    bio: "Building cloud architecture and hiking the Margalla Hills on weekends. Chai lover and book nerd.",
    hobbies: ["Cloud Computing", "Hiking", "Chai", "Reading"],
    phoneNumber: "+92 312 9876543",
    photos: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "zainab.malik@soulbridge.pk",
    fullName: "Zainab Malik",
    username: "zainab_khi",
    gender: "Female",
    interestedIn: "Male",
    age: 24,
    city: "Karachi",
    country: "Pakistan",
    profession: "Clinical Psychologist",
    education: "MS Clinical Psychology (Aga Khan University)",
    relationshipGoal: "Long-term",
    bio: "Passionate about mental wellness, ocean breeze at Clifton Beach, and classic Urdu literature.",
    hobbies: ["Psychology", "Poetry", "Beach Walks", "Writing"],
    phoneNumber: "+92 333 1122334",
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "mahnoor.rizvi@soulbridge.pk",
    fullName: "Mahnoor Rizvi",
    username: "mahnoor_pindi",
    gender: "Female",
    interestedIn: "Male",
    age: 27,
    city: "Rawalpindi",
    country: "Pakistan",
    profession: "Financial Analyst",
    education: "MBA Finance (LUMS)",
    relationshipGoal: "Marriage",
    bio: "Analyzing market trends and practicing classical calligraphy. Believer in deep conversations over karak chai.",
    hobbies: ["Finance", "Calligraphy", "Karak Chai", "History"],
    phoneNumber: "+92 345 5566778",
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "anum.siddiqui@soulbridge.pk",
    fullName: "Anum Siddiqui",
    username: "anum_pew",
    gender: "Female",
    interestedIn: "Male",
    age: 23,
    city: "Peshawar",
    country: "Pakistan",
    profession: "Medical Researcher",
    education: "PharmD (Khyber Medical University)",
    relationshipGoal: "Long-term",
    bio: "Dedicating my days to bio-medical research and my evenings to painting and photography.",
    hobbies: ["Medical Science", "Painting", "Photography", "Gardening"],
    phoneNumber: "+92 301 9988776",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "hira.tariq@soulbridge.pk",
    fullName: "Hira Tariq",
    username: "hiratariq_lh",
    gender: "Female",
    interestedIn: "Male",
    age: 28,
    city: "Lahore",
    country: "Pakistan",
    profession: "Interior Architect",
    education: "B.Arch (University of the Punjab)",
    relationshipGoal: "Marriage",
    bio: "Creating aesthetic living spaces with traditional Mughal & modern influences. Family oriented and love traveling.",
    hobbies: ["Architecture", "Travel", "Mughal Art", "Interior Design"],
    phoneNumber: "+92 321 4433221",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "maryam.ali@soulbridge.pk",
    fullName: "Maryam Ali",
    username: "maryam_ux",
    gender: "Female",
    interestedIn: "Male",
    age: 25,
    city: "Islamabad",
    country: "Pakistan",
    profession: "UI/UX Product Designer",
    education: "BS Design (COMSATS Islamabad)",
    relationshipGoal: "Long-term",
    bio: "Designing intuitive digital experiences. Adventurous soul who loves road trips to Hunza Valley and Skardu.",
    hobbies: ["UI/UX Design", "Road Trips", "Trekking", "Music"],
    phoneNumber: "+92 313 7788990",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "saba.ahmed@soulbridge.pk",
    fullName: "Saba Ahmed",
    username: "saba_fsd",
    gender: "Female",
    interestedIn: "Male",
    age: 26,
    city: "Faisalabad",
    country: "Pakistan",
    profession: "Senior Textile Developer",
    education: "BS Textile Engineering (NTU Faisalabad)",
    relationshipGoal: "Marriage",
    bio: "Passionate about sustainable fabrics and Pakistani handicraft heritage. Enjoys gardening and baking treats.",
    hobbies: ["Textile Art", "Handicrafts", "Baking", "Gardening"],
    phoneNumber: "+92 341 6655443",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "noor.ulain@soulbridge.pk",
    fullName: "Noor Ul Ain",
    username: "noor_multan",
    gender: "Female",
    interestedIn: "Male",
    age: 24,
    city: "Multan",
    country: "Pakistan",
    profession: "Content Producer & Journalist",
    education: "BS Mass Communication (BZU Multan)",
    relationshipGoal: "Long-term",
    bio: "Telling stories that matter. Coffee enthusiast, poet at heart, and avid traveler across Northern Pakistan.",
    hobbies: ["Journalism", "Sufi Poetry", "Travel Photography", "Coffee"],
    phoneNumber: "+92 302 3344556",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "aamna.bilal@soulbridge.pk",
    fullName: "Aamna Bilal",
    username: "aamna_quetta",
    gender: "Female",
    interestedIn: "Male",
    age: 27,
    city: "Quetta",
    country: "Pakistan",
    profession: "Education Consultant & Lecturer",
    education: "MA English Literature (University of Balochistan)",
    relationshipGoal: "Marriage",
    bio: "Empowering young minds. Passionate about literature, traditional teas, and peaceful weekend getaways.",
    hobbies: ["Literature", "Teaching", "Karak Tea", "Nature"],
    phoneNumber: "+92 331 8877665",
    photos: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop"
    ]
  },

  // --- 5 MALES ---
  {
    email: "hamza.chaudhry@soulbridge.pk",
    fullName: "Hamza Chaudhry",
    username: "hamza_lh",
    gender: "Male",
    interestedIn: "Female",
    age: 28,
    city: "Lahore",
    country: "Pakistan",
    profession: "Tech Entrepreneur & Founder",
    education: "BS Computer Science (FAST-NUCES)",
    relationshipGoal: "Marriage",
    bio: "Building startups and playing squash on weekends. Big fan of Sufi music, street food in Old Anarkali, and travel.",
    hobbies: ["Startups", "Squash", "Sufi Music", "Foodie Trips"],
    phoneNumber: "+92 300 1112233",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "bilal.abbasi@soulbridge.pk",
    fullName: "Bilal Abbasi",
    username: "bilal_isb",
    gender: "Male",
    interestedIn: "Female",
    age: 27,
    city: "Islamabad",
    country: "Pakistan",
    profession: "Civil Servant & Policy Researcher",
    education: "MS Public Policy (QAU Islamabad)",
    relationshipGoal: "Long-term",
    bio: "Working on public policy initiatives. Enjoys trekking in Naran & Kaghan, playing acoustic guitar, and reading history.",
    hobbies: ["Public Policy", "Trekking", "Guitar", "History Books"],
    phoneNumber: "+92 312 4445566",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "usman.farooq@soulbridge.pk",
    fullName: "Usman Farooq",
    username: "usman_khi",
    gender: "Male",
    interestedIn: "Female",
    age: 29,
    city: "Karachi",
    country: "Pakistan",
    profession: "Investment Banker",
    education: "BS Economics & Finance (IBA Karachi)",
    relationshipGoal: "Marriage",
    bio: "Finance strategist by day, foodie by night. Looking for someone genuine to share life's adventures with.",
    hobbies: ["Investment", "Food Tasting", "Fitness", "Cricket"],
    phoneNumber: "+92 333 7778899",
    photos: [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "daniyal.khan@soulbridge.pk",
    fullName: "Daniyal Khan",
    username: "daniyal_pew",
    gender: "Male",
    interestedIn: "Female",
    age: 26,
    city: "Peshawar",
    country: "Pakistan",
    profession: "Mechanical Engineer",
    education: "BS Mechanical Engineering (UET Peshawar)",
    relationshipGoal: "Long-term",
    bio: "Designing industrial machinery. Passionate about off-road driving, football, and traditional Pashtun hospitality.",
    hobbies: ["Engineering", "Off-roading", "Football", "Barbecue"],
    phoneNumber: "+92 345 2233445",
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop"
    ]
  },
  {
    email: "shahmeer.shah@soulbridge.pk",
    fullName: "Shahmeer Shah",
    username: "shahmeer_pindi",
    gender: "Male",
    interestedIn: "Female",
    age: 30,
    city: "Rawalpindi",
    country: "Pakistan",
    profession: "Orthopedic Surgeon",
    education: "MBBS, FCPS Orthopedics (RMU Rawalpindi)",
    relationshipGoal: "Marriage",
    bio: "Dedicated doctor with a love for outdoor photography, mountain climbing, and family values.",
    hobbies: ["Medicine", "Photography", "Mountaineering", "Badminton"],
    phoneNumber: "+92 301 6677889",
    photos: [
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop"
    ]
  }
];

async function main() {
  console.log("🇵🇰 Seeding 15 Pakistani Profiles (10 Females, 5 Males with 5 images each)...");
  
  const plainPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  for (const u of PAKISTANI_USERS) {
    let user = await prisma.user.findUnique({
      where: { email: u.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: u.email,
          passwordHash: hashedPassword,
          role: "USER",
          status: "ACTIVE",
          profile: {
            create: {
              fullName: u.fullName,
              username: u.username,
              gender: u.gender,
              interestedIn: u.interestedIn,
              age: u.age,
              city: u.city,
              country: u.country,
              profession: u.profession,
              education: u.education,
              relationshipGoal: u.relationshipGoal,
              bio: u.bio,
              hobbies: u.hobbies,
              phoneNumber: u.phoneNumber,
              completed: true,
              premiumStatus: "GOLD"
            }
          },
          photos: {
            create: u.photos.map((url, idx) => ({
              url,
              publicId: `pk_seed_${u.username}_${idx + 1}`,
              isProfile: idx === 0
            }))
          }
        }
      });
      console.log(`✅ Seeded ${u.gender}: ${u.fullName} (${u.city}) with 5 photos!`);
    } else {
      console.log(`ℹ User ${u.email} already exists.`);
    }
  }

  // --- SEED ADMIN ACCOUNT ---
  const adminEmail = "admin@soulbridge.pk";
  const adminPassword = "Admin123!";
  const adminHashedPassword = await bcrypt.hash(adminPassword, 10);

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminHashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
        profile: {
          create: {
            fullName: "Soul Bridge Administrator",
            username: "admin",
            gender: "Male",
            interestedIn: "Everyone",
            age: 30,
            city: "Lahore",
            country: "Pakistan",
            profession: "System Administrator",
            education: "BS Computer Science",
            relationshipGoal: "Marriage",
            bio: "Official Administrator of Soul Bridge Platform.",
            hobbies: ["Administration", "Security", "Analytics"],
            phoneNumber: "+92 300 0000000",
            completed: true,
            premiumStatus: "PLATINUM"
          }
        },
        photos: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
              publicId: "pk_seed_admin_1",
              isProfile: true
            }
          ]
        }
      }
    });
    console.log("👑 Seeded Admin Account: admin@soulbridge.pk / Admin123!");
  } else {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { role: "ADMIN", passwordHash: adminHashedPassword }
    });
    console.log("👑 Admin Account synchronized: admin@soulbridge.pk / Admin123!");
  }

  console.log("🎉 Successfully completed Pakistani profiles & Admin seeding!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
