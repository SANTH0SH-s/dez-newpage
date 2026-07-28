import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateProjectCosts } from "@/utils/pricingCalculator";
import { ContactData } from "./contact-form";
import { Check, ArrowRight, Printer, Sparkles } from "lucide-react";
import { getGlobalSettings } from "@/utils/db";

interface SuccessMessageProps {
  selectedServiceIds: string[];
  answers: Record<string, Record<string, any>>;
  contactData: ContactData;
  onReset: () => void;
  projectModifiers?: { complexity?: string; urgency?: string; quality?: string };
}

export const SuccessMessage = ({
  selectedServiceIds,
  answers,
  contactData,
  onReset,
  projectModifiers = { complexity: "simple", urgency: "normal", quality: "standard" }
}: SuccessMessageProps) => {
  const [currency, setCurrency] = useState("₹");

  useEffect(() => {
    setCurrency(getGlobalSettings().currency);
  }, []);

  const result = calculateProjectCosts(selectedServiceIds, answers, projectModifiers);
  
  // Generate a random Reference ID
  const referenceId = React.useMemo(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let text = "DPX-";
    for (let i = 0; i < 4; i++) {
      text += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    text += "-";
    for (let i = 0; i < 4; i++) {
      text += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return text;
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 font-sans print:p-0">
      {/* Visual Success Ring */}
      <div className="flex flex-col items-center text-center mb-10 print:hidden">
        <div className="w-20 h-20 bg-dezprox-accent/15 border-2 border-dezprox-accent/20 text-dezprox-primary rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Check className="w-10 h-10 stroke-[3px]" />
        </div>
        
        <Badge variant="accent" className="px-3 py-1 font-sans text-xs mb-3">
          Step 5: Inquiry Confirmed
        </Badge>
        
        <h2 className="text-2xl md:text-3xl font-extrabold text-dezprox-primary">
          Estimate Submission Received!
        </h2>
        
        <p className="text-dezprox-text/60 mt-2 text-sm max-w-lg leading-relaxed">
          Thank you, <strong className="text-dezprox-primary">{contactData.name}</strong>. Your custom project configuration has been matched with reference <strong className="text-dezprox-primary font-mono">{referenceId}</strong>.
        </p>
      </div>

      {/* PDF Receipt Card */}
      <Card className="border-gray-200/80 shadow-card overflow-hidden rounded-card bg-white relative">
        {/* Decorative corner tag */}
        <div className="absolute right-0 top-0 bg-dezprox-accent/10 border-l border-b border-dezprox-accent/25 rounded-bl-xl px-3 py-1.5 flex items-center space-x-1 print:hidden">
          <Sparkles className="w-3.5 h-3.5 text-dezprox-primary" />
          <span className="text-[10px] font-bold text-dezprox-primary uppercase tracking-widest">
            Dezprox Quote
          </span>
        </div>

        <CardHeader className="bg-gray-50/70 border-b border-gray-100 p-6 flex flex-row justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-dezprox-text/40 uppercase tracking-widest block font-sans">
              Estimated Service Quote
            </span>
            <CardTitle className="text-lg font-bold text-dezprox-primary mt-1 font-sans">
              Project Pricing Slip
            </CardTitle>
          </div>
          <div className="text-right text-sm">
            <span className="text-xs text-dezprox-text/40 block font-semibold">Reference ID</span>
            <span className="font-mono font-bold text-dezprox-primary">{referenceId}</span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Quote Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-dezprox-primary text-white rounded-xl p-6">
            <div>
              <span className="text-[10px] font-bold text-dezprox-accent uppercase tracking-widest block">
                Contact details
              </span>
              <div className="mt-2 text-sm font-sans space-y-1">
                <p className="font-bold text-base">{contactData.name}</p>
                {contactData.company && <p className="text-white/60 text-xs">Company: {contactData.company}</p>}
                <p className="text-white/60 text-xs">Email: {contactData.email}</p>
                <p className="text-white/60 text-xs">Phone: {contactData.phone}</p>
              </div>
            </div>
            
            <div className="flex flex-col md:items-end justify-center">
              <span className="text-[10px] font-bold text-dezprox-accent uppercase tracking-widest block">
                Estimated pricing range
              </span>
              <span className="text-2xl md:text-3xl font-extrabold mt-1 text-white block">
                {currency}{result.estimatedMin.toLocaleString()} - {currency}{result.estimatedMax.toLocaleString()}
              </span>
              <span className="text-[10px] text-white/60 mt-1 block">
                *Subject to requirement refinements
              </span>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-dezprox-text/40 uppercase tracking-widest block">
              Itemized configuration
            </span>
            
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-50">
              {result.services.map((srv) => (
                <div key={srv.serviceId} className="p-4 flex justify-between items-center text-sm font-sans">
                  <div>
                    <span className="font-bold text-dezprox-primary block">{srv.serviceName}</span>
                    <ul className="text-xs text-dezprox-text/50 mt-1.5 space-y-1 pl-3 list-disc">
                      {srv.details.filter(d => d.type !== "base").map(d => (
                        <li key={d.id}>{d.name}</li>
                      ))}
                      {srv.details.filter(d => d.type !== "base").length === 0 && (
                        <li>Standard baseline configurations only</li>
                      )}
                    </ul>
                  </div>
                  
                  <span className="font-bold text-dezprox-primary text-xs shrink-0 self-start mt-0.5 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                    Subtotal: {currency}{Math.round(srv.totalCost).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes if present */}
          {contactData.notes && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-dezprox-text/40 uppercase tracking-widest block">
                Project Comments
              </span>
              <p className="text-xs text-dezprox-text/60 italic bg-gray-50 border border-gray-100 p-4 rounded-xl leading-relaxed">
                "{contactData.notes}"
              </p>
            </div>
          )}
          
          <div className="text-[10px] text-dezprox-text/40 text-center leading-relaxed font-semibold pt-4 border-t border-gray-50">
            Dezprox CMS Pricing Engine v1.0.1. Generates instant estimations for scope analysis purposes. Fully non-binding.
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 print:hidden">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print Estimate Receipt
        </Button>
        
        <Button
          variant="primary"
          onClick={onReset}
          className="w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer"
        >
          Configure Another Project
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
