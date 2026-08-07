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
  Service 
} from "@/utils/db";
import { getIcon } from "@/data/servicesData";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  X, 
  Save
} from "lucide-react";

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [currency, setCurrency] = useState("₹");
  
  // Editor/Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  const handleFileChange = (field: "iconImage" | "cardImage" | "heroBanner" | "thumbnail", file: File | null) => {
    if (!file || !editingService) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingService(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: reader.result as string
        };
      });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setServices(getServices());
    setCurrency(getGlobalSettings().currency);
  }, []);

  const handleToggleStatus = (id: string) => {
    const list = services.map((s) => 
      s.id === id 
        ? { ...s, status: (s.status === "active" ? "inactive" : "active") as "active" | "inactive" } 
        : s
    );
    setServices(list);
    saveServices(list);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service? This may affect estimates referencing it.")) {
      const list = services.filter((s) => s.id !== id);
      setServices(list);
      saveServices(list);
    }
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setIsEditorOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingService({
      id: `service-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      category: "Development",
      description: "",
      iconName: "Globe",
      basePrice: 1000,
      unitType: "Project",
      status: "active",
      questions: [],
      pricingComponents: []
    });
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name || !editingService.id) return;

    let updatedList = [...services];
    const index = services.findIndex((s) => s.id === editingService.id);
    
    if (index > -1) {
      updatedList[index] = editingService as Service;
    } else {
      updatedList.push(editingService as Service);
    }

    setServices(updatedList);
    saveServices(updatedList);
    setIsEditorOpen(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
            Service Management
          </h1>
          <p className="text-dezprox-text/60 mt-1 text-sm">
            Configure dynamic services that users can select in the client-facing estimator portal.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          variant="accent"
          size="sm"
          className="flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {/* Services Table */}
      <Card className="overflow-hidden border-gray-100 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-dezprox-primary font-bold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">Service</th>
                <th className="p-4">Category</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Unit Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service) => {
                const Icon = getIcon(service.iconName);
                const isActive = service.status === "active";
                return (
                  <tr key={service.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 pl-6 flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isActive ? "bg-dezprox-accent/10 text-dezprox-primary" : "bg-gray-100 text-gray-400"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-dezprox-primary block">{service.name}</span>
                        <span className="text-xs text-gray-400 max-w-xs truncate block">{service.description}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-600">{service.category}</td>
                    <td className="p-4 font-bold text-dezprox-primary">{currency}{service.basePrice.toLocaleString()}</td>
                    <td className="p-4 text-xs font-semibold text-gray-500">{service.unitType || "Project"}</td>
                    <td className="p-4">
                      <Badge variant={isActive ? "accent" : "outline"} className="capitalize font-bold text-[10px]">
                        {service.status}
                      </Badge>
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleToggleStatus(service.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isActive 
                            ? "border-amber-200 text-amber-600 hover:bg-amber-50" 
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={isActive ? "Disable Service" : "Enable Service"}
                      >
                        {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="p-1.5 border border-gray-200 text-gray-500 rounded-lg hover:text-dezprox-primary hover:bg-gray-50 transition-all cursor-pointer"
                        title="Edit Service"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-1.5 border border-red-100 text-red-500 rounded-lg hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Editor Modal Overlays */}
      {isEditorOpen && editingService && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsEditorOpen(false)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-dezprox-primary mb-4">
              {services.some(s => s.id === editingService.id) ? "Modify Service Profile" : "Create New Estimate Service"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Service Name</label>
                <Input
                  required
                  placeholder="e.g. Cybersecurity Audits"
                  value={editingService.name || ""}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Category</label>
                <Select
                  options={[
                    { value: "Development", label: "Development" },
                    { value: "Design", label: "Design" },
                    { value: "Marketing", label: "Marketing" },
                    { value: "AI & Data Science", label: "AI & Data Science" },
                    { value: "Cloud & DevOps", label: "Cloud & DevOps" },
                    { value: "General", label: "General" },
                  ]}
                  value={editingService.category || "Development"}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Base Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Base Price ({currency})</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={editingService.basePrice || 0}
                    onChange={(e) => setEditingService({ ...editingService, basePrice: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {/* Unit Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Unit Type</label>
                  <Select
                    options={[
                      { value: "Project", label: "Per Project" },
                      { value: "Month", label: "Per Month" },
                      { value: "Screen", label: "Per Screen" },
                      { value: "Hour", label: "Per Hour" },
                    ]}
                    value={editingService.unitType || "Project"}
                    onChange={(e) => setEditingService({ ...editingService, unitType: e.target.value })}
                  />
                </div>
              </div>

              {/* Icon Choice */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Lucide Icon name</label>
                <Select
                  options={[
                    { value: "Globe", label: "Globe (Web)" },
                    { value: "Smartphone", label: "Smartphone (Mobile)" },
                    { value: "Palette", label: "Palette (Design)" },
                    { value: "Megaphone", label: "Megaphone (Marketing)" },
                    { value: "Search", label: "Search (SEO)" },
                    { value: "Award", label: "Award (Branding)" },
                    { value: "Cpu", label: "Cpu (AI/Core)" },
                    { value: "Code", label: "Code (Development)" },
                    { value: "Cloud", label: "Cloud (DevOps)" },
                    { value: "ShoppingBag", label: "ShoppingBag (E-com)" },
                  ]}
                  value={editingService.iconName || "Globe"}
                  onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value })}
                />
              </div>

              {/* Asset Uploads */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-150">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-550 block">Card Icon Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("iconImage", e.target.files?.[0] || null)}
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-dezprox-accent/15 file:text-dezprox-primary hover:file:bg-dezprox-accent/25 cursor-pointer block w-full"
                  />
                  {editingService.iconImage && (
                    <img src={editingService.iconImage} alt="Icon Preview" className="h-6 object-contain border rounded p-0.5 bg-white mt-1" />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-550 block">Card Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("cardImage", e.target.files?.[0] || null)}
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-dezprox-accent/15 file:text-dezprox-primary hover:file:bg-dezprox-accent/25 cursor-pointer block w-full"
                  />
                  {editingService.cardImage && (
                    <img src={editingService.cardImage} alt="Card Preview" className="h-6 object-contain border rounded p-0.5 bg-white mt-1" />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-550 block">Hero Banner</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("heroBanner", e.target.files?.[0] || null)}
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-dezprox-accent/15 file:text-dezprox-primary hover:file:bg-dezprox-accent/25 cursor-pointer block w-full"
                  />
                  {editingService.heroBanner && (
                    <img src={editingService.heroBanner} alt="Hero Preview" className="h-6 object-contain border rounded p-0.5 bg-white mt-1" />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-550 block">Thumbnail</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("thumbnail", e.target.files?.[0] || null)}
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-dezprox-accent/15 file:text-dezprox-primary hover:file:bg-dezprox-accent/25 cursor-pointer block w-full"
                  />
                  {editingService.thumbnail && (
                    <img src={editingService.thumbnail} alt="Thumbnail Preview" className="h-6 object-contain border rounded p-0.5 bg-white mt-1" />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description</label>
                <Textarea
                  placeholder="Provide a summary of the capabilities included..."
                  value={editingService.description || ""}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
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
