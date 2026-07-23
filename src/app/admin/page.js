"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield, Users, MessageSquare, Heart, TrendingUp, Activity,
  RefreshCw, Search, Ban, CheckCircle, Crown, AlertTriangle,
  ChevronLeft, ChevronRight, UserCheck, Sparkles, BarChart2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getAdminStats,
  getAdminUsers,
  updateUserStatusAction,
  updateUserRoleAction,
  getAdminActivityLogs
} from "@/actions/admin";

// ─────────────────────────────────────────────
// Stat Card Component
// ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-black">{value?.toLocaleString() ?? "—"}</p>
        <p className="text-xs text-foreground/60 font-semibold">{label}</p>
        {sub && <p className="text-[10px] text-foreground/40 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Signup Trend Mini Bar Chart
// ─────────────────────────────────────────────
function TrendChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-lg bg-gradient-premium transition-all duration-500"
            style={{ height: `${Math.max((d.count / max) * 52, 4)}px` }}
          />
          <span className="text-[8px] text-foreground/40 font-semibold">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    BANNED: "bg-red-500/15 text-red-400 border-red-500/25",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${styles[status] || "bg-white/5 text-foreground/50 border-white/10"}`}>
      {status}
    </span>
  );
}

function PremiumBadge({ status }) {
  if (!status || status === "FREE") return <span className="text-[9px] text-foreground/30">Free</span>;
  return (
    <span className="flex items-center gap-0.5 text-[9px] font-bold text-yellow-400">
      <Crown className="w-3 h-3 fill-yellow-400" /> {status}
    </span>
  );
}

// ─────────────────────────────────────────────
// Main Admin Page
// ─────────────────────────────────────────────
export default function AdminConsolePage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionFeedback, setActionFeedback] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview | users | activity

  // ── Load Stats ──────────────────────────────
  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, logsRes] = await Promise.all([
        getAdminStats(),
        getAdminActivityLogs({ limit: 15 })
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      else setError(statsRes.error || "Failed to load stats");

      if (logsRes.success) setActivityLogs(logsRes.logs);
    } catch (err) {
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load Users ───────────────────────────────
  const loadUsers = useCallback(async (page = 1) => {
    setUsersLoading(true);
    try {
      const res = await getAdminUsers({ page, search, status: statusFilter });
      if (res.success) {
        setUsers(res.users);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Load users error:", err);
    } finally {
      setUsersLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => {
    if (activeTab === "users") loadUsers(1);
  }, [activeTab, loadUsers]);

  // ── User Actions ─────────────────────────────
  const handleBanToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "BANNED" ? "ACTIVE" : "BANNED";
    const res = await updateUserStatusAction(userId, newStatus);
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(""), 3000);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Are you sure you want to make this user ${newRole}?`)) return;
    const res = await updateUserRoleAction(userId, newRole);
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(""), 3000);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers(1);
  };

  // ── Render ───────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-foreground/50">Loading admin console...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="p-6 rounded-2xl glass-card border border-red-500/20 max-w-sm text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold mb-1">Access Denied</h3>
            <p className="text-xs text-foreground/60">{error}</p>
            <Link href="/dashboard" className="mt-4 inline-block text-xs text-primary-pink hover:underline">
              Return to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary-purple" />
              Admin Console
            </h1>
            <p className="text-sm text-foreground/50 mt-1">
              Platform management and analytics for Soul Bridge administrators.
            </p>
          </div>

          <button
            onClick={loadStats}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>

        {/* Action Feedback Toast */}
        {actionFeedback && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4" /> {actionFeedback}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 glass-panel rounded-xl mb-8 w-fit">
          {[
            { id: "overview", label: "Overview", icon: BarChart2 },
            { id: "users", label: "User Management", icon: Users },
            { id: "activity", label: "Activity Logs", icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-premium text-white shadow-md"
                  : "text-foreground/60 hover:text-foreground hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && stats && (
          <div className="flex flex-col gap-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-primary-pink/15 text-primary-pink" />
              <StatCard icon={CheckCircle} label="Active Users" value={stats.activeUsers} color="bg-emerald-500/15 text-emerald-400" />
              <StatCard icon={Heart} label="Total Matches" value={stats.totalMatches} color="bg-rose-500/15 text-rose-400" />
              <StatCard icon={MessageSquare} label="Messages Sent" value={stats.totalMessages} color="bg-primary-purple/15 text-primary-purple" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={TrendingUp} label="Total Likes" value={stats.totalLikes} color="bg-orange-500/15 text-orange-400" />
              <StatCard icon={Crown} label="Premium Members" value={stats.premiumUsers} color="bg-yellow-500/15 text-yellow-400" />
              <StatCard icon={UserCheck} label="Email Verified" value={stats.verifiedUsers} color="bg-indigo-500/15 text-indigo-400" />
              <StatCard icon={Ban} label="Banned Users" value={stats.bannedUsers} color="bg-red-500/15 text-red-400" />
            </div>

            {/* Signup Trend Chart */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold text-sm mb-5 flex items-center gap-2 uppercase tracking-wider text-foreground/70">
                <TrendingUp className="w-4 h-4 text-primary-pink" /> 7-Day Signup Trend
              </h3>
              <TrendChart data={stats.signupTrend} />
              {stats.signupTrend?.every(d => d.count === 0) && (
                <p className="text-xs text-foreground/40 text-center mt-4">No new signups in the last 7 days.</p>
              )}
            </div>

            {/* Quick Platform Health */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold text-sm mb-5 flex items-center gap-2 uppercase tracking-wider text-primary-purple">
                <Sparkles className="w-4 h-4" /> Platform Health
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Match Rate",
                    value: stats.totalUsers > 0
                      ? `${Math.round((stats.totalMatches / Math.max(stats.totalLikes, 1)) * 100)}%`
                      : "N/A",
                    desc: "Likes that converted to matches",
                    color: "bg-emerald-500"
                  },
                  {
                    label: "Premium Rate",
                    value: stats.totalUsers > 0
                      ? `${Math.round((stats.premiumUsers / stats.totalUsers) * 100)}%`
                      : "N/A",
                    desc: "Users on a paid plan",
                    color: "bg-yellow-400"
                  },
                  {
                    label: "Verification Rate",
                    value: stats.totalUsers > 0
                      ? `${Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}%`
                      : "N/A",
                    desc: "Users with verified emails",
                    color: "bg-indigo-500"
                  }
                ].map((metric) => (
                  <div key={metric.label} className="glass-panel rounded-xl p-4 border border-white/5">
                    <p className="text-2xl font-black">{metric.value}</p>
                    <p className="text-xs font-bold text-foreground/80 mt-0.5">{metric.label}</p>
                    <p className="text-[10px] text-foreground/40 mt-1">{metric.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            {/* Search & Filter Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl glass-input text-sm bg-background min-w-[150px]"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="BANNED">Banned</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-premium text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Table */}
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      {["User", "Email", "Status", "Premium", "Role", "Matches", "Messages", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-foreground/40">
                          <div className="w-6 h-6 border-2 border-primary-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          Loading users...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-foreground/40">
                          No users found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-premium flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0">
                                {user.fullName ? user.fullName[0] : user.email[0]}
                              </div>
                              <div>
                                <p className="font-bold text-foreground/90">{user.fullName || "—"}</p>
                                <p className="text-[9px] text-foreground/40">@{user.username || "no username"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground/60 max-w-[160px] truncate">{user.email}</td>
                          <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                          <td className="px-4 py-3"><PremiumBadge status={user.premiumStatus} /></td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              user.role === "ADMIN"
                                ? "bg-primary-purple/15 text-primary-purple border-primary-purple/25"
                                : "bg-white/5 text-foreground/40 border-white/10"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">{user.matchesCount}</td>
                          <td className="px-4 py-3 font-bold">{user.messagesCount}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleBanToggle(user.id, user.status)}
                                title={user.status === "BANNED" ? "Unban User" : "Ban User"}
                                className={`p-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer border ${
                                  user.status === "BANNED"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                                    : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                                }`}
                              >
                                {user.status === "BANNED" ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleRoleToggle(user.id, user.role)}
                                title={user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                                className="p-1.5 rounded-lg border border-primary-purple/30 bg-primary-purple/10 text-primary-purple hover:bg-primary-purple hover:text-white transition-all cursor-pointer"
                              >
                                <Shield className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                  <span className="text-[10px] text-foreground/40">
                    Showing {((pagination.page - 1) * pagination.pageSize) + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} users
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => loadUsers(pagination.page - 1)}
                      className="p-1.5 rounded-lg glass-panel disabled:opacity-30 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold">{pagination.page} / {pagination.totalPages}</span>
                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => loadUsers(pagination.page + 1)}
                      className="p-1.5 rounded-lg glass-panel disabled:opacity-30 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ACTIVITY LOGS TAB ── */}
        {activeTab === "activity" && (
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground/80 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-primary-pink" /> Recent Platform Activity
              </h3>
            </div>
            <div className="flex flex-col divide-y divide-white/5">
              {activityLogs.length === 0 ? (
                <div className="py-12 text-center text-foreground/40">
                  <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-xs">No recent activity logs found.</p>
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary-pink shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground/80">{log.details || log.action}</p>
                        <p className="text-[10px] text-foreground/40 mt-0.5">
                          by <span className="text-foreground/60 font-bold">{log.userName}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-foreground/50 font-semibold uppercase">
                        {log.action}
                      </span>
                      <p className="text-[9px] text-foreground/30 mt-1">
                        {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
