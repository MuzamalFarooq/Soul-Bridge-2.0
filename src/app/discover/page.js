"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Heart, Sparkles, Filter, SlidersHorizontal, RefreshCcw, 
  MapPin, Brain, HelpCircle, User, Star, Crown 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TinderCard from "@/components/swipe/TinderCard";
import CelebrationModal from "@/components/chat/CelebrationModal";
import { fetchDiscoverProfiles, submitSwipeAction, undoLastSwipeAction } from "@/actions/matching";

export default function Discover() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
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

  const loadCandidates = async (currentFilters) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchDiscoverProfiles(currentFilters);
      if (res.success) {
        setCandidates(res.deck || []);
      } else {
        setError(res.error || "Failed to load discovery deck");
      }
    } catch (err) {
      setError("An unexpected error occurred while loading matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates(filters);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setFiltersOpen(false);
    setHistoryStack([]);
    loadCandidates(filters);
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
    loadCandidates(defaultFilters);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Discover Matches <Sparkles className="w-5 h-5 text-primary-pink" />
            </h1>
            <p className="text-xs text-foreground/60">Find companions sharing your frequencies</p>
          </div>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel hover:border-primary-pink hover:text-primary-pink text-xs font-bold transition-all cursor-pointer"
          >
            <Filter className="w-4 h-4" /> Filters {filtersOpen ? "Open" : ""}
          </button>
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
                placeholder="e.g. New York"
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

        {/* Discovery swipe panel area */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 min-h-[500px]">
          {loading && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary-pink border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-foreground/50">Fetching dating profiles...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center p-6 rounded-2xl bg-red-500/10 border border-red-500/20 max-w-sm">
              <p className="text-xs text-red-500 font-semibold">{error}</p>
              <button
                onClick={() => loadCandidates(filters)}
                className="mt-4 px-4 py-2 rounded-xl bg-white/5 text-xs border border-white/10"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && candidates.length > 0 && (
            <div className="w-full flex items-center justify-center">
              <TinderCard
                candidate={candidates[0]}
                onSwipe={handleSwipe}
                onUndo={handleUndo}
                canUndo={historyStack.length > 0}
              />
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <div className="text-center flex flex-col items-center max-w-sm glass-card p-8 rounded-3xl border border-white/5">
              <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center text-primary-pink border border-pink-500/25 mb-4">
                <RefreshCcw className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="font-extrabold text-base mb-1.5">No More Profiles Around</h3>
              <p className="text-xs text-foreground/60 leading-normal mb-5">
                We couldn't find matches matching your filters. Try widening your age range or checking other locations.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-full bg-gradient-premium text-white text-xs font-bold shadow-lg"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

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
