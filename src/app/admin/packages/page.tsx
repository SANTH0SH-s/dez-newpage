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
  Package 
} from "@/lib/db";
import { Plus, Edit, Trash2, Copy, X, Save, Layers, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PackageBuilder() {
  const [services, setServices] = useState<Service[]>(() => getServices());
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => getServices()[0]?.id || "website-dev");
  const [currency] = useState(() => getGlobalSettings().currency || "₹");
  
  // Editor/Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<Package> | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  
  // Drag and drop helper state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const activeService = services.find((s) => s.id === selectedServiceId);
  const packages = activeService?.packages || [];
  
  // Sort packages by displayOrder
  const sortedPackages = [...packages].sort((a, b) => a.displayOrder - b.displayOrder);

  const updateServicePackages = (updatedPkgs: Package[]) => {
    if (!activeService) return;
    const updatedServices = services.map((s) => 
      s.id === activeService.id 
        ? { ...s, packages: updatedPkgs } 
        : s
    );
    setServices(updatedServices);
    saveServices(updatedServices);
  };

  const handleOpenAdd = () => {
    setEditingPackage({
      id: `pkg-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      price: 1000,
      timeline: "2-3 weeks",
      description: "",
      isRecommended: false,
      isPopular: false,
      isBestValue: false,
      isNew: false,
      displayOrder: packages.length,
      status: "active",
      features: []
    });
    setFeatureInput("");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFeatureInput("");
    setIsEditorOpen(true);
  };

  const handleDelete = (pkgId: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      const updated = packages
        .filter((p) => p.id !== pkgId)
        .map((p, idx) => ({ ...p, displayOrder: idx })); // Adjust orders
      updateServicePackages(updated);
    }
  };

  const handleDuplicate = (pkg: Package) => {
    const duplicatedPkg: Package = {
      ...pkg,
      id: `${pkg.id}-copy-${packages.length + 1}`,
      name: `${pkg.name} (Copy)`,
      displayOrder: packages.length,
      isRecommended: false,
      isPopular: false,
      isBestValue: false,
      isNew: false
    };
    const updated = [...packages, duplicatedPkg];
    updateServicePackages(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService || !editingPackage?.id || !editingPackage.name) return;

    let updatedPkgs = [...packages];
    const index = packages.findIndex((p) => p.id === editingPackage.id);

    // Enforce that only one package can be recommended
    if (editingPackage.isRecommended) {
      updatedPkgs = updatedPkgs.map((p) => 
        p.id === editingPackage.id ? p : { ...p, isRecommended: false }
      );
    }

    if (index > -1) {
      updatedPkgs[index] = editingPackage as Package;
    } else {
      updatedPkgs.push(editingPackage as Package);
    }

    // Re-index displayOrder just in case
    updatedPkgs = updatedPkgs.map((p, idx) => ({ ...p, displayOrder: p.displayOrder ?? idx }));

    updateServicePackages(updatedPkgs);
    setIsEditorOpen(false);
    setEditingPackage(null);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim() || !editingPackage) return;
    const currentFeatures = editingPackage.features || [];
    if (!currentFeatures.includes(featureInput.trim())) {
      setEditingPackage({
        ...editingPackage,
        features: [...currentFeatures, featureInput.trim()]
      });
    }
    setFeatureInput("");
  };

  const handleRemoveFeature = (feature: string) => {
    if (!editingPackage) return;
    const currentFeatures = editingPackage.features || [];
    setEditingPackage({
      ...editingPackage,
      features: currentFeatures.filter((f) => f !== feature)
    });
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddFeature();
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;

    // Rearrange packages display order locally for visual responsiveness
    const reordered = [...sortedPackages];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(idx, 0, draggedItem);

    // Save Display orders
    const updated = reordered.map((p, i) => ({ ...p, displayOrder: i }));
    setDraggedIndex(idx);
    updateServicePackages(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
          Package Builder
        </h1>
        <p className="text-dezprox-text/60 mt-1 text-sm">
          Define multiple pricing tiers and package features for each dynamic CMS service.
        </p>
      </div>

      {/* Select Service Dropdown */}
      <Card className="p-6 border-gray-100 shadow-sm bg-white">
        <div className="max-w-md space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Select Service to Configure Tiers
          </label>
          <Select
            options={services.map((s) => ({ value: s.id, label: s.name }))}
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          />
        </div>
      </Card>

      {/* Packages list management */}
      {activeService && (
        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-dezprox-primary">
                Packages for {activeService.name}
              </CardTitle>
              <CardDescription className="text-xs">
                Drag using the handle icon to change visual order in client estimator.
              </CardDescription>
            </div>
            <Button
              onClick={handleOpenAdd}
              variant="accent"
              size="sm"
              className="flex items-center gap-2 cursor-pointer shadow-sm animate-in fade-in duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Package
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {sortedPackages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No packages configured.</p>
                <p className="text-xs text-gray-400 mt-1">Create different plans (e.g. Starter, Pro) for this service.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedPackages.map((pkg, idx) => (
                  <motion.div
                    key={pkg.id}
                    layoutId={pkg.id}
                    className={`flex items-center justify-between border rounded-xl p-4 bg-white transition-shadow ${
                      pkg.status === "inactive" ? "border-gray-100 opacity-60" : "border-gray-150 hover:shadow-sm"
                    }`}
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
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-dezprox-primary text-sm">{pkg.name}</span>
                          {pkg.isRecommended && (
                            <Badge variant="accent" className="text-[9px] py-0.5 font-bold">Recommended</Badge>
                          )}
                          {pkg.isPopular && (
                            <Badge variant="secondary" className="text-[9px] py-0.5 font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">Popular</Badge>
                          )}
                          {pkg.isBestValue && (
                            <Badge variant="secondary" className="text-[9px] py-0.5 font-bold bg-amber-50 text-amber-600 border border-amber-150">Best Value</Badge>
                          )}
                          {pkg.isNew && (
                            <Badge variant="secondary" className="text-[9px] py-0.5 font-bold bg-emerald-50 text-emerald-600 border border-emerald-150">New</Badge>
                          )}
                          <span className="text-xs text-gray-400 font-medium">Timeline: {pkg.timeline}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1 max-w-xl">{pkg.description}</p>
                        
                        {/* Features chips */}
                        {pkg.features && pkg.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {pkg.features.map((feat, fIdx) => (
                              <span key={fIdx} className="inline-flex items-center px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-bold text-dezprox-primary">
                                ✓ {feat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pl-4">
                      {/* Price */}
                      <span className="text-sm font-black text-dezprox-primary whitespace-nowrap">
                        {currency}{pkg.price.toLocaleString()}
                      </span>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDuplicate(pkg)}
                          className="p-1.5 border border-gray-150 text-gray-400 hover:text-dezprox-primary rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          title="Duplicate Package"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(pkg)}
                          className="p-1.5 border border-gray-150 text-gray-500 hover:text-dezprox-primary rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          title="Edit Package"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="p-1.5 border border-red-500/10 text-red-500 hover:text-red-650 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Package"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CRUD Overlay Modal Dialog */}
      <AnimatePresence>
        {isEditorOpen && editingPackage && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-card max-w-xl w-full p-6 shadow-2xl relative border border-gray-100 overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-dezprox-primary mb-5">
                {packages.some(p => p.id === editingPackage.id) ? "Modify Package Details" : "Construct Package Tier"}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Package Name</label>
                    <Input
                      required
                      placeholder="e.g. Standard"
                      value={editingPackage.name || ""}
                      onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Price ({currency})</label>
                    <Input
                      type="number"
                      required
                      min="0"
                      value={editingPackage.price || 0}
                      onChange={(e) => setEditingPackage({ ...editingPackage, price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Timeline */}
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Estimated Timeline</label>
                    <Input
                      required
                      placeholder="e.g. 2-3 weeks, Monthly"
                      value={editingPackage.timeline || ""}
                      onChange={(e) => setEditingPackage({ ...editingPackage, timeline: e.target.value })}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Status</label>
                    <Select
                      options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                      ]}
                      value={editingPackage.status || "active"}
                      onChange={(e) => setEditingPackage({ ...editingPackage, status: e.target.value as "active" | "inactive" })}
                    />
                  </div>
                </div>

                {/* Badge Toggles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isRecommended"
                      checked={editingPackage.isRecommended || false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, isRecommended: e.target.checked })}
                      className="rounded text-dezprox-primary focus:ring-dezprox-primary w-4 h-4 border-gray-300"
                    />
                    <label htmlFor="isRecommended" className="text-[10px] font-black uppercase text-gray-600 cursor-pointer select-none">
                      Recommended
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={editingPackage.isPopular || false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, isPopular: e.target.checked })}
                      className="rounded text-dezprox-primary focus:ring-dezprox-primary w-4 h-4 border-gray-300"
                    />
                    <label htmlFor="isPopular" className="text-[10px] font-black uppercase text-gray-600 cursor-pointer select-none">
                      Popular
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isBestValue"
                      checked={editingPackage.isBestValue || false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, isBestValue: e.target.checked })}
                      className="rounded text-dezprox-primary focus:ring-dezprox-primary w-4 h-4 border-gray-300"
                    />
                    <label htmlFor="isBestValue" className="text-[10px] font-black uppercase text-gray-600 cursor-pointer select-none">
                      Best Value
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isNew"
                      checked={editingPackage.isNew || false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, isNew: e.target.checked })}
                      className="rounded text-dezprox-primary focus:ring-dezprox-primary w-4 h-4 border-gray-300"
                    />
                    <label htmlFor="isNew" className="text-[10px] font-black uppercase text-gray-600 cursor-pointer select-none">
                      New
                    </label>
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Short Description</label>
                  <Textarea
                    placeholder="Provide a quick overview..."
                    value={editingPackage.description || ""}
                    onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Features input with tags/chips */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Included Features</label>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add feature (press Enter or comma)"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={handleFeatureKeyDown}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddFeature}
                      variant="outline"
                      className="shrink-0 cursor-pointer text-xs font-bold"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Rendered Chips list */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editingPackage.features && editingPackage.features.map((feat) => (
                      <span key={feat} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-dezprox-accent/10 border border-dezprox-accent/25 rounded-full text-[10px] font-bold text-dezprox-primary">
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(feat)}
                          className="hover:text-red-500 transition-colors p-0.5 rounded-full"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    {(!editingPackage.features || editingPackage.features.length === 0) && (
                      <span className="text-[11px] text-gray-400 italic">No features added yet.</span>
                    )}
                  </div>
                </div>

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
                    Save Package
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
