"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, CalendarDays, Compass, Crown, Heart, MapPin, Sparkles, UserRound, Briefcase, MessageCircle, ShieldCheck, Camera, Plus, UploadCloud } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDashboardData } from "@/actions/dashboard";
import { saveUserProfile } from "@/actions/profile";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getDashboardData();
        if (response?.success) {
          setProfileData(response.data);
          setGalleryPhotos(response?.data?.profile?.user?.photos || []);
        } else {
          setError(response?.error || "Unable to load your profile right now.");
        }
      } catch (err) {
        setError("Unable to load your profile right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const profile = profileData?.profile;
  const isPremium = profile?.premiumStatus && profile?.premiumStatus !== "FREE";
  const completion = profileData?.completionPercentage || 0;

  const handlePhotoSelection = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (galleryPhotos.length + pendingPhotos.length + files.length > 6) {
      setPhotoMessage("You can add up to 6 photos in your gallery.");
      event.target.value = "";
      return;
    }

    try {
      const newImages = await Promise.all(
        files.map((file) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({
            url: reader.result,
            publicId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            isProfile: false
          });
          reader.onerror = () => reject(new Error("Unable to read image"));
          reader.readAsDataURL(file);
        }))
      );

      setPendingPhotos((prev) => [...prev, ...newImages]);
      setPhotoMessage(`${newImages.length} photo${newImages.length > 1 ? "s" : ""} ready to save.`);
    } catch (err) {
      setPhotoMessage("One of the selected files could not be processed.");
    } finally {
      event.target.value = "";
    }
  };

  const handleSaveGallery = async () => {
    if (!pendingPhotos.length) return;

    try {
      setSavingPhotos(true);
      setPhotoMessage("");

      const normalizedPhotos = [...galleryPhotos, ...pendingPhotos].slice(0, 6).map((photo, index) => ({
        ...photo,
        isProfile: index === 0 && !galleryPhotos.some((item) => item.isProfile)
      }));

      const result = await saveUserProfile({
        ...profile,
        photos: normalizedPhotos
      });

      if (result?.success) {
        setGalleryPhotos(normalizedPhotos);
        setPendingPhotos([]);
        setPhotoMessage("Your gallery has been updated.");
      } else {
        setPhotoMessage(result?.error || "Unable to save your gallery.");
      }
    } catch (err) {
      setPhotoMessage("Unable to save your gallery right now.");
    } finally {
      setSavingPhotos(false);
    }
  };

  const highlights = useMemo(() => [
    { label: "Matches", value: profileData?.matchesCount || 0, icon: Heart },
    { label: "Likes", value: profileData?.likesCount || 0, icon: Sparkles },
    { label: "City", value: profile?.city || "TBD", icon: MapPin },
    { label: "Goal", value: profile?.relationshipGoal || "Open", icon: Compass },
  ], [profile, profileData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#FF4D8D] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-28 md:pb-12">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
        </div>

        {error ? (
          <div className="glass-card-lux rounded-3xl p-6 border border-rose-500/25 text-rose-300">{error}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-lux rounded-3xl p-6 border border-white/10"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF4D8D] to-[#9C6BFF] flex items-center justify-center text-3xl font-black uppercase shadow-lg">
                    {profile?.fullName ? profile.fullName[0] : (session?.user?.fullName ? session.user.fullName[0] : "U")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-black text-white">{profile?.fullName || session?.user?.fullName || "Your Profile"}</h1>
                      {isPremium && <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />}
                    </div>
                    <p className="text-sm text-white/60 mt-1">@{profile?.username || "your-username"}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#9C6BFF]/30 bg-[#9C6BFF]/15 px-3 py-1 text-[11px] font-semibold text-[#9C6BFF]">
                      <BadgeCheck className="w-3.5 h-3.5" /> {profile?.premiumStatus || "FREE"} Plan
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  <div className="font-semibold text-white">Profile completion</div>
                  <div className="mt-2 text-2xl font-black text-[#FF4D8D]">{completion}%</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                  <span>Completion progress</span>
                  <span>{completion}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF]" style={{ width: `${completion}%` }} />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {highlights.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/50">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </div>
                    <div className="mt-2 text-lg font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card-lux rounded-3xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#9C6BFF]">
                <ShieldCheck className="w-4 h-4" /> About you
              </div>
              <div className="mt-5 space-y-4 text-sm text-white/80">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <Briefcase className="w-4 h-4 mt-0.5 text-[#FF4D8D]" />
                  <div>
                    <div className="font-semibold text-white">Profession</div>
                    <div>{profile?.profession || "Add your profession to stand out."}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <CalendarDays className="w-4 h-4 mt-0.5 text-[#FF4D8D]" />
                  <div>
                    <div className="font-semibold text-white">Age</div>
                    <div>{profile?.age || "Add your age for more relevant matches."}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <MessageCircle className="w-4 h-4 mt-0.5 text-[#FF4D8D]" />
                  <div>
                    <div className="font-semibold text-white">Bio</div>
                    <div>{profile?.bio || "Write a short bio that reflects your personality."}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <UserRound className="w-4 h-4 mt-0.5 text-[#FF4D8D]" />
                  <div>
                    <div className="font-semibold text-white">Gender</div>
                    <div>{profile?.gender || "Share how you identify."}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-[#101019] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Camera className="w-4 h-4 text-[#FF4D8D]" /> Instagram-style gallery
                    </div>
                    <p className="mt-1 text-sm text-white/60">Share multiple moments so other users can see your personality.</p>
                  </div>
                  <div className="rounded-full border border-[#FF4D8D]/30 bg-[#FF4D8D]/10 px-3 py-1 text-xs font-semibold text-[#FF4D8D]">
                    {galleryPhotos.length + pendingPhotos.length}/6 photos
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {galleryPhotos.length > 0 ? galleryPhotos.map((photo, index) => (
                    <div key={photo.id || `${photo.url}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      <img src={photo.url} alt={`Gallery ${index + 1}`} className="h-40 w-full object-cover" />
                      {photo.isProfile && (
                        <div className="px-3 py-2 text-xs font-semibold text-[#9C6BFF]">Primary photo</div>
                      )}
                    </div>
                  )) : (
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-center text-sm text-white/60">
                      No photos yet. Add a few to make your profile feel more personal.
                    </div>
                  )}

                  {pendingPhotos.map((photo, index) => (
                    <div key={`${photo.publicId}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      <img src={photo.url} alt={`Pending ${index + 1}`} className="h-40 w-full object-cover" />
                      <div className="px-3 py-2 text-xs font-semibold text-emerald-400">Ready to save</div>
                    </div>
                  ))}
                </div>

                <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#9C6BFF]/30 bg-[#9C6BFF]/10 px-4 py-3 text-sm font-semibold text-[#9C6BFF] transition hover:bg-[#9C6BFF]/20">
                  <UploadCloud className="w-4 h-4" />
                  <span>Add photos</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoSelection} className="hidden" />
                </label>

                {photoMessage ? (
                  <p className="mt-3 text-sm text-white/70">{photoMessage}</p>
                ) : null}

                {pendingPhotos.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleSaveGallery}
                    disabled={savingPhotos}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingPhotos ? "Saving..." : <><Plus className="w-4 h-4" /> Save gallery</>}
                  </button>
                ) : null}
              </div>
            </motion.section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
