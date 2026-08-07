"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { 
  getGlobalSettings, 
  saveGlobalSettings, 
  GlobalSettings 
} from "@/utils/db";
import { Save, Check, RefreshCw } from "lucide-react";

export default function GlobalSettingsView() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSettings(getGlobalSettings());
  }, []);

  const handleInputChange = (field: keyof GlobalSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: field === "taxRate" || field === "discountRate" || field === "minimumCost" || field === "maximumCost" 
        ? (value === "" ? "" : value)
        : value
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const cleanedSettings: GlobalSettings = {
      ...settings,
      taxRate: parseFloat(settings.taxRate as any) || 0,
      discountRate: parseFloat(settings.discountRate as any) || 0,
      minimumCost: parseFloat(settings.minimumCost as any) || 0,
      maximumCost: parseFloat(settings.maximumCost as any) || 0,
    };

    saveGlobalSettings(cleanedSettings);
    setSettings(cleanedSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm("Reset settings back to original defaults?")) {
      const defaults: GlobalSettings = {
        companyName: "Dezprox Solutions",
        currency: "₹",
        taxRate: 18,
        discountRate: 0,
        defaultPricingMode: "Standard Additive",
        minimumCost: 500,
        maximumCost: 100000,
        gateEstimateWithLeadForm: false,
      };
      setSettings(defaults);
      saveGlobalSettings(defaults);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dezprox-primary tracking-tight">
            Global Settings
          </h1>
          <p className="text-dezprox-text/60 mt-1 text-sm">
            Configure system parameters, currency symbols, and estimate margins.
          </p>
        </div>
        
        {saveSuccess && (
          <div className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-full font-bold flex items-center gap-1.5 animate-bounce">
            <Check className="w-3.5 h-3.5" />
            Configuration Settings Saved Successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* General Business Info */}
          <Card className="border-gray-100 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-dezprox-primary">Company Profile & Branding</CardTitle>
              <CardDescription className="text-xs">Branding settings appearing on client quotes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Company Name</label>
                <Input
                  required
                  value={settings.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Estimate Currency</label>
                <Select
                  options={[
                    { value: "₹", label: "Indian Rupee (₹)" },
                    { value: "$", label: "US Dollar ($)" },
                    { value: "€", label: "Euro (€)" },
                    { value: "£", label: "British Pound (£)" },
                    { value: "¥", label: "Yen (¥)" },
                  ]}
                  value={settings.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Pricing Calculation Model</label>
                <Select
                  options={[
                    { value: "Standard Additive", label: "Standard Additive (Flat + Multipliers)" },
                    { value: "Aggressive Multiplier", label: "Aggressive Multiplier" },
                  ]}
                  value={settings.defaultPricingMode}
                  onChange={(e) => handleInputChange("defaultPricingMode", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">WhatsApp Contact Number</label>
                <Input
                  placeholder="e.g. +15550199000"
                  value={settings.whatsappNumber || ""}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                />
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Lead Gate Protection</label>
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleInputChange("gateEstimateWithLeadForm", !settings.gateEstimateWithLeadForm)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${
                      settings.gateEstimateWithLeadForm ? "bg-dezprox-primary" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-205 ease-in-out ${
                        settings.gateEstimateWithLeadForm ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-gray-650">
                    {settings.gateEstimateWithLeadForm ? "Enabled (Blur details & request lead info)" : "Disabled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax, Discounts & Financial Thresholds */}
          <Card className="border-gray-100 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-dezprox-primary">Financial & Cost Thresholds</CardTitle>
              <CardDescription className="text-xs">Adjust tax rates, discounts, and estimate bounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Global Tax Rate (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.taxRate}
                    onChange={(e) => handleInputChange("taxRate", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Global Discount (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.discountRate}
                    onChange={(e) => handleInputChange("discountRate", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Minimum Budget ({settings.currency})</label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.minimumCost}
                    onChange={(e) => handleInputChange("minimumCost", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Maximum Budget ({settings.currency})</label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.maximumCost}
                    onChange={(e) => handleInputChange("maximumCost", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Defaults
          </Button>

          <Button
            type="submit"
            variant="accent"
            size="sm"
            className="flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Configuration Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
