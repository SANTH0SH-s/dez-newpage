"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiplierSet, Multiplier } from "@/lib/types";
import { Save, AlertCircle } from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { AdminSkeleton } from "@/components/ui/admin-skeleton";

export default function MultiplierManagement() {
  const [multipliers, setMultipliers] = useState<MultiplierSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchMultipliers = async () => {
    try {
      setLoading(true);
      const res = await endpoints.adminGetMultipliers();
      if (res.success && res.data) {
        setAllMultipliers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setAllMultipliers = (data: any) => {
    // Organize by categories
    const complexity: Multiplier[] = [];
    const urgency: Multiplier[] = [];
    const quality: Multiplier[] = [];

    const items = Array.isArray(data) ? data : [...(data.complexity || []), ...(data.urgency || []), ...(data.quality || [])];

    items.forEach((item: any) => {
      const formatted: Multiplier = {
        id: item.id,
        category: item.category,
        label: item.label,
        value: Number(item.value),
        description: item.description || ""
      };
      if (item.category === "complexity") complexity.push(formatted);
      if (item.category === "urgency") urgency.push(formatted);
      if (item.category === "quality") quality.push(formatted);
    });

    setMultipliers({ complexity, urgency, quality });
  };

  useEffect(() => {
    fetchMultipliers();
  }, []);

  const handleMultiplierChange = (
    category: keyof MultiplierSet,
    id: string,
    field: keyof Multiplier,
    value: string | number
  ) => {
    if (!multipliers) return;
    
    const updatedCategory = multipliers[category].map((item) => 
      item.id === id 
        ? { ...item, [field]: field === "value" ? parseFloat(String(value)) || 1.0 : value } 
        : item
    );

    setMultipliers({
      ...multipliers,
      [category]: updatedCategory
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!multipliers) return;

    try {
      setSaving(true);
      // Collect all flat items to update
      const allItems = [
        ...multipliers.complexity,
        ...multipliers.urgency,
        ...multipliers.quality
      ];

      await Promise.all(allItems.map(item => 
        endpoints.adminUpdateMultiplier(item.id, { value: item.value })
      ));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchMultipliers();
    } catch (err) {
      console.error("Failed to save multipliers:", err);
      alert("Failed to save multipliers.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !multipliers) {
    return <AdminSkeleton />;
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
            Multiplier Management
          </h1>
          <p className="text-dezprox-text/60 mt-1 text-sm">
            Adjust project-wide coefficients applied to base and addon fees during estimation.
          </p>
        </div>
        
        {saveSuccess && (
          <div className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-full font-bold flex items-center gap-1.5 animate-bounce">
            <AlertCircle className="w-3.5 h-3.5" />
            Coefficients Updated successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Complexity Multipliers */}
          <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-sm font-black text-dezprox-primary uppercase tracking-wider">
                1. Project Complexity
              </CardTitle>
              <CardDescription className="text-xs">
                Coefficients based on technical complexity
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {multipliers.complexity.map((mult) => (
                <div key={mult.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {mult.label} Multiplier
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">ID: {mult.id}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={mult.value}
                      onChange={(e) => handleMultiplierChange("complexity", mult.id, "value", e.target.value)}
                    />
                    <div className="bg-gray-50 text-gray-500 font-bold border border-gray-200 rounded-xl px-4 flex items-center justify-center text-xs w-16 shrink-0">
                      x
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Urgency Multipliers */}
          <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-sm font-black text-dezprox-primary uppercase tracking-wider">
                2. Project Urgency
              </CardTitle>
              <CardDescription className="text-xs">
                Surcharges based on project delivery timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {multipliers.urgency.map((mult) => (
                <div key={mult.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {mult.label} Multiplier
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">ID: {mult.id}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={mult.value}
                      onChange={(e) => handleMultiplierChange("urgency", mult.id, "value", e.target.value)}
                    />
                    <div className="bg-gray-50 text-gray-500 font-bold border border-gray-200 rounded-xl px-4 flex items-center justify-center text-xs w-16 shrink-0">
                      x
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quality Multipliers */}
          <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-sm font-black text-dezprox-primary uppercase tracking-wider">
                3. Deliverable Quality
              </CardTitle>
              <CardDescription className="text-xs">
                Standards of design, testing and code robustness
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {multipliers.quality.map((mult) => (
                <div key={mult.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {mult.label} Multiplier
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">ID: {mult.id}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={mult.value}
                      onChange={(e) => handleMultiplierChange("quality", mult.id, "value", e.target.value)}
                    />
                    <div className="bg-gray-50 text-gray-500 font-bold border border-gray-200 rounded-xl px-4 flex items-center justify-center text-xs w-16 shrink-0">
                      x
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="accent"
            size="sm"
            disabled={saving}
            className="flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Multiplier Coefficients"}
          </Button>
        </div>
      </form>
    </div>
  );
}
