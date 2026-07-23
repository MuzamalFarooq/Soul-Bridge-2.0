"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Heart, Sparkles, User, Calendar, MapPin, Compass, Briefcase, 
  Camera, Check, ChevronRight, ChevronLeft, ArrowRight, Brain 
} from "lucide-react";
import { saveUserProfile, getAIBioAction } from "@/actions/profile";

export default function Onboarding() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Fields State
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
    // Mock Photos
    photo1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    photo2: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!formData.fullName || !formData.username || !formData.dob) {
        setError("Please complete all basic info fields");
        return;
      }
    }
    if (step === 2) {
      if (!formData.country || !formData.city || !formData.profession) {
        setError("Please complete your location and profession");
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
        setError(res.error || "Failed to generate AI Bio");
      }
    } catch (err) {
      setError("AI generation failed. Please type bio manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      // Structure profile dataset
      const payload = {
        ...formData,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        languages: formData.languages.split(",").map(s => s.trim()).filter(Boolean),
        hobbies: formData.hobbies.split(",").map(s => s.trim()).filter(Boolean),
        pets: formData.pets.split(",").map(s => s.trim()).filter(Boolean),
        favoriteMusic: formData.favoriteMusic.split(",").map(s => s.trim()).filter(Boolean),
        favoriteMovies: formData.favoriteMovies.split(",").map(s => s.trim()).filter(Boolean),
        photos: [
          { url: formData.photo1, isProfile: true },
          { url: formData.photo2, isProfile: false }
        ]
      };

      const res = await saveUserProfile(payload);
      if (!res.success) {
        setError(res.error || "Failed to submit profile");
        setLoading(false);
        return;
      }

      // Update Session parameters client-side
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10">
      {/* Brand logo */}
      <div className="flex items-center gap-1.5 mb-6">
        <Heart className="w-7 h-7 text-primary-pink fill-primary-pink" />
        <span className="text-xl font-bold tracking-tight bg-gradient-premium bg-clip-text text-transparent">
          Soul Bridge Onboarding
        </span>
      </div>

      <div className="w-full max-w-2xl glass-card rounded-3xl p-8 border border-white border-opacity-10 shadow-2xl relative">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-premium transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between text-xs text-foreground/50 mb-8 font-semibold">
          <span className={step >= 1 ? "text-primary-pink" : ""}>1. Basic Info</span>
          <span className={step >= 2 ? "text-primary-pink" : ""}>2. Lifestyle</span>
          <span className={step >= 3 ? "text-primary-pink" : ""}>3. AI Bio</span>
          <span className={step >= 4 ? "text-primary-pink" : ""}>4. Photos & Socials</span>
        </div>

        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-left">
            {error}
          </div>
        )}

        {/* STEP 1: BASIC INFO */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary-pink" /> Let's get to know you
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="e.g. johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm bg-background"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Interested In</label>
                <select
                  name="interestedIn"
                  value={formData.interestedIn}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm bg-background"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Everyone">Everyone</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LIFESTYLE & LOCATION */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary-purple" /> Lifestyle & Background
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Country</label>
                <input
                  type="text"
                  name="country"
                  placeholder="e.g. United States"
                  value={formData.country}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. New York"
                  value={formData.city}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Profession</label>
                <input
                  type="text"
                  name="profession"
                  placeholder="e.g. UX Designer"
                  value={formData.profession}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Education</label>
                <input
                  type="text"
                  name="education"
                  placeholder="e.g. Bachelor's Degree"
                  value={formData.education}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Religion</label>
                <input
                  type="text"
                  name="religion"
                  placeholder="e.g. Christian"
                  value={formData.religion}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  placeholder="e.g. 175"
                  value={formData.height}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Smoking</label>
                <select
                  name="smoking"
                  value={formData.smoking}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm bg-background"
                >
                  <option value="Non-smoker">Non-smoker</option>
                  <option value="Social Smoker">Social Smoker</option>
                  <option value="Smoker">Smoker</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Drinking</label>
                <select
                  name="drinking"
                  value={formData.drinking}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm bg-background"
                >
                  <option value="Non-drinker">Non-drinker</option>
                  <option value="Social Drinker">Social Drinker</option>
                  <option value="Heavy Drinker">Heavy Drinker</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BIO & HOBBIES WITH AI GENERATOR */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" /> Bio & Interests
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground/70">Hobbies (Comma separated)</label>
              <input
                type="text"
                name="hobbies"
                placeholder="e.g. Hiking, Photography, Reading, Coffee"
                value={formData.hobbies}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-foreground/70">About Me / Bio</label>
                <button
                  type="button"
                  onClick={handleGenerateAIBio}
                  disabled={aiLoading}
                  className="flex items-center gap-1 text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 px-2 py-0.5 rounded-full hover:bg-indigo-500 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" /> {aiLoading ? "Generating..." : "Generate AI Bio"}
                </button>
              </div>
              <textarea
                name="bio"
                rows={4}
                placeholder="Tell potential matches about yourself..."
                value={formData.bio}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl glass-input text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Relationship Goal</label>
                <select
                  name="relationshipGoal"
                  value={formData.relationshipGoal}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm bg-background"
                >
                  <option value="Long-term">Long-term relation</option>
                  <option value="Short-term">Short-term relation</option>
                  <option value="Marriage">Looking for marriage</option>
                  <option value="Friendship">Open to friendship</option>
                  <option value="Casual">Casual dating</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Personality Type (MBTI)</label>
                <input
                  type="text"
                  name="personalityType"
                  placeholder="e.g. INFJ, ENFP"
                  value={formData.personalityType}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PHOTOS & SOCIALS */}
        {step === 4 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-pink" /> Photos & Social Channels
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Profile Photo URL</label>
                <input
                  type="text"
                  name="photo1"
                  value={formData.photo1}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/20 mt-1">
                  <img src={formData.photo1} alt="Profile Photo Preview" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Gallery Photo URL</label>
                <input
                  type="text"
                  name="photo2"
                  value={formData.photo2}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/20 mt-1">
                  <img src={formData.photo2} alt="Gallery Photo Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Instagram Handle</label>
                <input
                  type="text"
                  name="instagram"
                  placeholder="e.g. @johndoe"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70">Facebook Profile Link</label>
                <input
                  type="text"
                  name="facebook"
                  placeholder="e.g. facebook.com/johndoe"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Button Actions */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-white border-opacity-5">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-premium text-white text-xs font-bold shadow-lg cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-premium text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving Profile..." : (
                <>
                  Complete Setup <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
