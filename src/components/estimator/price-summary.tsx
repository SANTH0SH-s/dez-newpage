"use client";

import React, { useEffect, useState } from "react";
import { TotalCalculationResult, GlobalSettings } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, X, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { endpoints, prepareEstimatePayload } from "@/lib/api/endpoints";

import { ContactData } from "./contact-form";

interface PriceSummaryProps {
  selectedServiceIds: string[];
  answers: Record<string, Record<string, unknown>>;
  onBack?: () => void;
  onNext?: () => void;
  sidebarMode?: boolean;
  projectModifiers?: { complexity?: string; urgency?: string; quality?: string };
  isMobileSheet?: boolean;
  contactData?: ContactData | null;
  onContactSave?: (data: ContactData) => void;
  calculationResult?: TotalCalculationResult;
}

// Smoothly animated count-up numbers using requestAnimationFrame
const AnimatedNumber = ({ value, currency }: { value: number; currency: string }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 350; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const ease = progress * (2 - progress); // Ease out quad
      const current = Math.round(start + (end - start) * ease);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, displayValue]);

  return <span>{currency}{displayValue.toLocaleString()}</span>;
};

export const PriceSummary = ({
  selectedServiceIds,
  answers,
  onBack,
  onNext,
  sidebarMode = false,
  projectModifiers = { complexity: "simple", urgency: "normal", quality: "standard" },
  isMobileSheet = false,
  contactData = null,
  onContactSave,
  calculationResult
}: PriceSummaryProps) => {
  const [settings] = useState<GlobalSettings | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("dezprox_settings");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Lead Gate local states
  const [localName, setLocalName] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [localPhone, setLocalPhone] = useState("");

  const currentSettings = settings || { currency: "₹", taxRate: 18, discountRate: 5, gateEstimateWithLeadForm: false };
  const currency = currentSettings.currency;

  const result = calculationResult;

  if (selectedServiceIds.length === 0 || !result) {
    return null;
  }

  // Calculations mirroring Quotation Proposal values
  const subtotal = result.oneTimeSubtotal;
  const discountAmount = result.oneTimeDiscount;
  const taxAmount = result.oneTimeTax;
  const grandTotal = result.oneTimeFinalCost;

  const monthlySubtotal = result.monthlySubtotal;
  const monthlyDiscount = result.monthlyDiscount;
  const monthlyTax = result.monthlyTax;
  const monthlyGrandTotal = result.monthlyFinalCost;

  const showGate = !!currentSettings.gateEstimateWithLeadForm && !contactData;

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName || !localEmail || !localPhone) return;

    const data = {
      name: localName,
      email: localEmail,
      phone: localPhone,
      company: "",
      notes: ""
    };

    if (onContactSave) onContactSave(data);



    // The estimate will be created once the user reaches the SuccessMessage (Step 4).
    // We only update the contactData in the parent here.
  };

  // Render Itemized breakdown rows
  const renderItemizedBreakdown = () => {
    const oneTimeItems: { name: string; costLabel: string }[] = [];
    const monthlyItems: { name: string; costLabel: string }[] = [];

    result.services.forEach((srv) => {
      srv.details.forEach((d) => {
        if (d.type !== "multiplier") {
          const item = {
            name: `${srv.serviceName} - ${d.name.replace("Add-on: ", "")}`,
            costLabel: d.costLabel
          };
          if (d.billingCycle === "monthly") {
            monthlyItems.push(item);
          } else {
            oneTimeItems.push(item);
          }
        }
      });
    });

    return (
      <div className="space-y-4">
        {oneTimeItems.length > 0 && (
          <div>
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">One-Time Charges</h5>
            <div className="space-y-2">
              {oneTimeItems.map((item, idx) => (
                <div key={`ot-${idx}`} className="flex justify-between text-xs font-semibold text-dezprox-primary">
                  <span className="max-w-[80%] leading-tight">{item.name}</span>
                  <span className="shrink-0 font-sans">{item.costLabel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {monthlyItems.length > 0 && (
          <div className="pt-2 border-t border-gray-100/50">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Monthly Charges</h5>
            <div className="space-y-2">
              {monthlyItems.map((item, idx) => (
                <div key={`m-${idx}`} className="flex justify-between text-xs font-semibold text-dezprox-primary">
                  <span className="max-w-[80%] leading-tight">{item.name}</span>
                  <span className="shrink-0 font-sans">{item.costLabel}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // MOBILE BOTTOM SHEET DRAWER
  if (isMobileSheet) {
    return (
      <>
        {/* Sticky Trigger Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-155 z-40 px-4 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.06)] flex items-center justify-between font-sans print:hidden">
          <div 
            className="flex items-center space-x-2.5 cursor-pointer"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <div className="p-1.5 bg-gray-50 border border-gray-150 rounded-lg text-gray-500">
              {isMobileOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4 animate-bounce" />}
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Running Estimate</span>
              <span className="text-base font-black text-dezprox-primary">
                <AnimatedNumber value={grandTotal} currency={currency} />
                {monthlyGrandTotal > 0 && (
                  <span className="text-xs font-bold text-gray-500 ml-1">
                    + <AnimatedNumber value={monthlyGrandTotal} currency={currency} />/mo
                  </span>
                )}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setIsMobileOpen(true)}
            variant="accent"
            className="font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Review Scope
          </Button>
        </div>

        {/* Drawer Backdrop & Sheet Overlay */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-black z-[80] print:hidden"
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-3xl z-[90] p-6 max-h-[85vh] overflow-y-auto shadow-2xl font-sans print:hidden"
              >
                {/* Drag Handle Icon Indicator */}
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setIsMobileOpen(false)} />
                
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                  <h3 className="font-extrabold text-sm text-dezprox-primary uppercase tracking-wider">Itemized Breakdown</h3>
                  <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scope rows */}
                <div className="max-h-[40vh] overflow-y-auto mb-6 pr-1">
                  {renderItemizedBreakdown()}
                </div>

                {/* Ledger calculation table */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-2 text-xs font-semibold text-dezprox-text/80 mb-6">
                  <div className="flex justify-between">
                    <span>One-Time Subtotal:</span>
                    <span className="text-dezprox-primary font-bold">{currency}{Math.round(subtotal).toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>One-Time Discount ({Math.round(currentSettings.discountRate)}%):</span>
                      <span>-{currency}{Math.round(discountAmount).toLocaleString()}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>One-Time GST ({Math.round(currentSettings.taxRate)}%):</span>
                      <span>+{currency}{Math.round(taxAmount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-black text-dezprox-primary text-xs">
                    <span>One-Time Total:</span>
                    <span className="text-sm font-extrabold"><AnimatedNumber value={grandTotal} currency={currency} /></span>
                  </div>
                  {monthlySubtotal > 0 && (
                    <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Monthly Subtotal:</span>
                        <span className="text-dezprox-primary font-bold">{currency}{Math.round(monthlySubtotal).toLocaleString()}/month</span>
                      </div>
                      {monthlyDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Monthly Discount ({Math.round(currentSettings.discountRate)}%):</span>
                          <span>-{currency}{Math.round(monthlyDiscount).toLocaleString()}/month</span>
                        </div>
                      )}
                      {monthlyTax > 0 && (
                        <div className="flex justify-between">
                          <span>Monthly GST ({Math.round(currentSettings.taxRate)}%):</span>
                          <span>+{currency}{Math.round(monthlyTax).toLocaleString()}/month</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-150 pt-1 font-black text-dezprox-primary text-xs">
                        <span>Monthly Total:</span>
                        <span className="text-sm font-extrabold"><AnimatedNumber value={monthlyGrandTotal} currency={currency} />/month</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full font-bold text-xs py-3.5 rounded-xl cursor-pointer"
                  variant="primary"
                >
                  Return to Questionnaire
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // DESKTOP STICKY SIDEBAR CARD
  if (sidebarMode) {
    return (
      <Card className="border-gray-150 shadow-md bg-white overflow-y-auto rounded-2xl max-w-sm max-h-[calc(100vh-160px)]">
        {/* Header Ribbon */}
        <div className="bg-dezprox-primary text-white p-5 relative">
          <span className="text-[10px] font-black uppercase tracking-wider block text-dezprox-accent">
            Live Pricing Calculator
          </span>
          <div className="mt-2 flex flex-col justify-start">
            <span className="text-xl font-black font-sans">
              One-Time: <AnimatedNumber value={grandTotal} currency={currency} />
            </span>
            {monthlyGrandTotal > 0 && (
              <span className="text-base font-black font-sans text-dezprox-accent mt-1 animate-pulse">
                Monthly: <AnimatedNumber value={monthlyGrandTotal} currency={currency} />/month
              </span>
            )}
          </div>
          <span className="text-[10px] text-white/50 block mt-1 font-semibold uppercase">
            Inc. {Math.round(currentSettings.taxRate)}% Tax & {Math.round(currentSettings.discountRate)}% Discount
          </span>
        </div>

        <CardContent className="p-5 font-sans space-y-4">
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Itemized Breakdown
            </h4>
            <div className="max-h-[30vh] overflow-y-auto pr-1 space-y-3">
              {renderItemizedBreakdown()}
            </div>
          </div>

          {/* Subtotals Ledger */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs font-semibold text-dezprox-text/80">
            <div className="flex justify-between">
              <span>One-Time Subtotal:</span>
              <span className="text-dezprox-primary font-bold">{currency}{Math.round(subtotal).toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>One-Time Discount ({Math.round(currentSettings.discountRate)}%):</span>
                <span>-{currency}{Math.round(discountAmount).toLocaleString()}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between">
                <span>One-Time GST ({Math.round(currentSettings.taxRate)}%):</span>
                <span>+{currency}{Math.round(taxAmount).toLocaleString()}</span>
              </div>
            )}
            {monthlyGrandTotal > 0 && (
              <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Monthly Subtotal:</span>
                  <span className="text-dezprox-primary font-bold">{currency}{Math.round(monthlySubtotal).toLocaleString()}/month</span>
                </div>
                {monthlyDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Monthly Discount ({Math.round(currentSettings.discountRate)}%):</span>
                    <span>-{currency}{Math.round(monthlyDiscount).toLocaleString()}/month</span>
                  </div>
                )}
                {monthlyTax > 0 && (
                  <div className="flex justify-between">
                    <span>Monthly GST ({Math.round(currentSettings.taxRate)}%):</span>
                    <span>+{currency}{Math.round(monthlyTax).toLocaleString()}/month</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-2 text-dezprox-primary font-bold">
              <span>Timeline:</span>
              <motion.span key={result.estimatedTimeline} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-bold">{result.estimatedTimeline}</motion.span>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 leading-relaxed pt-2 border-t border-gray-100 font-medium">
            *Final proposal quotation dispatches with complete PDF documents after inquiry check.
          </div>
        </CardContent>
      </Card>
    );
  }

  // STANDARD STEP VIEWPORT RENDER (STEP 3 FULL REVIEW)
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 font-sans">
      <div className="flex flex-col items-center text-center mb-8">
        <Badge variant="accent" className="px-3 py-1 font-sans text-[10px] uppercase font-bold tracking-widest mb-2">
          Step 3: Cost Validation
        </Badge>
        <h2 className="text-xl md:text-2xl font-extrabold text-dezprox-primary">
          Estimate Proposal Review
        </h2>
        <p className="text-dezprox-text/60 mt-1 text-xs max-w-md leading-relaxed">
          Verify your itemized configuration setup details before generating proposal quotation contracts.
        </p>
      </div>

      <div className="relative">
        <Card className={twMerge("border-gray-250 shadow-md bg-white rounded-2xl p-6 md:p-8 space-y-6 transition-all duration-300", showGate ? "filter blur-md select-none pointer-events-none" : "")}>
          <div className="border-b border-gray-100 pb-5 flex flex-col md:flex-row justify-between items-baseline gap-2">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Estimated Totals</span>
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-xl md:text-2xl font-black text-dezprox-primary tracking-tight">
                  One-Time: <AnimatedNumber value={grandTotal} currency={currency} />
                </span>
                {monthlyGrandTotal > 0 && (
                  <span className="text-lg md:text-xl font-black text-dezprox-accent tracking-tight">
                    Monthly: <AnimatedNumber value={monthlyGrandTotal} currency={currency} />/month
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Inc. {Math.round(currentSettings.taxRate)}% Tax & {Math.round(currentSettings.discountRate)}% Discount
            </span>
          </div>

          {/* Scope Rows divided by Billing Cycle */}
          <div className="space-y-6">
            {/* One-Time charges group */}
            {(() => {
              const otServices = result.services.filter(s => s.details.some(d => d.billingCycle !== "monthly"));
              if (otServices.length === 0) return null;
              return (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none border-b border-gray-100 pb-2">
                    One-Time Services
                  </h4>
                  <div className="divide-y divide-gray-100">
                    {otServices.map((srv) => {
                      const oneTimeDetails = srv.details.filter(d => d.billingCycle !== "monthly");
                      const baseItem = oneTimeDetails.find(d => d.type === "base");
                      const displayName = baseItem ? baseItem.name : srv.serviceName;
                      const addonsList = oneTimeDetails.filter(d => d.type !== "base");

                      let srvOtCost = 0;
                      oneTimeDetails.forEach(d => {
                        if (d.type !== "multiplier") srvOtCost += d.amount;
                      });
                      srvOtCost *= srv.multiplierProduct;

                      return (
                        <div key={`ot-${srv.serviceId}`} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex justify-between items-start font-bold text-dezprox-primary text-sm">
                            <span>{displayName}</span>
                            <span>{currency}{Math.round(srvOtCost).toLocaleString()}</span>
                          </div>
                          {addonsList.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              {addonsList.map((addon) => (
                                <div key={addon.id} className="flex justify-between items-center p-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs">
                                  <span className="font-semibold text-dezprox-primary">{addon.name}</span>
                                  <span className="font-bold text-dezprox-primary font-sans shrink-0 ml-4">{addon.costLabel}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Monthly subscription charges group */}
            {monthlySubtotal > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none border-b border-gray-100 pb-2">
                  Monthly Subscription Services
                </h4>
                <div className="divide-y divide-gray-100">
                  {result.services.filter(s => s.details.some(d => d.billingCycle === "monthly")).map((srv) => {
                    const monthlyDetails = srv.details.filter(d => d.billingCycle === "monthly");
                    const baseItem = monthlyDetails.find(d => d.type === "base");
                    const displayName = baseItem ? baseItem.name : srv.serviceName;
                    const addonsList = monthlyDetails.filter(d => d.type !== "base");

                    let srvMoCost = 0;
                    monthlyDetails.forEach(d => {
                      if (d.type !== "multiplier") srvMoCost += d.amount;
                    });
                    srvMoCost *= srv.multiplierProduct;

                    return (
                      <div key={`mo-${srv.serviceId}`} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start font-bold text-dezprox-primary text-sm">
                          <span>{displayName}</span>
                          <span>{currency}{Math.round(srvMoCost).toLocaleString()}/month</span>
                        </div>
                        {addonsList.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {addonsList.map((addon) => (
                              <div key={addon.id} className="flex justify-between items-center p-2.5 bg-gray-50/50 border border-gray-100 rounded-lg text-xs">
                                <span className="font-semibold text-dezprox-primary">{addon.name}</span>
                                <span className="font-bold text-dezprox-primary font-sans shrink-0 ml-4">{addon.costLabel}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Totals Ledger */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 space-y-4 text-xs font-semibold text-dezprox-text/80 pt-6">
            {/* One-Time section */}
            <div className="space-y-2">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">One-Time charges ledger</div>
              <div className="flex justify-between">
                <span>One-Time Subtotal:</span>
                <span className="text-dezprox-primary font-bold">{currency}{Math.round(subtotal).toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>One-Time Discount ({Math.round(currentSettings.discountRate)}%):</span>
                  <span className="font-bold">-{currency}{Math.round(discountAmount).toLocaleString()}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>One-Time GST ({Math.round(currentSettings.taxRate)}%):</span>
                  <span className="text-dezprox-primary font-bold">{currency}{Math.round(taxAmount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-dezprox-primary text-xs pt-1 border-t border-dashed border-gray-200">
                <span>One-Time Cost:</span>
                <span className="text-sm font-extrabold">{currency}{Math.round(grandTotal).toLocaleString()}</span>
              </div>
            </div>

            {/* Monthly section */}
            {monthlySubtotal > 0 && (
              <div className="space-y-2 pt-4 border-t border-gray-255">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly subscription ledger</div>
                <div className="flex justify-between">
                  <span>Monthly Subtotal:</span>
                  <span className="text-dezprox-primary font-bold">{currency}{Math.round(monthlySubtotal).toLocaleString()}/month</span>
                </div>
                {monthlyDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Monthly Discount ({Math.round(currentSettings.discountRate)}%):</span>
                    <span className="font-bold">-{currency}{Math.round(monthlyDiscount).toLocaleString()}/month</span>
                  </div>
                )}
                {monthlyTax > 0 && (
                  <div className="flex justify-between">
                    <span>Monthly GST ({Math.round(currentSettings.taxRate)}%):</span>
                    <span className="text-dezprox-primary font-bold">{currency}{Math.round(monthlyTax).toLocaleString()}/month</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-dezprox-primary text-xs pt-1 border-t border-dashed border-gray-200">
                  <span>Monthly Cost:</span>
                  <span className="text-sm font-extrabold">{currency}{Math.round(monthlyGrandTotal).toLocaleString()}/month</span>
                </div>
              </div>
            )}

            <div className="flex justify-between border-t border-gray-250/30 pt-3 text-dezprox-primary font-black text-sm">
              <span>Estimated Project Delivery:</span>
              <motion.span key={result.estimatedTimeline} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-base font-extrabold text-dezprox-primary">{result.estimatedTimeline}</motion.span>
            </div>
          </div>
        </Card>

        {/* Lead Gate Overlay Card */}
        {showGate && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
            <div className="bg-white/95 border border-gray-150 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4 font-sans">
              <div className="text-center">
                <span className="text-[9px] font-black tracking-widest text-dezprox-accent uppercase block">
                  Unlock Cost Summary
                </span>
                <h3 className="text-sm font-extrabold text-dezprox-primary mt-1">
                  Enter Basic Details to View
                </h3>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  Provide your information to unlock the itemized price breakdown.
                </p>
              </div>

              <form onSubmit={handleGateSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase block">Full Name *</label>
                  <Input
                    required
                    placeholder="e.g. Aman Sharma"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase block">Email Address *</label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. aman@techcorp.in"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase block">Contact Number *</label>
                  <Input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  className="w-full font-bold text-xs py-2.5 rounded-xl cursor-pointer mt-4"
                >
                  Unlock Proposal Review
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {onBack && !showGate && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 cursor-pointer font-bold text-xs py-3.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Configuration
          </Button>
        )}

        {onNext && !showGate && (
          <Button
            variant="accent"
            onClick={onNext}
            className="flex items-center gap-2 cursor-pointer font-bold text-xs py-3.5 ml-auto"
          >
            Generate Quotation Proposal
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
