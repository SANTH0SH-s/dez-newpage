"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DezproxLogo } from "@/components/ui/logo";
import { 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  Briefcase, 
  TrendingUp, 
  ChevronRight, 
  ArrowLeft,
  Menu,
  X,
  FileText,
  HelpCircle,
  FolderLock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { initDb } from "@/utils/db";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/pricing", label: "Pricing Components", icon: TrendingUp },
  { href: "/admin/multipliers", label: "Multiplier Set", icon: FolderLock },
  { href: "/admin/estimates", label: "Estimates", icon: FileText },
  { href: "/admin/enquiries", label: "Enquiries", icon: HelpCircle },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initDb();
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Generate breadcrumb text
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, index) => {
      const href = "/" + parts.slice(0, index + 1).join("/");
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
      return { href, label };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen bg-slate-50 font-sans relative overflow-hidden">
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
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
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

              {/* Back to Client Site */}
              <Link
                href="/"
                className="flex items-center justify-center space-x-2 w-full py-3.5 border border-gray-200 hover:border-dezprox-primary hover:bg-gray-50 rounded-full text-xs font-bold text-dezprox-primary transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Client Estimator</span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-64 border-r border-gray-100 bg-white/70 backdrop-blur-md p-6 z-20">
        <div className="space-y-8">
          <div className="py-2">
            <DezproxLogo showTagline={false} />
            <span className="text-[10px] uppercase font-bold tracking-widest text-dezprox-accent/80 ml-1">
              CMS Admin Workspace
            </span>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
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

        {/* Back to Client Site */}
        <Link
          href="/"
          className="flex items-center justify-center space-x-2 w-full py-3.5 border border-gray-200 hover:border-dezprox-primary hover:bg-gray-50 rounded-full text-xs font-bold text-dezprox-primary transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Client Estimator</span>
        </Link>
      </aside>

      {/* Right Column Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden z-10">
        {/* Sticky Header */}
        <header className="h-16 border-b border-gray-100 bg-white/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
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

          <div className="flex items-center space-x-4">
            {/* Quick Profile Badge */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-dezprox-primary text-dezprox-accent flex items-center justify-center font-bold text-xs shadow-sm border border-dezprox-accent/20">
                DX
              </div>
              <span className="hidden md:inline text-xs font-bold text-dezprox-primary">
                Administrator
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
