"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Heart, MessageCircle, ArrowLeft, BadgeCheck, Crown, MapPin, 
  Briefcase, GraduationCap, Sparkles, User, Calendar, Flame,
  Share2, ShieldCheck, Check, Music, Film, Compass, Globe, Info
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUserPublicProfile } from "@/actions/profile";
import { submitSwipeAction } from "@/actions/matching";

export default function UserPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await getUserPublicProfile(userId);
        if (isMounted) {
          if (res.success && res.user) {
            setUserData(res.user);
          } else {
            setError(res.error || "User not found");
          }
        }
      } catch (err) {
        if (isMounted) setError("Failed to load user profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleLike = async () => {
    if (!userData || liked) return;
    setLiked(true);
    try {
      await submitSwipeAction({ swipedId: userData.userId || userData.id, type: "LIKE" });
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPremium = userData?.premiumStatus && userData?.premiumStatus !== "FREE";
  const userPhotos = userData?.photos?.length > 0 
    ? userData.photos.map((p) => p.url) 
    : userData?.avatar 
      ? [userData.avatar] 
      : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-foreground">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-16 relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel-lux text-xs font-bold text-white/80 hover:text-white hover:border-pink-500/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel-lux text-xs font-bold text-white/80 hover:text-white hover:border-pink-500/40 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Copied Profile Link
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" /> Share Profile
              </>
            )}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 min-h-[400px]">
            <div className="w-12 h-12 border-4 border-[#FF4D8D] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-white/50 font-semibold tracking-wider uppercase">
              Loading member profile...
            </p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-card-lux rounded-3xl p-8 max-w-md mx-auto my-8 border border-white/10">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <User className="w-8 h-8 opacity-70" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-xs text-white/60 mb-6 leading-relaxed">
              {error}. The profile you are looking for might have been moved or removed.
            </p>
            <Link
              href="/discover"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white text-xs font-bold shadow-lg shadow-pink-500/20"
            >
              Browse Discovery Feed
            </Link>
          </div>
        )}

        {/* User Profile Content */}
        {!loading && !error && userData && (
          <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Top Hero Card */}
            <div className="relative rounded-3xl overflow-hidden glass-card-lux border border-white/10 p-6 sm:p-8">
              {/* Decorative Ambient Glow Background */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-[#FF4D8D]/25 via-[#9C6BFF]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-[#9C6BFF]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
                {/* Avatar with luxury border */}
                <div className="relative shrink-0">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-[#FF4D8D] via-[#FFB6C1] to-[#9C6BFF] shadow-2xl shadow-pink-500/20">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#181424] flex items-center justify-center">
                      {userData.avatar ? (
                        <img
                          src={userData.avatar}
                          alt={userData.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-[#FF4D8D] to-[#9C6BFF]">
                          {userData.fullName ? userData.fullName[0] : "U"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Online Badge */}
                  {userData.isOnline && (
                    <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-3 border-[#09090B] flex items-center justify-center shadow-lg" title="Online Now">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </span>
                  )}
                </div>

                {/* User Details */}
                <div className="flex-1 text-center md:text-left flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {userData.fullName}
                    </h1>

                    {userData.age && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-xs font-bold border border-white/10">
                        {userData.age} yrs
                      </span>
                    )}

                    {userData.verificationBadge && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-bold">
                        <BadgeCheck className="w-3.5 h-3.5 fill-sky-500 text-black" /> Verified
                      </span>
                    )}

                    {isPremium && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                        <Crown className="w-3.5 h-3.5 fill-amber-400" /> {userData.premiumStatus}
                      </span>
                    )}
                  </div>

                  {/* Username */}
                  <p className="text-xs font-semibold text-white/50 flex items-center justify-center md:justify-start gap-1">
                    @{userData.username}
                  </p>

                  {/* Key Info Pills */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs text-white/75">
                    {userData.city && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel-lux border-white/10">
                        <MapPin className="w-3.5 h-3.5 text-[#FF4D8D]" />
                        {userData.city}{userData.country ? `, ${userData.country}` : ""}
                      </span>
                    )}
                    {(userData.profession || userData.occupation) && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel-lux border-white/10">
                        <Briefcase className="w-3.5 h-3.5 text-[#9C6BFF]" />
                        {userData.profession || userData.occupation}
                      </span>
                    )}
                    {userData.education && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel-lux border-white/10">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                        {userData.education}
                      </span>
                    )}
                    {userData.relationshipGoal && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel-lux border-white/10 text-pink-300">
                        <Heart className="w-3.5 h-3.5 text-primary-pink fill-primary-pink" />
                        {userData.relationshipGoal}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg cursor-pointer ${
                        liked
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white shadow-pink-500/20 hover:scale-105 active:scale-95"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${liked ? "fill-rose-400 text-rose-400" : "fill-white"}`} />
                      {liked ? "Liked Profile" : "Like Profile"}
                    </button>

                    <Link
                      href={`/chat`}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full glass-panel-lux hover:bg-white/10 text-white text-xs font-bold border-white/15 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-[#9C6BFF]" />
                      Message
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Bio & Gallery */}
              <div className="md:col-span-2 flex flex-col gap-6">
                {/* Bio Card */}
                {userData.bio && (
                  <div className="rounded-3xl glass-card-lux p-6 border border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FF4D8D]" /> About {userData.fullName}
                    </h3>
                    <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed italic border-l-2 border-[#FF4D8D]/60 pl-4 py-1">
                      &quot;{userData.bio}&quot;
                    </p>
                  </div>
                )}

                {/* Photo Gallery Card */}
                {userPhotos.length > 0 && (
                  <div className="rounded-3xl glass-card-lux p-6 border border-white/10 flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center justify-between">
                      <span>Photo Gallery ({userPhotos.length})</span>
                    </h3>

                    {/* Main Featured Photo Preview */}
                    <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-black/40 border border-white/10 shadow-xl">
                      <img
                        src={userPhotos[activePhotoIdx]}
                        alt={`${userData.fullName} photo`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Thumbnail Selector */}
                    {userPhotos.length > 1 && (
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                        {userPhotos.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                              activePhotoIdx === idx
                                ? "border-[#FF4D8D] scale-105 shadow-md shadow-pink-500/30"
                                : "border-white/10 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Col: Lifestyle & Attributes */}
              <div className="flex flex-col gap-6">
                {/* Passions / Hobbies */}
                {userData.hobbies?.length > 0 && (
                  <div className="rounded-3xl glass-card-lux p-6 border border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#9C6BFF]" /> Interests & Passions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userData.hobbies.map((hobby, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-full glass-panel-lux text-xs font-semibold text-white/90 border border-white/10"
                        >
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Profile Traits & Info */}
                <div className="rounded-3xl glass-card-lux p-6 border border-white/10 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400" /> Basic Overview
                  </h3>

                  <div className="flex flex-col divide-y divide-white/5 text-xs">
                    {userData.gender && (
                      <div className="py-2.5 flex items-center justify-between">
                        <span className="text-white/50">Gender</span>
                        <span className="font-semibold text-white">{userData.gender}</span>
                      </div>
                    )}
                    {userData.interestedIn && (
                      <div className="py-2.5 flex items-center justify-between">
                        <span className="text-white/50">Interested In</span>
                        <span className="font-semibold text-white">{userData.interestedIn}</span>
                      </div>
                    )}
                    {userData.religion && (
                      <div className="py-2.5 flex items-center justify-between">
                        <span className="text-white/50">Religion</span>
                        <span className="font-semibold text-white">{userData.religion}</span>
                      </div>
                    )}
                    {userData.height && (
                      <div className="py-2.5 flex items-center justify-between">
                        <span className="text-white/50">Height</span>
                        <span className="font-semibold text-white">{userData.height} cm</span>
                      </div>
                    )}
                    {userData.smoking && (
                      <div className="py-2.5 flex items-center justify-between">
                        <span className="text-white/50">Smoking</span>
                        <span className="font-semibold text-white">{userData.smoking}</span>
                      </div>
                    )}
                    {userData.drinking && (
                      <div className="py-2.5 flex items-center justify-between">
                        <span className="text-white/50">Drinking</span>
                        <span className="font-semibold text-white">{userData.drinking}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages */}
                {userData.languages?.length > 0 && (
                  <div className="rounded-3xl glass-card-lux p-6 border border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-400" /> Languages Spoken
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userData.languages.map((lang, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-xl bg-white/5 text-xs text-white/80 border border-white/10"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
