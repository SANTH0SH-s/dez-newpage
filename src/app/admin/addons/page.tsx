"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Service, PricingComponent } from "@/lib/types";
import { Plus, Edit, Trash2, Copy, X, Save, PlusCircle } from "lucide-react";
import * as Icons from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";

export default function AddonManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [components, setComponents] = useState<PricingComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [componentsLoading, setComponentsLoading] = useState(false);
  const [currency, setCurrency] = useState("₹");
  
  // Editor/Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Partial<PricingComponent> | null>(null);

  const activeService = services.find((s) => s.id === selectedServiceId);

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

  const fetchComponents = async (serviceId: string) => {
    if (!serviceId) return;
    try {
      setComponentsLoading(true);
      const res = await endpoints.adminGetComponents(serviceId);
      if (res.success && res.data) {
        setComponents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setComponentsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      fetchComponents(selectedServiceId);
    }
  }, [selectedServiceId]);

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

  const handleDuplicate = async (comp: PricingComponent) => {
    try {
      const duplicated = {
        ...comp,
        id: `comp-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${comp.name} (Copy)`
      };
      await endpoints.adminCreateComponent(selectedServiceId, duplicated);
      fetchComponents(selectedServiceId);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to duplicate component: ${err.message || err}`);
    }
  };

  const handleDelete = async (compId: string) => {
    if (confirm("Are you sure you want to delete this add-on?")) {
      try {
        await endpoints.adminDeleteComponent(compId);
        fetchComponents(selectedServiceId);
      } catch (err: any) {
        console.error(err);
        alert(`Failed to delete component: ${err.message || err}`);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !editingComponent?.id || !editingComponent.name) return;

    const payload = {
      id: editingComponent.id,
      name: editingComponent.name,
      pricingType: editingComponent.type === "quantity" ? "per-unit" : "fixed",
      price: editingComponent.type === "quantity" ? (editingComponent.perUnitPrice || 0) : (editingComponent.fixedPrice || 0),
      description: editingComponent.description,
      maxQuantity: editingComponent.maxQuantity,
      iconName: editingComponent.iconName,
      status: editingComponent.status,
      category: editingComponent.category,
      billingCycle: editingComponent.billingCycle,
      note: editingComponent.note
    };

    try {
      const isNew = !components.some((c) => c.id === editingComponent.id);
      if (isNew) {
        await endpoints.adminCreateComponent(selectedServiceId, payload);
      } else {
        await endpoints.adminUpdateComponent(editingComponent.id, payload);
      }
      fetchComponents(selectedServiceId);
      setIsEditorOpen(false);
      setEditingComponent(null);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save: ${err.message || err}`);
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
          Pricing Components & Add-ons
        </h1>
        <p className="text-dezprox-text/60 mt-1 text-sm">
          Define base extras, structural variables, hourly/volume addons, and specific feature components.
        </p>
      </div>

      <Card className="p-6 border-gray-100 shadow-sm bg-white">
        <div className="max-w-md space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Select Service to Configure Add-ons
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
                Components for {activeService.name}
              </CardTitle>
              <CardDescription className="text-xs">
                Base extra structures that can be chosen dynamically by users.
              </CardDescription>
            </div>
            <Button
              onClick={handleCreate}
              variant="accent"
              size="sm"
              className="flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Component
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {componentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dezprox-primary" />
              </div>
            ) : components.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <PlusCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No components configured.</p>
                <p className="text-xs text-gray-400 mt-1">Configure addons like database setups, SEO integrations, etc.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {components.map((comp) => {
                  const LucideIcon = (Icons as any)[comp.iconName || "Settings"] || Icons.Settings;
                  const isActive = comp.status === "active";
                  return (
                    <div 
                      key={comp.id}
                      className={`border rounded-xl p-5 bg-white transition-all relative ${
                        !isActive ? "border-gray-100 opacity-60" : "border-gray-150 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start space-x-3.5 pr-20">
                        <div className={`p-2 rounded-lg shrink-0 ${isActive ? "bg-dezprox-accent/10 text-dezprox-primary" : "bg-gray-150 text-gray-400"}`}>
                          <LucideIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="font-bold text-dezprox-primary text-sm leading-tight block">{comp.name}</span>
                            <Badge variant="outline" className="text-[8px] py-0.2 tracking-wide font-black uppercase text-gray-500">{comp.category}</Badge>
                            <Badge variant={comp.billingCycle === "one-time" ? "outline" : "accent"} className="text-[8px] py-0.2 tracking-wide font-black uppercase">
                              {comp.billingCycle}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{comp.description}</p>
                          {comp.note && (
                            <span className="text-[10px] text-dezprox-accent font-semibold block mt-1.5">⚠️ {comp.note}</span>
                          )}
                        </div>
                      </div>

                      <div className="absolute right-4 top-4 flex flex-col items-end space-y-2">
                        <span className="text-xs font-bold text-dezprox-primary bg-slate-50 border px-2 py-0.5 rounded-md whitespace-nowrap">
                          {comp.type === "fixed" ? (
                            `${currency}${comp.fixedPrice.toLocaleString()}`
                          ) : (
                            `${currency}${comp.perUnitPrice.toLocaleString()}/unit`
                          )}
                        </span>
                        {comp.type === "quantity" && (
                          <span className="text-[9px] text-gray-400 font-bold">Max Qty: {comp.maxQuantity}</span>
                        )}
                        
                        <div className="flex items-center space-x-1 pt-1">
                          <button
                            onClick={() => handleDuplicate(comp)}
                            className="p-1 border border-gray-150 text-gray-400 hover:text-dezprox-primary rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleEdit(comp)}
                            className="p-1 border border-gray-150 text-gray-400 hover:text-dezprox-primary rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(comp.id)}
                            className="p-1 border border-red-100 text-red-500 rounded-md hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isEditorOpen && editingComponent && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsEditorOpen(false)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-dezprox-primary mb-4">
              {components.some(c => c.id === editingComponent.id) ? "Modify Pricing Component" : "Configure Add-on Pricing"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Component Name</label>
                <Input
                  required
                  placeholder="e.g. SEO Campaign Launch"
                  value={editingComponent.name || ""}
                  onChange={(e) => setEditingComponent({ ...editingComponent, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Addon Category</label>
                  <Select
                    options={[
                      { value: "Integrations", label: "Integrations" },
                      { value: "Security", label: "Security & Audits" },
                      { value: "Content", label: "Content & Assets" },
                      { value: "Marketing", label: "Marketing / SEO" },
                      { value: "Support", label: "SLA / Support Plans" },
                      { value: "Infrastructure", label: "Infrastructure" },
                    ]}
                    value={editingComponent.category || "Integrations"}
                    onChange={(e) => setEditingComponent({ ...editingComponent, category: e.target.value })}
                  />
                </div>

                {/* Billing Cycle */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Billing Cycle</label>
                  <Select
                    options={[
                      { value: "one-time", label: "One-Time Cost" },
                      { value: "monthly", label: "Monthly Recurring" },
                    ]}
                    value={editingComponent.billingCycle || "one-time"}
                    onChange={(e) => setEditingComponent({ ...editingComponent, billingCycle: e.target.value as "one-time" | "monthly" })}
                  />
                </div>
              </div>

              {/* Addon Type Selector */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-550 block tracking-wider">Addon Calculations Strategy</label>
                  <Select
                    options={[
                      { value: "fixed", label: "Flat/Fixed Fee Rate" },
                      { value: "quantity", label: "Quantity-Scaled (Volume/Units)" },
                    ]}
                    value={editingComponent.type || "fixed"}
                    onChange={(e) => setEditingComponent({ ...editingComponent, type: e.target.value as "fixed" | "quantity" })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {editingComponent.type === "fixed" ? (
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Fixed Price Amount ({currency})</label>
                      <Input
                        type="number"
                        required
                        min="0"
                        value={editingComponent.fixedPrice || 0}
                        onChange={(e) => setEditingServiceVal("fixedPrice", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Price Per Unit ({currency})</label>
                        <Input
                          type="number"
                          required
                          min="0"
                          value={editingComponent.perUnitPrice || 0}
                          onChange={(e) => setEditingServiceVal("perUnitPrice", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Max Allowable Quantity</label>
                        <Input
                          type="number"
                          required
                          min="1"
                          value={editingComponent.maxQuantity || 1}
                          onChange={(e) => setEditingServiceVal("maxQuantity", parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Icon Choice & Note */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Lucide Icon name</label>
                  <Select
                    options={[
                      { value: "Settings", label: "Settings (Default)" },
                      { value: "Database", label: "Database (Backend)" },
                      { value: "ShieldCheck", label: "ShieldCheck (Security)" },
                      { value: "Search", label: "Search (SEO)" },
                      { value: "MessageSquare", label: "MessageSquare (Chat)" },
                      { value: "Activity", label: "Activity (Analytics)" },
                      { value: "Zap", label: "Zap (Automation)" },
                      { value: "FileText", label: "FileText (Reports)" },
                    ]}
                    value={editingComponent.iconName || "Settings"}
                    onChange={(e) => setEditingComponent({ ...editingComponent, iconName: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Warning/Advisory Note</label>
                  <Input
                    placeholder="e.g. Requires API Keys"
                    value={editingComponent.note || ""}
                    onChange={(e) => setEditingComponent({ ...editingComponent, note: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description</label>
                <Textarea
                  placeholder="Summarize the value or capabilities added by this component..."
                  value={editingComponent.description || ""}
                  onChange={(e) => setEditingComponent({ ...editingComponent, description: e.target.value })}
                  rows={2}
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
                  value={editingComponent.status || "active"}
                  onChange={(e) => setEditingComponent({ ...editingComponent, status: e.target.value as "active" | "inactive" })}
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

  function setEditingServiceVal(field: string, val: any) {
    if (!editingComponent) return;
    setEditingComponent({
      ...editingComponent,
      [field]: val
    });
  }
}
