"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  getEstimates, 
  getServices, 
  getGlobalSettings,
  Estimate, 
  Service 
} from "@/lib/db";
import { 
  FileDown, 
  TrendingUp, 
  Users, 
  FileText, 
  Filter, 
  RefreshCw,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const [estimates] = useState<Estimate[]>(() => (typeof window !== "undefined" ? getEstimates() : []));
  const [services] = useState<Service[]>(() => (typeof window !== "undefined" ? getServices() : []));
  const [currency] = useState(() => (typeof window !== "undefined" ? getGlobalSettings().currency : "₹"));

  // Filters State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [customerQuery, setCustomerQuery] = useState("");

  // Filter Logic
  const filteredEstimates = estimates.filter((e) => {
    // Date filter
    if (startDate && new Date(e.createdDate) < new Date(startDate)) return false;
    if (endDate && new Date(e.createdDate) > new Date(endDate + "T23:59:59")) return false;

    // Status filter
    if (statusFilter !== "all" && e.status !== statusFilter) return false;

    // Service filter
    if (serviceFilter !== "all" && !e.serviceNames.some(name => name.toLowerCase().includes(serviceFilter.toLowerCase()))) return false;

    // Customer search
    if (customerQuery && !e.customerName.toLowerCase().includes(customerQuery.toLowerCase()) && !e.customerEmail.toLowerCase().includes(customerQuery.toLowerCase())) return false;

    return true;
  });

  // Calculate Metrics
  const totalRevenue = filteredEstimates.reduce((sum, e) => sum + e.totalPrice, 0);
  const totalEstimatesCount = filteredEstimates.length;
  
  const completedEstimates = filteredEstimates.filter(e => e.status === "completed" || e.status === "approved").length;
  const conversionRate = totalEstimatesCount > 0 ? Math.round((completedEstimates / totalEstimatesCount) * 100) : 0;

  // Most Selected Services Chart Data aggregation
  const serviceSelectionCounts: Record<string, number> = {};
  estimates.forEach(e => {
    e.serviceNames.forEach(name => {
      serviceSelectionCounts[name] = (serviceSelectionCounts[name] || 0) + 1;
    });
  });

  const servicesChartData = Object.entries(serviceSelectionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxServiceCount = Math.max(...servicesChartData.map(d => d.count), 1);

  // Status breakdown data aggregation
  const statusCounts: Record<string, number> = {
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0
  };
  filteredEstimates.forEach(e => {
    if (statusCounts[e.status] !== undefined) {
      statusCounts[e.status]++;
    }
  });

  // Monthly Comparison Aggregation
  const monthlyRevenue: Record<string, number> = {};
  estimates.forEach(e => {
    const d = new Date(e.createdDate);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" }); // e.g. "Jul 26"
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + e.totalPrice;
  });

  const monthlyChartData = Object.entries(monthlyRevenue)
    .map(([month, val]) => ({ month, val }))
    .slice(-6); // Last 6 months

  const maxMonthlyVal = Math.max(...monthlyChartData.map(d => d.val), 1);

  // Export handlers
  const handleExportCSV = () => {
    const headers = ["Proposal ID", "Customer Name", "Customer Email", "Total Quote Price", "Status", "Date Created"];
    const rows = filteredEstimates.map(e => [
      e.id,
      `"${e.customerName}"`,
      `"${e.customerEmail}"`,
      e.totalPrice,
      e.status,
      new Date(e.createdDate).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(",")].concat(rows.map(r => r.join(","))).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dezprox_revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    handleExportCSV();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setServiceFilter("all");
    setCustomerQuery("");
  };

  return (
    <div className="space-y-8 font-sans print:p-0">
      
      {/* Header toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
            System Reports & Analytics
          </h1>
          <p className="text-dezprox-text/60 mt-1 text-sm">
            Monitor conversion rates, monthly revenue gains, and selected services distributions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 cursor-pointer font-bold text-xs h-10 bg-white"
          >
            <FileDown className="w-4 h-4 text-dezprox-accent" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 cursor-pointer font-bold text-xs h-10 bg-white"
          >
            <FileDown className="w-4 h-4 text-dezprox-accent" />
            Excel
          </Button>
          <Button
            onClick={handlePrintPDF}
            variant="accent"
            className="flex items-center gap-1.5 cursor-pointer font-bold text-xs h-10 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Print PDF Report
          </Button>
        </div>
      </div>

      {/* Filter Options Drawer */}
      <Card className="p-5 border-gray-155 shadow-sm bg-white print:hidden">
        <div className="flex items-center space-x-2 pb-4 border-b border-gray-100 mb-5">
          <Filter className="w-4.5 h-4.5 text-dezprox-accent" />
          <h3 className="text-xs font-black text-dezprox-primary uppercase tracking-widest">Active Filters Panel</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Lead Status</label>
            <Select
              options={[
                { value: "all", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "completed", label: "Completed" },
                { value: "rejected", label: "Rejected" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          {/* Service filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Service</label>
            <Select
              options={[{ value: "all", label: "All Services" }].concat(
                services.map(s => ({ value: s.name, label: s.name }))
              )}
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            />
          </div>

          {/* Search bar */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Search Lead Name</label>
            <Input
              placeholder="Search by name, email..."
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              className="text-xs placeholder:text-gray-300"
            />
          </div>
        </div>

        {(startDate || endDate || statusFilter !== "all" || serviceFilter !== "all" || customerQuery) && (
          <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-gray-400 hover:text-dezprox-primary uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
            >
              <RefreshCw className="w-3 h-3" />
              Clear Filter Panel
            </button>
          </div>
        )}
      </Card>

      {/* Analytics KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Estimated Pipeline */}
        <Card className="p-5 border-gray-155 shadow-sm bg-white flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-gray-400">
            <TrendingUp className="w-4 h-4 text-dezprox-accent" />
            <span className="text-[10px] font-black uppercase tracking-wider block">Revenue Pipeline</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-dezprox-primary block tracking-tight">
              {currency}{Math.round(totalRevenue).toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wide">
              Selected filter sum
            </span>
          </div>
        </Card>

        {/* Lead Estimates Generated */}
        <Card className="p-5 border-gray-155 shadow-sm bg-white flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-gray-400">
            <FileText className="w-4 h-4 text-dezprox-accent" />
            <span className="text-[10px] font-black uppercase tracking-wider block">Total Inquiries</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-dezprox-primary block tracking-tight">
              {totalEstimatesCount}
            </span>
            <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wide">
              Estimates generated
            </span>
          </div>
        </Card>

        {/* Closed/Won Deals */}
        <Card className="p-5 border-gray-155 shadow-sm bg-white flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-gray-400">
            <Award className="w-4 h-4 text-dezprox-accent" />
            <span className="text-[10px] font-black uppercase tracking-wider block">Won Leads</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-dezprox-primary block tracking-tight">
              {completedEstimates}
            </span>
            <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wide">
              Approved or Completed
            </span>
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="p-5 border-gray-155 shadow-sm bg-white flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-gray-400">
            <Users className="w-4 h-4 text-dezprox-accent" />
            <span className="text-[10px] font-black uppercase tracking-wider block">Conversion Rate</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-dezprox-primary block tracking-tight animate-pulse">
              {conversionRate}%
            </span>
            <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wide">
              Lead sign-off weight
            </span>
          </div>
        </Card>
      </div>

      {/* Main Charts & Visual grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:grid-cols-1">
        {/* Service Popularity bar representation */}
        <Card className="border-gray-155 shadow-sm bg-white md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-black text-dezprox-primary uppercase tracking-wider">Top Configured Services</CardTitle>
            <CardDescription className="text-xs">Based on user selected choices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            {servicesChartData.length > 0 ? (
              servicesChartData.map((data, idx) => {
                const widthPercent = (data.count / maxServiceCount) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-dezprox-primary uppercase tracking-wider">
                      <span className="truncate pr-4">{data.name}</span>
                      <span className="shrink-0">{data.count} config{data.count === 1 ? "" : "s"}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-50 border border-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.08 }}
                        className="h-full bg-gradient-to-r from-dezprox-accent to-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">No service metrics logged.</div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart representation */}
        <Card className="border-gray-155 shadow-sm bg-white md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-black text-dezprox-primary uppercase tracking-wider">Monthly Revenue Analytics</CardTitle>
            <CardDescription className="text-xs">Last 6 months estimated project values</CardDescription>
          </CardHeader>
          <CardContent className="h-56 pb-4">
            {monthlyChartData.length > 0 ? (
              <div className="h-full flex items-end justify-between px-4 pt-4 relative">
                {/* Horizontal Guide lines */}
                <div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-full border-t border-dashed border-gray-100" />
                  ))}
                </div>

                {monthlyChartData.map((data, idx) => {
                  const heightPercent = (data.val / maxMonthlyVal) * 80; // Max height 80%
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end z-10">
                      <span className="text-[8px] font-black text-dezprox-primary mb-1 select-none">
                        {currency}{Math.round(data.val / 1000)}k
                      </span>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05, ease: "easeOut" }}
                        className="w-10 sm:w-14 bg-dezprox-primary text-white rounded-t-lg shadow-sm hover:opacity-90 cursor-pointer relative group flex justify-center items-end pb-1.5"
                      >
                        <span className="text-[6px] font-bold uppercase tracking-wider select-none hidden sm:block">Won</span>
                      </motion.div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 block select-none">
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">No monthly revenue logged.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Donut Chart and Monthly comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:grid-cols-1">
        
        {/* Estimate Status (Donut SVG Chart) */}
        <Card className="border-gray-155 shadow-sm bg-white md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-black text-dezprox-primary uppercase tracking-wider">Leads Status Weights</CardTitle>
            <CardDescription className="text-xs">Visual distribution of logged estimates status</CardDescription>
          </CardHeader>
          <CardContent className="h-56 flex flex-col items-center justify-center relative pb-6">
            {totalEstimatesCount > 0 ? (
              <div className="flex flex-col items-center w-full">
                <svg className="w-32 h-32 overflow-visible relative">
                  {(() => {
                    const total = filteredEstimates.length;
                    let accumulatedPercent = 0;
                    
                    const colors = {
                      pending: "#f59e0b",
                      approved: "#3b82f6",
                      completed: "#10b981",
                      rejected: "#ef4444"
                    };

                    return Object.entries(statusCounts).map(([status, count], idx) => {
                      if (count === 0) return null;
                      const percent = (count / total) * 100;
                      
                      const radius = 45;
                      const circ = 2 * Math.PI * radius;
                      const strokeDash = circ;
                      const strokeOffset = circ - (percent / 100) * circ;
                      const rotation = (accumulatedPercent / 100) * 360;
                      
                      accumulatedPercent += percent;

                      return (
                        <motion.circle 
                          key={status}
                          cx="64"
                          cy="64"
                          r={radius}
                          fill="transparent"
                          stroke={colors[status as keyof typeof colors] || "#cbd5e1"}
                          strokeWidth="10"
                          strokeDasharray={strokeDash}
                          initial={{ strokeDashoffset: circ }}
                          animate={{ strokeDashoffset: strokeOffset }}
                          transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                          style={{
                            transform: `rotate(${rotation - 90}deg)`,
                            transformOrigin: "64px 64px"
                          }}
                          className="hover:stroke-[12px] transition-all cursor-pointer"
                        />
                      );
                    });
                  })()}
                  
                  {/* Center Badge label */}
                  <circle cx="64" cy="64" r="35" className="fill-white" />
                  <text x="64" y="62" textAnchor="middle" className="text-xs font-black fill-dezprox-primary font-sans">
                    {totalEstimatesCount}
                  </text>
                  <text x="64" y="75" textAnchor="middle" className="text-[7px] font-black fill-gray-400 uppercase tracking-widest font-sans">
                    Leads Total
                  </text>
                </svg>

                {/* Donut Legend */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-4 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-amber-500" />
                    <span>Pending ({statusCounts.pending})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-blue-500" />
                    <span>Approved ({statusCounts.approved})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-emerald-500" />
                    <span>Completed ({statusCounts.completed})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-red-500" />
                    <span>Rejected ({statusCounts.rejected})</span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-400">No logged lead statuses.</span>
            )}
          </CardContent>
        </Card>

        {/* Ledger transaction logs dataset */}
        <Card className="border-gray-155 shadow-sm bg-white md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-black text-dezprox-primary uppercase tracking-wider">Filtered Audit Log</CardTitle>
            <CardDescription className="text-xs">Detailed records matching selected criteria</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto max-h-56 print:max-h-none print:overflow-visible">
              <table className="w-full text-left border-collapse text-[10px] font-semibold text-dezprox-primary">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-155 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Quote No</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Services</th>
                    <th className="py-2.5 px-4 text-right">Price</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEstimates.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50/50">
                      <td className="py-2 px-4 font-mono font-bold">{e.id}</td>
                      <td className="py-2 px-4">
                        <span className="font-extrabold block">{e.customerName}</span>
                        <span className="text-[9px] text-gray-400 block font-normal">{e.customerEmail}</span>
                      </td>
                      <td className="py-2 px-4 truncate max-w-[120px] font-normal">{e.serviceNames.join(", ")}</td>
                      <td className="py-2 px-4 text-right font-bold">{currency}{Math.round(e.totalPrice).toLocaleString()}</td>
                      <td className="py-2 px-4 text-center">
                        <Badge 
                          variant="secondary" 
                          className={`px-1.5 py-0.5 text-[8px] uppercase font-bold ${
                            e.status === "completed" 
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-250/20" 
                              : e.status === "pending" 
                              ? "bg-amber-50 text-amber-600 border border-amber-200" 
                              : e.status === "rejected"
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : "bg-blue-50 text-blue-600 border border-blue-200"
                          }`}
                        >
                          {e.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredEstimates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 italic">No matching ledger records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signature Approval lines during PDF exports */}
      <div className="hidden print:grid grid-cols-2 gap-8 pt-20 border-t border-gray-300 mt-20">
        <div>
          <div className="border-b border-gray-400 w-48 text-center pb-2 font-serif italic text-gray-400 select-none">
            Corporate Auditor
          </div>
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider mt-1 block">Internal Review Signatory</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="border-b border-gray-400 w-48 text-center pb-2 font-serif italic text-gray-400 select-none">
            Dezprox Admin System
          </div>
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider mt-1 mr-8 block">Authorized Seal</span>
        </div>
      </div>
    </div>
  );
}
