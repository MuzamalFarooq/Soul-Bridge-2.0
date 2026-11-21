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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 sm:px-4 pb-3 sm:pb-4 pt-1 pointer-events-none">
      <div className="rounded-full border border-[#641C35]/15 dark:border-[#FFF9F3]/15 shadow-xl p-1 sm:p-1.5 flex items-center justify-around pointer-events-auto backdrop-blur-2xl bg-[#FFF9F3]/95 dark:bg-[#1C1318]/95 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-colors duration-200 ${
                isActive
                  ? "bg-[#641C35] text-white shadow-xs"
                  : "text-[#887780] dark:text-[#C5B7BE] hover:text-[#641C35] dark:hover:text-[#FFF9F3]"
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? "fill-current" : ""}`} />
              <span className="text-[9px] font-medium mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
