"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const benefits = [
  {
    icon: Heart,
    title: "Find Your Match",
    description: "Discover genuine people who share your values and vision.",
  },
  {
    icon: Users,
    title: "Build Connections",
    description: "Start meaningful conversations and create something special.",
  },
  {
    icon: ShieldCheck,
    title: "Feel Safe & Seen",
    description: "Connect with confidence in a respectful, verified community.",
  },
];

export default function Home() {
  return (
    <div className="welcome-page">
      <Navbar />

      <main>
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

        <section className="welcome-benefits" id="how-it-works" aria-label="Why SoulBridge">
          <div className="welcome-section-heading">
            <p className="welcome-section-kicker">A better way to connect</p>
            <h2>Make room for something real.</h2>
          </div>

          <div className="welcome-benefit-grid">
            {benefits.map(({ icon: Icon, title, description }) => (
              <article className="welcome-benefit" key={title}>
                <span className="welcome-benefit-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="welcome-story" id="features">
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
            <h2>Connection that feels like coming home.</h2>
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
      </main>

      <Footer />
    </div>
  );
}
