import React from 'react';

export default function ChatSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[580px] rounded-3xl overflow-hidden border border-white/60 p-4 shadow-xl"
        style={{
          backgroundColor: 'rgba(255, 253, 250, 0.75)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Left Threads Pane */}
        <div className="flex flex-col border-r border-rose-100/60 pr-4">
          <div className="flex items-center justify-between mb-5 px-1">
            <div>
              <div className="h-6 w-32 bg-[#f1e3e1] rounded-xl mb-1.5" />
              <div className="h-3 w-24 bg-[#f1e3e1]/50 rounded-md" />
            </div>
            <div className="h-8 w-20 bg-[#fce7e5] rounded-full" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="h-10 w-full bg-[#f1e3e1]/50 rounded-2xl mb-4" />

          {/* Thread Items */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-white/40"
              >
                <div className="w-12 h-12 rounded-full bg-[#f1e3e1] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="h-4 w-28 bg-[#f1e3e1] rounded-md" />
                    <div className="h-3 w-10 bg-[#f1e3e1]/60 rounded-md" />
                  </div>
                  <div className="h-3 w-40 bg-[#f1e3e1]/60 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Active Conversation Pane */}
        <div className="md:col-span-2 flex flex-col justify-between pl-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-rose-100/60">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#f1e3e1]" />
              <div>
                <div className="h-5 w-32 bg-[#f1e3e1] rounded-md mb-1.5" />
                <div className="h-3 w-20 bg-[#f1e3e1]/60 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#f1e3e1]/60" />
              <div className="w-9 h-9 rounded-full bg-[#f1e3e1]/60" />
            </div>
          </div>

          {/* Chat Bubbles Skeleton */}
          <div className="py-6 space-y-4 flex-1">
            {/* Incoming Message */}
            <div className="flex items-end gap-2.5 max-w-sm">
              <div className="w-7 h-7 rounded-full bg-[#f1e3e1] shrink-0" />
              <div className="p-4 rounded-3xl rounded-bl-sm bg-white/70 border border-white/80 w-64">
                <div className="h-3.5 w-full bg-[#f1e3e1] rounded mb-2" />
                <div className="h-3.5 w-36 bg-[#f1e3e1] rounded" />
              </div>
            </div>

            {/* Outgoing Message */}
            <div className="flex items-end justify-end gap-2.5">
              <div className="p-4 rounded-3xl rounded-br-sm bg-[#800D32]/15 border border-[#800D32]/10 w-56">
                <div className="h-3.5 w-full bg-[#800D32]/20 rounded mb-2" />
                <div className="h-3.5 w-28 bg-[#800D32]/20 rounded" />
              </div>
            </div>

            {/* Incoming Message */}
            <div className="flex items-end gap-2.5 max-w-sm">
              <div className="w-7 h-7 rounded-full bg-[#f1e3e1] shrink-0" />
              <div className="p-4 rounded-3xl rounded-bl-sm bg-white/70 border border-white/80 w-72">
                <div className="h-3.5 w-full bg-[#f1e3e1] rounded mb-2" />
                <div className="h-3.5 w-48 bg-[#f1e3e1] rounded" />
              </div>
            </div>
          </div>

          {/* Input Bar */}
          <div className="pt-4 border-t border-rose-100/60 flex items-center gap-3">
            <div className="h-12 flex-1 rounded-full bg-white/70 border border-white/80 px-4 flex items-center">
              <div className="h-4 w-36 bg-[#f1e3e1]/60 rounded-md" />
            </div>
            <div className="w-12 h-12 rounded-full bg-[#800D32]/20 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

