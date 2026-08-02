"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, BadgeCheck, CalendarDays, Compass, Crown, Heart, MapPin, 
  Sparkles, UserRound, Briefcase, MessageCircle, ShieldCheck, Camera, 
  Plus, UploadCloud, Trash2, Star, CheckCircle2, Cloud, Loader2 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDashboardData } from "@/actions/dashboard";
import { saveUserProfile, deleteProfilePhotoAction, setPrimaryProfilePhotoAction } from "@/actions/profile";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
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

  const handleCloudinaryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (galleryPhotos.length + files.length > 6) {
      setPhotoMessage("You can upload up to 6 photos in your gallery.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setPhotoMessage("Uploading image to Cloudinary...");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload/cloudinary", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok && data?.success && data?.photo) {
          setGalleryPhotos((prev) => [...prev, data.photo]);
          setPhotoMessage("Image uploaded to Cloudinary successfully!");
        } else {
          setPhotoMessage(data?.error || "Failed to upload image to Cloudinary.");
        }
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setPhotoMessage("An error occurred while uploading your photo to Cloudinary.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      setPhotoMessage("Deleting photo...");
      const res = await deleteProfilePhotoAction(photoId);
      if (res.success) {
        setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setPhotoMessage("Photo deleted successfully.");
      } else {
        setPhotoMessage(res.error || "Failed to delete photo.");
      }
    } catch (err) {
      setPhotoMessage("Error deleting photo.");
    }
  };

  const handleSetPrimary = async (photoId) => {
    try {
      setPhotoMessage("Setting primary photo...");
      const res = await setPrimaryProfilePhotoAction(photoId);
      if (res.success) {
        setGalleryPhotos((prev) =>
          prev.map((p) => ({
            ...p,
            isProfile: p.id === photoId,
          }))
        );
        setPhotoMessage("Primary profile photo updated.");
      } else {
        setPhotoMessage(res.error || "Failed to update primary photo.");
      }
    } catch (err) {
      setPhotoMessage("Error setting primary photo.");
    }
  };

  const primaryPhoto = galleryPhotos.find((p) => p.isProfile) || galleryPhotos[0];

  const handleDirectAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setPhotoMessage("Updating profile picture...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data?.success && data?.photo) {
        const newPhoto = data.photo;
        if (newPhoto.id) {
          await setPrimaryProfilePhotoAction(newPhoto.id);
        }
        setGalleryPhotos((prev) => [
          { ...newPhoto, isProfile: true },
          ...prev.map((p) => ({ ...p, isProfile: false })),
        ]);
        setPhotoMessage("Profile picture updated successfully!");
      } else {
        setPhotoMessage(data?.error || "Failed to upload profile picture.");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      setPhotoMessage("Error updating profile picture.");
    } finally {
      setUploading(false);
      event.target.value = "";
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
                  {/* Profile Picture / Avatar with Change Photo overlay button */}
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF4D8D] to-[#9C6BFF] p-0.5 shadow-lg flex items-center justify-center overflow-hidden">
                      {primaryPhoto?.url ? (
                        <img
                          src={primaryPhoto.url}
                          alt={profile?.fullName || "Profile photo"}
                          className="w-full h-full object-cover rounded-[22px]"
                        />
                      ) : (
                        <div className="w-full h-full rounded-[22px] bg-[#14141E] flex items-center justify-center text-3xl font-black uppercase text-white">
                          {profile?.fullName ? profile.fullName[0] : (session?.user?.fullName ? session.user.fullName[0] : "U")}
                        </div>
                      )}
                    </div>

                    <label className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-transform flex items-center justify-center" title="Update Profile Picture">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={handleDirectAvatarUpload}
                        className="hidden"
                      />
                    </label>
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

              <div className="mt-8 rounded-3xl border border-white/10 bg-[#101019] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                      <Cloud className="w-4 h-4 text-[#FF4D8D]" /> Photo Gallery
                    </div>
                    <p className="mt-1 text-xs text-white/60 font-medium">
                      Upload photos These will be shown randomly to other users in Explore!
                    </p>
                  </div>
                  <div className="rounded-full border border-[#FF4D8D]/30 bg-[#FF4D8D]/10 px-3 py-1 text-xs font-bold text-[#FF4D8D] shrink-0">
                    {galleryPhotos.length}/6 photos
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {galleryPhotos.length > 0 ? galleryPhotos.map((photo, index) => (
                    <div key={photo.id || photo.publicId || `${photo.url}-${index}`} className="relative group overflow-hidden rounded-2xl border border-white/10 bg-black/40 flex flex-col">
                      <div className="h-44 w-full relative">
                        <img src={photo.url} alt={`Cloudinary ${index + 1}`} className="h-full w-full object-cover" />
                        
                        {photo.isProfile && (
                          <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-[10px] font-extrabold text-white flex items-center gap-1 shadow-md">
                            <Star className="w-3 h-3 fill-current" /> Primary
                          </span>
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 backdrop-blur-xs">
                          {!photo.isProfile && photo.id && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(photo.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-black text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="Set as Primary Profile Photo"
                            >
                              <Star className="w-3.5 h-3.5" /> Make Primary
                            </button>
                          )}
                          {photo.id && (
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="p-2 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white transition-all cursor-pointer"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-2.5 bg-white/5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50 font-semibold">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Cloudinary Hosted
                        </span>
                        <span>{photo.publicId ? photo.publicId.slice(0, 14) : `photo_${index+1}`}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-xs text-white/60 font-medium">
                      No  photos uploaded yet. Click below to add your first photo.
                    </div>
                  )}
                </div>

                <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#9C6BFF]/40 bg-[#9C6BFF]/10 hover:bg-[#9C6BFF]/20 px-4 py-3.5 text-xs font-bold text-[#9C6BFF] transition-all">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#9C6BFF]" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-[#9C6BFF]" />
                      <span>Upload Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        disabled={uploading || galleryPhotos.length >= 6} 
                        onChange={handleCloudinaryUpload} 
                        className="hidden" 
                      />
                    </>
                  )}
                </label>

                {photoMessage && (
                  <p className="mt-3 text-xs text-center text-white/70 font-semibold">{photoMessage}</p>
                )}
              </div>
            </motion.section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
