"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Search, X, Loader2, User, BadgeCheck, Crown, MapPin, 
  Sparkles, ArrowRight, Briefcase, HeartHandshake 
} from "lucide-react";
import { searchUsersAction } from "@/actions/profile";

export default function NavbarSearch({ isMobile = false, onCloseMobile }) {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  }

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    setSelectedIndex(-1);

    try {
      const res = await searchUsersAction(searchTerm);
      if (res && res.success) {
        setResults(res.users || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Navbar search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    debounceTimerRef.current = setTimeout(() => {
      performSearch(val);
    }, 250);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectUser = (user) => {
    setIsOpen(false);
    setQuery("");
    if (onCloseMobile) onCloseMobile();
    router.push(`/user/${user.id || user.userId || user.username}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectUser(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelectUser(results[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative ${isMobile ? "w-full" : "w-64 lg:w-80"}`}
    >
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-white/40 flex items-center">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[#FF4D8D] animate-spin" />
          ) : (
            <Search className="w-4 h-4 group-focus-within:text-[#FF4D8D] transition-colors" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search people by name or @username..."
          className="w-full pl-10 pr-9 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/8 focus:bg-[#09090B] border border-white/10 focus:border-[#FF4D8D]/60 text-white placeholder-white/40 shadow-inner focus:shadow-[0_0_20px_rgba(255,77,141,0.25)] outline-none transition-all duration-300"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-0.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Matching Users Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-card-lux p-2 shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-200 z-60 bg-[#09090B]/95 backdrop-blur-2xl max-h-[400px] overflow-y-auto">
          {/* Dropdown Header */}
          <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between text-[11px] font-bold text-white/60">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-primary-pink" /> Matching People
            </span>
            <span>{results.length} found</span>
          </div>

          {/* Loading Indicator */}
          {loading && results.length === 0 && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/50">
              <Loader2 className="w-6 h-6 text-[#FF4D8D] animate-spin" />
              <span className="text-xs font-medium">Searching for &quot;{query}&quot;...</span>
            </div>
          )}

          {/* No Results Found */}
          {!loading && results.length === 0 && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center text-white/40 px-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-1">
                <User className="w-5 h-5 opacity-40" />
              </div>
              <p className="text-xs font-bold text-white/70">No people found</p>
              <p className="text-[11px] text-white/40">
                No matching users found for &quot;<span className="text-white/80">{query}</span>&quot;. Try searching by first name or username.
              </p>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 && (
            <div className="flex flex-col gap-1">
              {results.map((user, idx) => {
                const isSelected = selectedIndex === idx;
                const isUserPremium = user.premiumStatus && user.premiumStatus !== "FREE";

                return (
                  <button
                    key={user.id || user.userId || idx}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-transparent border border-pink-500/30"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF4D8D] to-[#9C6BFF] p-0.5 shadow-md overflow-hidden flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-[#181424] flex items-center justify-center text-xs font-black text-white uppercase">
                            {user.fullName ? user.fullName[0] : "U"}
                          </div>
                        )}
                      </div>
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#09090B]" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {user.fullName}
                        </span>

                        {user.verificationBadge && (
                          <BadgeCheck className="w-3.5 h-3.5 fill-sky-500 text-black shrink-0" />
                        )}

                        {isUserPremium && (
                          <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-white/50 truncate">
                        <span className="text-primary-pink font-semibold">@{user.username}</span>
                        {user.age && <span>• {user.age} yrs</span>}
                        {user.city && (
                          <span className="flex items-center gap-0.5 truncate">
                            • <MapPin className="w-2.5 h-2.5 text-white/40" /> {user.city}
                          </span>
                        )}
                      </div>

                      {user.profession && (
                        <p className="text-[10px] text-white/40 truncate mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-2.5 h-2.5" /> {user.profession}
                        </p>
                      )}
                    </div>

                    {/* Action Arrow */}
                    <div className="shrink-0 text-white/30 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
