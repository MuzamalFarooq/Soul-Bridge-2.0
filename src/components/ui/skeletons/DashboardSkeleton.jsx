import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse">
      {/* Top Greeting Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-8 w-64 bg-[#f1e3e1] rounded-xl mb-2" />
          <div className="h-4 w-48 bg-[#f1e3e1]/60 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-[#f1e3e1] rounded-full" />
          <div className="h-10 w-32 bg-[#f1e3e1] rounded-full" />
        </div>
      </div>

      {/* 4 Metrics Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="p-5 rounded-3xl border border-white/60 bg-white/70 shadow-xs flex flex-col justify-between h-32"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-[#f1e3e1]" />
              <div className="w-12 h-4 rounded-full bg-[#f1e3e1]/50" />
            </div>
            <div>
              <div className="h-6 w-16 bg-[#f1e3e1] rounded-lg mb-1.5" />
              <div className="h-3.5 w-24 bg-[#f1e3e1]/60 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area (AI Review + Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: AI Insights */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl border border-white/60 bg-white/70 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f1e3e1]" />
              <div>
                <div className="h-5 w-40 bg-[#f1e3e1] rounded-lg mb-1.5" />
                <div className="h-3 w-56 bg-[#f1e3e1]/60 rounded-md" />
              </div>
            </div>
            <div className="h-9 w-28 bg-[#f1e3e1] rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="h-14 w-full bg-[#fce7e5]/50 rounded-2xl" />
            <div className="h-14 w-full bg-[#fce7e5]/50 rounded-2xl" />
            <div className="h-14 w-full bg-[#fce7e5]/50 rounded-2xl" />
          </div>
        </div>

        {/* Right 1 Col: Quick Actions */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/60 bg-white/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="h-5 w-32 bg-[#f1e3e1] rounded-lg mb-4" />
            <div className="space-y-3">
              <div className="h-11 w-full bg-[#f1e3e1]/60 rounded-2xl" />
              <div className="h-11 w-full bg-[#f1e3e1]/60 rounded-2xl" />
              <div className="h-11 w-full bg-[#f1e3e1]/60 rounded-2xl" />
            </div>
          </div>
          <div className="h-12 w-full bg-[#800D32]/15 rounded-full mt-6" />
        </div>
      </div>
    </div>
  );
}

