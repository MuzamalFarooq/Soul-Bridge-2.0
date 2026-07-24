"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Compass, MessageSquare, LayoutDashboard, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const navItems = [
    { label: "Feed", href: "/", icon: Heart },
    { label: "Discover", href: "/discover", icon: Compass },
    { label: "Chat", href: "/chat", icon: MessageSquare },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-1 pointer-events-none">
      <div className="glass-card-lux rounded-full border border-white/10 shadow-2xl p-1.5 flex items-center justify-around pointer-events-auto backdrop-blur-2xl bg-[#09090B]/85">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white shadow-lg shadow-pink-500/25 scale-105"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
              <span className="text-[9px] font-bold mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
