"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { 
  getServices, 
  saveServices, 
  getGlobalSettings,
  Service,
  Question,
  QuestionOption
} from "@/lib/db";
import { Plus, Edit, Trash2, Copy, X, Save, HelpCircle, GripVertical, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestionnaireBuilder() {
  const [services, setServices] = useState<Service[]>(() => (typeof window !== "undefined" ? getServices() : []));
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => (typeof window !== "undefined" ? getServices()[0]?.id || "website-dev" : "website-dev"));
  const [selectedPackageId, setSelectedPackageId] = useState<string>("general");
  const [currency] = useState(() => (typeof window !== "undefined" ? getGlobalSettings().currency : "₹"));
  
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
      return activePackage?.questions || [];
    }
    return activeService?.questions || [];
  };

  const activeQuestions = getActiveQuestionsList();
  const sortedQuestions = [...activeQuestions].sort((a, b) => a.displayOrder - b.displayOrder);

  // Parent questions options for conditional logic
  // (Filter out the current question being edited to prevent self-referencing)
  const availableParentQuestions = (isPackageContext 
    ? [...(activeService?.questions || []), ...(activePackage?.questions || [])]
    : activeService?.questions || []
  ).filter((q) => q.id !== editingQuestion?.id);

  const updateQuestionsDatabase = (updatedQs: Question[]) => {
    if (!activeService) return;
    
    let updatedServices;
    if (isPackageContext && activePackage) {
      // Package questions
      const updatedPackages = packagesList.map((p) => 
        p.id === activePackage.id 
          ? { ...p, questions: updatedQs } 
          : p
      );
      updatedServices = services.map((s) => 
        s.id === activeService.id 
          ? { ...s, packages: updatedPackages } 
          : s
      );
    } else {
      // Service questions
      updatedServices = services.map((s) => 
        s.id === activeService.id 
          ? { ...s, questions: updatedQs } 
          : s
      );
    }
    
    setServices(updatedServices);
    saveServices(updatedServices);
  };

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
      options: [],
      conditionalParentId: "",
      conditionalParentValue: "",
      validationRules: { min: undefined, max: undefined, pattern: "", message: "" }
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion({
      ...q,
      validationRules: q.validationRules || { min: undefined, max: undefined, pattern: "", message: "" }
    });
    setIsEditorOpen(true);
  };

  const handleDelete = (qId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      const updated = activeQuestions
        .filter((q) => q.id !== qId)
        .map((q, idx) => ({ ...q, displayOrder: idx }));
      updateQuestionsDatabase(updated);
    }
  };

  const handleDuplicate = (q: Question) => {
    const duplicated: Question = {
      ...q,
      id: `${q.id}-copy-${activeQuestions.length + 1}`,
      text: `${q.text} (Copy)`,
      displayOrder: activeQuestions.length
    };
    const updated = [...activeQuestions, duplicated];
    updateQuestionsDatabase(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion?.id || !editingQuestion.text) return;

    let updatedQs = [...activeQuestions];
    const index = activeQuestions.findIndex((q) => q.id === editingQuestion.id);

    if (index > -1) {
      updatedQs[index] = editingQuestion as Question;
    } else {
      updatedQs.push(editingQuestion as Question);
    }

    updatedQs = updatedQs.map((q, idx) => ({ ...q, displayOrder: q.displayOrder ?? idx }));

    updateQuestionsDatabase(updatedQs);
    setIsEditorOpen(false);
    setEditingQuestion(null);
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

  const handleRemoveOption = (value: string) => {
    if (!editingQuestion) return;
    const currentOptions = editingQuestion.options || [];
    setEditingQuestion({
      ...editingQuestion,
      options: currentOptions.filter((o) => o.value !== value)
    });
  };

  // Drag and Drop reordering implementation
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

    const updated = reordered.map((q, i) => ({ ...q, displayOrder: i }));
    setDraggedIndex(idx);
    updateQuestionsDatabase(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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
            {sortedQuestions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No questions built for this context.</p>
                <p className="text-xs text-gray-400 mt-1">Questions will render inside the step-by-step wizard questionnaire.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedQuestions.map((q, idx) => (
                  <motion.div
                    key={q.id}
                    layoutId={q.id}
                    className="flex items-center justify-between border border-gray-150 rounded-xl p-4 bg-white hover:shadow-sm transition-all"
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-dezprox-primary p-1.5 rounded transition-colors">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-dezprox-primary text-sm">{q.text}</span>
                          <Badge variant="secondary" className="capitalize text-[9px] py-0.5 font-bold">{q.type}</Badge>
                          {q.isRequired && (
                            <Badge variant="outline" className="text-[9px] py-0.5 font-bold border-red-200 text-red-500 bg-red-50/50">Required</Badge>
                          )}
                          {q.conditionalParentId && (
                            <Badge variant="outline" className="text-[9px] py-0.5 font-bold border-indigo-200 text-indigo-500 bg-indigo-50/50 flex items-center gap-1">
                              <Eye className="w-2.5 h-2.5" /> Conditional
                            </Badge>
                          )}
                        </div>
                        {q.description && <p className="text-xs text-gray-400 truncate mt-1 max-w-lg">{q.description}</p>}
                        
                        {/* Option badges if available */}
                        {q.options && q.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {q.options.map((opt, oIdx) => (
                              <span key={oIdx} className="inline-flex items-center px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-medium text-dezprox-primary">
                                {opt.label} ({opt.priceModifier !== 0 ? `${opt.modifierType === "flat" ? "+" : "x"}${opt.priceModifier}` : "Free"})
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Flat/Multiplier modifier indicator for non-option types */}
                        {["counter", "number", "toggle", "text"].includes(q.type) && q.priceModifier !== undefined && q.priceModifier !== 0 && (
                          <div className="text-[10px] text-gray-500 font-semibold mt-1">
                            Price impact: {q.modifierType === "flat" ? `+${currency}${q.priceModifier}` : `+${Math.round((q.priceModifier - 1) * 100)}%`} per unit/activation.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pl-4">
                      <button
                        onClick={() => handleDuplicate(q)}
                        className="p-1.5 border border-gray-150 text-gray-400 hover:text-dezprox-primary rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Duplicate Question"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(q)}
                        className="p-1.5 border border-gray-150 text-gray-500 hover:text-dezprox-primary rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Edit Question"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 border border-red-500/10 text-red-500 hover:text-red-650 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editor Modal Dialog */}
      <AnimatePresence>
        {isEditorOpen && editingQuestion && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-card max-w-2xl w-full p-6 shadow-2xl relative border border-gray-100 overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-dezprox-primary mb-5">
                {activeQuestions.some(q => q.id === editingQuestion.id) ? "Modify Questionnaire Input" : "Construct Form Input"}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Label */}
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Question Label</label>
                    <Input
                      required
                      placeholder="e.g. Need domain setup?"
                      value={editingQuestion.text || ""}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                    />
                  </div>

                  {/* Input Type */}
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Question Type</label>
                    <Select
                      options={[
                        { value: "radio", label: "Radio Selection" },
                        { value: "checkbox", label: "Checkbox Array" },
                        { value: "select", label: "Select Dropdown" },
                        { value: "counter", label: "Counter (Unit +/-)" },
                        { value: "number", label: "Number Input" },
                        { value: "text", label: "Text Input Box" },
                        { value: "toggle", label: "Toggle Yes/No Switch" },
                      ]}
                      value={editingQuestion.type || "radio"}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as Question["type"] })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Description */}
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Short Help Description</label>
                    <Input
                      placeholder="e.g. Select if you want apex to configure custom URLs"
                      value={editingQuestion.description || ""}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, description: e.target.value })}
                    />
                  </div>

                  {/* Default Value */}
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Default Value</label>
                    <Input
                      placeholder="e.g. standard, 1, true, or blank"
                      value={editingQuestion.defaultValue !== undefined ? String(editingQuestion.defaultValue) : ""}
                      onChange={(e) => {
                        let val: string | number | boolean = e.target.value;
                        if (editingQuestion.type === "toggle") val = e.target.value === "true";
                        if (["counter", "number"].includes(editingQuestion.type as string)) val = parseFloat(e.target.value) || 0;
                        setEditingQuestion({ ...editingQuestion, defaultValue: val });
                      }}
                    />
                  </div>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={editingQuestion.isRequired || false}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, isRequired: e.target.checked })}
                    className="rounded text-dezprox-primary focus:ring-dezprox-primary w-4 h-4 border-gray-300"
                  />
                  <label htmlFor="isRequired" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                    Required Field (Prevent next step if empty)
                  </label>
                </div>

                {/* Price Modifier directly on Question (Toggles, Counter, Number, Text) */}
                {["toggle", "counter", "number", "text"].includes(editingQuestion.type || "") && (
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <h4 className="text-xs font-black text-dezprox-primary uppercase tracking-wider">
                      Price Impact Configuration
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Price Modifier */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Modifier Coefficient / Price
                        </label>
                        <Input
                          type="number"
                          step="any"
                          value={editingQuestion.priceModifier || 0}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, priceModifier: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      {/* Modifier Type */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Modifier Format
                        </label>
                        <Select
                          options={[
                            { value: "flat", label: `Flat Fee (+${currency})` },
                            { value: "multiplier", label: "Percentage Multiplier Offset (e.g. 1.05 for +5%)" },
                          ]}
                          value={editingQuestion.modifierType || "flat"}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, modifierType: e.target.value as "flat" | "multiplier" })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Visibility Engine */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <h4 className="text-xs font-black text-dezprox-primary uppercase tracking-wider">
                    Conditional Visibility rules
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Render this input only if a parent questionnaire question equals a target choice value.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Parent Question Select */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Parent Question
                      </label>
                      <Select
                        options={[
                          { value: "", label: "No Condition - Always Displayed" },
                          ...availableParentQuestions.map((q) => ({ value: q.id, label: q.text }))
                        ]}
                        value={editingQuestion.conditionalParentId || ""}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, conditionalParentId: e.target.value })}
                      />
                    </div>

                    {/* Target Parent Value */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        If Parent Value Equals
                      </label>
                      <Input
                        placeholder="e.g. Yes, basic, or custom-web-app"
                        disabled={!editingQuestion.conditionalParentId}
                        value={editingQuestion.conditionalParentValue || ""}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, conditionalParentValue: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Validation Rules Card (Text, Numbers, Counters) */}
                {["text", "number", "counter"].includes(editingQuestion.type || "") && (
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <h4 className="text-xs font-black text-dezprox-primary uppercase tracking-wider">
                      Validation & Boundaries Configuration
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Min / Max */}
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Minimum Limit (or Char Length)
                        </label>
                        <Input
                          type="number"
                          value={editingQuestion.validationRules?.min !== undefined ? editingQuestion.validationRules.min : ""}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            validationRules: {
                              ...(editingQuestion.validationRules || {}),
                              min: e.target.value !== "" ? parseInt(e.target.value) : undefined
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Maximum Limit (or Char Length)
                        </label>
                        <Input
                          type="number"
                          value={editingQuestion.validationRules?.max !== undefined ? editingQuestion.validationRules.max : ""}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            validationRules: {
                              ...(editingQuestion.validationRules || {}),
                              max: e.target.value !== "" ? parseInt(e.target.value) : undefined
                            }
                          })}
                        />
                      </div>

                      {/* Pattern Regex */}
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Regex Pattern Match
                        </label>
                        <Input
                          placeholder="e.g. ^[A-Za-z0-9]+$"
                          value={editingQuestion.validationRules?.pattern || ""}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            validationRules: {
                              ...(editingQuestion.validationRules || {}),
                              pattern: e.target.value
                            }
                          })}
                        />
                      </div>

                      {/* Error Message */}
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Custom Error message
                        </label>
                        <Input
                          placeholder="e.g. Only alpha-numerical input structures allowed"
                          value={editingQuestion.validationRules?.message || ""}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            validationRules: {
                              ...(editingQuestion.validationRules || {}),
                              message: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Option Builder (Radio, Checkbox, Dropdowns) */}
                {["radio", "checkbox", "select"].includes(editingQuestion.type || "") && (
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <h4 className="text-xs font-black text-dezprox-primary uppercase tracking-wider">
                      Option Set Creator
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-gray-150">
                      {/* Option Label */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Option Label</label>
                        <Input
                          placeholder="e.g. Business Site"
                          value={optionLabel}
                          onChange={(e) => setOptionLabel(e.target.value)}
                        />
                      </div>

                      {/* Option Value */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Option Value (ID)</label>
                        <Input
                          placeholder="e.g. business"
                          value={optionValue}
                          onChange={(e) => setOptionValue(e.target.value)}
                        />
                      </div>

                      {/* Option Price Modifier */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Price modifier</label>
                        <Input
                          type="number"
                          value={optionPrice}
                          onChange={(e) => setOptionPrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      {/* Modifier format */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Format</label>
                        <Select
                          options={[
                            { value: "flat", label: `Flat (+${currency})` },
                            { value: "multiplier", label: "Multiplier Offset" },
                          ]}
                          value={optionType}
                          onChange={(e) => setOptionType(e.target.value as "flat" | "multiplier")}
                        />
                      </div>

                      {/* Option Desc */}
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Short Option Description</label>
                        <Input
                          placeholder="What features are bundled with this option..."
                          value={optionDesc}
                          onChange={(e) => setOptionDesc(e.target.value)}
                        />
                      </div>

                      <div className="col-span-2 pt-2 flex justify-end">
                        <Button
                          type="button"
                          onClick={handleAddOption}
                          variant="outline"
                          size="sm"
                          className="cursor-pointer font-bold text-xs"
                        >
                          Add Option
                        </Button>
                      </div>
                    </div>

                    {/* Rendered options list */}
                    <div className="space-y-1.5 pt-1">
                      {editingQuestion.options && editingQuestion.options.map((opt) => (
                        <div key={opt.value} className="flex justify-between items-center p-2.5 bg-white border border-gray-150 rounded-lg text-xs">
                          <div>
                            <span className="font-bold text-dezprox-primary">{opt.label}</span>
                            <span className="text-[10px] text-gray-400 block">ID: {opt.value} | {opt.description || "No description"}</span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-dezprox-primary">
                              {opt.priceModifier !== 0 ? (
                                opt.modifierType === "flat" ? `+${currency}${opt.priceModifier}` : `x${opt.priceModifier}`
                              ) : "Free"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(opt.value)}
                              className="text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!editingQuestion.options || editingQuestion.options.length === 0) && (
                        <span className="text-[11px] text-gray-400 italic">Configure choices. Required for radio/checkbox/dropdown types.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 mt-6">
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
                    Save Question
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
