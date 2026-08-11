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
  currency: string;
}
