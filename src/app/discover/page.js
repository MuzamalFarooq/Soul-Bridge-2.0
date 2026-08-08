"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Heart, Sparkles, Filter, SlidersHorizontal, RefreshCcw, 
  MapPin, Brain, HelpCircle, User, Star, Crown, LayoutGrid, Layers
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TinderCard from "@/components/swipe/TinderCard";
import UserFeedPost from "@/components/discover/UserFeedPost";
import QuickMessageModal from "@/components/discover/QuickMessageModal";
import CelebrationModal from "@/components/chat/CelebrationModal";
import { fetchDiscoverProfiles, submitSwipeAction, undoLastSwipeAction } from "@/actions/matching";
import { fetchDiscoverFeed } from "@/actions/feed";

export default function Discover() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("feed"); // "feed" (Instagram/FB style) or "swipe" (Tinder style)
  
  // Feed & Deck state
  const [feedPosts, setFeedPosts] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Direct Messaging modal state
  const [activeMessageCandidate, setActiveMessageCandidate] = useState(null);

  // Swipe Undo Memory (client side stack backup)
  const [historyStack, setHistoryStack] = useState([]);

  // Match Celebrations
  const [matchCelebration, setMatchCelebration] = useState(null);

  // Filters State
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    gender: "Everyone",
    city: "",
    relationshipGoal: "",
    religion: "",
    profession: "",
    ageMin: "18",
    ageMax: "35",
    sortBy: "Compatibility"
  });

  const loadData = async (currentFilters = filters, mode = viewMode) => {
    setLoading(true);
    setError("");
    try {
      if (mode === "feed") {
        const res = await fetchDiscoverFeed(currentFilters);
        if (res.success) {
          setFeedPosts(res.feed || []);
        } else {
          setError(res.error || "Failed to load discovery feed");
        }
      } else {
        const res = await fetchDiscoverProfiles(currentFilters);
        if (res.success) {
          setCandidates(res.deck || []);
        } else {
          setError(res.error || "Failed to load discovery deck");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred while loading discovery data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchInitial() {
      try {
        if (viewMode === "feed") {
          const res = await fetchDiscoverFeed(filters);
          if (isMounted) {
            if (res.success) setFeedPosts(res.feed || []);
            else setError(res.error || "Failed to load discovery feed");
          }
        } else {
          const res = await fetchDiscoverProfiles(filters);
          if (isMounted) {
            if (res.success) setCandidates(res.deck || []);
            else setError(res.error || "Failed to load discovery deck");
          }
        }
      } catch (err) {
        if (isMounted) setError("An unexpected error occurred while loading discovery data");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [viewMode]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setFiltersOpen(false);
    setHistoryStack([]);
    loadData(filters, viewMode);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      gender: "Everyone",
      city: "",
      relationshipGoal: "",
      religion: "",
      profession: "",
      ageMin: "18",
      ageMax: "35",
      sortBy: "Compatibility"
    };
    setFilters(defaultFilters);
    setFiltersOpen(false);
    setHistoryStack([]);
    loadData(defaultFilters, viewMode);
  };

  const handleSwipe = async (type) => {
    if (candidates.length === 0) return;
    
    const currentCandidate = candidates[0];
    
    // Backup swiped candidate into history stack for undo support
    setHistoryStack((prev) => [currentCandidate, ...prev]);

    // Submit swipe outcome to DB
    try {
      const res = await submitSwipeAction({ swipedId: currentCandidate.id, type });
      if (res.success && res.matched) {
        // Trigger Match Celebration Modal!
        setMatchCelebration(res.matchData);
      }
    } catch (err) {
      console.error("Failed to register swipe:", err);
    }

    // Remove candidate from current deck
    setCandidates((prev) => prev.slice(1));
  };

  const handleUndo = async () => {
    if (historyStack.length === 0) return;
    
    const lastCandidate = historyStack[0];

    try {
      const res = await undoLastSwipeAction();
      if (res.success) {
        // Prepend candidate back to deck top
        setCandidates((prev) => [lastCandidate, ...prev]);
        // Remove from history stack
        setHistoryStack((prev) => prev.slice(1));
      } else {
        alert(res.error || "Could not undo last swipe.");
      }
    } catch (err) {
      console.error("Undo swipe request failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-10 relative z-10 flex flex-col">
        {/* Title / Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              Discover Matches <Sparkles className="w-5 h-5 text-primary-pink" />
            </h1>
            <p className="text-xs text-foreground/60">Browse user profiles, images & direct messages</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher Toggle */}
            <div className="flex items-center p-1 rounded-2xl glass-card border border-white/10 bg-white/5">
              <button
                onClick={() => setViewMode("feed")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "feed"
                    ? "bg-gradient-premium text-white shadow-md"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Vertical Feed
              </button>
              <button
                onClick={() => setViewMode("swipe")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "swipe"
                    ? "bg-gradient-premium text-white shadow-md"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Swipe Cards
              </button>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel hover:border-primary-pink hover:text-primary-pink text-xs font-bold transition-all cursor-pointer"
            >
              <Filter className="w-4 h-4" /> Filters {filtersOpen ? "Open" : ""}
            </button>
          </div>
        </div>

        {/* Filters drawer panel */}
        {filtersOpen && (
          <form 
            onSubmit={handleApplyFilters}
            className="p-6 mb-8 rounded-2xl glass-card border border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">Interested In</label>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="px-3 py-2 rounded-lg glass-input text-xs bg-background"
              >
                <option value="Everyone">Everyone</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">Location/City</label>
              <input
                type="text"
                name="city"
                placeholder="e.g. Lahore, Karachi"
                value={filters.city}
                onChange={handleFilterChange}
                className="px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">Goal</label>
              <select
                name="relationshipGoal"
                value={filters.relationshipGoal}
                onChange={handleFilterChange}
                className="px-3 py-2 rounded-lg glass-input text-xs bg-background"
              >
                <option value="">Any goal</option>
                <option value="Long-term">Long-term Relation</option>
                <option value="Short-term">Short-term Relation</option>
                <option value="Marriage">Looking for marriage</option>
                <option value="Casual">Casual dating</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">Age Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="ageMin"
                  placeholder="Min"
                  value={filters.ageMin}
                  onChange={handleFilterChange}
                  className="w-1/2 px-3 py-2 rounded-lg glass-input text-xs"
                />
                <span className="text-xs">-</span>
                <input
                  type="number"
                  name="ageMax"
                  placeholder="Max"
                  value={filters.ageMax}
                  onChange={handleFilterChange}
                  className="w-1/2 px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-end gap-3 mt-2 border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg border border-white/10 text-xs font-semibold hover:bg-white/5 cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-premium text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </form>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary-pink border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-foreground/50 mt-3">Fetching discovery profiles...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center p-6 rounded-2xl bg-red-500/10 border border-red-500/20 max-w-sm">
              <p className="text-xs text-red-500 font-semibold">{error}</p>
              <button
                onClick={() => loadData(filters, viewMode)}
                className="mt-4 px-4 py-2 rounded-xl bg-white/5 text-xs border border-white/10 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* VERTICAL FEED VIEW (Facebook & Instagram Style) */}
        {!loading && !error && viewMode === "feed" && (
          <div className="flex-1 flex flex-col items-center py-4">
            {feedPosts.length > 0 ? (
              feedPosts.map((post) => (
                <UserFeedPost
                  key={post.id}
                  candidate={post}
                  onOpenMessage={(candidate) => setActiveMessageCandidate(candidate)}
                />
              ))
            ) : (
              <div className="text-center flex flex-col items-center max-w-sm glass-card p-8 rounded-3xl border border-white/5 my-12">
                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center text-primary-pink border border-pink-500/25 mb-4">
                  <RefreshCcw className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="font-extrabold text-base mb-1.5">No Profiles Found</h3>
                <p className="text-xs text-foreground/60 leading-normal mb-5">
                  We couldn&apos;t find feed posts matching your filters. Try resetting search filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-full bg-gradient-premium text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  Reset Search Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* SWIPE CARD DECK VIEW (Tinder Style) */}
        {!loading && !error && viewMode === "swipe" && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 min-h-[500px]">
            {candidates.length > 0 ? (
              <div className="w-full flex items-center justify-center">
                <TinderCard
                  candidate={candidates[0]}
                  onSwipe={handleSwipe}
                  onUndo={handleUndo}
                  canUndo={historyStack.length > 0}
                />
              </div>
            ) : (
              <div className="text-center flex flex-col items-center max-w-sm glass-card p-8 rounded-3xl border border-white/5">
                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center text-primary-pink border border-pink-500/25 mb-4">
                  <RefreshCcw className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="font-extrabold text-base mb-1.5">No More Profiles Around</h3>
                <p className="text-xs text-foreground/60 leading-normal mb-5">
                  We couldn&apos;t find matches matching your filters. Try widening your age range or checking other locations.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-full bg-gradient-premium text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  Reset Search Filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Direct Messaging Quick Modal */}
      {activeMessageCandidate && (
        <QuickMessageModal
          candidate={activeMessageCandidate}
          onClose={() => setActiveMessageCandidate(null)}
        />
      )}

      {/* Match Celebration Modal */}
      {matchCelebration && (
        <CelebrationModal
          matchData={matchCelebration}
          onClose={() => setMatchCelebration(null)}
          onChat={() => {
            setMatchCelebration(null);
            router.push("/chat");
          }}
        />
      )}
    </div>
  );
}

