"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AdminSkeleton } from "@/components/ui/admin-skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Service, Package } from "@/lib/types";
import { Plus, Edit, Trash2, Copy, X, Save, Layers, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import { endpoints } from "@/lib/api/endpoints";

export default function PackageBuilder() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [currency, setCurrency] = useState("₹");
  
  // Editor/Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<Package> | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  
  // Drag and drop helper state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const activeService = services.find((s) => s.id === selectedServiceId);
  const sortedPackages = [...packages].sort((a, b) => a.displayOrder - b.displayOrder);

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

  const fetchPackages = async (serviceId: string) => {
    if (!serviceId) return;
    try {
      setPackagesLoading(true);
      const res = await endpoints.adminGetPackages(serviceId);
      if (res.success && res.data) {
        setPackages(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPackagesLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      fetchPackages(selectedServiceId);
    }
  }, [selectedServiceId]);

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

  const handleDelete = async (pkgId: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      try {
        await endpoints.adminDeletePackage(pkgId);
        fetchPackages(selectedServiceId);
      } catch (err: any) {
        console.error(err);
        alert(`Failed to delete package: ${err.message || err}`);
      }
    }
  };

  const handleDuplicate = async (pkg: Package) => {
    try {
      const duplicatedPkg = {
        ...pkg,
        id: `pkg-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${pkg.name} (Copy)`,
        displayOrder: packages.length,
        isRecommended: false,
        isPopular: false,
        isBestValue: false,
        isNew: false
      };
      await endpoints.adminCreatePackage(selectedServiceId, duplicatedPkg);
      fetchPackages(selectedServiceId);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to duplicate package: ${err.message || err}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !editingPackage?.id || !editingPackage.name) return;

    try {
      const isNewPkg = !packages.some((p) => p.id === editingPackage.id);
      
      // Enforce recommended constraint locally if recommended
      if (editingPackage.isRecommended) {
        const others = packages.filter((p) => p.id !== editingPackage.id && p.isRecommended);
        await Promise.all(others.map(o => endpoints.adminUpdatePackage(o.id, { isRecommended: false })));
      }

      if (isNewPkg) {
        await endpoints.adminCreatePackage(selectedServiceId, editingPackage);
      } else {
        await endpoints.adminUpdatePackage(editingPackage.id, editingPackage);
      }

      fetchPackages(selectedServiceId);
      setIsEditorOpen(false);
      setEditingPackage(null);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save package: ${err.message || err}`);
    }
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

  const handleDragOver = async (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;

    const reordered = [...sortedPackages];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(idx, 0, draggedItem);

    // Save display orders
    const updated = reordered.map((p, i) => ({ ...p, displayOrder: i }));
    setPackages(updated); // responsive optimistic update
    setDraggedIndex(idx);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      await Promise.all(packages.map(p => endpoints.adminUpdatePackage(p.id, { displayOrder: p.displayOrder })));
    } catch (err) {
      console.error("Failed to persist display order:", err);
    }
  };

  if (loading) {
    return <AdminSkeleton />;
  }

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
            {packagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dezprox-primary" />
              </div>
            ) : sortedPackages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No packages configured.</p>
                <p className="text-xs text-gray-400 mt-1">Create different plans (e.g. Starter, Pro) for this service.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedPackages.map((pkg, idx) => (
                  <div
                    key={pkg.id}
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
                          className="p-1.5 border border-gray-150 text-gray-400 hover:text-dezprox-primary rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          title="Edit Package"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="p-1.5 border border-red-100 text-red-500 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Package"
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

      {/* Package Editor Modal */}
      {isEditorOpen && editingPackage && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-slate-900/5 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsEditorOpen(false)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-dezprox-primary mb-4">
              {packages.some(p => p.id === editingPackage.id) ? "Modify Pricing Tier" : "Add New Tier Plan"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Package Name</label>
                <Input
                  required
                  placeholder="e.g. Enterprise Suite"
                  value={editingPackage.name || ""}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Price ({currency})</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={editingPackage.price || 0}
                    onChange={(e) => setEditingPackage({ ...editingPackage, price: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {/* Timeline */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Delivery Timeline</label>
                  <Input
                    required
                    placeholder="e.g. 4-6 weeks"
                    value={editingPackage.timeline || ""}
                    onChange={(e) => setEditingPackage({ ...editingPackage, timeline: e.target.value })}
                  />
                </div>
              </div>

              {/* Badges/Promos */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2.5">
                <span className="text-[10px] font-black uppercase text-gray-550 block tracking-wider">Plan Badges & Highlights</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-dezprox-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingPackage.isRecommended || false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, isRecommended: e.target.checked })}
                      className="rounded text-dezprox-accent focus:ring-dezprox-accent/20 border-gray-300 w-4 h-4 cursor-pointer"
                    />
                    <span>Recommended Plan</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold text-dezprox-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingPackage.isPopular || false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, isPopular: e.target.checked })}
                      className="rounded text-dezprox-accent focus:ring-dezprox-accent/20 border-gray-300 w-4 h-4 cursor-pointer"
                    />
                    <span>Popular Highlight</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold text-dezprox-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingPackage.isBestValue || false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, isBestValue: e.target.checked })}
                      className="rounded text-dezprox-accent focus:ring-dezprox-accent/20 border-gray-300 w-4 h-4 cursor-pointer"
                    />
                    <span>Best Value Tag</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold text-dezprox-primary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingPackage.isNew || false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, isNew: e.target.checked })}
                      className="rounded text-dezprox-accent focus:ring-dezprox-accent/20 border-gray-300 w-4 h-4 cursor-pointer"
                    />
                    <span>New Release Label</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description</label>
                <Textarea
                  placeholder="Provide a summary of who this plan is tailored for..."
                  value={editingPackage.description || ""}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Features Builder */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Plan Features & Deliverables</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a feature and press Enter"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddFeature}
                    className="cursor-pointer font-bold shrink-0"
                  >
                    Add
                  </Button>
                </div>
                
                {/* Features list */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {(editingPackage.features || []).map((feat, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center pl-2 pr-1 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-dezprox-primary"
                    >
                      {feat}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feat)}
                        className="ml-1.5 p-0.5 text-gray-400 hover:text-red-500 rounded-md cursor-pointer hover:bg-gray-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Visibility Status</label>
                <Select
                  options={[
                    { value: "active", label: "Active & Published" },
                    { value: "inactive", label: "Inactive (Archived)" },
                  ]}
                  value={editingPackage.status || "active"}
                  onChange={(e) => setEditingPackage({ ...editingPackage, status: e.target.value as "active" | "inactive" })}
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
        </div>,
        document.body
      )}
    </div>
  );
}
