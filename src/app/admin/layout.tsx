"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DezproxLogo } from "@/components/ui/logo";
import { 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  Briefcase, 
  ChevronRight,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  FileText,
  HelpCircle,
  FolderLock,
  Layers,
  PlusCircle,
  BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { initDb, getCurrentSession, logoutAdmin, hasAccessToRoute, UserSession, updateAdminPassword } from "@/lib/db";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/packages", label: "Packages", icon: Layers },
  { href: "/admin/questions", label: "Questionnaire", icon: HelpCircle },
  { href: "/admin/addons", label: "Add-ons", icon: PlusCircle },
  { href: "/admin/multipliers", label: "Multiplier Set", icon: FolderLock },
  { href: "/admin/estimates", label: "Estimates", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    initDb();

    const timer = setTimeout(() => {
      setIsMounted(true);
      const activeSession = getCurrentSession();
      setSession(activeSession);
      setLoading(!activeSession);

      if (!activeSession) {
        if (pathname !== "/admin/login" && pathname !== "/admin/unauthorized") {
          router.push("/admin/login");
        }
      } else {
        if (pathname === "/admin/login") {
          router.push("/admin");
        } else {
          const hasAccess = hasAccessToRoute(activeSession.role, pathname);
          if (!hasAccess && pathname !== "/admin/unauthorized") {
            router.push("/admin/unauthorized");
          }
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname, router]);


  const handleLogout = () => {
    logoutAdmin();
    router.push("/admin/login");
  };

  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/unauthorized";

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Filter navigation links based on roles
  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (!session) return false;
    return hasAccessToRoute(session.role, item.href);
  });

  // Generate breadcrumb text
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "admin") {
      parts.shift();
    }
    return parts.map((part, index) => {
      const href = "/admin/" + parts.slice(0, index + 1).join("/");
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
      return { href, label };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen bg-slate-50 font-sans relative overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      {!isMounted || loading ? (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Decorative background blurs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-dezprox-accent/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl" />

          <div className="flex flex-col items-center space-y-4 z-10">
            <div className="w-8 h-8 rounded-full border-2 border-dezprox-accent border-t-transparent animate-spin" />
            <div className="text-center">
              <span className="text-sm font-black tracking-widest text-dezprox-primary block uppercase">DEZPROX</span>
              <span className="text-[9px] font-bold tracking-[0.24em] text-gray-400 uppercase mt-1 block">Dream | Design | Deploy</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Sidebar Overlay Drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-gray-100 z-50 p-6 flex flex-col justify-between backdrop-blur-md bg-white/95"
                >
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <DezproxLogo showTagline={false} />
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1 text-gray-500 hover:text-dezprox-primary"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <nav className="space-y-1">
                      {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                              isActive 
                                ? "bg-dezprox-primary text-white shadow-card" 
                                : "text-dezprox-text/60 hover:text-dezprox-primary hover:bg-gray-100/50"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? "text-dezprox-accent" : "text-gray-400"}`} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>

                  {/* User profile & Mobile Logout */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <Link
                      href="/"
                      className="flex items-center justify-center space-x-2 w-full py-3.5 border border-gray-200 hover:border-dezprox-primary hover:bg-gray-50 rounded-full text-xs font-bold text-dezprox-primary transition-all active:scale-95"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Client Estimator</span>
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col justify-between w-64 border-r border-gray-100 bg-white/70 backdrop-blur-md p-6 z-20 print:hidden">
            <div className="space-y-8">
              <div className="py-2">
                <DezproxLogo showTagline={false} />
                <span className="text-[10px] uppercase font-bold tracking-widest text-dezprox-accent/80 ml-1">
                  CMS Admin Workspace
                </span>
              </div>

              <nav className="space-y-1">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                        isActive 
                          ? "bg-dezprox-primary text-white shadow-card" 
                          : "text-dezprox-text/60 hover:text-dezprox-primary hover:bg-gray-100/50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-dezprox-accent" : "text-gray-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User profile & Desktop Logout */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Link
                href="/"
                className="flex items-center justify-center space-x-2 w-full py-3.5 border border-gray-200 hover:border-dezprox-primary hover:bg-gray-50 rounded-full text-xs font-bold text-dezprox-primary transition-all active:scale-95 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Client Estimator</span>
              </Link>
            </div>
          </aside>

          {/* Right Column Layout */}
          <div className="flex-1 flex flex-col h-full overflow-hidden z-10 print:h-auto print:overflow-visible">
            {/* Sticky Header */}
            <header className="h-16 border-b border-gray-100 bg-white/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 print:hidden">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1 text-gray-500 hover:text-dezprox-primary lg:hidden"
                >
                  <Menu className="w-6 h-6" />
                </button>

                {/* Breadcrumb Navigation */}
                <nav className="flex items-center space-x-1.5 text-xs font-semibold text-gray-400 font-sans">
                  <Link href="/admin" className="hover:text-dezprox-primary transition-colors">
                    Admin
                  </Link>
                  {breadcrumbs.map((bc, idx) => (
                    <React.Fragment key={bc.href}>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <Link 
                        href={bc.href}
                        className={`hover:text-dezprox-primary transition-colors ${
                          idx === breadcrumbs.length - 1 ? "text-dezprox-primary font-bold" : ""
                        }`}
                      >
                        {bc.label}
                      </Link>
                    </React.Fragment>
                  ))}
                </nav>
              </div>

              <div className="flex items-center space-x-4 relative">
                {/* Quick Profile Badge */}
                {session && (
                  <div 
                    className="flex items-center space-x-2 cursor-pointer select-none p-1.5 hover:bg-slate-100 rounded-xl transition-all"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <div className="w-8 h-8 rounded-full bg-dezprox-primary text-dezprox-accent flex items-center justify-center font-bold text-xs shadow-sm border border-dezprox-accent/20">
                      A
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-bold text-dezprox-primary">
                        Administrator
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold truncate max-w-[120px]">
                        {session.email}
                      </span>
                    </div>
                  </div>
                )}

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && session && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-12 w-56 bg-white border border-gray-150 rounded-2xl shadow-lg p-3 space-y-2 z-40 font-sans"
                      >
                        <div className="px-2 py-1.5 border-b border-gray-100 pb-2">
                          <p className="text-xs font-black text-dezprox-primary">Administrator</p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{session.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setPasswordModalOpen(true);
                          }}
                          className="flex items-center space-x-2 w-full px-2 py-2 text-xs font-bold text-gray-600 hover:bg-slate-50 hover:text-dezprox-primary rounded-lg transition-colors cursor-pointer text-left border-none bg-transparent"
                        >
                          <SettingsIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>Change Password</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-2 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left border-none bg-transparent"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </header>

            {/* Scrollable Content Viewport */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 print:p-0 print:overflow-visible">
              <div className="max-w-6xl mx-auto space-y-8">
                {children}
              </div>
            </main>
          </div>
          {/* Change Password Modal */}
          <AnimatePresence>
            {passwordModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-sans">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setPasswordModalOpen(false);
                    setPasswordChangeSuccess(false);
                    setNewPassword("");
                  }}
                  className="absolute inset-0 bg-black"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-gray-100 shadow-2xl space-y-6 z-10"
                >
                  <div>
                    <h3 className="text-base font-extrabold text-dezprox-primary">
                      Change Password
                    </h3>
                    <p className="text-[11px] text-gray-400 leading-normal mt-1 font-normal">
                      Configure a new password for the admin workspace.
                    </p>
                  </div>

                  {passwordChangeSuccess ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-2xl font-bold flex items-center space-x-2">
                        <span className="text-emerald-500 font-extrabold text-sm">✓</span>
                        <span>Password updated successfully!</span>
                      </div>
                      <Button
                        onClick={() => {
                          setPasswordModalOpen(false);
                          setPasswordChangeSuccess(false);
                          setNewPassword("");
                        }}
                        className="w-full font-bold text-xs py-3 rounded-full"
                        variant="primary"
                      >
                        Close
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                          New Password
                        </label>
                        <Input
                          type="password"
                          placeholder="Enter new password..."
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full text-xs"
                        />
                      </div>
                      <div className="flex space-x-3 pt-2">
                        <Button
                          onClick={() => {
                            setPasswordModalOpen(false);
                            setNewPassword("");
                          }}
                          variant="outline"
                          className="w-1/2 font-bold text-xs py-3 rounded-full cursor-pointer"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (newPassword.trim().length >= 6) {
                              updateAdminPassword(newPassword.trim());
                              setPasswordChangeSuccess(true);
                            } else {
                              alert("Password must be at least 6 characters.");
                            }
                          }}
                          variant="accent"
                          className="w-1/2 font-bold text-xs py-3 rounded-full cursor-pointer"
                        >
                          Save Password
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
