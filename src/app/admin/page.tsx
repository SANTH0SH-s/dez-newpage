"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  TrendingUp, 
  ArrowUpRight,
  Clock
} from "lucide-react";
import { 
  getServices, 
  getEstimates, 
  getEnquiries, 
  getGlobalSettings,
  Service,
  Estimate,
  Enquiry
} from "@/utils/db";

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [currency, setCurrency] = useState("₹");

  useEffect(() => {
    setServices(getServices());
    setEstimates(getEstimates());
    setEnquiries(getEnquiries());
    setCurrency(getGlobalSettings().currency);
  }, []);

  const totalServices = services.length;
  const totalEstimates = estimates.length;
  const pendingEnquiries = enquiries.filter(e => e.status === "pending").length;
  const completedEnquiries = enquiries.filter(e => e.status === "completed" || e.status === "archived").length;
  
  // Calculate total revenue from approved estimates
  const totalRevenue = estimates
    .filter(e => e.status === "approved" || e.status === "completed")
    .reduce((sum, e) => sum + e.totalPrice, 0);

  // Combine recent activities
  const recentActivities = [
    ...estimates.map(e => ({
      id: e.id,
      type: "estimate",
      title: `Estimate generated for ${e.customerName}`,
      detail: `${e.serviceNames.join(", ")} - ${currency}${Math.round(e.totalPrice).toLocaleString()}`,
      date: new Date(e.createdDate),
      status: e.status
    })),
    ...enquiries.map(e => ({
      id: e.id,
      type: "enquiry",
      title: `New enquiry from ${e.name}`,
      detail: e.message.length > 50 ? `${e.message.slice(0, 50)}...` : e.message,
      date: new Date(e.createdDate),
      status: e.status
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-dezprox-text/60 mt-1 text-sm">
          Overview of estimations, services metrics, and customer enquiries queues.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Services */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Services</span>
            <div className="p-2 bg-dezprox-primary/5 text-dezprox-primary rounded-xl">
              <Briefcase className="w-4 h-4 text-dezprox-accent" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-dezprox-primary">{totalServices}</span>
            <span className="text-xs text-gray-400 block mt-1">Configured items</span>
          </div>
        </Card>

        {/* Total Estimates */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Estimates</span>
            <div className="p-2 bg-dezprox-primary/5 text-dezprox-primary rounded-xl">
              <FileText className="w-4 h-4 text-dezprox-accent" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-dezprox-primary">{totalEstimates}</span>
            <span className="text-xs text-gray-400 block mt-1">Generated slips</span>
          </div>
        </Card>

        {/* Pending Enquiries */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Enquiries</span>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-dezprox-primary">{pendingEnquiries}</span>
            <span className="text-xs text-amber-600 font-bold block mt-1">Needs attention</span>
          </div>
        </Card>

        {/* Completed Enquiries */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-dezprox-primary">{completedEnquiries}</span>
            <span className="text-xs text-emerald-600 font-bold block mt-1">Total resolved</span>
          </div>
        </Card>

        {/* Revenue Overview */}
        <Card className="p-5 flex flex-col justify-between bg-dezprox-primary text-white border-none shadow-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-dezprox-accent uppercase tracking-wider">Est. Revenue</span>
            <div className="p-2 bg-white/10 text-white rounded-xl">
              <TrendingUp className="w-4 h-4 text-dezprox-accent" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-black">{currency}{totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-white/50 block mt-1">Approved contracts</span>
          </div>
        </Card>
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SVG Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold text-dezprox-primary">Revenue & Estimates Trend</CardTitle>
                <CardDescription className="text-xs">Estimate submissions activity over recent months</CardDescription>
              </div>
              <Badge variant="accent" className="text-[10px]">Live Data</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-64 flex items-end relative pt-4">
            {/* Draw inline vector SVG chart to maintain high performance and look extremely custom */}
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3FA740" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#3FA740" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />
              
              {/* Chart Line path */}
              <path
                d="M 0 170 Q 100 130 180 140 T 360 80 T 500 40"
                fill="none"
                stroke="rgb(23, 26, 53)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 170 Q 100 130 180 140 T 360 80 T 500 40 L 500 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Highlight Nodes */}
              <circle cx="180" cy="140" r="5" fill="#3FA740" stroke="white" strokeWidth="1.5" />
              <circle cx="360" cy="80" r="5" fill="#3FA740" stroke="white" strokeWidth="1.5" />
              <circle cx="500" cy="40" r="5" fill="#3FA740" stroke="white" strokeWidth="1.5" />
            </svg>
            
            {/* Custom chart labels */}
            <div className="absolute left-6 bottom-0 right-6 flex justify-between text-[10px] text-gray-400 font-bold font-sans">
              <span>May</span>
              <span>June</span>
              <span>July (Current)</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold text-dezprox-primary">Recent Action Feed</CardTitle>
            <CardDescription className="text-xs">Latest platform transactions logs</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {recentActivities.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-xs">No recent actions logged.</div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start space-x-3 text-xs">
                    <div className={`p-1.5 rounded-lg mt-0.5 ${
                      act.type === "estimate" ? "bg-indigo-50 text-indigo-500" : "bg-emerald-50 text-emerald-500"
                    }`}>
                      {act.type === "estimate" ? <FileText className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-dezprox-primary leading-tight truncate">{act.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{act.detail}</p>
                      <span className="text-[9px] text-gray-400 mt-1 block font-bold">
                        {act.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[9px] capitalize px-1.5 py-0">
                      {act.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
