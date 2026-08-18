"use client";

import React, { useState, useEffect } from "react";
import { AdminSkeleton } from "@/components/ui/admin-skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Service, FAQItem } from "@/lib/types";
import { Plus, Edit, Trash2, Copy, X, Save, HelpCircle, GripVertical } from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";

export default function FAQManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqsLoading, setFaqsLoading] = useState(false);
  
  // Editor/Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<Partial<FAQItem> | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const activeService = services.find((s) => s.id === selectedServiceId);
  const sortedFAQs = [...faqs].sort((a, b) => a.displayOrder - b.displayOrder);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await endpoints.adminGetServices();
      if (res.success && res.data && res.data.length > 0) {
        setServices(res.data);
        setSelectedServiceId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFAQs = async (serviceId: string) => {
    if (!serviceId) return;
    try {
      setFaqsLoading(true);
      const res = await endpoints.adminGetFAQs(serviceId);
      if (res.success && res.data) {
        setFaqs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFaqsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      fetchFAQs(selectedServiceId);
    }
  }, [selectedServiceId]);

  const handleOpenAdd = () => {
    setEditingFAQ({
      id: `faq-${Math.floor(1000 + Math.random() * 9000)}`,
      question: "",
      answer: "",
      displayOrder: faqs.length,
      status: "active"
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (faq: FAQItem) => {
    setEditingFAQ({ ...faq });
    setIsEditorOpen(true);
  };

  const handleDuplicate = async (faq: FAQItem) => {
    try {
      const duplicated = {
        ...faq,
        id: `faq-${Math.floor(1000 + Math.random() * 9000)}`,
        question: `${faq.question} (Copy)`,
        displayOrder: faqs.length
      };
      await endpoints.adminCreateFAQ(selectedServiceId, duplicated);
      fetchFAQs(selectedServiceId);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to duplicate FAQ: ${err.message || err}`);
    }
  };

  const handleDelete = async (faqId: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await endpoints.adminDeleteFAQ(faqId);
        fetchFAQs(selectedServiceId);
      } catch (err: any) {
        console.error(err);
        alert(`Failed to delete FAQ: ${err.message || err}`);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !editingFAQ?.id || !editingFAQ.question || !editingFAQ.answer) return;

    try {
      const isNew = !faqs.some((f) => f.id === editingFAQ.id);
      if (isNew) {
        await endpoints.adminCreateFAQ(selectedServiceId, editingFAQ);
      } else {
        await endpoints.adminUpdateFAQ(editingFAQ.id, editingFAQ);
      }
      fetchFAQs(selectedServiceId);
      setIsEditorOpen(false);
      setEditingFAQ(null);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save FAQ: ${err.message || err}`);
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const reordered = [...sortedFAQs];
    const draggedItem = reordered[draggedIdx];
    reordered.splice(draggedIdx, 1);
    reordered.splice(idx, 0, draggedItem);

    // optimistic update display order
    const updated = reordered.map((f, i) => ({ ...f, displayOrder: i }));
    setFaqs(updated);
    setDraggedIdx(idx);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    try {
      await Promise.all(faqs.map(f => endpoints.adminUpdateFAQ(f.id, { displayOrder: f.displayOrder })));
    } catch (err) {
      console.error("Failed to persist FAQ drag order:", err);
    }
  };

  if (loading) {
    return <AdminSkeleton />;
  }

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
          FAQ CMS Manager
        </h1>
        <p className="text-dezprox-text/60 mt-1 text-sm">
          Add, reorder, or edit helper FAQs linked to specific services.
        </p>
      </div>

      <Card className="p-6 border-gray-100 shadow-sm bg-white">
        <div className="max-w-md space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Select Service for FAQs
          </label>
          <Select
            options={services.map((s) => ({ value: s.id, label: s.name }))}
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          />
        </div>
      </Card>

      {activeService && (
        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-dezprox-primary">
                FAQs for {activeService.name}
              </CardTitle>
              <CardDescription className="text-xs">
                FAQs display at the bottom of the client estimator wizard for support. Drag handles to reorder.
              </CardDescription>
            </div>
            <Button
              onClick={handleOpenAdd}
              variant="accent"
              size="sm"
              className="flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add FAQ
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {faqsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dezprox-primary" />
              </div>
            ) : sortedFAQs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No FAQs configured.</p>
                <p className="text-xs text-gray-400 mt-1">FAQs will show on the frontend to handle user queries.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedFAQs.map((faq, idx) => (
                  <div
                    key={faq.id}
                    className={`flex items-center justify-between border border-gray-150 rounded-xl p-4 bg-white hover:shadow-sm transition-all ${
                      faq.status === "inactive" ? "opacity-60 border-gray-100" : ""
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0 pr-4">
                      <div className="cursor-grab active:cursor-grabbing text-gray-400 p-1.5 rounded hover:bg-slate-50 shrink-0 mt-0.5">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-dezprox-primary text-sm leading-snug">{faq.question}</span>
                          <Badge variant={faq.status === "active" ? "accent" : "outline"} className="text-[8px] py-0.5 tracking-wider uppercase">
                            {faq.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-2xl">{faq.answer}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 pl-2">
                      <button
                        onClick={() => handleDuplicate(faq)}
                        className="p-1.5 border border-gray-150 text-gray-400 hover:text-dezprox-primary rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(faq)}
                        className="p-1.5 border border-gray-150 text-gray-400 hover:text-dezprox-primary rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-1.5 border border-red-100 text-red-500 rounded-lg hover:text-red-650 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* FAQ Editor Modal Overlay */}
      {isEditorOpen && editingFAQ && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsEditorOpen(false)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-dezprox-primary mb-4">
              {faqs.some(f => f.id === editingFAQ.id) ? "Modify FAQ Block" : "Add FAQ Question"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Question */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Question Text</label>
                <Input
                  required
                  placeholder="e.g. Do you provide ongoing maintenance after project delivery?"
                  value={editingFAQ.question || ""}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                />
              </div>

              {/* Answer */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Answer Text</label>
                <Textarea
                  required
                  placeholder="Provide the detailed explanation/answer..."
                  value={editingFAQ.answer || ""}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Visibility Status</label>
                <Select
                  options={[
                    { value: "active", label: "Active & Published" },
                    { value: "inactive", label: "Inactive (Archived)" },
                  ]}
                  value={editingFAQ.status || "active"}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, status: e.target.value as any })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditorOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
