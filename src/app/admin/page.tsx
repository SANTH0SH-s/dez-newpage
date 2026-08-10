"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  FileText, 
  Clock,
  Flame
} from "lucide-react";
import { 
  getServices, 
  getEstimates, 
  getGlobalSettings,
  Service,
  Estimate
} from "@/lib/db";

export default function AdminDashboard() {
  const [services] = useState<Service[]>(() => (typeof window !== "undefined" ? getServices() : []));
  const [estimates] = useState<Estimate[]>(() => (typeof window !== "undefined" ? getEstimates() : []));
  const [currency] = useState(() => (typeof window !== "undefined" ? getGlobalSettings().currency : "₹"));

  const totalServices = services.length;
  const totalEstimates = estimates.length;
  const pendingEstimates = estimates.filter(e => e.status === "pending").length;

  // Calculate service popularity based on estimate records
  const getPopularServices = () => {
    const counts: Record<string, number> = {};
    estimates.forEach((est) => {
      est.serviceNames.forEach((name) => {
        counts[name] = (counts[name] || 0) + 1;
      });
    });

    return services
      .map((srv) => ({
        name: srv.name,
        category: srv.category,
        count: counts[srv.name] || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  };

  const popularServices = getPopularServices();

  const recentEstimates = [...estimates]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-dezprox-text/60 mt-1 text-sm">
          Simple, clutter-free overview of platform configurations, estimates, and customer leads.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Services */}
        <Card className="p-5 flex flex-col justify-between border-gray-155 shadow-sm bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Services</span>
            <div className="p-2 bg-dezprox-accent/15 text-dezprox-primary rounded-xl">
              <Briefcase className="w-4 h-4 text-dezprox-accent" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-dezprox-primary">{totalServices}</span>
            <span className="text-xs text-gray-400 block mt-1">Configured items</span>
          </div>
        </Card>

        {/* Total Estimates */}
        <Card className="p-5 flex flex-col justify-between border-gray-155 shadow-sm bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Estimates & Leads</span>
            <div className="p-2 bg-dezprox-accent/15 text-dezprox-primary rounded-xl">
              <FileText className="w-4 h-4 text-dezprox-accent" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-dezprox-primary">{totalEstimates}</span>
            <span className="text-xs text-gray-400 block mt-1">Estimations generated</span>
          </div>
        </Card>

        {/* Pending Estimates */}
        <Card className="p-5 flex flex-col justify-between border-gray-155 shadow-sm bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Review</span>
            <div className="p-2 bg-amber-500/15 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-dezprox-primary">{pendingEstimates}</span>
            <span className="text-xs text-gray-400 block mt-1">Awaiting follow-up</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular Services Section */}
        <Card className="lg:col-span-1 border-gray-155 shadow-sm bg-white rounded-2xl">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-bold text-dezprox-primary flex items-center gap-2">
              <Flame className="w-4 h-4 text-dezprox-accent" />
              Popular Services
            </CardTitle>
            <CardDescription className="text-xs">Based on customer quotation choices</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-4">
              {popularServices.map((srv, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div>
                    <span className="font-bold text-xs text-dezprox-primary block">{srv.name}</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5 block">{srv.category}</span>
                  </div>
                  <Badge variant="outline" className="font-extrabold text-[10px] text-dezprox-primary px-2.5 py-0.5 border-gray-200">
                    {srv.count} Call{srv.count === 1 ? "" : "s"}
                  </Badge>
                </div>
              ))}
              {popularServices.length === 0 && (
                <div className="text-center text-xs text-gray-400 italic py-6">No estimations logged yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Estimates List */}
        <Card className="lg:col-span-2 border-gray-155 shadow-sm bg-white rounded-2xl">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-bold text-dezprox-primary">Recent Estimates & Customer Leads</CardTitle>
            <CardDescription className="text-xs">Latest pricing calculations and inbound proposals</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-4">
              {recentEstimates.map((est) => (
                <div key={est.id} className="flex items-start justify-between text-xs border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-dezprox-primary leading-tight truncate">{est.customerName}</p>
                      {est.customerCompany && (
                        <span className="text-[9px] bg-gray-50 border border-gray-150 px-1 rounded text-gray-500 font-bold">
                          {est.customerCompany}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 block truncate">
                      {est.serviceNames.join(", ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-dezprox-primary block">
                      {currency}{Math.round(est.totalPrice).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-gray-400 block font-bold mt-1">
                      {new Date(est.createdDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
              {recentEstimates.length === 0 && (
                <div className="text-center text-xs text-gray-400 italic py-6">No estimates generated yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
