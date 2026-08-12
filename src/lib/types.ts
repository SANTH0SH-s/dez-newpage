export interface PricingComponent {
  id: string;
  name: string;
  type: "fixed" | "per-unit" | "quantity";
  fixedPrice: number;
  perUnitPrice: number;
  description: string;
  maxQuantity?: number;
  iconName?: string;
  status?: "active" | "inactive";
  category?: string;
  billingCycle?: "one-time" | "monthly";
  note?: string;
}

export interface ValidationRule {
  min?: number | null;
  max?: number | null;
  pattern?: string | null;
  message?: string | null;
}

export interface QuestionOption {
  value: string;
  label: string;
  priceModifier: number;
  modifierType: "flat" | "multiplier";
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  description?: string;
  type: "radio" | "checkbox" | "select" | "counter" | "number" | "text" | "toggle";
  isRequired: boolean;
  displayOrder: number;
  defaultValue?: string | number | boolean | string[];
  priceModifier?: number;
  modifierType?: "flat" | "multiplier";
  options?: QuestionOption[];
  conditionalParentId?: string | null;
  conditionalParentValue?: string | null;
  validationRules?: ValidationRule | null;
  packageId?: string | null;
  status?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  timeline: string;
  description: string;
  isRecommended: boolean;
  isPopular: boolean;
  isBestValue?: boolean;
  isNew?: boolean;
  displayOrder: number;
  status: "active" | "inactive";
  features: string[];
  questions?: Question[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  status: "active" | "inactive";
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  iconImage?: string;
  cardImage?: string;
  heroBanner?: string;
  thumbnail?: string;
  basePrice: number;
  unitType: string;
  status: "active" | "inactive";
  questions: Question[];
  pricingComponents: PricingComponent[];
  packages?: Package[];
  faqs?: FAQItem[];
}

export interface Multiplier {
  id: string;
  label: string;
  value: number;
  description?: string;
  category?: string;
}

export interface MultiplierSet {
  complexity: Multiplier[];
  urgency: Multiplier[];
  quality: Multiplier[];
}

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

export type CostDetailItem = CostBreakdownItem;

export interface Estimate {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;
  notes?: string;
  serviceNames: string[];
  totalPrice: number;
  status: "pending" | "approved" | "rejected" | "completed";
  createdDate: string;
  breakdown: TotalCalculationResult | Record<string, unknown>;
  answers: Record<string, Record<string, unknown>>;
  estimateRange?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  selectedServices: string[];
  estimateRange: string;
  message: string;
  status: "pending" | "contacted" | "completed" | "archived";
  createdDate: string;
}

export interface GlobalSettings {
  companyName: string;
  currency: string;
  taxRate: number;
  discountRate: number;
  defaultPricingMode: string;
  minimumCost: number;
  maximumCost: number;
  whatsappNumber?: string;
  gateEstimateWithLeadForm?: boolean;
}
