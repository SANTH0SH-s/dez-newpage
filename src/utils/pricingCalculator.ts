import { getServices, getMultipliers, getGlobalSettings } from "@/utils/db";

export interface CostBreakdownItem {
  id: string;
  name: string;
  type: "base" | "addon" | "multiplier";
  costLabel: string;
  amount: number;
  billingCycle?: "one-time" | "monthly";
}

export interface ServiceCostBreakdown {
  serviceId: string;
  serviceName: string;
  baseCost: number;
  addonsCost: number;
  multiplierProduct: number;
  totalCost: number;
  details: CostBreakdownItem[];
  estimatedTimeline: string;
}

export interface TotalCalculationResult {
  services: ServiceCostBreakdown[];
  totalBaseCost: number;
  totalCalculatedCost: number;
  estimatedMin: number;
  estimatedMax: number;
  taxAmount: number;
  discountAmount: number;
  finalCost: number;
  estimatedTimeline: string;
  oneTimeSubtotal: number;
  monthlySubtotal: number;
  oneTimeDiscount: number;
  monthlyDiscount: number;
  oneTimeTax: number;
  monthlyTax: number;
  oneTimeFinalCost: number;
  monthlyFinalCost: number;
}

export const calculateProjectCosts = (
  selectedServiceIds: string[],
  answers: Record<string, Record<string, any>>,
  projectModifiers?: { complexity?: string; urgency?: string; quality?: string }
): TotalCalculationResult => {
  const services = getServices();
  const multipliers = getMultipliers();
  const settings = getGlobalSettings();

  const servicesBreakdown: ServiceCostBreakdown[] = [];
  let totalBaseCost = 0;
  let totalCalculatedCost = 0;

  selectedServiceIds.forEach((serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service || service.status === "inactive") return;

    const serviceAnswers = answers[serviceId] || {};
    const selectedPackageId = serviceAnswers["selected-package"];

    let basePrice = service.basePrice;
    let baseLabel = `${service.name} (Base Service)`;
    let isBaseMonthly = false;
    if (selectedPackageId && service.packages) {
      const pkg = service.packages.find((p: any) => p.id === selectedPackageId);
      if (pkg) {
        basePrice = pkg.price;
        baseLabel = `${service.name} (${pkg.name} Package)`;
        if (pkg.timeline === "Monthly") {
          isBaseMonthly = true;
        }
      }
    } else if (serviceId === "seo") {
      isBaseMonthly = true;
    }

    totalBaseCost += basePrice;

    const details: CostBreakdownItem[] = [
      {
        id: `${serviceId}-base`,
        name: baseLabel,
        type: "base",
        costLabel: `${settings.currency}${basePrice.toLocaleString()}${isBaseMonthly ? "/month" : ""}`,
        amount: basePrice,
        billingCycle: isBaseMonthly ? "monthly" : "one-time"
      }
    ];

    let flatAddons = 0;
    let multiplierProduct = 1.0;


    // 1. Dynamic questionnaire options
    let allQuestions = [...(service.questions || [])];
    if (selectedPackageId && service.packages) {
      const pkg = service.packages.find((p) => p.id === selectedPackageId);
      if (pkg && pkg.questions) {
        allQuestions = [...allQuestions, ...pkg.questions];
      }
    }

    if (allQuestions) {
      allQuestions.forEach((question) => {
        const selectedValue = serviceAnswers[question.id];
        
        // Conditional visibility check
        if (question.conditionalParentId) {
          const parentVal = serviceAnswers[question.conditionalParentId];
          let isVisible = false;
          if (parentVal !== undefined && parentVal !== null && parentVal !== "") {
            if (Array.isArray(parentVal)) {
              isVisible = parentVal.includes(question.conditionalParentValue);
            } else {
              isVisible = String(parentVal) === String(question.conditionalParentValue);
            }
          }
          if (!isVisible) return; // Skip if condition not met!
        }

        if (selectedValue === undefined || selectedValue === null || selectedValue === "") return;

        // A. Radio, Checkbox, Dropdown
        if (["radio", "checkbox", "select"].includes(question.type) && question.options) {
          question.options.forEach((option: any) => {
            const isSelected = Array.isArray(selectedValue)
              ? selectedValue.includes(option.value)
              : selectedValue === option.value;

            if (isSelected) {
              if (option.modifierType === "flat") {
                if (option.priceModifier !== 0) {
                  flatAddons += option.priceModifier;
                  details.push({
                    id: `${serviceId}-${question.id}-${option.value}`,
                    name: `${question.text}: ${option.label}`,
                    type: "addon",
                    costLabel: `+${settings.currency}${option.priceModifier.toLocaleString()}`,
                    amount: option.priceModifier
                  });
                }
              } else if (option.modifierType === "multiplier") {
                if (option.priceModifier !== 1.0) {
                  multiplierProduct *= option.priceModifier;
                  details.push({
                    id: `${serviceId}-${question.id}-${option.value}`,
                    name: `${question.text}: ${option.label}`,
                    type: "multiplier",
                    costLabel: `${option.priceModifier > 1 ? "+" : ""}${Math.round((option.priceModifier - 1) * 100)}%`,
                    amount: option.priceModifier
                  });
                }
              }
            }
          });
        }
        
        // B. Toggle
        if (question.type === "toggle" && selectedValue === true) {
          const mod = question.priceModifier || 0;
          const type = question.modifierType || "flat";
          if (type === "flat" && mod !== 0) {
            flatAddons += mod;
            details.push({
              id: `${serviceId}-${question.id}`,
              name: `${question.text}: Yes`,
              type: "addon",
              costLabel: `+${settings.currency}${mod.toLocaleString()}`,
              amount: mod
            });
          } else if (type === "multiplier" && mod !== 1.0 && mod !== 0) {
            multiplierProduct *= mod;
            details.push({
              id: `${serviceId}-${question.id}`,
              name: `${question.text}: Yes`,
              type: "multiplier",
              costLabel: `${mod > 1 ? "+" : ""}${Math.round((mod - 1) * 100)}%`,
              amount: mod
            });
          }
        }
        
        // C. Counter / Number
        if (["counter", "number"].includes(question.type)) {
          const val = parseFloat(selectedValue) || 0;
          const mod = question.priceModifier || 0;
          const type = question.modifierType || "flat";
          
          if (val > 0 && mod !== 0) {
            if (type === "flat") {
              const cost = mod * val;
              flatAddons += cost;
              details.push({
                id: `${serviceId}-${question.id}`,
                name: `${question.text} (${val})`,
                type: "addon",
                costLabel: `+${settings.currency}${cost.toLocaleString()}`,
                amount: cost
              });
            } else if (type === "multiplier") {
              const factor = 1.0 + ((mod - 1.0) * val);
              multiplierProduct *= factor;
              details.push({
                id: `${serviceId}-${question.id}`,
                name: `${question.text} (${val})`,
                type: "multiplier",
                costLabel: `+${Math.round((factor - 1.0) * 100)}%`,
                amount: factor
              });
            }
          }
        }

        // D. Text
        if (question.type === "text" && typeof selectedValue === "string" && selectedValue.trim() !== "") {
          const mod = question.priceModifier || 0;
          if (question.id === "custom-requirements") {
            details.push({
              id: `${serviceId}-${question.id}`,
              name: `${question.text}: ${selectedValue}`,
              type: "addon",
              costLabel: "Enquire the team",
              amount: 0
            });
          } else if (mod !== 0) {
            flatAddons += mod;
            details.push({
              id: `${serviceId}-${question.id}`,
              name: `${question.text} (Custom)`,
              type: "addon",
              costLabel: `+${settings.currency}${mod.toLocaleString()}`,
              amount: mod
            });
          }
        }
      });
    }

    // 2. Custom Pricing Components (Module 3)
    const selectedComponents = serviceAnswers["pricing-components"] || [];
    const componentUnits = serviceAnswers["pricing-component-units"] || {};

    if (service.pricingComponents) {
      service.pricingComponents.forEach((comp) => {
        if (comp.status === "inactive") return;
        
        if (selectedComponents.includes(comp.id)) {
          const billing = comp.billingCycle || "one-time";
          const cycleSuffix = billing === "monthly" ? "/month" : "";
          if (comp.type === "fixed") {
            flatAddons += comp.fixedPrice;
            details.push({
              id: comp.id,
              name: `Add-on: ${comp.name}`,
              type: "addon",
              costLabel: `+${settings.currency}${comp.fixedPrice.toLocaleString()}${cycleSuffix}`,
              amount: comp.fixedPrice,
              billingCycle: billing
            });
          } else if (comp.type === "per-unit") {
            let units = componentUnits[comp.id] || 1;
            if (comp.maxQuantity !== undefined && comp.maxQuantity > 0) {
              units = Math.min(units, comp.maxQuantity);
            }
            const cost = comp.perUnitPrice * units;
            flatAddons += cost;
            details.push({
              id: comp.id,
              name: `Add-on: ${comp.name} (${units} ${service.unitType || "units"})`,
              type: "addon",
              costLabel: `+${settings.currency}${cost.toLocaleString()}${cycleSuffix}`,
              amount: cost,
              billingCycle: billing
            });
          }
        }
      });
    }

    const totalCost = (basePrice + flatAddons) * multiplierProduct;
    totalCalculatedCost += totalCost;

    // Timeline Estimation calculations
    let baselineTimeline = "2-4 Weeks";
    if (selectedPackageId && service.packages) {
      const pkg = service.packages.find((p: any) => p.id === selectedPackageId);
      if (pkg) {
        baselineTimeline = pkg.timeline;
      }
    }

    let activeAddonsCount = 0;
    if (selectedComponents) activeAddonsCount += selectedComponents.length;
    Object.entries(serviceAnswers).forEach(([k, v]) => {
      if (k !== "selected-package" && k !== "pricing-components" && k !== "pricing-component-units") {
        if (Array.isArray(v)) activeAddonsCount += v.length;
        else if (typeof v === "boolean" && v) activeAddonsCount += 1;
        else if (typeof v === "number" && v > 0) activeAddonsCount += v;
        else if (typeof v === "string" && v.trim() !== "") activeAddonsCount += 1;
      }
    });

    const timelineResult = calculateTimeline(
      baselineTimeline,
      activeAddonsCount,
      projectModifiers?.complexity || "simple",
      projectModifiers?.urgency || "normal"
    );

    servicesBreakdown.push({
      serviceId,
      serviceName: service.name,
      baseCost: basePrice,
      addonsCost: flatAddons,
      multiplierProduct,
      totalCost,
      details,
      estimatedTimeline: timelineResult.label
    });
  });

  // Apply project-wide multipliers to one-time charges, keep monthly flat
  const compOpt = multipliers.complexity.find((m) => m.id === projectModifiers?.complexity) || { value: 1.0 };
  const urgOpt = multipliers.urgency.find((m) => m.id === projectModifiers?.urgency) || { value: 1.0 };
  const qualOpt = multipliers.quality.find((m) => m.id === projectModifiers?.quality) || { value: 1.0 };

  // Calculate subtotals by scanning details
  let oneTimeSubtotal = 0;
  let monthlySubtotal = 0;

  servicesBreakdown.forEach((srv) => {
    let srvOneTime = 0;
    let srvMonthly = 0;
    srv.details.forEach((d) => {
      if (d.type !== "multiplier") {
        if (d.billingCycle === "monthly") {
          srvMonthly += d.amount;
        } else {
          srvOneTime += d.amount;
        }
      }
    });
    oneTimeSubtotal += srvOneTime * srv.multiplierProduct;
    monthlySubtotal += srvMonthly * srv.multiplierProduct;
  });

  let finalOneTimeCost = oneTimeSubtotal * compOpt.value * urgOpt.value * qualOpt.value;
  let finalMonthlyCost = monthlySubtotal;

  // Apply discounts
  let oneTimeDiscount = 0;
  if (settings.discountRate > 0) {
    oneTimeDiscount = finalOneTimeCost * (settings.discountRate / 100);
  }
  let monthlyDiscount = 0;
  if (settings.discountRate > 0) {
    monthlyDiscount = finalMonthlyCost * (settings.discountRate / 100);
  }

  // Apply tax
  let oneTimeTax = 0;
  if (settings.taxRate > 0) {
    oneTimeTax = (finalOneTimeCost - oneTimeDiscount) * (settings.taxRate / 100);
  }
  let monthlyTax = 0;
  if (settings.taxRate > 0) {
    monthlyTax = (finalMonthlyCost - monthlyDiscount) * (settings.taxRate / 100);
  }

  let oneTimeFinalCost = finalOneTimeCost - oneTimeDiscount + oneTimeTax;
  let monthlyFinalCost = finalMonthlyCost - monthlyDiscount + monthlyTax;

  let finalCost = oneTimeFinalCost + monthlyFinalCost;

  // Bound within settings constraints
  if (finalCost < settings.minimumCost) finalCost = settings.minimumCost;
  if (finalCost > settings.maximumCost) finalCost = settings.maximumCost;

  // Range estimation (-10% to +15%)
  const estimatedMin = Math.round((finalCost * 0.9) / 100) * 100;
  const estimatedMax = Math.round((finalCost * 1.15) / 100) * 100;

  // Combine timelines: take the maximum timeline weeks
  let maxProjectWeeks = 2;
  let minProjectWeeks = 1;
  let hasTimeline = false;

  servicesBreakdown.forEach((s) => {
    const numbers = s.estimatedTimeline.match(/\d+(\.\d+)?/g);
    if (numbers && numbers.length > 0) {
      hasTimeline = true;
      const val1 = parseFloat(numbers[0]);
      const val2 = numbers[1] ? parseFloat(numbers[1]) : val1;
      if (val2 > maxProjectWeeks) maxProjectWeeks = val2;
      if (val1 < minProjectWeeks) minProjectWeeks = val1;
    }
  });

  const finalProjectTimeline = hasTimeline 
    ? (minProjectWeeks === maxProjectWeeks ? `${minProjectWeeks} Weeks` : `${minProjectWeeks}-${maxProjectWeeks} Weeks`)
    : "2-4 Weeks";

  return {
    services: servicesBreakdown,
    totalBaseCost,
    totalCalculatedCost,
    estimatedMin,
    estimatedMax,
    taxAmount: oneTimeTax + monthlyTax,
    discountAmount: oneTimeDiscount + monthlyDiscount,
    finalCost,
    estimatedTimeline: finalProjectTimeline,
    oneTimeSubtotal,
    monthlySubtotal,
    oneTimeDiscount,
    monthlyDiscount,
    oneTimeTax,
    monthlyTax,
    oneTimeFinalCost,
    monthlyFinalCost
  };
};

export const calculateTimeline = (
  baselineTimeline: string,
  activeAddonsCount: number,
  complexity: string,
  urgency: string
): { minWeeks: number; maxWeeks: number; label: string } => {
  // Default parsing
  let min = 2;
  let max = 4;
  let unit = "weeks";

  const numbers = baselineTimeline.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    if (numbers.length === 1) {
      min = parseInt(numbers[0]);
      max = min;
    } else {
      min = parseInt(numbers[0]);
      max = parseInt(numbers[1]);
    }
  }

  if (baselineTimeline.toLowerCase().includes("day")) {
    unit = "days";
  }

  // Add-on impact: +2 days per active addon
  const addonImpactDays = activeAddonsCount * 2;
  
  // Convert to days for scaling
  let minDays = unit === "weeks" ? min * 7 : min;
  let maxDays = unit === "weeks" ? max * 7 : max;

  minDays += addonImpactDays;
  maxDays += addonImpactDays;

  // Complexity multiplier
  let complexityMultiplier = 1.0;
  if (complexity === "medium") complexityMultiplier = 1.25;
  else if (complexity === "complex") complexityMultiplier = 1.5;

  // Urgency multiplier (reduces timeline but keeps a floor of 3 days)
  let urgencyMultiplier = 1.0;
  if (urgency === "fast") urgencyMultiplier = 0.75;
  else if (urgency === "urgent") urgencyMultiplier = 0.5;

  minDays = Math.max(3, Math.round(minDays * complexityMultiplier * urgencyMultiplier));
  maxDays = Math.max(4, Math.round(maxDays * complexityMultiplier * urgencyMultiplier));

  // Convert back to Weeks if >= 7 days
  if (minDays >= 7 || maxDays >= 7) {
    const minWeeks = Math.round((minDays / 7) * 10) / 10;
    const maxWeeks = Math.round((maxDays / 7) * 10) / 10;
    const label = minWeeks === maxWeeks ? `${minWeeks} Weeks` : `${minWeeks}-${maxWeeks} Weeks`;
    return { minWeeks, maxWeeks, label };
  } else {
    const label = minDays === maxDays ? `${minDays} Days` : `${minDays}-${maxDays} Days`;
    return { minWeeks: minDays / 7, maxWeeks: maxDays / 7, label };
  }
};

