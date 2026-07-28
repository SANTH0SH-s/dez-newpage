import { SERVICES_DATA, Service as StaticService } from "@/data/servicesData";

export interface PricingComponent {
  id: string;
  name: string;
  type: "fixed" | "per-unit";
  fixedPrice: number;
  perUnitPrice: number;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  basePrice: number;
  unitType: string; // e.g. "Project", "Month", "Screen", "Hour"
  status: "active" | "inactive";
  questions: any[]; // existing dynamic questionnaire structure
  pricingComponents: PricingComponent[]; // components managed in Module 3
}

export interface Multiplier {
  id: string;
  label: string;
  value: number;
  description?: string;
}

export interface MultiplierSet {
  complexity: Multiplier[];
  urgency: Multiplier[];
  quality: Multiplier[];
}

export interface Estimate {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceNames: string[];
  totalPrice: number;
  status: "pending" | "approved" | "rejected" | "completed";
  createdDate: string;
  breakdown: any;
  answers: any;
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
  taxRate: number; // percentage
  discountRate: number; // percentage
  defaultPricingMode: string;
  minimumCost: number;
  maximumCost: number;
}

const STORAGE_KEYS = {
  SERVICES: "dezprox_services",
  MULTIPLIERS: "dezprox_multipliers",
  ESTIMATES: "dezprox_estimates",
  ENQUIRIES: "dezprox_enquiries",
  SETTINGS: "dezprox_settings",
};

// Default Multipliers
const DEFAULT_MULTIPLIERS: MultiplierSet = {
  complexity: [
    { id: "simple", label: "Simple", value: 1.0, description: "Standard template-based work" },
    { id: "medium", label: "Medium", value: 1.3, description: "Custom UI elements and API integrations" },
    { id: "complex", label: "Complex", value: 1.6, description: "Advanced features, custom backend, multi-role auth" }
  ],
  urgency: [
    { id: "normal", label: "Normal", value: 1.0, description: "Standard delivery timeline (4-6 weeks)" },
    { id: "fast", label: "Fast", value: 1.25, description: "Expedited delivery (2-3 weeks)" },
    { id: "urgent", label: "Urgent", value: 1.5, description: "Priority delivery (1 week or less)" }
  ],
  quality: [
    { id: "basic", label: "Basic", value: 0.9, description: "Functional release, MVP standards" },
    { id: "standard", label: "Standard", value: 1.0, description: "High quality production-ready standard release" },
    { id: "premium", label: "Premium", value: 1.3, description: "Elite graphics, custom micro-interactions, extensive QA" }
  ]
};

// Default Settings
const DEFAULT_SETTINGS: GlobalSettings = {
  companyName: "Dezprox Solutions",
  currency: "₹",
  taxRate: 18,
  discountRate: 0,
  defaultPricingMode: "Standard Additive",
  minimumCost: 500,
  maximumCost: 100000,
};

// Default Estimates Seed data
const DEFAULT_ESTIMATES: Estimate[] = [
  {
    id: "EST-2801",
    customerName: "Aman Sharma",
    customerEmail: "aman@techcorp.in",
    serviceNames: ["Website Development", "UI/UX Design"],
    totalPrice: 6500,
    status: "approved",
    createdDate: "2026-07-20T10:30:00.000Z",
    breakdown: {},
    answers: {}
  },
  {
    id: "EST-2802",
    customerName: "Sarah Jenkins",
    customerEmail: "sarah@apex.io",
    serviceNames: ["Mobile App Development"],
    totalPrice: 12500,
    status: "pending",
    createdDate: "2026-07-25T14:15:00.000Z",
    breakdown: {},
    answers: {}
  }
];

// Default Enquiries Seed data
const DEFAULT_ENQUIRIES: Enquiry[] = [
  {
    id: "ENQ-1001",
    name: "Aman Sharma",
    email: "aman@techcorp.in",
    phone: "+91 98765 43210",
    company: "TechCorp India",
    selectedServices: ["website-dev", "uiux-design"],
    estimateRange: "₹6,000 - ₹7,500",
    message: "Looking for a custom multi-page website with dynamic branding elements and Figma layout drafts.",
    status: "pending",
    createdDate: "2026-07-20T10:30:00.000Z"
  },
  {
    id: "ENQ-1002",
    name: "Sarah Jenkins",
    email: "sarah@apex.io",
    phone: "+1 (555) 019-2834",
    company: "Apex Technologies",
    selectedServices: ["mobile-app"],
    estimateRange: "₹11,000 - ₹14,000",
    message: "Need a hybrid mobile app using React Native targeting both iOS and Android. Must support biometrics.",
    status: "contacted",
    createdDate: "2026-07-25T14:15:00.000Z"
  }
];

// Helper to check client-side context
const isClient = typeof window !== "undefined";

export const initDb = () => {
  if (!isClient) return;

  // Initialize Services
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    const initialServices: Service[] = SERVICES_DATA.map((s) => {
      // Map static data to DB structure
      const pricingComponents: PricingComponent[] = [];
      
      // Seed default pricing components based on prompt examples
      if (s.id === "website-dev" || s.id === "ecommerce-dev" || s.id === "software-dev" || s.id === "mobile-app") {
        pricingComponents.push(
          { id: `${s.id}-auth`, name: "Authentication (OAuth/JWT)", type: "fixed", fixedPrice: 800, perUnitPrice: 0, description: "Secure user signup and login sessions" },
          { id: `${s.id}-admin`, name: "Admin Dashboard Control Panel", type: "fixed", fixedPrice: 1500, perUnitPrice: 0, description: "Internal management tool" },
          { id: `${s.id}-payment`, name: "Payment Gateway Integration", type: "fixed", fixedPrice: 600, perUnitPrice: 0, description: "Stripe, PayPal, Razorpay setup" },
          { id: `${s.id}-hosting`, name: "Cloud Hosting & Deployment Setup", type: "fixed", fixedPrice: 400, perUnitPrice: 0, description: "Vercel, AWS or GCP provisioning" }
        );
      } else if (s.id === "uiux-design") {
        pricingComponents.push(
          { id: `uiux-screens`, name: "Additional Prototype Screens", type: "per-unit", fixedPrice: 0, perUnitPrice: 80, description: "Custom UI layout screens" }
        );
      }

      return {
        id: s.id,
        name: s.name,
        category: getCategoryFromId(s.id),
        description: s.description,
        iconName: s.iconName,
        basePrice: s.basePrice,
        unitType: s.id === "uiux-design" ? "Screen" : "Project",
        status: "active",
        questions: s.questions,
        pricingComponents
      };
    });
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(initialServices));
  }

  // Initialize Multipliers
  if (!localStorage.getItem(STORAGE_KEYS.MULTIPLIERS)) {
    localStorage.setItem(STORAGE_KEYS.MULTIPLIERS, JSON.stringify(DEFAULT_MULTIPLIERS));
  }

  // Initialize Settings
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }

  // Initialize Estimates
  if (!localStorage.getItem(STORAGE_KEYS.ESTIMATES)) {
    localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(DEFAULT_ESTIMATES));
  }

  // Initialize Enquiries
  if (!localStorage.getItem(STORAGE_KEYS.ENQUIRIES)) {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(DEFAULT_ENQUIRIES));
  }
};

const getCategoryFromId = (id: string): string => {
  if (id.includes("dev")) return "Development";
  if (id.includes("design") || id.includes("branding")) return "Design";
  if (id.includes("marketing") || id.includes("seo")) return "Marketing";
  if (id.includes("ai")) return "AI & Data Science";
  if (id.includes("cloud")) return "Cloud & DevOps";
  return "General";
};

// Service Database Operations
export const getServices = (): Service[] => {
  if (!isClient) return [];
  initDb();
  const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
  return data ? JSON.parse(data) : [];
};

export const saveServices = (services: Service[]) => {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
};

// Multipliers Database Operations
export const getMultipliers = (): MultiplierSet => {
  if (!isClient) return DEFAULT_MULTIPLIERS;
  initDb();
  const data = localStorage.getItem(STORAGE_KEYS.MULTIPLIERS);
  return data ? JSON.parse(data) : DEFAULT_MULTIPLIERS;
};

export const saveMultipliers = (multipliers: MultiplierSet) => {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.MULTIPLIERS, JSON.stringify(multipliers));
};

// Global Settings Database Operations
export const getGlobalSettings = (): GlobalSettings => {
  if (!isClient) return DEFAULT_SETTINGS;
  initDb();
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

export const saveGlobalSettings = (settings: GlobalSettings) => {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Estimates Database Operations
export const getEstimates = (): Estimate[] => {
  if (!isClient) return [];
  initDb();
  const data = localStorage.getItem(STORAGE_KEYS.ESTIMATES);
  return data ? JSON.parse(data) : [];
};

export const addEstimate = (estimate: Omit<Estimate, "id" | "createdDate">) => {
  if (!isClient) return;
  const list = getEstimates();
  const newEstimate: Estimate = {
    ...estimate,
    id: `EST-${Math.floor(1000 + Math.random() * 9000)}`,
    createdDate: new Date().toISOString()
  };
  list.unshift(newEstimate);
  localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(list));
  return newEstimate;
};

export const deleteEstimate = (id: string) => {
  if (!isClient) return;
  const list = getEstimates().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(list));
};

export const updateEstimateStatus = (id: string, status: Estimate["status"]) => {
  if (!isClient) return;
  const list = getEstimates().map((e) => e.id === id ? { ...e, status } : e);
  localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(list));
};

// Enquiries Database Operations
export const getEnquiries = (): Enquiry[] => {
  if (!isClient) return [];
  initDb();
  const data = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
  return data ? JSON.parse(data) : [];
};

export const addEnquiry = (enquiry: Omit<Enquiry, "id" | "createdDate">) => {
  if (!isClient) return;
  const list = getEnquiries();
  const newEnquiry: Enquiry = {
    ...enquiry,
    id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
    createdDate: new Date().toISOString()
  };
  list.unshift(newEnquiry);
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(list));
  return newEnquiry;
};

export const deleteEnquiry = (id: string) => {
  if (!isClient) return;
  const list = getEnquiries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(list));
};

export const updateEnquiryStatus = (id: string, status: Enquiry["status"]) => {
  if (!isClient) return;
  const list = getEnquiries().map((e) => e.id === id ? { ...e, status } : e);
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(list));
};
