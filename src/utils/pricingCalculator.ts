import { SERVICES_DATA, Service } from "@/data/servicesData";

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
}

export const calculateProjectCosts = (
  selectedServiceIds: string[],
  answers: Record<string, Record<string, any>>
): TotalCalculationResult => {
  const servicesBreakdown: ServiceCostBreakdown[] = [];
  let totalBaseCost = 0;
  let totalCalculatedCost = 0;

  selectedServiceIds.forEach((serviceId) => {
    const service = SERVICES_DATA.find((s) => s.id === serviceId);
    if (!service) return;

    totalBaseCost += service.basePrice;

    const details: CostBreakdownItem[] = [
      {
        id: `${serviceId}-base`,
        name: `${service.name} (Base Service)`,
        type: "base",
        costLabel: `$${service.basePrice.toLocaleString()}`,
        amount: service.basePrice
      }
    ];

    let flatAddons = 0;
    let multipliersSum = 1.0; // We can multiply them or add them. In product billing, multiplying provides organic compounds. Let's multiply them!
    let multiplierProduct = 1.0;

    const serviceAnswers = answers[serviceId] || {};

    service.questions.forEach((question) => {
      const selectedValue = serviceAnswers[question.id];
      if (selectedValue === undefined || selectedValue === null) return;

      question.options.forEach((option) => {
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
                costLabel: `+$${option.priceModifier.toLocaleString()}`,
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

  // Calculate estimated range (e.g. -10% for min, +15% for max to account for requirements variance)
  const estimatedMin = Math.round((totalCalculatedCost * 0.9) / 100) * 100;
  const estimatedMax = Math.round((totalCalculatedCost * 1.15) / 100) * 100;

  return {
    services: servicesBreakdown,
    totalBaseCost,
    totalCalculatedCost,
    estimatedMin,
    estimatedMax
  };
};
