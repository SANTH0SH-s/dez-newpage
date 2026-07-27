import React from "react";
import { calculateProjectCosts, TotalCalculationResult } from "@/utils/pricingCalculator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, DollarSign, ListCollapse, ChevronRight } from "lucide-react";

interface PriceSummaryProps {
  selectedServiceIds: string[];
  answers: Record<string, Record<string, any>>;
  onBack?: () => void;
  onNext?: () => void;
  sidebarMode?: boolean;
}

export const PriceSummary = ({
  selectedServiceIds,
  answers,
  onBack,
  onNext,
  sidebarMode = false
}: PriceSummaryProps) => {
  const result: TotalCalculationResult = calculateProjectCosts(selectedServiceIds, answers);

  if (selectedServiceIds.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 font-sans border-2 border-dashed border-gray-100 rounded-2xl">
        No services configured yet.
      </div>
    );
  }

  // Sidebar Mode Widget (Compact sidebar showing active totals)
  if (sidebarMode) {
    return (
      <Card className="sticky top-6 border-gray-100/80 overflow-hidden">
        <div className="bg-dezprox-primary text-white p-5">
          <span className="text-xs uppercase tracking-widest font-sans font-semibold text-dezprox-accent">
            Live Pricing Estimate
          </span>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold font-sans">
              ${result.estimatedMin.toLocaleString()}
            </span>
            <span className="mx-1 text-white/50 text-sm font-semibold font-sans">-</span>
            <span className="text-3xl font-bold font-sans">
              ${result.estimatedMax.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-white/60 mt-2 font-sans">
            Estimate ranges are based on chosen complexity and add-on factors.
          </p>
        </div>

        <CardContent className="p-5 font-sans">
          <h4 className="text-xs font-bold text-dezprox-primary uppercase tracking-wider mb-3">
            Selected Services ({selectedServiceIds.length})
          </h4>
          <ul className="space-y-2 mb-4">
            {result.services.map((srv) => (
              <li key={srv.serviceId} className="flex justify-between items-center text-sm text-dezprox-text/75 font-sans">
                <span className="truncate pr-4 font-semibold">{srv.serviceName}</span>
                <span className="font-bold text-dezprox-primary text-xs">
                  ${Math.round(srv.totalCost).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <div className="text-[11px] text-dezprox-text/45 border-t border-gray-100 pt-3">
            *Final quote will be tailored after scoping calls.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Standalone Page Mode
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-8 font-sans">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="accent" className="mb-3 px-3 py-1 font-sans text-xs">
          Step 3: Review pricing breakdown
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-dezprox-primary">
          Your Project Cost Estimate
        </h2>
        <p className="text-dezprox-text/60 mt-2 text-sm">
          Below is a detailed itemized projection based on your selections. Review your specifications before finalizing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cost Breakdown Details List */}
        <div className="lg:col-span-2 space-y-6">
          {result.services.map((srv) => (
            <Card key={srv.serviceId} className="border-gray-100/70 overflow-hidden">
              <div className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-base text-dezprox-primary">
                  {srv.serviceName}
                </h3>
                <Badge variant="accent" className="font-sans text-xs font-bold text-dezprox-primary bg-dezprox-accent/20">
                  Subtotal: ${Math.round(srv.totalCost).toLocaleString()}
                </Badge>
              </div>

              <CardContent className="p-6">
                <div className="divide-y divide-gray-100">
                  {srv.details.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center text-sm text-dezprox-text/50 first:pt-0 last:pb-0">
                      <span className="font-sans leading-relaxed text-dezprox-text/75 flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-dezprox-accent shrink-0 mt-0.5" />
                        {item.name}
                      </span>
                      <span className="font-semibold text-dezprox-primary font-mono bg-gray-50/50 px-2.5 py-0.5 rounded text-xs border border-gray-100">
                        {item.costLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Summary Side Card */}
        <div className="lg:col-span-1">
          <Card className="border-dezprox-primary/5 bg-gray-50/40">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base uppercase tracking-wider text-dezprox-text/40 font-bold">
                Estimation Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {/* Total Estimate Range */}
                <div className="bg-dezprox-primary text-white rounded-xl p-6 text-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-dezprox-accent">
                    Estimated Range
                  </span>
                  <div className="mt-3 flex items-baseline justify-center">
                    <span className="text-2xl md:text-3xl font-extrabold font-sans">
                      ${result.estimatedMin.toLocaleString()}
                    </span>
                    <span className="mx-2 text-gray-400 text-base font-semibold">-</span>
                    <span className="text-2xl md:text-3xl font-extrabold font-sans">
                      ${result.estimatedMax.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 mt-3 leading-relaxed">
                    Includes base fees + configured adjustments. Exclusive of relevant local taxes.
                  </p>
                </div>

                {/* Itemized Quick Stats */}
                <div className="space-y-3 pt-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Configured Services</span>
                    <span className="font-bold text-dezprox-primary">{selectedServiceIds.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Flat Fees</span>
                    <span className="font-semibold text-dezprox-primary">${result.totalBaseCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold text-dezprox-primary">
                    <span>Subtotal Cost</span>
                    <span>${Math.round(result.totalCalculatedCost).toLocaleString()}</span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                  <Button
                    variant="accent"
                    onClick={onNext}
                    className="w-full flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    Proceed to Contact Info
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>

                  {onBack && (
                    <Button
                      variant="outline"
                      onClick={onBack}
                      className="w-full flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back to Configure
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
