"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { calculateProjectCosts } from "@/utils/pricingCalculator";
import { ContactData } from "./contact-form";
import { 
  Check, 
  ArrowRight,
  Printer, 
  Sparkles, 
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  FileText,
  FileDown,
  MessageCircle,
  PhoneCall,
  Headphones,
  CalendarDays,
  X,
  CheckCircle,
  HelpCircle,
  Clock,
  Coins
} from "lucide-react";
import { getGlobalSettings, addEstimate } from "@/utils/db";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";

interface SuccessMessageProps {
  selectedServiceIds: string[];
  answers: Record<string, Record<string, any>>;
  contactData: ContactData | null;
  onReset: () => void;
  onBack?: () => void;
  projectModifiers?: { complexity?: string; urgency?: string; quality?: string };
  onContactSave?: (data: ContactData) => void;
}

export const SuccessMessage = ({
  selectedServiceIds,
  answers,
  contactData,
  onReset,
  onBack,
  projectModifiers = { complexity: "simple", urgency: "normal", quality: "standard" },
  onContactSave
}: SuccessMessageProps) => {
  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState("₹");
  const [whatsappConfigured, setWhatsappConfigured] = useState(false);
  const [settings, setSettings] = useState<any | null>(null);
  
  // Lead Generation Modals / Forms States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"pdf" | "consultation" | "email" | "callback" | null>(null);
  
  // Local form inputs
  const [localName, setLocalName] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [localCompany, setLocalCompany] = useState("");
  const [localNotes, setLocalNotes] = useState("");
  
  // Instant Confirmation feedback states
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "info"; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const settings = getGlobalSettings();
    setSettings(settings);
    setCurrency(settings.currency);
    setWhatsappConfigured(!!settings.whatsappNumber);
  }, []);

  const result = calculateProjectCosts(selectedServiceIds, answers, projectModifiers);

  // Proposal Numbers and Dates
  const today = React.useMemo(() => {
    return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }, []);

  const validityDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }, []);

  const quotationNumber = React.useMemo(() => {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `QTN-2026-${num}`;
  }, []);

  const currentSettings = settings || { currency: "₹", taxRate: 18, discountRate: 5 };
  const subtotal = result.totalCalculatedCost;
  const discountRate = currentSettings.discountRate / 100;
  const discountAmount = subtotal * discountRate;
  const taxableAmount = subtotal - discountAmount;
  const taxRate = currentSettings.taxRate / 100;
  const taxAmount = taxableAmount * taxRate;
  const grandTotal = taxableAmount + taxAmount;

  if (!mounted) return null;

  // Build the prefilled WhatsApp Text
  const getWhatsAppLink = (expertMode = false) => {
    const settings = getGlobalSettings();
    const wsNum = settings.whatsappNumber || "+15550199000";
    const cleanedNum = wsNum.replace(/[^0-9+]/g, "");
    
    const serviceDetails = result.services.map(s => {
      const baseItem = s.details.find((d: any) => d.type === "base");
      const displayName = baseItem ? baseItem.name : s.serviceName;
      return `- ${displayName} (${currency}${Math.round(s.totalCost).toLocaleString()})`;
    }).join("\n");

    const message = expertMode 
      ? `Hello! I would like to consult with an expert regarding proposal ID ${quotationNumber}. The calculated grand total is ${currency}${Math.round(grandTotal).toLocaleString()}.`
      : `Hello! I just configured my custom project estimate on your portal.\n\n` +
        `*Proposal ID:* ${quotationNumber}\n` +
        `*Configured Services:* \n${serviceDetails}\n\n` +
        `*Subtotal:* ${currency}${Math.round(subtotal).toLocaleString()}\n` +
        `*GST (${Math.round(currentSettings.taxRate)}%):* ${currency}${Math.round(taxAmount).toLocaleString()}\n` +
        `*Grand Total:* ${currency}${Math.round(grandTotal).toLocaleString()}\n\n` +
        `Please let me know how we can proceed with a formal scope review!`;

    return `https://wa.me/${cleanedNum}?text=${encodeURIComponent(message)}`;
  };

  const handleActionClick = (actionType: "pdf" | "consultation" | "email" | "callback") => {
    if (contactData) {
      executeDirectAction(actionType, contactData);
    } else {
      setModalAction(actionType);
      setIsModalOpen(true);
    }
  };

  const executeDirectAction = (action: "pdf" | "consultation" | "email" | "callback", data: ContactData) => {
    if (action === "pdf") {
      window.print();
      triggerAlert("success", "Opening print/download prompt for your Quotation PDF.");
    } else if (action === "consultation") {
      triggerAlert("success", `Thank you ${data.name}! We have scheduled a free 30-minute scope consultation. A calendar invite is sent to ${data.email}.`);
    } else if (action === "email") {
      triggerAlert("success", `Proposal ${quotationNumber} has been sent successfully to ${data.email}.`);
    } else if (action === "callback") {
      triggerAlert("success", `Callback request received. One of our experts will call you at ${data.phone} within 2 hours.`);
    }
  };

  const triggerAlert = (type: "success" | "info", text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName || !localEmail || !localPhone) return;

    const data: ContactData = {
      name: localName,
      email: localEmail,
      phone: localPhone,
      company: localCompany,
      notes: localNotes
    };

    if (onContactSave) onContactSave(data);

    const rangeText = `${currency}${Math.round(result.estimatedMin).toLocaleString()} - ${currency}${Math.round(result.estimatedMax).toLocaleString()}`;
    addEstimate({
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      customerCompany: data.company,
      notes: data.notes,
      serviceNames: result.services.map(s => s.serviceName),
      totalPrice: grandTotal,
      status: "pending",
      breakdown: result,
      answers: answers,
      estimateRange: rangeText
    });

    setIsModalOpen(false);
    
    if (modalAction) {
      executeDirectAction(modalAction, data);
    }
  };

  const overallTimeline = result.estimatedTimeline;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 font-sans print:p-0">
      
      {/* Alert Notification Toast */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-dezprox-primary border border-dezprox-accent/20 text-white rounded-full px-6 py-3 shadow-2xl flex items-center space-x-2 text-xs font-bold font-sans tracking-wide"
          >
            <CheckCircle className="w-4 h-4 text-dezprox-accent" />
            <span>{alertMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Indicators Header (Lead Generation Panel) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
        {/* Cost Summary Card */}
        <Card className="p-5 border-gray-155 shadow-sm bg-white relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-gray-400">
            <Coins className="w-4 h-4 text-dezprox-accent" />
            <span className="text-xs font-black uppercase tracking-wider block">Estimated Quote Total</span>
          </div>
          <div className="my-3">
            <span className="text-2xl md:text-3xl font-black text-dezprox-primary block tracking-tight">
              {currency}{Math.round(grandTotal).toLocaleString()}
            </span>
            <span className="text-xs text-gray-550 font-bold block mt-0.5 uppercase tracking-wide">
              Inc. {Math.round(currentSettings.taxRate)}% Tax & {Math.round(currentSettings.discountRate)}% Discount
            </span>
          </div>
          <Badge variant="secondary" className="self-start text-[10px] font-bold bg-dezprox-accent/10 border-dezprox-accent/20 text-dezprox-primary">
            Proposal ID: {quotationNumber}
          </Badge>
        </Card>

        {/* Outer Grid Wrapper */}
        <Card className="p-5 border-gray-155 shadow-sm bg-white flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-4 h-4 text-dezprox-accent" />
            <span className="text-xs font-black uppercase tracking-wider block">Target Timeline</span>
          </div>
          <div className="my-3">
            <span className="text-2xl md:text-3xl font-black text-dezprox-primary block tracking-tight">
              {overallTimeline}
            </span>
            <span className="text-xs text-gray-550 font-bold block mt-0.5 uppercase tracking-wide">
              Subject to scope finalization
            </span>
          </div>
          <Badge variant="secondary" className="self-start text-[10px] font-bold bg-indigo-50 border-indigo-150 text-indigo-650">
            Priority Delivery Available
          </Badge>
        </Card>

        {/* Config Summary Card */}
        <Card className="p-5 border-gray-155 shadow-sm bg-white flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-gray-400">
            <Sparkles className="w-4 h-4 text-dezprox-accent" />
            <span className="text-xs font-black uppercase tracking-wider block">Configured Scope</span>
          </div>
          <div className="my-3 text-xs text-dezprox-primary font-bold space-y-1 mt-4">
            {result.services.map((s, idx) => (
              <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-gray-50 border border-gray-150 rounded text-xs font-bold text-dezprox-primary mr-1 mb-1 shadow-sm">
                {s.serviceName}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500 font-bold block">
            {selectedServiceIds.length} Core Module{selectedServiceIds.length > 1 ? "s" : ""} selected.
          </span>
        </Card>
      </div>

      {/* CTA Lead Generation Actions Grid */}
      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 mb-10 shadow-sm print:hidden">
        <h3 className="text-xs font-black text-dezprox-primary uppercase tracking-widest block mb-4 text-center">
          Take Next Steps
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          
          {/* Download PDF Quote */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => handleActionClick("pdf")}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs shadow-sm bg-white hover:border-dezprox-accent/20"
            >
              <FileDown className="w-4 h-4 text-dezprox-accent" />
              Download PDF Quote
            </Button>
          </motion.div>

          {/* Chat on WhatsApp */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => window.open(getWhatsAppLink(), "_blank")}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs shadow-sm bg-white hover:border-green-400"
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              Chat on WhatsApp
            </Button>
          </motion.div>

          {/* Request Callback */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => handleActionClick("callback")}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs shadow-sm bg-white hover:border-indigo-400"
            >
              <PhoneCall className="w-4 h-4 text-indigo-500" />
              Request Callback
            </Button>
          </motion.div>

          {/* Talk to an Expert */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => window.open(getWhatsAppLink(true), "_blank")}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs shadow-sm bg-white hover:border-red-400"
            >
              <Headphones className="w-4 h-4 text-red-500" />
              Talk to an Expert
            </Button>
          </motion.div>

          {/* Book Consultation */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => handleActionClick("consultation")}
              variant="accent"
              className="w-full h-12 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs shadow-md"
            >
              <CalendarDays className="w-4 h-4 text-white" />
              Book Consultation
            </Button>
          </motion.div>

          {/* Email Quote */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => handleActionClick("email")}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs shadow-sm bg-white hover:border-amber-400"
            >
              <Mail className="w-4 h-4 text-amber-500" />
              Email Proposal Quote
            </Button>
          </motion.div>
        </div>
      </div>

      {/* The Printable Proposal Sheet (Embedded, always visible) */}
      <Card className="border-gray-200/80 shadow-xl overflow-hidden rounded-2xl bg-white relative p-8 md:p-12 print:border-none print:shadow-none print:p-0">
        
        {/* Quotation Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-100 pb-8 gap-6">
          <div>
            {/* Corporate Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-dezprox-primary flex items-center justify-center text-white font-black text-base shadow-sm">
                D
              </div>
              <span className="text-lg font-black text-dezprox-primary tracking-wider">DEZPROX</span>
            </div>
            <p className="text-xs text-dezprox-text/50 mt-2 font-medium">
              Premium Service Development & Strategy Hub<br />
              100 Cloud Parkway, Tech District, Suite 500<br />
              contact@dezprox.com | +1 (555) 019-9000
            </p>
          </div>

          <div className="md:text-right">
            <h1 className="text-3xl font-black text-dezprox-primary tracking-tight">QUOTATION</h1>
            <div className="mt-3 text-xs space-y-1 text-dezprox-text/60 font-semibold">
              <p><span className="text-gray-400 font-bold uppercase tracking-widest mr-1 text-[9px]">Proposal No:</span> <span className="font-mono text-dezprox-primary font-bold">{quotationNumber}</span></p>
              <p><span className="text-gray-400 font-bold uppercase tracking-widest mr-1 text-[9px]">Date:</span> {today}</p>
              <p><span className="text-gray-400 font-bold uppercase tracking-widest mr-1 text-[9px]">Validity:</span> {validityDate}</p>
            </div>
          </div>
        </div>

        {/* Customer & Prepared By Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Prepared For:</span>
            {contactData ? (
              <div className="text-xs space-y-1 font-medium text-dezprox-primary">
                <p className="font-extrabold text-sm text-dezprox-primary">{contactData.name}</p>
                {contactData.company && (
                  <p className="flex items-center gap-1.5 text-dezprox-text/60">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {contactData.company}
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-dezprox-text/60">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {contactData.email}
                </p>
                <p className="flex items-center gap-1.5 text-dezprox-text/60">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {contactData.phone}
                </p>
              </div>
            ) : (
              <div className="text-xs text-gray-450 italic font-medium p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                Contact information pending scope reservation details. Click "Download PDF Quote" above to customize and bind client details.
              </div>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Prepared By:</span>
            <div className="text-xs space-y-1 font-medium text-dezprox-primary">
              <p className="font-extrabold text-sm text-dezprox-primary">Dezprox Estimator Suite</p>
              <p className="text-[11px] font-bold text-dezprox-accent uppercase block tracking-wide">Est. Delivery Timeline: {overallTimeline}</p>
              <p className="text-dezprox-text/60">CMS Account Executive</p>
              <p className="text-dezprox-text/60">Inquiry Routing Code: {result.services.map(s => s.serviceId).join("-")}</p>
            </div>
          </div>
        </div>

        {/* Itemized pricing breakdown */}
        <div className="py-8">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-4">Project Line Items</span>
          
          <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-2/3">Scope Description</th>
                  <th className="py-3.5 px-4 text-right">Service Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {result.services.map((srv) => {
                  const baseItem = srv.details.find((d: any) => d.type === "base");
                  const displayName = baseItem ? baseItem.name : srv.serviceName;

                  return (
                    <tr key={srv.serviceId} className="align-top">
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-dezprox-primary text-sm block">{displayName}</span>
                        <ul className="text-[10px] text-dezprox-text/50 mt-2 space-y-1 pl-3 list-disc">
                          {srv.details.filter(d => d.type !== "base").map(d => (
                            <li key={d.id}>{d.name}</li>
                          ))}
                          {srv.details.filter(d => d.type !== "base").length === 0 && (
                            <li>Standard baseline configurations only</li>
                          )}
                        </ul>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-dezprox-primary text-sm">
                        {currency}{Math.round(srv.totalCost).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Summary & Calculations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Terms & Conditions</span>
            <ul className="text-[10px] text-dezprox-text/50 space-y-1.5 list-decimal pl-3.5 font-medium leading-relaxed">
              <li>Project milestones configuration requires signing a master services contract.</li>
              <li>Taxes applied conform to dynamic IT integration rates ({Math.round(currentSettings.taxRate)}% GST).</li>
              <li>Estimated timelines depend on content delivery schedules from the client.</li>
              <li>Intellectual property rights are fully assigned upon invoice settlement.</li>
            </ul>
          </div>

          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 space-y-3 font-semibold text-xs text-dezprox-text/75 self-start">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-dezprox-primary font-bold">{currency}{Math.round(subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Corporate Discount ({Math.round(currentSettings.discountRate)}%):</span>
              <span className="font-bold">-{currency}{Math.round(discountAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax ({Math.round(currentSettings.taxRate)}%):</span>
              <span className="text-dezprox-primary font-bold">{currency}{Math.round(taxAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-sm font-black text-dezprox-primary">
              <span>Grand Total:</span>
              <span className="text-base font-extrabold text-dezprox-primary">{currency}{Math.round(grandTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Signatures & Proposal Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100 mt-4">
          {contactData?.notes && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Requirement Notes</span>
              <p className="text-[10px] text-dezprox-text/50 italic leading-relaxed">"{contactData.notes}"</p>
            </div>
          )}
          <div className="flex flex-col md:items-end justify-end mt-4 md:mt-0">
            <div className="border-b border-gray-250 w-48 text-center pb-2 font-serif italic text-gray-400 select-none">
              Dezprox Estimator
            </div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 mr-12">Authorized Signatory</span>
          </div>
        </div>

        <div className="text-[9px] text-dezprox-text/30 text-center leading-relaxed font-semibold pt-8 border-t border-gray-50 mt-12 block">
          Dezprox Quotation System. Generated on demand by client configuration parameters. This proposal remains non-binding until explicitly signed.
        </div>
      </Card>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center justify-center gap-2 cursor-pointer font-bold text-xs px-6 py-4 rounded-xl w-full sm:w-auto"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            Back to Estimate Review
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center justify-center gap-2 cursor-pointer font-bold text-xs px-6 py-4 rounded-xl w-full sm:w-auto"
        >
          Configure Another Project
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* LEAD CAPTURE MODAL DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 p-1 text-gray-400 hover:text-dezprox-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <span className="text-[8px] font-black tracking-widest text-dezprox-accent uppercase block">
                  Lead Details Required
                </span>
                <h3 className="text-base font-extrabold text-dezprox-primary mt-1">
                  Complete Scope Reservation
                </h3>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  Provide your contact details to authorize the proposal file and reserve consultation sessions.
                </p>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-3.5">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase block">Full Name *</label>
                  <Input
                    required
                    placeholder="e.g. Aman Sharma"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase block">Email Address *</label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. aman@techcorp.in"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase block">Phone Number *</label>
                  <Input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                  />
                </div>

                {/* Company (Optional) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase block">Company Name (Optional)</label>
                  <Input
                    placeholder="e.g. TechCorp India"
                    value={localCompany}
                    onChange={(e) => setLocalCompany(e.target.value)}
                  />
                </div>

                {/* Notes (Optional) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase block">Project Notes (Optional)</label>
                  <Input
                    placeholder="Add brief project notes or instructions..."
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 font-bold text-xs py-3 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    className="flex-1 font-bold text-xs py-3 cursor-pointer"
                  >
                    Authorize Proposal
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
