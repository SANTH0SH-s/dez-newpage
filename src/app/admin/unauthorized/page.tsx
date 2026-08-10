"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { logoutAdmin } from "@/lib/db";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = () => {
    logoutAdmin();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 font-sans relative">
      <div className="w-full max-w-md">
        <Card className="border-gray-200/80 shadow-xl overflow-hidden rounded-2xl bg-white text-center p-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-5 text-red-500 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <Badge variant="secondary" className="px-3 py-1 bg-red-50 border-red-100 text-red-700 font-bold uppercase tracking-widest text-[9px] mb-3">
            Access Denied
          </Badge>

          <h1 className="text-xl font-extrabold text-dezprox-primary tracking-tight mb-2">
            Insufficient Permissions
          </h1>
          
          <p className="text-xs text-dezprox-text/60 max-w-sm mx-auto leading-relaxed mb-8">
            Your assigned user role does not possess permissions to access this control page. Please contact a Super Admin to adjust credentials.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/admin")}
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs py-3.5 border-gray-150 hover:bg-gray-50 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Admin Dashboard
            </Button>
            
            <Button
              variant="accent"
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs py-3.5 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
