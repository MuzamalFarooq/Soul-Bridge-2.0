"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Heart, Sparkles, User, Calendar, MapPin, Compass, Briefcase, 
  Camera, Check, ChevronRight, ChevronLeft, ArrowRight, Brain, 
  UploadCloud, Loader2, X 
} from "lucide-react";
import { saveUserProfile, getAIBioAction } from "@/actions/profile";

export default function Onboarding() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadingPhoto1, setUploadingPhoto1] = useState(false);
  const [uploadingPhoto2, setUploadingPhoto2] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e, photoKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photoKey === "photo1") setUploadingPhoto1(true);
    if (photoKey === "photo2") setUploadingPhoto2(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data?.success && data?.photo?.url) {
        setFormData((prev) => ({ ...prev, [photoKey]: data.photo.url }));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, [photoKey]: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Onboarding photo upload error:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [photoKey]: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      if (photoKey === "photo1") setUploadingPhoto1(false);
      if (photoKey === "photo2") setUploadingPhoto2(false);
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    gender: "Male",
    interestedIn: "Female",
    dob: "",
    height: "",
    weight: "",
    religion: "",
    profession: "",
    education: "",
    country: "",
    city: "",
    languages: "",
    relationshipGoal: "Long-term",
    bio: "",
    hobbies: "",
    smoking: "Non-smoker",
    drinking: "Social Drinker",
    pets: "",
    favoriteMusic: "",
    favoriteMovies: "",
    instagram: "",
    facebook: "",
    occupation: "",
    lookingFor: "",
    personalityType: "INTJ",
    photo1: "",
    photo2: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!formData.fullName || !formData.username || !formData.dob) {
        setError("Please complete all basic info fields.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.country || !formData.city || !formData.profession) {
        setError("Please complete your location and profession.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerateAIBio = async () => {
    setAiLoading(true);
    setError("");
    try {
      const keywords = {
        hobbies: formData.hobbies.split(",").map(s => s.trim()).filter(Boolean),
        relationshipGoal: formData.relationshipGoal,
        profession: formData.profession,
        gender: formData.gender
      };

      const res = await getAIBioAction(keywords);
      if (res.success) {
        setFormData(prev => ({ ...prev, bio: res.bio }));
      } else {
        setError(res.error || "Failed to generate AI Bio.");
      }
    } catch (err) {
      setError("AI generation failed. Please enter bio manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const userPhotos = [];
      if (formData.photo1 && formData.photo1.trim()) {
        userPhotos.push({ url: formData.photo1, isProfile: true });
      }
      if (formData.photo2 && formData.photo2.trim()) {
        userPhotos.push({ url: formData.photo2, isProfile: userPhotos.length === 0 });
      }

      const payload = {
        ...formData,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        languages: formData.languages.split(",").map(s => s.trim()).filter(Boolean),
        hobbies: formData.hobbies.split(",").map(s => s.trim()).filter(Boolean),
        pets: formData.pets.split(",").map(s => s.trim()).filter(Boolean),
        favoriteMusic: formData.favoriteMusic.split(",").map(s => s.trim()).filter(Boolean),
        favoriteMovies: formData.favoriteMovies.split(",").map(s => s.trim()).filter(Boolean),
        photos: userPhotos
      };

      const res = await saveUserProfile(payload);
      if (!res.success) {
        setError(res.error || "Failed to submit profile dataset.");
        setLoading(false);
        return;
      }

      // Save to recent new users cache for instant home card stack preview
      try {
        const newCardProfile = {
          id: res.profile?.userId || `user_${Date.now()}`,
          fullName: formData.fullName || "Soul Bridge Member",
          age: formData.dob ? Math.abs(new Date(Date.now() - new Date(formData.dob).getTime()).getUTCFullYear() - 1970) : 25,
          gender: formData.gender,
          city: formData.city || "Islamabad",
          country: formData.country || "Pakistan",
          profession: formData.profession || "Professional",
          bio: formData.bio || "Excited to meet new people on Soul Bridge!",
          hobbies: formData.hobbies.split(",").map(s => s.trim()).filter(Boolean),
          relationshipGoal: formData.relationshipGoal || "Long-term",
          compatibility: 97,
          photos: userPhotos.map(p => p.url).filter(Boolean),
          isNew: true,
          badge: "Just Joined ✨"
        };
        const existing = JSON.parse(localStorage.getItem("sb_recent_new_users") || "[]");
        const updated = [newCardProfile, ...existing.filter(u => u.id !== newCardProfile.id)].slice(0, 10);
        localStorage.setItem("sb_recent_new_users", JSON.stringify(updated));
      } catch (e) {}

      await updateSession({
        completed: true,
        username: formData.username,
        fullName: formData.fullName
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Failed to complete onboarding. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10 bg-[#09090B]">
      <div className="absolute w-[600px] h-[600px] bg-radial from-[#FF4D8D]/20 via-[#9C6BFF]/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Brand logo */}
      <div className="flex items-center gap-2 mb-8">
        <Heart className="w-8 h-8 text-[#FF4D8D] fill-[#FF4D8D] filter drop-shadow-[0_0_10px_rgba(255,77,141,0.6)]" />
        <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] via-[#FFB6C1] to-[#9C6BFF]">
          Soul Bridge Setup
        </span>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl glass-card-lux rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl relative"
      >
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF]"
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between text-xs text-white/50 mb-8 font-bold">
          <span className={step >= 1 ? "text-[#FF4D8D]" : ""}>1. Basic Info</span>
          <span className={step >= 2 ? "text-[#FF4D8D]" : ""}>2. Lifestyle</span>
          <span className={step >= 3 ? "text-[#FF4D8D]" : ""}>3. AI Bio</span>
          <span className={step >= 4 ? "text-[#FF4D8D]" : ""}>4. Gallery</span>
        </div>

        {error && (
          <div className="p-3.5 mb-6 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold text-left">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#FF4D8D]" /> Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Alex Morgan"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl glass-input-lux text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="e.g. alexmorgan"
                  value={formData.username}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl glass-input-lux text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl glass-input-lux text-xs bg-[#09090B] text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Interested In</label>
                <select
                  name="interestedIn"
                  value={formData.interestedIn}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl glass-input-lux text-xs bg-[#09090B] text-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Everyone">Everyone</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl glass-input-lux text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#9C6BFF]" /> Lifestyle & Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Country</label>
                <input
                  type="text"
                  name="country"
                  placeholder="e.g. United States"
                  value={formData.country}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl glass-input-lux text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. San Francisco"
                  value={formData.city}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl glass-input-lux text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Profession</label>
                <input
                  type="text"
                  name="profession"
                  placeholder="e.g. Architect"
                  value={formData.profession}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl glass-input-lux text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Education</label>
                <input
                  type="text"
                  name="education"
                  placeholder="e.g. Master's Degree"
                  value={formData.education}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl glass-input-lux text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70">Religion</label>
                <input
                  type="text"
                  name="religion"
                  placeholder="e.g. Spiritual"
                  value={formData.religion}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-2xl glass-input-lux text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#FFB6C1]" /> Groq AI Bio Assistant
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-white/70">Hobbies (Comma separated)</label>
              <input
                type="text"
                name="hobbies"
                placeholder="e.g. Coffee, Photography, Hiking, Gallery Walks"
                value={formData.hobbies}
                onChange={handleChange}
                className="px-4 py-3 rounded-2xl glass-input-lux text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-white/70">Bio Description</label>
                <button
                  type="button"
                  onClick={handleGenerateAIBio}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 text-[10px] bg-[#9C6BFF]/20 text-[#9C6BFF] border border-[#9C6BFF]/30 px-3 py-1 rounded-full hover:bg-[#9C6BFF] hover:text-white transition-all cursor-pointer font-bold disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" /> {aiLoading ? "Generating AI Bio..." : "Generate with Groq AI"}
                </button>
              </div>
              <textarea
                name="bio"
                rows={4}
                placeholder="Write or generate your personal bio..."
                value={formData.bio}
                onChange={handleChange}
                className="px-4 py-3 rounded-2xl glass-input-lux text-xs text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#FF4D8D]" /> Gallery & Profile Photo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Photo 1 Uploader */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl glass-card-lux border border-white/10">
                <label className="text-xs font-bold text-white/90 flex items-center justify-between">
                  <span>Primary Profile Picture</span>
                  <span className="text-[10px] text-[#FF4D8D] font-extrabold uppercase">Main Avatar</span>
                </label>

                <div className="h-44 w-full rounded-2xl overflow-hidden border border-white/20 relative bg-black/40 flex flex-col items-center justify-center">
                  {formData.photo1 ? (
                    <>
                      <img src={formData.photo1} alt="Primary Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, photo1: "" }))}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="Remove Photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/40 p-4 text-center">
                      <Camera className="w-8 h-8 opacity-40 text-[#FF4D8D]" />
                      <span className="text-xs font-medium">No photo selected</span>
                    </div>
                  )}

                  {uploadingPhoto1 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 text-xs font-bold text-[#FF4D8D]">
                      <Loader2 className="w-5 h-5 animate-spin" /> Uploading image...
                    </div>
                  )}
                </div>

                <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] transition-transform">
                  <UploadCloud className="w-4 h-4" /> {formData.photo1 ? "Change Profile Photo" : "Upload Profile Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingPhoto1}
                    onChange={(e) => handleFileUpload(e, "photo1")}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo 2 Uploader */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl glass-card-lux border border-white/10">
                <label className="text-xs font-bold text-white/90 flex items-center justify-between">
                  <span>Secondary Gallery Photo</span>
                  <span className="text-[10px] text-white/50 font-bold uppercase">Gallery Slot</span>
                </label>

                <div className="h-44 w-full rounded-2xl overflow-hidden border border-white/20 relative bg-black/40 flex flex-col items-center justify-center">
                  {formData.photo2 ? (
                    <>
                      <img src={formData.photo2} alt="Secondary Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, photo2: "" }))}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="Remove Photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/40 p-4 text-center">
                      <UploadCloud className="w-8 h-8 opacity-40 text-[#9C6BFF]" />
                      <span className="text-xs font-medium">No photo selected</span>
                    </div>
                  )}

                  {uploadingPhoto2 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 text-xs font-bold text-[#9C6BFF]">
                      <Loader2 className="w-5 h-5 animate-spin" /> Uploading image...
                    </div>
                  )}
                </div>

                <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors">
                  <UploadCloud className="w-4 h-4 text-[#9C6BFF]" /> {formData.photo2 ? "Change Gallery Photo" : "Upload Gallery Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingPhoto2}
                    onChange={(e) => handleFileUpload(e, "photo2")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/10">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/15 text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white text-xs font-bold shadow-lg shadow-pink-500/25 cursor-pointer hover:scale-105 transition-all"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white text-xs font-bold shadow-lg shadow-pink-500/25 cursor-pointer hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? "Completing Profile..." : (
                <>
                  Complete Setup <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
