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
  PricingComponent 
} from "@/utils/db";
import { Plus, Edit, Trash2, X, Save, Settings2 } from "lucide-react";

export default function PricingComponentBuilder() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [currency, setCurrency] = useState("₹");
  
  // Editor/Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Partial<PricingComponent> | null>(null);

  useEffect(() => {
    const list = getServices();
    setServices(list);
    if (list.length > 0) {
      setSelectedServiceId(list[0].id);
    }
    setCurrency(getGlobalSettings().currency);
  }, []);

  const activeService = services.find((s) => s.id === selectedServiceId);
  const components = activeService?.pricingComponents || [];

  const handleOpenAdd = () => {
    setEditingComponent({
      id: `comp-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      type: "fixed",
      fixedPrice: 0,
      perUnitPrice: 0,
      description: ""
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (comp: PricingComponent) => {
    setEditingComponent(comp);
    setIsEditorOpen(true);
  };

  const handleDelete = (compId: string) => {
    if (!activeService) return;
    if (confirm("Are you sure you want to delete this pricing component?")) {
      const updatedComponents = components.filter((c) => c.id !== compId);
      const updatedServices = services.map((s) => 
        s.id === activeService.id 
          ? { ...s, pricingComponents: updatedComponents } 
          : s
      );
      setServices(updatedServices);
      saveServices(updatedServices);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService || !editingComponent?.id || !editingComponent.name) return;

    let updatedComponents = [...components];
    const index = components.findIndex((c) => c.id === editingComponent.id);

    if (index > -1) {
      updatedComponents[index] = editingComponent as PricingComponent;
    } else {
      updatedComponents.push(editingComponent as PricingComponent);
    }

    const updatedServices = services.map((s) => 
      s.id === activeService.id 
        ? { ...s, pricingComponents: updatedComponents } 
        : s
    );

    setServices(updatedServices);
    saveServices(updatedServices);
    setIsEditorOpen(false);
    setEditingComponent(null);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
          Pricing Component Builder
        </h1>
        <p className="text-dezprox-text/60 mt-1 text-sm">
          Construct optional add-on building blocks and specifications for each estimate service.
        </p>
      </div>

      {/* Select Service Selector */}
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

      {/* Components Management List */}
      {activeService && (
        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-dezprox-primary">
                Pricing Blocks for {activeService.name}
              </CardTitle>
              <CardDescription className="text-xs">
                Configure features like Authentication, Dashboards, and Hostings for this service
              </CardDescription>
            </div>
            <Button
              onClick={handleOpenAdd}
              variant="accent"
              size="sm"
              className="flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Component
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {components.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <Settings2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No components created yet.</p>
                <p className="text-xs text-gray-400 mt-1">Add components to give estimate builders optional checkboxes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {components.map((comp) => (
                  <Card key={comp.id} className="p-5 relative border-gray-100 flex flex-col justify-between hover:border-dezprox-accent/20 transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-2 pr-12">
                        <span className="font-bold text-dezprox-primary block">{comp.name}</span>
                        <Badge variant="accent" className="capitalize text-[9px] py-0.5">
                          {comp.type} Price
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">{comp.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                      <span className="text-sm font-black text-dezprox-primary">
                        {comp.type === "fixed" ? (
                          `${currency}${comp.fixedPrice.toLocaleString()}`
                        ) : (
                          `${currency}${comp.perUnitPrice.toLocaleString()} / ${activeService.unitType || "unit"}`
                        )}
                      </span>
                      <div className="space-x-1">
                        <button
                          onClick={() => handleOpenEdit(comp)}
                          className="p-1 border border-gray-100 hover:border-gray-200 text-gray-500 rounded hover:text-dezprox-primary hover:bg-gray-50 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(comp.id)}
                          className="p-1 border border-red-500/10 hover:border-red-500/20 text-red-500 rounded hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Component Dialog Modal Overlay */}
      {isEditorOpen && editingComponent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsEditorOpen(false)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-dezprox-primary mb-4">
              {components.some(c => c.id === editingComponent.id) ? "Modify Component Builder" : "Create Pricing Block"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Component Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Component Name</label>
                <Input
                  required
                  placeholder="e.g. Authentication Gateway (OAuth2)"
                  value={editingComponent.name || ""}
                  onChange={(e) => setEditingComponent({ ...editingComponent, name: e.target.value })}
                />
              </div>

              {/* Pricing Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Pricing Type</label>
                <Select
                  options={[
                    { value: "fixed", label: "Fixed Cost" },
                    { value: "per-unit", label: "Per-Unit Quantity Cost" },
                  ]}
                  value={editingComponent.type || "fixed"}
                  onChange={(e) => setEditingComponent({ ...editingComponent, type: e.target.value as "fixed" | "per-unit" })}
                />
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
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Per-Unit Price Amount ({currency} / {activeService?.unitType || "unit"})</label>
                    <Input
                      type="number"
                      required
                      min="0"
                      value={editingComponent.perUnitPrice || 0}
                      onChange={(e) => setEditingComponent({ ...editingComponent, perUnitPrice: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description</label>
                <Textarea
                  placeholder="Describe what is bundled inside this component block..."
                  value={editingComponent.description || ""}
                  onChange={(e) => setEditingComponent({ ...editingComponent, description: e.target.value })}
                  rows={3}
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
                  Save Component
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
