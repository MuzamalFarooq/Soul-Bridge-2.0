"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import { useSocket } from "@/context/SocketContext";
import { Heart, Sun, Moon, Menu, X, User, LogOut, Shield, Crown, Bell, BellRing, MessageSquare, HeartHandshake, Eye } from "lucide-react";

const NOTIFICATION_ICONS = {
  MATCH: { icon: HeartHandshake, color: "text-primary-pink", bg: "bg-primary-pink/15" },
  MESSAGE: { icon: MessageSquare, color: "text-primary-purple", bg: "bg-primary-purple/15" },
  LIKE: { icon: Heart, color: "text-rose-400", bg: "bg-rose-400/15" },
  PROFILE_VIEW: { icon: Eye, color: "text-indigo-400", bg: "bg-indigo-400/15" },
  CALL_REQUEST: { icon: Bell, color: "text-emerald-400", bg: "bg-emerald-400/15" },
};

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { notifications, addNotification } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Count unread notifications
  const unreadCount = notifications.length - readCount;

  // Close dropdowns on outside click
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
    // Mark all as read when panel opens
    if (!notifOpen) {
      setReadCount(notifications.length);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-opacity-20 shadow-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative">
          <Heart className="w-8 h-8 text-primary-pink fill-primary-pink group-hover:scale-110 transition-transform duration-300" />
          <Heart className="w-8 h-8 text-primary-purple fill-primary-purple absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 blur-sm" />
        </div>
        <span className="text-2xl font-bold tracking-tight bg-gradient-premium bg-clip-text text-transparent">
          Soul Bridge
        </span>
      </Link>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className="text-sm font-medium hover:text-primary-pink transition-colors">
          Home
        </Link>
        {session ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary-pink transition-colors">
              Dashboard
            </Link>
            <Link href="/discover" className="text-sm font-medium hover:text-primary-pink transition-colors">
              Discover
            </Link>
            <Link href="/chat" className="text-sm font-medium hover:text-primary-pink transition-colors">
              Chat
            </Link>
          </>
        ) : (
          <>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary-pink transition-colors">
              How it Works
            </Link>
            <Link href="#features" className="text-sm font-medium hover:text-primary-pink transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary-pink transition-colors">
              Pricing
            </Link>
          </>
        )}
      </div>

      {/* Right-Side Actions */}
      <div className="hidden md:flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full glass-panel hover:bg-primary-pink hover:text-white transition-all duration-300 cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {session ? (
          <>
            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleOpenNotifs}
                className="relative p-2.5 rounded-full glass-panel hover:bg-primary-pink/20 hover:text-primary-pink transition-all duration-300 cursor-pointer"
                aria-label="Notifications"
              >
                {unreadCount > 0
                  ? <BellRing className="w-4 h-4 text-primary-pink animate-pulse" />
                  : <Bell className="w-4 h-4" />
                }
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary-pink text-white text-[9px] font-black flex items-center justify-center border-2 border-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-2 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <h4 className="text-xs font-bold flex items-center gap-1.5 text-foreground/80 uppercase tracking-wider">
                      <Bell className="w-3.5 h-3.5 text-primary-pink" />
                      Notifications
                    </h4>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-8 flex flex-col items-center text-center text-foreground/40 gap-2">
                      <Bell className="w-7 h-7 opacity-30" />
                      <p className="text-xs font-semibold">No notifications yet</p>
                      <p className="text-[10px]">Matches, messages and likes will appear here.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                      {notifications.map((notif) => {
                        const config = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.LIKE;
                        const IconComp = config.icon;
                        return (
                          <div
                            key={notif.id}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                              <IconComp className={`w-4 h-4 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground/90 leading-normal">{notif.content}</p>
                              <span className="text-[9px] text-foreground/40 font-semibold uppercase mt-0.5 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            {notif.link && (
                              <Link
                                href={notif.link}
                                onClick={() => setNotifOpen(false)}
                                className="text-[9px] shrink-0 px-2 py-1 rounded-lg bg-primary-pink/15 text-primary-pink hover:bg-primary-pink hover:text-white transition-all font-bold"
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

            {/* User Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel hover:border-primary-pink transition-all duration-300 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-premium flex items-center justify-center text-white text-xs font-semibold uppercase">
                  {session.user.fullName ? session.user.fullName[0] : (session.user.email ? session.user.email[0] : "U")}
                </div>
                <span className="text-xs font-semibold max-w-[100px] truncate">
                  {session.user.fullName || "My Account"}
                </span>
                {session.user.premiumStatus && session.user.premiumStatus !== "FREE" && (
                  <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl glass-panel p-2 shadow-xl border border-opacity-25 animate-in fade-in slide-in-from-top-2 duration-200">
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-purple hover:bg-opacity-20 text-sm transition-colors text-primary-purple"
                    >
                      <Shield className="w-4 h-4" /> Admin Console
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-pink hover:bg-opacity-20 text-sm transition-colors"
                  >
                    <User className="w-4 h-4" /> My Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm transition-colors"
                  >
                    <User className="w-4 h-4" /> Edit Profile
                  </Link>
                  <div className="h-px bg-white bg-opacity-10 my-1"></div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500 hover:bg-opacity-20 text-red-500 text-sm text-left transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold px-5 py-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-all"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-5 py-2.5 rounded-full bg-gradient-premium text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Sign Up Free
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <div className="flex md:hidden items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full glass-panel text-foreground"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        {session && (
          <button
            onClick={handleOpenNotifs}
            className="relative p-2 rounded-full glass-panel text-foreground"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary-pink text-white text-[8px] font-black flex items-center justify-center border border-background">
                {unreadCount}
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg glass-panel text-foreground"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[73px] left-0 right-0 glass-panel border-b p-6 flex flex-col gap-4 shadow-2xl md:hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold py-2 border-b border-white border-opacity-5"
          >
            Home
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold py-2 border-b border-white border-opacity-5"
              >
                Dashboard
              </Link>
              <Link
                href="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold py-2 border-b border-white border-opacity-5"
              >
                Discover Matches
              </Link>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold py-2 border-b border-white border-opacity-5"
              >
                Chat Conversations
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold py-2 border-b border-white border-opacity-5"
              >
                Edit Profile
              </Link>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold py-2 border-b border-white border-opacity-5 text-primary-purple"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left text-base font-semibold py-2 text-red-500 cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold py-2 border-b border-white border-opacity-5"
              >
                How it Works
              </Link>
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold py-2 border-b border-white border-opacity-5"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold py-2 border-b border-white border-opacity-5"
              >
                Pricing
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-foreground border-opacity-20 text-sm font-semibold"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-premium text-white text-sm font-semibold shadow-lg"
                >
                  Sign Up Free
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile Notification Panel (shown below header) */}
      {notifOpen && session && (
        <div className="absolute top-[73px] left-0 right-0 glass-panel border-b p-4 flex flex-col gap-2 shadow-2xl md:hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/60 px-2">Notifications</h4>
          {notifications.length === 0 ? (
            <p className="text-xs text-center text-foreground/40 py-4">No notifications yet.</p>
          ) : (
            notifications.slice(0, 5).map((notif) => {
              const config = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.LIKE;
              const IconComp = config.icon;
              return (
                <div key={notif.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5">
                  <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                    <IconComp className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>
                  <p className="text-xs text-foreground/80 leading-normal">{notif.content}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </nav>
  );
}
