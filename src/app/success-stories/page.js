"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Sparkles, Star, MapPin, Calendar, Quote, 
  ArrowRight, Share2, Filter, PlusCircle, CheckCircle, 
  X, Upload, HeartHandshake, Award, Flame, MessageCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SuccessStoriesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedStory, setSelectedStory] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    coupleNames: "",
    matchYear: "2025",
    location: "",
    category: "Married",
    quote: "",
    storyText: ""
  });

  const categories = [
    { id: "all", label: "All Stories" },
    { id: "married", label: "Married Couples" },
    { id: "engaged", label: "Engaged" },
    { id: "ai-match", label: "99%+ SoulMatch" },
    { id: "long-distance", label: "Long Distance Love" }
  ];

  const featuredStory = {
    names: "Samantha & Daniel",
    category: "married",
    categoryLabel: "Married • 2 Years Together",
    location: "New York, USA & London, UK",
    matchDate: "October 2024",
    compatibility: "99.4% SoulMatch",
    quote: "Soul Bridge's Gemini AI predicted our values would align before we even exchanged our first message. We're now happily married!",
    story: "Samantha was working in Manhattan while Daniel lived in London. Conventional dating apps filter out long distance, but Soul Bridge matched us based on our shared vision for cognitive psychology and international travel. Our 3D lounge date lasted 4 hours! 6 months later, Daniel proposed under the Eiffel Tower.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
    timeline: [
      { step: "Matched on Soul Bridge", date: "Oct 2024" },
      { step: "First 3D Date Night", date: "Nov 2024" },
      { step: "Met in Paris", date: "Apr 2025" },
      { step: "Tied the Knot", date: "Jun 2026" }
    ]
  };

  const stories = [
    {
      id: 1,
      names: "Aarav & Maya",
      category: "engaged",
      categoryLabel: "Engaged",
      location: "Toronto, Canada",
      matchDate: "January 2025",
      compatibility: "98.9% SoulMatch",
      quote: "We were both tired of superficial swiping. Soul Bridge introduced us through shared love for acoustic music and philosophy.",
      story: "Aarav and Maya connected after Soul Bridge highlighted their identical scores in creative expression and life philosophy. After 10 months of dating, they got engaged during a romantic trip to Banff National Park.",
      image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 2,
      names: "Lucas & Chloe",
      category: "married",
      categoryLabel: "Married",
      location: "Paris, France",
      matchDate: "March 2024",
      compatibility: "99.1% SoulMatch",
      quote: "The 3D Virtual Lounge made our first date feel like an intimate art gallery walk in Kyoto. We connected instantly.",
      story: "Lucas was an architect and Chloe a digital designer. Soul Bridge matched them based on aesthetic values and lifestyle rhythm. They tied the knot in Provence in early 2026.",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 3,
      names: "Tariq & Zara",
      category: "ai-match",
      categoryLabel: "99%+ SoulMatch",
      location: "Dubai, UAE",
      matchDate: "August 2025",
      compatibility: "99.8% SoulMatch",
      quote: "Soul Bridge's compatibility score was 99.8%. We laughed when we saw it, but after 5 minutes of talking, we realized the AI was 100% right.",
      story: "Tariq and Zara shared deep interests in sustainable tech and culinary arts. From their very first chat, conversation flowed effortlessly. They recently bought their first home together.",
      image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 4,
      names: "Ethan & Grace",
      category: "long-distance",
      categoryLabel: "Long Distance Love",
      location: "Sydney & San Francisco",
      matchDate: "February 2025",
      compatibility: "97.6% SoulMatch",
      quote: "12,000 miles couldn't keep us apart. Soul Bridge's encrypted video dates kept our relationship vibrant until we moved in together.",
      story: "Despite living on opposite sides of the globe, Ethan and Grace built a deep bond using Soul Bridge's synchronized date rooms. Grace relocated to Sydney in 2026.",
      image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 5,
      names: "Julian & Mateo",
      category: "married",
      categoryLabel: "Married",
      location: "Barcelona, Spain",
      matchDate: "May 2024",
      compatibility: "98.7% SoulMatch",
      quote: "Soul Bridge provided an inclusive, safe, and truly intelligent space where we could be our genuine selves.",
      story: "Julian and Mateo bonded over photography and trail running. After two years of adventures, they got married surrounded by family and close friends in Spain.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 6,
      names: "Sophia & Liam",
      category: "engaged",
      categoryLabel: "Engaged",
      location: "Melbourne, Australia",
      matchDate: "November 2024",
      compatibility: "99.3% SoulMatch",
      quote: "Soul Bridge felt completely different from any other app. The deep AI icebreakers sparked the best conversation of my life.",
      story: "Sophia and Liam were matched during Soul Bridge's AI Autumn Spark festival. Within three months they were inseparable, and Liam proposed during a sunrise hot air balloon flight.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600"
    }
  ];

  const filteredStories = stories.filter((s) => {
    if (activeCategory === "all") return true;
    return s.category === activeCategory;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsSubmitModalOpen(false);
      setFormData({
        coupleNames: "",
        matchYear: "2025",
        location: "",
        category: "Married",
        quote: "",
        storyText: ""
      });
    }, 2000);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#09090B] text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-lux border border-[#FF4D8D]/30 mb-8"
        >
          <Heart className="w-4 h-4 text-[#FF4D8D] fill-[#FF4D8D]" />
          <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">
            Soul Bridge Success Stories
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6 max-w-4xl mx-auto"
        >
          Real Souls. True Connections.{" "}
          <span className="text-gradient-lux">Endless Love.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-10 font-medium"
        >
          Discover how thousands of couples bypassed superficial swiping and found their forever soulmate through Gemini AI matchmaking and 3D date experiences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-[#FF4D8D]/25 flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Share Your Love Story</span>
          </button>
        </motion.div>
      </section>

      {/* Featured Story Spotlight */}
      <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="glass-card-lux rounded-3xl overflow-hidden border border-white/15 grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
          <div className="lg:col-span-6 h-80 lg:h-auto relative bg-white/5">
            <img
              src={featuredStory.image}
              alt={featuredStory.names}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-[#09090B]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold text-[#FF4D8D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{featuredStory.compatibility}</span>
            </div>
          </div>

          <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#9C6BFF] mb-2 block">
                Featured Love Story
              </span>
              <h2 className="text-3xl font-black text-white mb-2">{featuredStory.names}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 mb-6 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF4D8D]" /> {featuredStory.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#9C6BFF]" /> {featuredStory.matchDate}
                </span>
              </div>

              <blockquote className="glass-panel-lux p-5 rounded-2xl border-l-4 border-[#FF4D8D] text-sm text-white/90 italic mb-6 leading-relaxed">
                "{featuredStory.quote}"
              </blockquote>

              <p className="text-xs text-white/70 leading-relaxed mb-6 font-medium">
                {featuredStory.story}
              </p>
            </div>

            {/* Timeline */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {featuredStory.timeline.map((item, idx) => (
                <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] font-bold text-[#FF4D8D] block mb-1">{item.date}</span>
                  <span className="text-[11px] font-semibold text-white leading-tight block">{item.step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story Filter & Grid */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Category Pills */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white shadow-md shadow-[#FF4D8D]/20 scale-105"
                  : "glass-panel-lux text-white/60 hover:text-white border border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStories.map((story) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card-lux rounded-3xl overflow-hidden border border-white/10 hover:border-[#FF4D8D]/40 flex flex-col justify-between group"
            >
              <div>
                <div className="h-56 relative overflow-hidden bg-white/5">
                  <img
                    src={story.image}
                    alt={story.names}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-[#09090B]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-[#FF4D8D]">
                    {story.compatibility}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-[#09090B]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-white">
                    {story.categoryLabel}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#FF4D8D] transition-colors">
                    {story.names}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-white/50 mb-4 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF4D8D]" /> {story.location}
                    </span>
                  </div>

                  <p className="text-xs text-white/80 italic mb-4 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
                    "{story.quote}"
                  </p>

                  <p className="text-xs text-white/60 leading-relaxed line-clamp-3">
                    {story.story}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedStory(story)}
                  className="w-full py-2.5 rounded-xl glass-panel-lux border border-white/15 text-xs text-white font-semibold hover:border-[#FF4D8D] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Read Full Story</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF4D8D]" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full mb-12">
        <div className="glass-card-lux rounded-3xl p-8 border border-white/15 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF]">
              12,400+
            </h4>
            <p className="text-xs text-white/60 mt-1 font-semibold">Marriages & Weddings</p>
          </div>
          <div>
            <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#9C6BFF] to-pink-400">
              18,500+
            </h4>
            <p className="text-xs text-white/60 mt-1 font-semibold">Engagements Sparked</p>
          </div>
          <div>
            <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-400">
              99.1%
            </h4>
            <p className="text-xs text-white/60 mt-1 font-semibold">Long-Term Satisfaction</p>
          </div>
          <div>
            <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#FF4D8D]">
              120+
            </h4>
            <p className="text-xs text-white/60 mt-1 font-semibold">Countries Connected</p>
          </div>
        </div>
      </section>

      {/* Read Story Modal */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card-lux rounded-3xl max-w-xl w-full p-6 md:p-8 border border-white/20 relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 p-2 rounded-full glass-panel-lux text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-48 rounded-2xl overflow-hidden mb-6 bg-white/5">
                <img src={selectedStory.image} alt={selectedStory.names} className="w-full h-full object-cover" />
              </div>

              <span className="text-xs font-bold text-[#FF4D8D] uppercase tracking-widest block mb-1">
                {selectedStory.compatibility}
              </span>
              <h3 className="text-2xl font-black text-white mb-2">{selectedStory.names}</h3>
              <p className="text-xs text-white/50 mb-4">{selectedStory.location} • Matched {selectedStory.matchDate}</p>

              <blockquote className="p-4 rounded-xl bg-white/5 text-xs text-white/90 italic mb-4 border-l-2 border-[#9C6BFF]">
                "{selectedStory.quote}"
              </blockquote>

              <p className="text-xs text-white/70 leading-relaxed mb-6">
                {selectedStory.story}
              </p>

              <button
                onClick={() => setSelectedStory(null)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white font-bold text-xs cursor-pointer"
              >
                Close Story
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Your Story Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card-lux rounded-3xl max-w-lg w-full p-6 md:p-8 border border-white/20 relative"
            >
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full glass-panel-lux text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                <Heart className="w-6 h-6 text-[#FF4D8D] fill-[#FF4D8D]" /> Share Your Love Story
              </h3>
              <p className="text-xs text-white/60 mb-6">
                Did you meet your partner on Soul Bridge? We'd love to celebrate your journey!
              </p>

              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white mb-1">Story Submitted!</h4>
                  <p className="text-xs text-white/60">Thank you for sharing your love story with the Soul Bridge community.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-white/80 block mb-1 uppercase">Couple Names</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex & Jordan"
                      value={formData.coupleNames}
                      onChange={(e) => setFormData({ ...formData, coupleNames: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl glass-input-lux text-xs text-white placeholder-white/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-white/80 block mb-1 uppercase">Year Matched</label>
                      <input
                        type="text"
                        required
                        placeholder="2025"
                        value={formData.matchYear}
                        onChange={(e) => setFormData({ ...formData, matchYear: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl glass-input-lux text-xs text-white placeholder-white/40"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/80 block mb-1 uppercase">Status</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl glass-input-lux text-xs text-white bg-[#09090B]"
                      >
                        <option value="Married">Married</option>
                        <option value="Engaged">Engaged</option>
                        <option value="Dating">Dating</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/80 block mb-1 uppercase">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl glass-input-lux text-xs text-white placeholder-white/40"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/80 block mb-1 uppercase">Love Quote / Advice</label>
                    <input
                      type="text"
                      required
                      placeholder="One line about your love story"
                      value={formData.quote}
                      onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl glass-input-lux text-xs text-white placeholder-white/40"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/80 block mb-1 uppercase">Full Story</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tell us how you met on Soul Bridge..."
                      value={formData.storyText}
                      onChange={(e) => setFormData({ ...formData, storyText: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl glass-input-lux text-xs text-white placeholder-white/40"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white font-bold text-xs cursor-pointer shadow-lg hover:opacity-90"
                  >
                    Submit Love Story
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
