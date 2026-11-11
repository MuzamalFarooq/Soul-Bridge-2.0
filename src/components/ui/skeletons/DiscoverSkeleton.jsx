import React from 'react';

export default function DiscoverSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      {/* Title & Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-7 w-48 bg-[#f1e3e1] rounded-xl mb-1.5" />
          <div className="h-3.5 w-64 bg-[#f1e3e1]/60 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-44 bg-[#f1e3e1] rounded-2xl" />
          <div className="h-10 w-24 bg-[#f1e3e1] rounded-2xl" />
        </div>
      </div>

      {/* Main Discover Card Centerpiece */}
      <div className="flex flex-col items-center justify-center py-4">
        <div 
          className="w-full max-w-sm sm:max-w-md h-[520px] rounded-3xl border border-white/60 bg-white/70 shadow-lg p-5 flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(255, 253, 250, 0.8)',
          }}
        >
          {/* Card Photo Placeholder */}
          <div className="w-full h-80 rounded-2xl bg-[#f1e3e1] relative overflow-hidden">
            <div className="absolute top-4 left-4 h-6 w-20 bg-white/60 rounded-full" />
            <div className="absolute top-4 right-4 h-6 w-16 bg-white/60 rounded-full" />
          </div>

          {/* Card Info & Tags */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-6 w-36 bg-[#f1e3e1] rounded-lg" />
              <div className="h-5 w-16 bg-[#fce7e5] rounded-full" />
            </div>
            <div className="h-4 w-52 bg-[#f1e3e1]/60 rounded-md" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-16 bg-[#f1e3e1]/50 rounded-full" />
              <div className="h-5 w-20 bg-[#f1e3e1]/50 rounded-full" />
              <div className="h-5 w-14 bg-[#f1e3e1]/50 rounded-full" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-rose-100/40">
            <div className="w-12 h-12 rounded-full bg-[#f1e3e1]" />
            <div className="w-14 h-14 rounded-full bg-[#800D32]/15" />
            <div className="w-14 h-14 rounded-full bg-[#800D32]/20" />
            <div className="w-12 h-12 rounded-full bg-[#f1e3e1]" />
          </div>
        </div>
      </div>
    </div>
  );
}

