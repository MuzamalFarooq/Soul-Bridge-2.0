"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import { useSocket } from "@/context/SocketContext";
import { 
  Heart, Sun, Moon, Menu, X, User, LogOut, Shield, Crown, 
  Bell, BellRing, MessageSquare, HeartHandshake, Eye, Settings, Sparkles, Search 
} from "lucide-react";
import NavbarSearch from "@/components/NavbarSearch";

const NOTIFICATION_ICONS = {
  MATCH: { icon: HeartHandshake, color: "text-[#FF4D8D]", bg: "bg-[#FF4D8D]/15" },
  MESSAGE: { icon: MessageSquare, color: "text-[#9C6BFF]", bg: "bg-[#9C6BFF]/15" },
  LIKE: { icon: Heart, color: "text-rose-400", bg: "bg-rose-400/15" },
  PROFILE_VIEW: { icon: Eye, color: "text-indigo-400", bg: "bg-indigo-400/15" },
  CALL_REQUEST: { icon: Bell, color: "text-emerald-400", bg: "bg-emerald-400/15" },
};

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.length - readCount;

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpenNotifs = () => {
    setNotifOpen((prev) => !prev);
    setDropdownOpen(false);
    if (!notifOpen) {
      setReadCount(notifications.length);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const navLinks = session
    ? [
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Discover", href: "/discover" },
        { label: "Chat", href: "/chat" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "How it Works", href: "#how-it-works" },
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
      ];

  return (
    <header className="sticky top-0 z-50 px-4 md:px-8 py-3.5 backdrop-blur-2xl bg-[#09090B]/85 border-b border-white/10 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-6">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer shrink-0">
          <div className="relative flex items-center justify-center">
            <Heart className="w-8 h-8 text-[#FF4D8D] fill-[#FF4D8D] group-hover:scale-110 transition-all duration-300 filter drop-shadow-[0_0_12px_rgba(255,77,141,0.6)]" />
            <Heart className="w-8 h-8 text-[#9C6BFF] fill-[#9C6BFF] absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 blur-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] via-[#FFB6C1] to-[#9C6BFF]">
              Soul Bridge
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <div className="hidden sm:block flex-1 max-w-xs md:max-w-sm lg:max-w-md">
          <NavbarSearch />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full glass-panel-lux border-white/10 shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white shadow-md shadow-pink-500/20"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Controls */}
        <div className="hidden md:flex items-center gap-3.5">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full glass-panel-lux text-white/80 hover:text-white hover:border-[#FF4D8D]/40 transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>

          {session ? (
            <>
              {/* Notifications Panel */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleOpenNotifs}
                  className="relative p-2.5 rounded-full glass-panel-lux text-white/80 hover:text-[#FF4D8D] hover:border-[#FF4D8D]/40 transition-all cursor-pointer"
                  aria-label="Notifications"
                >
                  {unreadCount > 0 ? (
                    <BellRing className="w-4 h-4 text-primary-pink animate-pulse" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary-pink text-white text-[9px] font-black flex items-center justify-center border-2 border-[#09090B]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-3xl glass-card-lux p-3 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 z-50 bg-[#09090B]/95">
                    <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary-pink" /> Notifications
                      </h4>
                      <span className="text-[10px] text-white/40 font-semibold">{notifications.length} Total</span>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="py-8 flex flex-col items-center text-center text-white/40 gap-2">
                        <Bell className="w-8 h-8 opacity-30" />
                        <p className="text-xs font-semibold">No notifications yet</p>
                        <p className="text-[10px]">Matches & likes will appear here.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
                        {notifications.map((notif) => {
                          const config = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.LIKE;
                          const IconComp = config.icon;
                          return (
                            <div
                              key={notif.id}
                              className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-white/5 transition-colors border border-white/5"
                            >
                              <div className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                                <IconComp className={`w-4 h-4 ${config.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-white/90 leading-snug">{notif.content}</p>
                                <span className="text-[9px] text-white/40 font-semibold uppercase mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              {notif.link && (
                                <Link
                                  href={notif.link}
                                  onClick={() => setNotifOpen(false)}
                                  className="text-[9px] shrink-0 px-2.5 py-1 rounded-full bg-[#FF4D8D]/20 text-[#FF4D8D] hover:bg-[#FF4D8D] hover:text-white transition-all font-bold"
                                >
                                  View
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Avatar + Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-card-lux hover:border-[#FF4D8D]/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] p-0.5 flex items-center justify-center text-white text-xs font-black uppercase shadow-md overflow-hidden shrink-0">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.fullName || "User"} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{session.user.fullName ? session.user.fullName[0] : "U"}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold max-w-[100px] truncate text-white">
                    {session.user.fullName || "Account"}
                  </span>
                  {session.user.premiumStatus && session.user.premiumStatus !== "FREE" && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-[220px] sm:w-56 rounded-3xl glass-card-lux p-2 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 z-50 bg-[#09090B]/95">
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-[#9C6BFF]/20 text-xs font-bold transition-all text-[#9C6BFF]"
                      >
                        <Shield className="w-4 h-4" /> Admin Console
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-[#FF4D8D]/20 text-xs font-bold transition-all text-white"
                    >
                      <User className="w-4 h-4 text-[#FF4D8D]" /> My Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-white/10 text-xs font-bold transition-all text-white/80"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-white/10 text-xs font-bold transition-all text-white/80"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <div className="h-px bg-white/10 my-1.5" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-rose-500/20 text-rose-400 text-xs font-bold text-left transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 hover:border-rose-500/50 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all duration-200 shadow-sm cursor-pointer active:scale-95"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-bold px-5 py-2.5 rounded-full hover:bg-white/10 transition-all text-white"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold px-6 py-2.5 rounded-full bg-linear-to-r from-[#FF4D8D] to-[#9C6BFF] text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }}
            className="p-2 rounded-full glass-panel-lux text-white/80 hover:text-white"
            aria-label="Toggle Search"
          >
            <Search className="w-4 h-4 text-[#FF4D8D]" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass-panel-lux text-white/80"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (mobileSearchOpen) setMobileSearchOpen(false);
            }}
            className="p-2 rounded-xl glass-panel-lux text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-4 pt-3 pb-2 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
          <NavbarSearch isMobile onCloseMobile={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 glass-card-lux border-b border-white/10 p-6 flex flex-col gap-3 shadow-2xl md:hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50 bg-[#09090B]/95 max-h-[85vh] overflow-y-auto">
          {/* Search bar inside drawer */}
          <div className="pb-3 border-b border-white/5">
            <NavbarSearch isMobile onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>

          {/* User Profile Header in Mobile Drawer if logged in */}
          {session && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mb-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] p-0.5 flex items-center justify-center text-white text-sm font-black uppercase shadow-md overflow-hidden shrink-0">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.fullName || "User"} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span>{session.user.fullName ? session.user.fullName[0] : "U"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-white truncate">{session.user.fullName || "User"}</p>
                  {session.user.premiumStatus && session.user.premiumStatus !== "FREE" && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-white/50 truncate">{session.user.email}</p>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold py-2.5 border-b border-white/5 text-white/90 hover:text-[#FF4D8D]"
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-sm font-bold py-2 text-[#9C6BFF] hover:text-[#b48eff]"
                >
                  <Shield className="w-4 h-4" /> Admin Console
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-bold py-2 text-white/80 hover:text-white"
              >
                <User className="w-4 h-4 text-[#FF4D8D]" /> My Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-bold py-2 text-white/80 hover:text-white"
              >
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 pt-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-2xl border border-white/15 text-xs font-bold text-white"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-2xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white text-xs font-bold shadow-lg"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
