"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, Heart, ShieldCheck, Sparkles, Users, 
  MapPin, Briefcase, ChevronDown, CheckCircle2, Lock, 
  Eye, MessageSquare, Quote, LifeBuoy, Compass, Star,
  Shield, Check, UserCheck, HeartHandshake
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─────────────────────────────────────────────────────────────
// DATA: How SoulBridge Works Steps
// ─────────────────────────────────────────────────────────────
const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    icon: Compass,
    title: "Create Your Profile",
    description: "Share your passions, worldview, and relationship goals with our guided, thoughtful onboarding.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Discover Compatible People",
    description: "Explore genuine, verified members matched on authentic lifestyle alignment, habits, and shared values.",
  },
  {
    step: "03",
    icon: HeartHandshake,
    title: "Build Meaningful Bonds",
    description: "Engage through real-time messaging, private voice and video calls, and form lasting relationships.",
  },
];

// ─────────────────────────────────────────────────────────────
// DATA: Featured Showcase Profiles (Curated Public Data)
// ─────────────────────────────────────────────────────────────
const FEATURED_PROFILES = [
  {
    id: "showcase-1",
    fullName: "Sophia Al-Zahra",
    age: 26,
    city: "San Francisco",
    country: "USA",
    profession: "Architect & UI Designer",
    goal: "Long-term Relationship",
    bio: "Designing minimalist spaces by day, gallery hopping and crafting pour-over coffee by sunset.",
    tags: ["Architecture", "Modern Art", "Coffee", "Pilates"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
    badge: "Verified Member"
  },
  {
    id: "showcase-2",
    fullName: "Hamza Tariq",
    age: 28,
    city: "Lahore",
    country: "Pakistan",
    profession: "AI Research Scientist",
    goal: "Marriage-Oriented",
    bio: "Training neural networks and hiking northern peaks. Fan of Sufi poetry, vinyl records, and deep discussions.",
    tags: ["Machine Learning", "Hiking", "Poetry", "Vinyl"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
    badge: "Active Today"
  },
  {
    id: "showcase-3",
    fullName: "Ayla Nicole",
    age: 24,
    city: "London",
    country: "UK",
    profession: "Violinist & Sound Designer",
    goal: "Long-term Partnership",
    bio: "Exploring acoustic frequencies and indie bookshops. Looking for a kind soul with curiosity for deep conversations.",
    tags: ["Violin", "Indie Books", "Tea Tasting", "Cinema"],
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop",
    badge: "Verified Member"
  },
  {
    id: "showcase-4",
    fullName: "Zayn Mirza",
    age: 29,
    city: "Dubai",
    country: "UAE",
    profession: "Product Strategist & Pilot",
    goal: "Serious Relationship",
    bio: "Weekend aviation enthusiast and culinary explorer. Passionate about technology, travel, and purposeful growth.",
    tags: ["Aviation", "Culinary", "Squash", "Travel"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop",
    badge: "Active Today"
  }
];

// ─────────────────────────────────────────────────────────────
// DATA: Why Choose SoulBridge Pillars
// ─────────────────────────────────────────────────────────────
const WHY_CHOOSE_ITEMS = [
  {
    icon: Heart,
    title: "Genuine Intentions",
    description: "A community designed for singles tired of endless swiping and seeking real, long-term commitment."
  },
  {
    icon: Sparkles,
    title: "Values-First Compatibility",
    description: "Discover connections rooted in shared ethics, emotional rhythm, lifestyle habits, and life vision."
  },
  {
    icon: Lock,
    title: "Granular Privacy Control",
    description: "Keep private photos locked until you grant permission. You maintain complete control over your identity."
  },
  {
    icon: MessageSquare,
    title: "Real-Time Communication",
    description: "Seamless instant chat, audio calls, and WebRTC video dates directly in-app when you're both ready."
  },
  {
    icon: ShieldCheck,
    title: "Verified Community",
    description: "Photo verification and active anti-scam monitoring to safeguard against bots, catfishing, and bad actors."
  },
  {
    icon: Users,
    title: "Zero Superficial Gimmicks",
    description: "No gamified paywalls blocking mutual matches. Honest, respectful dating with transparency at every step."
  }
];

// ─────────────────────────────────────────────────────────────
// DATA: Compatibility Dimensions
// ─────────────────────────────────────────────────────────────
const COMPATIBILITY_DIMENSIONS = [
  {
    title: "Core Values & Life Philosophy",
    description: "Find someone whose outlook on life, family values, and ethics naturally align with your own."
  },
  {
    title: "Communication & Emotional Rhythm",
    description: "Connect with people who share your conversational style, empathy, and listening habits."
  },
  {
    title: "Lifestyle & Daily Pace",
    description: "Match across shared hobbies, wellness routines, travel preferences, and daily priorities."
  },
  {
    title: "Long-Term Relationship Intentions",
    description: "Ensure clarity from day one: marriage, life partnership, or building a loving future together."
  }
];

// ─────────────────────────────────────────────────────────────
// DATA: Real Success Stories (From /stories)
// ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    names: "Samantha & Daniel",
    status: "Married",
    location: "New York & London",
    matchDate: "Matched October 2024",
    quote: "SoulBridge matched us across two continents based on shared life philosophy and travel aspirations. Today, we're happily married!",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"
  },
  {
    names: "Aarav & Maya",
    status: "Engaged",
    location: "Toronto, Canada",
    matchDate: "Matched January 2025",
    quote: "We were exhausted by superficial dating apps. SoulBridge introduced us through our love for acoustic music and philosophy.",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600"
  },
  {
    names: "Lucas & Chloe",
    status: "Married",
    location: "Paris, France",
    matchDate: "Matched March 2024",
    quote: "Our very first conversation lasted four hours. SoulBridge made it easy to connect deeply from the moment we said hello.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600"
  }
];

// ─────────────────────────────────────────────────────────────
// DATA: Safety & Privacy Pillars
// ─────────────────────────────────────────────────────────────
const SAFETY_PILLARS = [
  {
    icon: UserCheck,
    title: "Photo Verification",
    description: "Members undergo selfie verification to confirm identity and guarantee you connect with authentic humans."
  },
  {
    icon: Lock,
    title: "Private Photo Vaults",
    description: "Upload sensitive images to your private album and unlock them only for trusted matches on your terms."
  },
  {
    icon: Shield,
    title: "Anti-Harassment Shield",
    description: "Automated filters actively monitor message patterns to protect you from financial solicitations and abuse."
  },
  {
    icon: LifeBuoy,
    title: "1-Tap Block & Report",
    description: "Instant blocking and responsive human review within minutes ensures a safe, respectful environment."
  }
];

// ─────────────────────────────────────────────────────────────
// DATA: FAQ Items
// ─────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    question: "What makes SoulBridge different from other dating apps?",
    answer: "SoulBridge is built intentionally for genuine, long-term relationships rather than superficial swiping. We emphasize compatibility around core values, lifestyle rhythms, and authentic conversations, supported by private communication tools and a verified, respectful community."
  },
  {
    question: "How do I create an account and get started?",
    answer: "Creating an account takes less than two minutes. Click 'Join Free' or 'Get Started Free', enter your email or sign in with Google, complete our thoughtful profile setup with your hobbies, values, and photos, and you're ready to explore compatible connections."
  },
  {
    question: "How does compatibility matchmaking work?",
    answer: "Our matchmaking evaluates compatibility across lifestyle dimensions including shared interests, relationship intentions, conversation habits, and personal values. We avoid misleading 100% gimmicks and highlight genuine areas of common ground between profiles."
  },
  {
    question: "Is SoulBridge free to join and use?",
    answer: "Yes, SoulBridge is free to join. Every member can create a profile, discover compatible people, receive likes, and chat with mutual connections. Optional premium tiers offer additional features such as advanced discovery filters and priority matching."
  },
  {
    question: "Can I control who sees my profile and private photos?",
    answer: "Absolutely. Privacy is a foundational pillar of SoulBridge. You can keep your profile visible or incognito, manage your discovery visibility, and lock private gallery photos so they are only viewable when you explicitly grant access."
  },
  {
    question: "How can I report or block someone who behaves inappropriately?",
    answer: "You can block or report any profile with a single tap directly from their profile card or chat header. Our dedicated safety moderation squad reviews reported accounts promptly with zero tolerance for harassment or fraudulent behavior."
  },
  {
    question: "Can I pause or delete my account anytime?",
    answer: "Yes. In your Settings, you have complete control to pause your profile when you need a break, or permanently delete your account and all associated personal data instantly with no hidden retention."
  }
];

export default function Home() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className="welcome-page">
      <Navbar />

      <main>
        {/* ───────────────────────────────────────────────────
            1. HERO / WELCOME SECTION (Preserved Original)
           ─────────────────────────────────────────────────── */}
        <section className="welcome-hero" aria-labelledby="welcome-heading">
          <Image
            src="/688d777f-8e90-4d01-bc4a-d0445bff439b.png"
            alt="A couple sharing a romantic moment at sunset"
            fill
            priority
            sizes="100vw"
            className="welcome-hero-image"
          />
          <div className="welcome-hero-overlay" />

          <div className="welcome-hero-content">
            <div className="welcome-brand">
              <span className="welcome-brand-mark" aria-hidden="true">
                <Heart size={20} fill="currentColor" />
              </span>
              <span>SoulBridge</span>
            </div>

            <div className="welcome-copy">
              <p className="welcome-eyebrow">
                <Sparkles size={15} aria-hidden="true" />
                Where hearts connect
              </p>
              <h1 id="welcome-heading">
                Real People.
                <br />
                Meaningful <em>Connections.</em>
              </h1>
              <p className="welcome-description">
                Find your perfect match and build something beautiful together.
              </p>
              <div className="welcome-actions">
                <Link href="/register" className="welcome-primary-button">
                  Get Started Free
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/discover" className="welcome-secondary-button">
                  Explore connections
                </Link>
              </div>
            </div>
          </div>

          <div className="welcome-hero-note">
            <span className="welcome-note-line" />
            <span>Love starts with a hello</span>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────
            2. HOW SOULBRIDGE WORKS SECTION
           ─────────────────────────────────────────────────── */}
        <section className="welcome-section" id="how-it-works" aria-labelledby="how-it-works-heading">
          <div className="welcome-section-header text-center">
            <p className="welcome-section-kicker">
              <Compass size={14} aria-hidden="true" />
              How SoulBridge Works
            </p>
            <h2 id="how-it-works-heading">Connecting with intention in three simple steps.</h2>
            <p className="welcome-section-subtitle">
              We redesigned the dating journey to remove anxiety and replace endless superficial swiping with authentic, memorable experiences.
            </p>
          </div>

          <div className="welcome-steps-grid">
            {HOW_IT_WORKS_STEPS.map(({ step, icon: Icon, title, description }) => (
              <div className="welcome-step-card" key={step}>
                <div className="welcome-step-header">
                  <span className="welcome-step-number">{step}</span>
                  <span className="welcome-step-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────
            3. FEATURED PROFILES / DISCOVER MEMBERS
           ─────────────────────────────────────────────────── */}
        <section className="welcome-section welcome-section-alt" id="featured-members" aria-labelledby="featured-heading">
          <div className="welcome-section-header text-center">
            <p className="welcome-section-kicker">
              <Users size={14} aria-hidden="true" />
              Our Community
            </p>
            <h2 id="featured-heading">Thoughtful singles ready to connect.</h2>
            <p className="welcome-section-subtitle">
              Every day, inspiring people from all walks of life join SoulBridge to build genuine romance on their own terms.
            </p>
          </div>

          <div className="welcome-profiles-grid">
            {FEATURED_PROFILES.map((profile) => (
              <article className="welcome-profile-card" key={profile.id}>
                <div className="welcome-profile-photo-wrapper">
                  <Image
                    src={profile.image}
                    alt={profile.fullName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="welcome-profile-gradient" />
                  <span className="welcome-profile-badge">{profile.badge}</span>
                  <div className="welcome-profile-meta-over">
                    <h4>{profile.fullName}, {profile.age}</h4>
                  </div>
                </div>

                <div className="welcome-profile-body">
                  <div>
                    <div className="welcome-profile-detail">
                      <MapPin size={13} aria-hidden="true" />
                      <span>{profile.city}, {profile.country}</span>
                    </div>
                    <div className="welcome-profile-detail">
                      <Briefcase size={13} aria-hidden="true" />
                      <span>{profile.profession}</span>
                    </div>
                    <p className="welcome-profile-bio">{profile.bio}</p>
                    <div className="welcome-profile-tags">
                      {profile.tags.map((tag) => (
                        <span className="welcome-profile-tag" key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <Link href="/discover" className="welcome-profile-action">
                    Connect on Discover <ArrowRight size={14} className="ml-1" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/discover" className="welcome-primary-button inline-flex">
              Explore All Verified Connections <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────
            4. WHY CHOOSE SOULBRIDGE?
           ─────────────────────────────────────────────────── */}
        <section className="welcome-section" id="why-choose-us" aria-labelledby="why-heading">
          <div className="welcome-section-header text-center">
            <p className="welcome-section-kicker">
              <Sparkles size={14} aria-hidden="true" />
              The SoulBridge Difference
            </p>
            <h2 id="why-heading">Designed for depth, not superficial swipes.</h2>
            <p className="welcome-section-subtitle">
              We built SoulBridge around honesty, emotional safety, and values compatibility so you can focus on building something lasting.
            </p>
          </div>

          <div className="welcome-why-grid">
            {WHY_CHOOSE_ITEMS.map(({ icon: Icon, title, description }) => (
              <div className="welcome-why-card" key={title}>
                <span className="welcome-why-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────
            5. COMPATIBILITY & MATCHING (Preserving Existing Story)
           ─────────────────────────────────────────────────── */}
        <section className="welcome-story" id="features" aria-labelledby="story-heading">
          <div className="welcome-story-image">
            <Image
              src="/d8acf20c-56ab-4910-b74a-8968a68de0cb.png"
              alt="A couple embracing above a city at golden hour"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
          <div className="welcome-story-copy">
            <p className="welcome-section-kicker">Your story starts here</p>
            <h2 id="story-heading">Connection that feels like coming home.</h2>
            <p>
              SoulBridge brings thoughtful people together through shared
              interests, honest conversations, and compatibility that goes
              beyond a first impression.
            </p>
            <Link href="/register" className="welcome-text-link">
              Create your profile <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Compatibility Dimensions Deep-Dive */}
        <section className="welcome-section" aria-labelledby="compat-heading">
          <div className="welcome-compat-layout">
            <div>
              <p className="welcome-section-kicker">
                <Heart size={14} aria-hidden="true" />
                Compatibility Matching
              </p>
              <h2 id="compat-heading">Compatibility that honors what truly matters to you.</h2>
              <p className="welcome-section-subtitle">
                True romance isn’t just about looking great in photos. We help you discover harmony across four foundational aspects of human connection.
              </p>

              <div className="welcome-compat-list">
                {COMPATIBILITY_DIMENSIONS.map(({ title, description }) => (
                  <div className="welcome-compat-item" key={title}>
                    <span className="welcome-compat-check">
                      <Check size={14} aria-hidden="true" />
                    </span>
                    <div>
                      <h4>{title}</h4>
                      <p>{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="welcome-compat-preview-card">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(74,23,44,0.1)]">
                <div>
                  <span className="welcome-compat-pill-badge">
                    <Sparkles size={12} className="mr-1" aria-hidden="true" /> Alignment Harmony
                  </span>
                  <h3 className="text-xl font-bold mt-2 text-[var(--welcome-ink)]">Shared Life Outlook</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#f4e3e3] flex items-center justify-center text-[var(--welcome-wine)]">
                  <Heart size={22} fill="currentColor" />
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="p-3.5 rounded-xl bg-[#f8f4ef] border border-[rgba(74,23,44,0.08)]">
                  <p className="font-bold text-xs uppercase tracking-wider text-[var(--welcome-rose)] mb-1">Mutual Vision</p>
                  <p className="text-[var(--welcome-ink)] font-medium">Both seeking long-term partnership with a focus on family, travel, and personal growth.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8f4ef] border border-[rgba(74,23,44,0.08)]">
                  <p className="font-bold text-xs uppercase tracking-wider text-[var(--welcome-rose)] mb-1">Lifestyle Pace</p>
                  <p className="text-[var(--welcome-ink)] font-medium">Balanced daily rhythm: quiet evenings with good books, weekend adventures, and deep curiosity.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8f4ef] border border-[rgba(74,23,44,0.08)]">
                  <p className="font-bold text-xs uppercase tracking-wider text-[var(--welcome-rose)] mb-1">Conversational Style</p>
                  <p className="text-[var(--welcome-ink)] font-medium">Open, thoughtful communicators who value active listening and intellectual honesty.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(74,23,44,0.1)] flex items-center justify-between">
                <span className="text-xs text-[var(--welcome-muted)] font-medium">Clear intention from the start</span>
                <Link href="/register" className="text-xs font-bold text-[var(--welcome-wine)] hover:underline flex items-center gap-1">
                  Find Your Match <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────
            6. SUCCESS STORIES / TESTIMONIALS
           ─────────────────────────────────────────────────── */}
        <section className="welcome-section welcome-section-alt" id="stories" aria-labelledby="testimonials-heading">
          <div className="welcome-section-header text-center">
            <p className="welcome-section-kicker">
              <Quote size={14} aria-hidden="true" />
              Real Stories of True Love
            </p>
            <h2 id="testimonials-heading">From a first hello to forever.</h2>
            <p className="welcome-section-subtitle">
              Read how couples found companionship, romance, and life partnership through intentional dating on SoulBridge.
            </p>
          </div>

          <div className="welcome-testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <article className="welcome-testimonial-card" key={t.names}>
                <div className="welcome-testimonial-img-wrapper">
                  <Image
                    src={t.image}
                    alt={`Photo of couple ${t.names}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="welcome-testimonial-content">
                  <div>
                    <span className="welcome-testimonial-badge">{t.status}</span>
                    <p className="welcome-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <div className="welcome-testimonial-author">
                    <p className="welcome-testimonial-names">{t.names}</p>
                    <p className="welcome-testimonial-location">
                      <MapPin size={12} aria-hidden="true" />
                      <span>{t.location} • {t.matchDate}</span>
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/stories" className="welcome-secondary-button inline-flex text-[var(--welcome-wine)] border-[rgba(74,23,44,0.3)] hover:bg-[rgba(74,23,44,0.06)]">
              Read All Success Stories <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────
            7. SAFETY & PRIVACY SECTION
           ─────────────────────────────────────────────────── */}
        <section className="welcome-section" id="safety" aria-labelledby="safety-heading">
          <div className="welcome-section-header text-center">
            <p className="welcome-section-kicker">
              <ShieldCheck size={14} aria-hidden="true" />
              Your Peace of Mind First
            </p>
            <h2 id="safety-heading">Date with clarity, confidence, and peace of mind.</h2>
            <p className="welcome-section-subtitle">
              Your physical and emotional safety is our highest priority. We provide industry-standard safeguards so you can connect comfortably.
            </p>
          </div>

          <div className="welcome-safety-grid">
            {SAFETY_PILLARS.map(({ icon: Icon, title, description }) => (
              <div className="welcome-safety-card" key={title}>
                <span className="welcome-safety-icon">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/safety" className="welcome-text-link inline-flex">
              Learn more in our Safety Center <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────
            8. FREQUENTLY ASKED QUESTIONS (FAQ)
           ─────────────────────────────────────────────────── */}
        <section className="welcome-section welcome-section-alt" id="faq" aria-labelledby="faq-heading">
          <div className="welcome-section-header text-center">
            <p className="welcome-section-kicker">
              <Sparkles size={14} aria-hidden="true" />
              Frequently Asked Questions
            </p>
            <h2 id="faq-heading">Everything you need to know about SoulBridge.</h2>
            <p className="welcome-section-subtitle">
              Have questions? Here are honest, straightforward answers to help you begin your journey with confidence.
            </p>
          </div>

          <div className="welcome-faq-container">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  className={`welcome-faq-item ${isOpen ? "is-open" : ""}`} 
                  key={item.question}
                >
                  <button
                    type="button"
                    className="welcome-faq-trigger"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    id={`faq-question-${idx}`}
                  >
                    <span>{item.question}</span>
                    <ChevronDown size={19} className="welcome-faq-chevron" aria-hidden="true" />
                  </button>
                  {isOpen && (
                    <div 
                      className="welcome-faq-content"
                      id={`faq-answer-${idx}`}
                      role="region"
                      aria-labelledby={`faq-question-${idx}`}
                    >
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────
            9. FINAL CALL-TO-ACTION (CTA)
           ─────────────────────────────────────────────────── */}
        <section className="welcome-cta-wrap" id="join" aria-labelledby="cta-heading">
          <div className="welcome-cta-card">
            <p className="welcome-eyebrow justify-center mb-4 text-[#ffd9df]">
              <Heart size={15} fill="currentColor" aria-hidden="true" />
              Where true love begins
            </p>
            <h2 id="cta-heading">Your Story Starts With One Connection.</h2>
            <p>
              Leave behind endless swiping and superficial chats. Join an intentional community of singles who value genuine companionship and true romance.
            </p>

            <div className="welcome-cta-actions">
              <Link href="/register" className="welcome-cta-primary">
                Create Your Account Free
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/login" className="welcome-cta-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ───────────────────────────────────────────────────
          10. FOOTER (Preserved Original)
         ─────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
