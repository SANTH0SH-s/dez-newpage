"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Service, Question, QuestionOption } from "@/lib/types";
import { Plus, Edit, Trash2, Copy, X, Save, HelpCircle, GripVertical, Eye } from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";

export default function QuestionnaireBuilder() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("general");
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [currency, setCurrency] = useState("₹");
  
  // Editor/Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  
  // Option creator sub-states
  const [optionValue, setOptionValue] = useState("");
  const [optionLabel, setOptionLabel] = useState("");
  const [optionPrice, setOptionPrice] = useState(0);
  const [optionType, setOptionType] = useState<"flat" | "multiplier">("flat");
  const [optionDesc, setOptionDesc] = useState("");

  // Drag and drop helper state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const activeService = services.find((s) => s.id === selectedServiceId);
  const packagesList = activeService?.packages || [];
  
  // Retrieve target questions list depending on context (Service vs Package)
  const isPackageContext = selectedPackageId !== "general";
  const activePackage = packagesList.find((p) => p.id === selectedPackageId);

  const getActiveQuestionsList = (): Question[] => {
    if (isPackageContext) {
      return allQuestions.filter(q => q.packageId === selectedPackageId);
    }
    return allQuestions.filter(q => !q.packageId);
  };

  const activeQuestions = getActiveQuestionsList();
  const sortedQuestions = [...activeQuestions].sort((a, b) => a.displayOrder - b.displayOrder);

  const availableParentQuestions = (isPackageContext 
    ? allQuestions
    : allQuestions.filter(q => !q.packageId)
  ).filter((q) => q.id !== editingQuestion?.id);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await endpoints.adminGetServices();
      if (res.success && res.data && res.data.length > 0) {
        setServices(res.data);
        setSelectedServiceId(res.data[0].id);
      }
      const settingsRes = await endpoints.adminGetSettings();
      if (settingsRes.success && settingsRes.data) {
        setCurrency(settingsRes.data.currency);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (serviceId: string) => {
    if (!serviceId) return;
    try {
      setQuestionsLoading(true);
      const res = await endpoints.adminGetQuestions(serviceId);
      if (res.success && res.data) {
        setAllQuestions(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      fetchQuestions(selectedServiceId);
    }
  }, [selectedServiceId]);

  const handleOpenAdd = () => {
    setEditingQuestion({
      id: `q-${Math.floor(1000 + Math.random() * 9000)}`,
      text: "",
      description: "",
      type: "radio",
      isRequired: false,
      displayOrder: activeQuestions.length,
      defaultValue: "",
      priceModifier: 0,
      modifierType: "flat",
      conditionalParentId: null,
      conditionalParentValue: null,
      packageId: isPackageContext ? selectedPackageId : null,
      validationRules: { min: null, max: null, pattern: null, message: null },
      options: []
    });
    setOptionValue("");
    setOptionLabel("");
    setOptionPrice(0);
    setOptionType("flat");
    setOptionDesc("");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion({
      ...q,
      validationRules: q.validationRules || { min: null, max: null, pattern: null, message: null }
    });
    setOptionValue("");
    setOptionLabel("");
    setOptionPrice(0);
    setOptionType("flat");
    setOptionDesc("");
    setIsEditorOpen(true);
  };

  const handleDelete = async (qId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await endpoints.adminDeleteQuestion(qId);
        fetchQuestions(selectedServiceId);
      } catch (err: any) {
        console.error(err);
        alert(`Failed to delete question: ${err.message || err}`);
      }
    }
  };

  const handleDuplicate = async (q: Question) => {
    try {
      const duplicated: Question = {
        ...q,
        id: `q-${Math.floor(1000 + Math.random() * 9000)}`,
        text: `${q.text} (Copy)`,
        displayOrder: activeQuestions.length
      };
      await endpoints.adminCreateQuestion(selectedServiceId, duplicated);
      fetchQuestions(selectedServiceId);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to duplicate question: ${err.message || err}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !editingQuestion?.id || !editingQuestion.text) return;

    try {
      const isNew = !allQuestions.some((q) => q.id === editingQuestion.id);
      
      const payload = {
        ...editingQuestion,
        packageId: isPackageContext ? selectedPackageId : null
      };

      if (isNew) {
        await endpoints.adminCreateQuestion(selectedServiceId, payload);
      } else {
        await endpoints.adminUpdateQuestion(editingQuestion.id, payload);
      }
      fetchQuestions(selectedServiceId);
      setIsEditorOpen(false);
      setEditingQuestion(null);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save question: ${err.message || err}`);
    }
  };

  const handleAddOption = () => {
    if (!optionValue.trim() || !optionLabel.trim() || !editingQuestion) return;
    const currentOptions = editingQuestion.options || [];
    
    const newOption: QuestionOption = {
      value: optionValue.trim(),
      label: optionLabel.trim(),
      priceModifier: optionPrice,
      modifierType: optionType,
      description: optionDesc.trim() || undefined
    };

    setEditingQuestion({
      ...editingQuestion,
      options: [...currentOptions, newOption]
    });

    setOptionValue("");
    setOptionLabel("");
    setOptionPrice(0);
    setOptionType("flat");
    setOptionDesc("");
  };

  const handleRemoveOption = (index: number) => {
    if (!editingQuestion) return;
    const currentOptions = editingQuestion.options || [];
    setEditingQuestion({
      ...editingQuestion,
      options: currentOptions.filter((_, idx) => idx !== index)
    });
  };

  // Drag and Drop implementation
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;

    const reordered = [...sortedQuestions];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(idx, 0, draggedItem);

    // optimistic update display order
    const updated = reordered.map((q, i) => ({ ...q, displayOrder: i }));
    setAllQuestions(prev => {
      const untouched = prev.filter(q => !sortedQuestions.some(sq => sq.id === q.id));
      return [...untouched, ...updated];
    });
    setDraggedIndex(idx);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      await Promise.all(sortedQuestions.map(q => endpoints.adminUpdateQuestion(q.id, { displayOrder: q.displayOrder })));
    } catch (err) {
      console.error("Failed to persist question drag order:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dezprox-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
          Questionnaire CMS Builder
        </h1>
        <p className="text-dezprox-text/60 mt-1 text-sm">
          Construct custom inputs, multipliers, validation rules, and visibility parameters.
        </p>
      </div>

      {/* Select Context (Service + Package selector) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service */}
        <Card className="p-6 border-gray-100 shadow-sm bg-white">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              1. Choose Service
            </label>
            <Select
              options={services.map((s) => ({ value: s.id, label: s.name }))}
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setSelectedPackageId("general");
              }}
            />
          </div>
        </Card>

        {/* Package Context (Optional) */}
        <Card className="p-6 border-gray-100 shadow-sm bg-white">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              2. Choose Context (Optional)
            </label>
            <Select
              options={[
                { value: "general", label: "None - General Service Questions" },
                ...packagesList.map((p) => ({ value: p.id, label: `Package: ${p.name}` }))
              ]}
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
            />
          </div>
        </Card>
      </div>

      {/* Questions Stack Panel */}
      {activeService && (
        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-dezprox-primary">
                {isPackageContext ? `Questions for Package: ${activePackage?.name}` : `General Questions for ${activeService.name}`}
              </CardTitle>
              <CardDescription className="text-xs">
                Visual display order inside the step configuration screen. Drag handles to sort.
              </CardDescription>
            </div>
            <Button
              onClick={handleOpenAdd}
              variant="accent"
              size="sm"
              className="flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            {questionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dezprox-primary" />
              </div>
            ) : sortedQuestions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No questions built for this context.</p>
                <p className="text-xs text-gray-400 mt-1">Questions will render inside the step-by-step wizard questionnaire.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between border border-gray-150 rounded-xl p-4 bg-white hover:shadow-sm transition-all"
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="cursor-grab active:cursor-grabbing text-gray-400 p-1 rounded hover:bg-slate-50 shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-dezprox-primary text-sm">{q.text}</span>
                          <Badge variant="outline" className="text-[9px] uppercase font-black tracking-wider text-gray-500 py-0.5">{q.type}</Badge>
                          {q.isRequired && (
                            <Badge variant="secondary" className="text-[9px] font-black uppercase text-red-600 bg-red-50 py-0.5">Required</Badge>
                          )}
                          {q.conditionalParentId && (
                            <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600 bg-amber-50/20 py-0.5">Conditional</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-1">{q.description || "No description provided."}</p>

                        {/* Options preview if applicable */}
                        {q.options && q.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {q.options.map((opt, oIdx) => (
                              <span key={oIdx} className="inline-flex items-center px-2 py-0.5 bg-slate-55 border rounded text-[9.5px] font-bold text-dezprox-primary">
                                {opt.label} 
                                {opt.priceModifier !== 0 && (
                                  <span className="text-[8.5px] text-dezprox-accent ml-1 font-black">
                                    ({opt.priceModifier > 0 ? "+" : ""}{opt.modifierType === "multiplier" ? `x${opt.priceModifier}` : `${currency}${opt.priceModifier.toLocaleString()}`})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pl-4">
                      {q.priceModifier !== undefined && q.priceModifier !== null && q.priceModifier !== 0 && (
                        <span className="text-xs font-bold text-dezprox-accent bg-amber-50/50 border border-amber-100 rounded-md px-2 py-0.5 whitespace-nowrap">
                          {q.priceModifier > 0 ? "+" : ""}{q.modifierType === "multiplier" ? `x${q.priceModifier}` : `${currency}${q.priceModifier}`}
                        </span>
                      )}

                      <div className="flex items-center space-x-0.5">
                        <button
                          onClick={() => handleDuplicate(q)}
                          className="p-1.5 border border-gray-150 text-gray-400 hover:text-dezprox-primary rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 border border-gray-150 text-gray-400 hover:text-dezprox-primary rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 border border-red-100 text-red-500 rounded-lg hover:text-red-650 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Question Editor Dialog Modal */}
      {isEditorOpen && editingQuestion && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-2xl w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => setIsEditorOpen(false)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-dezprox-primary mb-4">
              {allQuestions.some(q => q.id === editingQuestion.id) ? "Modify Questionnaire Step" : "Configure Custom Input"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Question Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Question Title / Prompt</label>
                <Input
                  required
                  placeholder="e.g. How many user roles do you expect in the system?"
                  value={editingQuestion.text || ""}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description / Contextual Help (Optional)</label>
                <Input
                  placeholder="e.g. Administrators, Managers, End Clients, etc."
                  value={editingQuestion.description || ""}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Input Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Field Input Type</label>
                  <Select
                    options={[
                      { value: "radio", label: "Radio (Single Choice)" },
                      { value: "checkbox", label: "Checkbox (Multi Choice)" },
                      { value: "select", label: "Select (Dropdown)" },
                      { value: "counter", label: "Counter (Numeric +/-)" },
                      { value: "number", label: "Number Input" },
                      { value: "text", label: "Text Field" },
                      { value: "toggle", label: "Toggle Switch" },
                    ]}
                    value={editingQuestion.type || "radio"}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })}
                  />
                </div>

                {/* Default Value */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Default Value (Optional)</label>
                  <Input
                    placeholder="e.g. 1, true, or option-value"
                    value={editingQuestion.defaultValue !== undefined ? String(editingQuestion.defaultValue) : ""}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, defaultValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 py-2 bg-slate-50/50 border border-slate-100 rounded-xl px-4">
                <label className="flex items-center space-x-2 text-xs font-bold text-dezprox-primary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingQuestion.isRequired || false}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, isRequired: e.target.checked })}
                    className="rounded text-dezprox-accent focus:ring-dezprox-accent/20 border-gray-300 w-4 h-4 cursor-pointer"
                  />
                  <span>Mandatory Field / Required</span>
                </label>
              </div>

              {/* Conditional Display Logic */}
              <div className="bg-amber-50/15 p-4 rounded-xl border border-amber-100/50 space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-600 block tracking-wider">Conditional Visibility Logic (Optional)</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Dependent Parent Question</label>
                    <Select
                      options={[
                        { value: "", label: "No Parent - Always Show" },
                        ...availableParentQuestions.map((q) => ({ value: q.id, label: q.text }))
                      ]}
                      value={editingQuestion.conditionalParentId || ""}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, conditionalParentId: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Triggering Option Value</label>
                    <Input
                      placeholder="e.g. true or enterprise-tier"
                      disabled={!editingQuestion.conditionalParentId}
                      value={editingQuestion.conditionalParentValue || ""}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, conditionalParentValue: e.target.value || null })}
                    />
                  </div>
                </div>
              </div>

              {/* Validation Rules if Text/Number/Counter */}
              {["number", "counter", "text"].includes(editingQuestion.type || "") && (
                <div className="bg-blue-50/10 p-4 rounded-xl border border-blue-100/40 space-y-3">
                  <span className="text-[10px] font-black uppercase text-blue-600 block tracking-wider">Input Validations Rules</span>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Min Value / Length</label>
                      <Input
                        type="number"
                        placeholder="None"
                        value={editingQuestion.validationRules?.min !== null ? String(editingQuestion.validationRules?.min) : ""}
                        onChange={(e) => setValidationVal("min", e.target.value === "" ? null : parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Max Value / Length</label>
                      <Input
                        type="number"
                        placeholder="None"
                        value={editingQuestion.validationRules?.max !== null ? String(editingQuestion.validationRules?.max) : ""}
                        onChange={(e) => setValidationVal("max", e.target.value === "" ? null : parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Regex Pattern Match</label>
                      <Input
                        placeholder="e.g. ^[0-9]{10}$"
                        value={editingQuestion.validationRules?.pattern || ""}
                        onChange={(e) => setValidationVal("pattern", e.target.value || null)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Validation Failure Message</label>
                    <Input
                      placeholder="e.g. Must be a valid 10 digit telephone number"
                      value={editingQuestion.validationRules?.message || ""}
                      onChange={(e) => setValidationVal("message", e.target.value || null)}
                    />
                  </div>
                </div>
              )}

              {/* Price Modifier for Single Value input (like Toggle / Text / Number) */}
              {!["radio", "checkbox", "select"].includes(editingQuestion.type || "") && (
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 space-y-3">
                  <span className="text-[10px] font-black uppercase text-gray-550 block tracking-wider">Static Pricing Modifier</span>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Modifier Coefficient Value</label>
                      <Input
                        type="number"
                        step="any"
                        value={editingQuestion.priceModifier || 0}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, priceModifier: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Modifier Type</label>
                      <Select
                        options={[
                          { value: "flat", label: "Flat Surcharge (+/-)" },
                          { value: "multiplier", label: "Multiplier Scale (x)" },
                        ]}
                        value={editingQuestion.modifierType || "flat"}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, modifierType: e.target.value as any })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Options Builder if Radio, Checkbox, Select */}
              {["radio", "checkbox", "select"].includes(editingQuestion.type || "") && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Define Selectable Options</label>
                  
                  {/* Option Add Form */}
                  <div className="bg-slate-50/50 p-4 border border-gray-150 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Option Value (Key/Slug)</label>
                        <Input
                          placeholder="e.g. ecommerce-integration"
                          value={optionValue}
                          onChange={(e) => setOptionValue(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Display Label</label>
                        <Input
                          placeholder="e.g. E-Commerce Shopping Cart"
                          value={optionLabel}
                          onChange={(e) => setOptionLabel(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Pricing Modifier ({currency}/x)</label>
                        <Input
                          type="number"
                          step="any"
                          value={optionPrice}
                          onChange={(e) => setOptionPrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Modifier Type</label>
                        <Select
                          options={[
                            { value: "flat", label: "Flat (+/-)" },
                            { value: "multiplier", label: "Multiplier (x)" },
                          ]}
                          value={optionType}
                          onChange={(e) => setOptionType(e.target.value as any)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Brief Description (Optional)</label>
                      <Input
                        placeholder="e.g. Adds fully functional Stripe Checkout flow"
                        value={optionDesc}
                        onChange={(e) => setOptionDesc(e.target.value)}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="cursor-pointer font-bold"
                    >
                      ✓ Add Option to List
                    </Button>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(editingQuestion.options || []).map((opt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg text-xs">
                        <div className="min-w-0">
                          <span className="font-bold text-dezprox-primary">{opt.label}</span>
                          <span className="text-[10px] text-gray-400 ml-2">({opt.value})</span>
                          {opt.description && (
                            <p className="text-[10px] text-gray-400 mt-0.5">{opt.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 shrink-0">
                          {opt.priceModifier !== 0 && (
                            <Badge variant="outline" className="font-black text-[9px] border-amber-200 text-amber-600 bg-amber-50">
                              {opt.priceModifier > 0 ? "+" : ""}{opt.modifierType === "multiplier" ? `x${opt.priceModifier}` : `${currency}${opt.priceModifier}`}
                            </Badge>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-red-500 hover:text-red-650 cursor-pointer p-0.5 hover:bg-gray-150 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="space-y-1 border-t border-gray-100 pt-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Visibility Status</label>
                <Select
                  options={[
                    { value: "active", label: "Active & Published" },
                    { value: "inactive", label: "Inactive (Archived)" },
                  ]}
                  value={editingQuestion?.status || "active"}
                  onChange={(e) => editingQuestion && setEditingQuestion({ ...editingQuestion, status: e.target.value })}
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

  function setValidationVal(field: string, val: any) {
    if (!editingQuestion) return;
    setEditingQuestion({
      ...editingQuestion,
      validationRules: {
        ...(editingQuestion.validationRules || { min: null, max: null, pattern: null, message: null }),
        [field]: val
      }
    });
  }
}
