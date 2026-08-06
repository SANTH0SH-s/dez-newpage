"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DezproxLogo } from "@/components/ui/logo";
import { loginAdmin, getCurrentSession } from "@/utils/db";
import { Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If already logged in, redirect to admin index
    if (getCurrentSession()) {
      router.push("/admin");
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all credentials fields.");
      return;
    }

    const session = loginAdmin(email, password);
    if (session) {
      router.push("/admin");
    } else {
      setError("Invalid administrative credentials. Access Denied.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 font-sans">
      {/* Decorative premium brand accent blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-dezprox-accent/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border border-gray-150 shadow-xl bg-white text-dezprox-primary rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="flex justify-center mb-2">
              <DezproxLogo showTagline={false} />
            </div>
            <CardTitle className="text-xl font-black tracking-wider text-dezprox-primary">ADMIN PORTAL</CardTitle>
            <CardDescription className="text-dezprox-text/60 text-xs">
              CMS Service Pricing & Quotation Engine Control
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3.5 text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="admin@dezprox.com"
                    required
                    className="pl-10 bg-white border border-gray-200 text-dezprox-primary placeholder-gray-400 focus:border-dezprox-accent focus:ring-4 focus:ring-dezprox-accent/10 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="pl-10 pr-10 bg-white border border-gray-200 text-dezprox-primary placeholder-gray-400 focus:border-dezprox-accent focus:ring-4 focus:ring-dezprox-accent/10 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-dezprox-primary transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="accent"
                  className="w-full h-12 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs shadow-md rounded-xl"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Seed Credentials Helper Box */}
              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3.5 mt-4 text-center">
                <span className="text-[9px] font-black uppercase text-dezprox-accent block tracking-wider mb-1">Demo Credentials</span>
                <span className="text-[10px] text-dezprox-text/60 font-mono">admin@dezprox.com / admin123</span>
              </div>

              {/* Back to Client portal */}
              <div className="pt-3 text-center border-t border-gray-100">
                <a
                  href="/"
                  className="text-xs font-bold text-gray-400 hover:text-dezprox-accent transition-all duration-300 inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Client Estimator
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
