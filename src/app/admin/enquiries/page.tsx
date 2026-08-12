"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Enquiry, Service } from "@/lib/types";
import { endpoints } from "@/lib/api/endpoints";
import { Search, Trash2, Eye, X, Phone, Mail, Building, Check, Clock } from "lucide-react";

export default function CustomerEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  
  // Details Modal state
  const [viewingEnquiry, setViewingEnquiry] = useState<Enquiry | null>(null);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await endpoints.adminGetEnquiries(1, 100);
      if (res.success && res.data) {
        setEnquiries(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEnquiries();
    endpoints.getPublicServices().then((res) => {
      if (res.success && res.data) {
        setServicesList(res.data);
      }
    }).catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await endpoints.adminDeleteEnquiry(id);
      fetchEnquiries();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to delete enquiry: ${err.message || err}`);
    }
  };

  const handleUpdateStatus = async (id: string, status: Enquiry["status"]) => {
    try {
      await endpoints.adminUpdateEnquiryStatus(id, status);
      fetchEnquiries();
      if (viewingEnquiry && viewingEnquiry.id === id) {
        setViewingEnquiry({ ...viewingEnquiry, status });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get service display names from ids
  const getServiceDisplayNames = (ids: string[]) => {
    return ids.map((id) => {
      const match = servicesList.find((s) => s.id === id);
      return match ? match.name : id;
    });
  };

  // Filter and search
  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch = 
      enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enq.company && enq.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || enq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
          Customer Enquiries
        </h1>
        <p className="text-dezprox-text/60 mt-1 text-sm">
          Respond to inbound service quote proposals and log customer contact requests.
        </p>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 border-gray-100 shadow-sm bg-white flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by customer name, company, email, or Enquiry ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            options={[
              { value: "all", label: "All Statuses" },
              { value: "pending", label: "Pending Contact" },
              { value: "contacted", label: "Contacted" },
              { value: "completed", label: "Completed" },
              { value: "archived", label: "Archived" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Enquiries Table */}
      <Card className="overflow-hidden border-gray-100 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-dezprox-primary font-bold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Lead Contact</th>
                <th className="p-4">Selected Services</th>
                <th className="p-4">Est. Bracket</th>
                <th className="p-4">Message</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No customer enquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-dezprox-primary">{enq.id}</td>
                    <td className="p-4">
                      <span className="font-bold text-dezprox-primary block">{enq.name}</span>
                      {enq.company && <span className="text-[10px] bg-gray-50 border border-gray-150 px-1.5 py-0.5 rounded text-gray-500 font-semibold">{enq.company}</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {getServiceDisplayNames(enq.selectedServices).map((s, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[9px] py-0.5">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-dezprox-primary whitespace-nowrap">
                      {enq.estimateRange}
                    </td>
                    <td className="p-4 max-w-xs truncate text-gray-500 font-normal">
                      {enq.message}
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={enq.status === "completed" || enq.status === "contacted" ? "accent" : "secondary"} 
                        className={`capitalize font-bold text-[10px] ${
                          enq.status === "contacted" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : ""
                        }`}
                      >
                        {enq.status === "contacted" ? "Contacted" : enq.status}
                      </Badge>
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setViewingEnquiry(enq)}
                        className="p-1.5 border border-gray-200 text-gray-500 rounded-lg hover:text-dezprox-primary hover:bg-gray-50 transition-all cursor-pointer"
                        title="View Enquiry Message"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(enq.id)}
                        className="p-1.5 border border-red-100 text-red-500 rounded-lg hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Viewing Modal Overlay */}
      {viewingEnquiry && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setViewingEnquiry(null)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-100 pb-4 mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Lead Enquiry Message</span>
              <h3 className="text-xl font-bold text-dezprox-primary mt-1">
                Ref ID: {viewingEnquiry.id}
              </h3>
            </div>

            <div className="space-y-6">
              {/* Contact Card */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-xs font-semibold text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-dezprox-primary">{viewingEnquiry.name}</span>
                </div>
                {viewingEnquiry.company && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Company: {viewingEnquiry.company}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${viewingEnquiry.email}`} className="text-dezprox-primary hover:underline">{viewingEnquiry.email}</a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Phone: {viewingEnquiry.phone}</span>
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Project Requirement Details</span>
                <p className="text-xs text-dezprox-text/75 bg-slate-50 border border-gray-100 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {viewingEnquiry.message || "(No project comments provided)"}
                </p>
              </div>

              {/* Selected summary */}
              <div className="flex justify-between items-center text-xs border border-gray-100 p-3 rounded-xl bg-slate-50/20">
                <div>
                  <span className="text-gray-400 block font-semibold">Estimate Range</span>
                  <span className="font-bold text-dezprox-primary text-sm">{viewingEnquiry.estimateRange}</span>
                </div>
                <Badge variant="accent">Inquiry Received</Badge>
              </div>

              {/* Status Update Controls */}
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => handleUpdateStatus(viewingEnquiry.id, "contacted")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewingEnquiry.status === "contacted"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50"
                  }`}
                >
                  <Phone className="w-3 h-3" />
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleUpdateStatus(viewingEnquiry.id, "completed")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewingEnquiry.status === "completed"
                      ? "bg-dezprox-primary text-white"
                      : "bg-white text-dezprox-primary border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Check className="w-3 h-3 text-dezprox-accent" />
                  Mark Completed
                </button>
                <button
                  onClick={() => handleUpdateStatus(viewingEnquiry.id, "pending")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewingEnquiry.status === "pending"
                      ? "bg-gray-400 text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Set Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
