import { getServices, getMultipliers, getGlobalSettings } from "@/utils/db";

export interface CostBreakdownItem {
  id: string;
  name: string;
  type: "base" | "addon" | "multiplier";
  costLabel: string;
  amount: number;
}

export interface ServiceCostBreakdown {
  serviceId: string;
  serviceName: string;
  baseCost: number;
  addonsCost: number;
  multiplierProduct: number;
  totalCost: number;
  details: CostBreakdownItem[];
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

    totalBaseCost += service.basePrice;

    const details: CostBreakdownItem[] = [
      {
        id: `${serviceId}-base`,
        name: `${service.name} (Base Service)`,
        type: "base",
        costLabel: `${settings.currency}${service.basePrice.toLocaleString()}`,
        amount: service.basePrice
      }
    ];

    let flatAddons = 0;
    let multiplierProduct = 1.0;

    const serviceAnswers = answers[serviceId] || {};

    // 1. Dynamic questionnaire options
    if (service.questions) {
      service.questions.forEach((question) => {
        const selectedValue = serviceAnswers[question.id];
        if (selectedValue === undefined || selectedValue === null) return;

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
      });
    }

    // 2. Custom Pricing Components (Module 3)
    const selectedComponents = serviceAnswers["pricing-components"] || [];
    const componentUnits = serviceAnswers["pricing-component-units"] || {};

    if (service.pricingComponents) {
      service.pricingComponents.forEach((comp) => {
        if (selectedComponents.includes(comp.id)) {
          if (comp.type === "fixed") {
            flatAddons += comp.fixedPrice;
            details.push({
              id: comp.id,
              name: `Component: ${comp.name}`,
              type: "addon",
              costLabel: `+${settings.currency}${comp.fixedPrice.toLocaleString()}`,
              amount: comp.fixedPrice
            });
          } else if (comp.type === "per-unit") {
            const units = componentUnits[comp.id] || 1;
            const cost = comp.perUnitPrice * units;
            flatAddons += cost;
            details.push({
              id: comp.id,
              name: `Component: ${comp.name} (${units} ${service.unitType || "units"})`,
              type: "addon",
              costLabel: `+${settings.currency}${cost.toLocaleString()}`,
              amount: cost
            });
          }
        }
      });
    }

    const totalCost = (service.basePrice + flatAddons) * multiplierProduct;
    totalCalculatedCost += totalCost;

    servicesBreakdown.push({
      serviceId,
      serviceName: service.name,
      baseCost: service.basePrice,
      addonsCost: flatAddons,
      multiplierProduct,
      totalCost,
      details
    });
  });

  // Apply project-wide multipliers
  const compOpt = multipliers.complexity.find((m) => m.id === projectModifiers?.complexity) || { value: 1.0 };
  const urgOpt = multipliers.urgency.find((m) => m.id === projectModifiers?.urgency) || { value: 1.0 };
  const qualOpt = multipliers.quality.find((m) => m.id === projectModifiers?.quality) || { value: 1.0 };

  let finalCost = totalCalculatedCost * compOpt.value * urgOpt.value * qualOpt.value;

  // Apply discounts
  let discountAmount = 0;
  if (settings.discountRate > 0) {
    discountAmount = finalCost * (settings.discountRate / 100);
    finalCost -= discountAmount;
  }

  // Apply tax
  let taxAmount = 0;
  if (settings.taxRate > 0) {
    taxAmount = finalCost * (settings.taxRate / 100);
    finalCost += taxAmount;
  }

  // Bound within settings constraints
  if (finalCost < settings.minimumCost) finalCost = settings.minimumCost;
  if (finalCost > settings.maximumCost) finalCost = settings.maximumCost;

  // Range estimation (-10% to +15%)
  const estimatedMin = Math.round((finalCost * 0.9) / 100) * 100;
  const estimatedMax = Math.round((finalCost * 1.15) / 100) * 100;

  return {
    services: servicesBreakdown,
    totalBaseCost,
    totalCalculatedCost,
    estimatedMin,
    estimatedMax,
    taxAmount,
    discountAmount,
    finalCost
  };
};

