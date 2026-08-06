"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { 
  getServices, 
  saveServices, 
  getGlobalSettings,
  Service,
  FAQItem
} from "@/utils/db";
import { Plus, Edit, Trash2, Copy, X, Save, HelpCircle, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQManager() {
  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  
  // Editor/Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<Partial<FAQItem> | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const list = getServices();
    setServices(list);
    if (list.length > 0) {
      setSelectedServiceId(list[0].id);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-8 font-sans animate-pulse">
        <div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  const activeService = services.find((s) => s.id === selectedServiceId);
  const faqs = activeService?.faqs || [];
  const sortedFAQs = [...faqs].sort((a, b) => a.displayOrder - b.displayOrder);

  const updateServiceFAQs = (updatedFAQs: FAQItem[]) => {
    if (!activeService) return;
    const updatedServices = services.map((s) => 
      s.id === activeService.id 
        ? { ...s, faqs: updatedFAQs } 
        : s
    );
    setServices(updatedServices);
    saveServices(updatedServices);
  };

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

  const handleDuplicate = (faq: FAQItem) => {
    const duplicated: FAQItem = {
      ...faq,
      id: `faq-${Math.floor(1000 + Math.random() * 9000)}`,
      question: `${faq.question} (Copy)`,
      displayOrder: faqs.length
    };
    const updated = [...faqs, duplicated];
    updateServiceFAQs(updated);
  };

  const handleDelete = (faqId: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      const updated = faqs
        .filter((f) => f.id !== faqId)
        .map((f, idx) => ({ ...f, displayOrder: idx })); // Adjust orders
      updateServiceFAQs(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService || !editingFAQ?.id || !editingFAQ.question || !editingFAQ.answer) return;

    const updated = [...faqs];
    const index = faqs.findIndex((f) => f.id === editingFAQ.id);

    const fullFAQ: FAQItem = {
      id: editingFAQ.id,
      question: editingFAQ.question,
      answer: editingFAQ.answer,
      displayOrder: editingFAQ.displayOrder ?? faqs.length,
      status: editingFAQ.status || "active"
    };

    if (index > -1) {
      updated[index] = fullFAQ;
    } else {
      updated.push(fullFAQ);
    }

    updateServiceFAQs(updated);
    setIsEditorOpen(false);
    setEditingFAQ(null);
  };

  // Drag and Drop reordering

  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const list = [...sortedFAQs];
    const draggedItem = list[draggedIdx];
    list.splice(draggedIdx, 1);
    list.splice(index, 0, draggedItem);

    // Re-assign displayOrder based on new positions
    const reordered = list.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }));

    setDraggedIdx(index);
    updateServiceFAQs(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
            FAQ Management
          </h1>
          <p className="text-dezprox-text/60 mt-1 text-sm">
            Create and organize accordion FAQs displayed under services in the estimator view.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          variant="accent"
          size="sm"
          className="flex items-center gap-2 cursor-pointer font-bold text-xs py-2.5 rounded-xl shadow-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Service FAQ
        </Button>
      </div>

      {/* Select Active Service Context */}
      <Card className="border-gray-150 shadow-sm bg-white p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Select Service Context
            </label>
            <Select
              options={services.map(s => ({ value: s.id, label: s.name }))}
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="max-w-md"
            />
          </div>
          {activeService && (
            <Badge variant="outline" className="px-3 py-1 font-bold text-[10px] uppercase border-gray-250/30">
              {faqs.length} FAQ{faqs.length === 1 ? "" : "s"} Configured
            </Badge>
          )}
        </div>
      </Card>

      {/* Accordion FAQs List */}
      <Card className="border-gray-150 shadow-sm bg-white rounded-2xl">
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-base font-bold text-dezprox-primary">
            Configure Accordions for {activeService?.name}
          </CardTitle>
          <CardDescription className="text-xs">
            Drag items using the handle on the left to reorder them in the customer estimator view.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-3">
            {sortedFAQs.map((faq, idx) => (
              <motion.div
                key={faq.id}
                layoutId={faq.id}
                className={`flex items-start justify-between border rounded-xl p-4 bg-white transition-shadow ${
                  faq.status === "inactive" ? "border-gray-100 opacity-60" : "border-gray-150 hover:shadow-sm"
                }`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-dezprox-primary p-1.5 rounded transition-colors shrink-0 mt-0.5">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <HelpCircle className="w-4 h-4 text-dezprox-accent shrink-0" />
                      <span className="font-bold text-dezprox-primary text-sm leading-tight">{faq.question}</span>
                      {faq.status === "inactive" && (
                        <Badge variant="outline" className="text-[8px] py-0 font-bold bg-gray-50 border-gray-200 text-gray-400">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-dezprox-text/60 mt-2 font-normal leading-relaxed">{faq.answer}</p>
                  </div>
                </div>

                 <div className="flex items-center space-x-1 pl-4 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(faq)}
                    className="w-8 h-8 p-0 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-dezprox-primary cursor-pointer flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDuplicate(faq)}
                    className="w-8 h-8 p-0 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-dezprox-primary cursor-pointer flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(faq.id)}
                    className="w-8 h-8 p-0 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}

            {faqs.length === 0 && (
              <div className="py-12 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
                <HelpCircle className="w-8 h-8 text-gray-300 mb-2 animate-bounce-slow" />
                <p className="text-xs text-gray-400 italic">No FAQs configured yet for this service.</p>
                <Button
                  onClick={handleOpenAdd}
                  variant="outline"
                  size="sm"
                  className="mt-3 font-bold text-[10px] uppercase border-dezprox-accent/20 text-dezprox-accent cursor-pointer"
                >
                  Create First Accordion
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editor Modal Drawer */}
      <AnimatePresence>
        {isEditorOpen && editingFAQ && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 overflow-y-auto border-l border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                  <h3 className="text-base font-extrabold text-dezprox-primary uppercase tracking-wider">
                    {faqs.some((f) => f.id === editingFAQ.id) ? "Modify Service FAQ" : "Add Service FAQ"}
                  </h3>
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Question */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Question Label</label>
                    <Input
                      required
                      placeholder="e.g. Do you support multi-language localizations?"
                      value={editingFAQ.question || ""}
                      onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                    />
                  </div>

                  {/* Answer */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Answer Details</label>
                    <Textarea
                      required
                      placeholder="Provide a clear, detailed answer..."
                      value={editingFAQ.answer || ""}
                      onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                      rows={4}
                    />
                  </div>

                  {/* Order & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Display Order</label>
                      <Input
                        type="number"
                        min="0"
                        value={editingFAQ.displayOrder ?? 0}
                        onChange={(e) => setEditingFAQ({ ...editingFAQ, displayOrder: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Status</label>
                      <Select
                        options={[
                          { value: "active", label: "Active" },
                          { value: "inactive", label: "Inactive" },
                        ]}
                        value={editingFAQ.status || "active"}
                        onChange={(e) => setEditingFAQ({ ...editingFAQ, status: e.target.value as "active" | "inactive" })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditorOpen(false)}
                      className="cursor-pointer font-bold text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="accent"
                      size="sm"
                      className="flex items-center gap-2 cursor-pointer font-bold text-xs"
                    >
                      <Save className="w-4 h-4" />
                      Save FAQ
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
