"use client";

import React, { useState } from "react";
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
  PricingComponent 
} from "@/lib/db";
import { Plus, Edit, Trash2, Copy, X, Save, PlusCircle } from "lucide-react";
import * as Icons from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function AddonManager() {
  const [services, setServices] = useState<Service[]>(() => (typeof window !== "undefined" ? getServices() : []));
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => (typeof window !== "undefined" ? getServices()[0]?.id || "website-dev" : "website-dev"));
  const [currency] = useState(() => (typeof window !== "undefined" ? getGlobalSettings().currency : "₹"));
  
  // Editor/Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Partial<PricingComponent> | null>(null);

  const activeService = services.find((s) => s.id === selectedServiceId);
  const components = activeService?.pricingComponents || [];

  const updateServiceComponents = (updatedComponents: PricingComponent[]) => {
    const updatedServices = services.map((s) => 
      s.id === selectedServiceId 
        ? { ...s, pricingComponents: updatedComponents } 
        : s
    );
    saveServices(updatedServices);
    setServices(updatedServices);
  };

  const handleCreate = () => {
    setEditingComponent({
      id: `comp-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      type: "fixed",
      fixedPrice: 1000,
      perUnitPrice: 0,
      description: "",
      maxQuantity: 1,
      iconName: "Settings",
      status: "active",
      category: "Integrations",
      billingCycle: "one-time",
      note: ""
    });
    setIsEditorOpen(true);
  };

  const handleEdit = (comp: PricingComponent) => {
    setEditingComponent({
      ...comp,
      maxQuantity: comp.maxQuantity ?? 1,
      iconName: comp.iconName ?? "Settings",
      status: comp.status ?? "active",
      category: comp.category ?? "Integrations",
      billingCycle: comp.billingCycle ?? "one-time",
      note: comp.note ?? ""
    });
    setIsEditorOpen(true);
  };

  const handleDuplicate = (comp: PricingComponent) => {
    const duplicated: PricingComponent = {
      ...comp,
      id: `${comp.id}-copy-${components.length + 1}`,
      name: `${comp.name} (Copy)`
    };
    const updated = [...components, duplicated];
    updateServiceComponents(updated);
  };

  const handleDelete = (compId: string) => {
    if (confirm("Are you sure you want to delete this add-on?")) {
      const updated = components.filter((c) => c.id !== compId);
      updateServiceComponents(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService || !editingComponent?.id || !editingComponent.name) return;

    const fullComponent: PricingComponent = {
      id: editingComponent.id,
      name: editingComponent.name,
      type: editingComponent.type || "fixed",
      fixedPrice: editingComponent.fixedPrice || 0,
      perUnitPrice: editingComponent.perUnitPrice || 0,
      description: editingComponent.description || "",
      maxQuantity: editingComponent.maxQuantity ?? 1,
      iconName: editingComponent.iconName || "Settings",
      status: editingComponent.status || "active",
      category: editingComponent.category || "Integrations",
      billingCycle: editingComponent.billingCycle || "one-time",
      note: editingComponent.note || ""
    };

    const index = components.findIndex((c) => c.id === editingComponent.id);
    let updated: PricingComponent[];
    if (index > -1) {
      updated = [...components];
      updated[index] = fullComponent;
    } else {
      updated = [...components, fullComponent];
    }

    updateServiceComponents(updated);
    setIsEditorOpen(false);
    setEditingComponent(null);
  };

  // Helper to render dynamically referenced Lucide Icons safely
  const renderIcon = (iconName: string) => {
    const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    if (IconComp) {
      return <IconComp className="w-5 h-5" />;
    }
    return <Icons.Settings className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
          Add-on Management
        </h1>
        <p className="text-dezprox-text/60 mt-1 text-sm">
          Define optional feature modules, micro-services, and scaling options per service tier.
        </p>
      </div>

      {/* Service Selector Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
        {services.map((srv) => {
          const isSelected = srv.id === selectedServiceId;
          return (
            <button
              key={srv.id}
              onClick={() => setSelectedServiceId(srv.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isSelected
                  ? "bg-dezprox-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {srv.name}
            </button>
          );
        })}
      </div>

      {activeService && (
        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-dezprox-primary">
                Add-on Options for {activeService.name}
              </CardTitle>
              <CardDescription className="text-xs">
                Add supplementary building blocks like page expansions, support layers, and integrations.
              </CardDescription>
            </div>
            <Button
              onClick={handleCreate}
              variant="accent"
              size="sm"
              className="flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Add-on
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {components.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <PlusCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No add-ons created yet.</p>
                <p className="text-xs text-gray-400 mt-1">Provide optional add-ons to build modular estimate additions.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {components.map((comp) => {
                  const isActive = comp.status !== "inactive";
                  return (
                    <Card key={comp.id} className={`p-5 relative border-gray-150 flex flex-col justify-between hover:border-dezprox-accent/20 transition-all ${
                      !isActive ? "opacity-60 border-dashed" : ""
                    }`}>
                      <div>
                        <div className="flex justify-between items-start mb-2 pr-12">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-500">
                              {renderIcon(comp.iconName || "Settings")}
                            </div>
                            <div>
                              <span className="font-bold text-dezprox-primary block text-sm">{comp.name}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">{comp.category || "General"}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge variant={isActive ? "accent" : "outline"} className="capitalize text-[8px] py-0.5 font-bold">
                              {comp.status || "active"}
                            </Badge>
                            <Badge variant="secondary" className="capitalize text-[8px] py-0.5 font-bold bg-slate-50 text-gray-500 border border-gray-200">
                              {comp.type === "fixed" ? "Fixed Cost" : "Quantity Cost"}
                            </Badge>
                            <Badge variant="secondary" className="capitalize text-[8px] py-0.5 font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {comp.billingCycle || "one-time"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-550 leading-relaxed mb-3">{comp.description}</p>
                        {comp.note && (
                          <p className="text-[10px] text-amber-700 font-semibold bg-amber-50/40 p-2 rounded-lg border border-amber-100/40 mb-3">
                            {comp.note}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-dezprox-primary">
                            {comp.type === "fixed" ? (
                              `${currency}${comp.fixedPrice.toLocaleString()}`
                            ) : (
                              `${currency}${comp.perUnitPrice.toLocaleString()} / ${activeService.unitType || "unit"}`
                            )}
                          </span>
                          {comp.type === "per-unit" && comp.maxQuantity && (
                            <span className="text-[9px] text-gray-400 font-bold">Max Limit: {comp.maxQuantity} units</span>
                          )}
                        </div>
                        
                        <div className="space-x-1">
                          <button
                            onClick={() => handleDuplicate(comp)}
                            className="p-1 border border-gray-100 hover:border-gray-200 text-gray-400 rounded hover:text-dezprox-primary hover:bg-gray-50 cursor-pointer transition-colors"
                            title="Duplicate Add-on"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(comp)}
                            className="p-1 border border-gray-100 hover:border-gray-200 text-gray-500 rounded hover:text-dezprox-primary hover:bg-gray-50 cursor-pointer transition-colors"
                            title="Edit Add-on"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(comp.id)}
                            className="p-1 border border-red-500/10 hover:border-red-500/20 text-red-500 rounded hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            title="Delete Add-on"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Component Dialog Modal Overlay */}
      <AnimatePresence>
        {isEditorOpen && editingComponent && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-dezprox-primary mb-4">
                {components.some(c => c.id === editingComponent.id) ? "Modify Add-on Details" : "Construct Service Add-on"}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Add-on Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Add-on Name</label>
                  <Input
                    required
                    placeholder="e.g. WhatsApp Integration Gateway"
                    value={editingComponent.name || ""}
                    onChange={(e) => setEditingComponent({ ...editingComponent, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Add-on Category</label>
                    <Select
                      options={[
                        { value: "Integrations", label: "Integrations" },
                        { value: "Security", label: "Security & Audits" },
                        { value: "Design Assets", label: "Design Assets" },
                        { value: "Support", label: "Support & AMC" },
                        { value: "Content", label: "Content & Marketing" },
                      ]}
                      value={editingComponent.category || "Integrations"}
                      onChange={(e) => setEditingComponent({ ...editingComponent, category: e.target.value })}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Status</label>
                    <Select
                      options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                      ]}
                      value={editingComponent.status || "active"}
                      onChange={(e) => setEditingComponent({ ...editingComponent, status: e.target.value as "active" | "inactive" })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Pricing Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Pricing Type</label>
                    <Select
                      options={[
                        { value: "fixed", label: "Fixed Cost" },
                        { value: "per-unit", label: "Quantity-Based Cost" },
                      ]}
                      value={editingComponent.type || "fixed"}
                      onChange={(e) => setEditingComponent({ ...editingComponent, type: e.target.value as "fixed" | "per-unit" })}
                    />
                  </div>

                  {/* Lucide Icon Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Lucide Icon Name</label>
                    <Select
                      options={[
                        { value: "Settings", label: "Settings Gears" },
                        { value: "FolderLock", label: "Lock Safe" },
                        { value: "LayoutDashboard", label: "Dashboard Control" },
                        { value: "TrendingUp", label: "Analytics Line" },
                        { value: "Cloud", label: "Cloud Services" },
                        { value: "Layers", label: "Stack Layers" },
                        { value: "MessageSquare", label: "Message Chat bubble" },
                        { value: "ShieldAlert", label: "Shield Security" },
                        { value: "Search", label: "Search SEO magnifier" },
                        { value: "Database", label: "Database Cylinder" },
                      ]}
                      value={editingComponent.iconName || "Settings"}
                      onChange={(e) => setEditingComponent({ ...editingComponent, iconName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Price Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {editingComponent.type === "fixed" ? (
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Fixed Price Amount ({currency})</label>
                      <Input
                        type="number"
                        required
                        min="0"
                        value={editingComponent.fixedPrice || 0}
                        onChange={(e) => setEditingComponent({ ...editingComponent, fixedPrice: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Per-Unit Price ({currency})</label>
                        <Input
                          type="number"
                          required
                          min="0"
                          value={editingComponent.perUnitPrice || 0}
                          onChange={(e) => setEditingComponent({ ...editingComponent, perUnitPrice: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Maximum Quantity Limit</label>
                        <Input
                          type="number"
                          required
                          min="1"
                          value={editingComponent.maxQuantity || 1}
                          onChange={(e) => setEditingComponent({ ...editingComponent, maxQuantity: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Billing Cycle */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Billing Cycle</label>
                    <Select
                      options={[
                        { value: "one-time", label: "One-Time" },
                        { value: "monthly", label: "Monthly" },
                      ]}
                      value={editingComponent.billingCycle || "one-time"}
                      onChange={(e) => setEditingComponent({ ...editingComponent, billingCycle: e.target.value as "one-time" | "monthly" })}
                    />
                  </div>
                  <div className="space-y-1">
                    {/* Empty spacer or additional info */}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description</label>
                  <Textarea
                    placeholder="Describe what supplementary parameters are included..."
                    value={editingComponent.description || ""}
                    onChange={(e) => setEditingComponent({ ...editingComponent, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Note */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Important Note (Optional)</label>
                  <Textarea
                    placeholder="Provide a warning/notice details to display in the estimator option..."
                    value={editingComponent.note || ""}
                    onChange={(e) => setEditingComponent({ ...editingComponent, note: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                    Save Add-on
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
