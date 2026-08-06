import { SERVICES_DATA, Service as StaticService } from "@/data/servicesData";

export interface PricingComponent {
  id: string;
  name: string;
  type: "fixed" | "per-unit";
  fixedPrice: number;
  perUnitPrice: number;
  description: string;
  maxQuantity?: number;
  iconName?: string;
  status?: "active" | "inactive";
  category?: string;
}

export interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
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
  defaultValue?: any;
  priceModifier?: number;
  modifierType?: "flat" | "multiplier";
  options?: QuestionOption[];
  conditionalParentId?: string;
  conditionalParentValue?: string;
  validationRules?: ValidationRule;
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
  customerPhone?: string;
  customerCompany?: string;
  notes?: string;
  serviceNames: string[];
  totalPrice: number;
  status: "pending" | "approved" | "rejected" | "completed";
  createdDate: string;
  breakdown: any;
  answers: any;
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

const STORAGE_KEYS = {
  SERVICES: "dezprox_services",
  MULTIPLIERS: "dezprox_multipliers",
  ESTIMATES: "dezprox_estimates",
  ENQUIRIES: "dezprox_enquiries",
  SETTINGS: "dezprox_settings",
};

const DEFAULT_MULTIPLIERS: MultiplierSet = {
  complexity: [
    { id: "simple", label: "Simple", value: 1.0, description: "Standard template-based work" },
    { id: "medium", label: "Medium", value: 1.3, description: "Custom UI elements and API integrations" },
    { id: "complex", label: "Complex", value: 1.6, description: "Advanced features, custom backend, auth" }
  ],
  urgency: [
    { id: "normal", label: "Normal", value: 1.0, description: "Standard delivery timeline" },
    { id: "fast", label: "Fast", value: 1.25, description: "Expedited delivery" },
    { id: "urgent", label: "Urgent", value: 1.5, description: "Priority delivery" }
  ],
  quality: [
    { id: "basic", label: "Basic", value: 0.9, description: "Functional release, MVP standards" },
    { id: "standard", label: "Standard", value: 1.0, description: "High quality production release" },
    { id: "premium", label: "Premium", value: 1.3, description: "Elite graphics and micro-interactions" }
  ]
};

const DEFAULT_SETTINGS: GlobalSettings = {
  companyName: "Dezprox Solutions",
  currency: "₹",
  taxRate: 18,
  discountRate: 0,
  defaultPricingMode: "Standard Additive",
  minimumCost: 500,
  maximumCost: 100000,
  whatsappNumber: "+15550199000",
  gateEstimateWithLeadForm: false,
};

const DEFAULT_ESTIMATES: Estimate[] = [
  {
    id: "EST-2801",
    customerName: "Aman Sharma",
    customerEmail: "aman@techcorp.in",
    serviceNames: ["Website Development", "Graphic Design"],
    totalPrice: 17998,
    status: "approved",
    createdDate: "2026-07-20T10:30:00.000Z",
    breakdown: {},
    answers: {}
  }
];

const DEFAULT_ENQUIRIES: Enquiry[] = [
  {
    id: "ENQ-1001",
    name: "Aman Sharma",
    email: "aman@techcorp.in",
    phone: "+91 98765 43210",
    company: "TechCorp India",
    selectedServices: ["website-dev", "branding"],
    estimateRange: "₹17,000 - ₹20,000",
    message: "Looking for a custom multi-page website with Graphic Design deliverables.",
    status: "pending",
    createdDate: "2026-07-20T10:30:00.000Z"
  }
];

const isClient = typeof window !== "undefined";

export const initDb = () => {
  if (!isClient) return;

  const currentDbVersion = "db_v10";
  const storedVersion = localStorage.getItem("dezprox_db_version");

  if (storedVersion !== currentDbVersion) {
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.MULTIPLIERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem("dezprox_session");
    localStorage.setItem("dezprox_db_version", currentDbVersion);
  }

  // Initialize Services
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    const initialServices: Service[] = SERVICES_DATA.map((s) => {
      const pricingComponents: PricingComponent[] = [];
      
      if (s.id === "website-dev") {
        pricingComponents.push(
          { id: `website-amc`, name: "Annual Maintenance Contract (AMC)", type: "fixed", fixedPrice: 2000, perUnitPrice: 0, description: "Includes core updates, security patches and optimizations", maxQuantity: 1, iconName: "Shield", status: "active", category: "Standard Add-ons" },
          { id: `website-whatsapp`, name: "WhatsApp Integration Support", type: "fixed", fixedPrice: 1999, perUnitPrice: 0, description: "Direct customer contact chat widgets setup", maxQuantity: 1, iconName: "MessageCircle", status: "active", category: "Standard Add-ons" },
          { id: `website-blogs`, name: "Dynamic Blog System Setup", type: "fixed", fixedPrice: 4999, perUnitPrice: 0, description: "Publish content updates and articles", maxQuantity: 1, iconName: "FileText", status: "active", category: "Standard Add-ons" }
        );
      }

      const packages: Package[] = [];
      if (s.id === "website-dev") {
        packages.push(
          { 
            id: "web-std-no-domain", 
            name: "Standard (Code, No Domain)", 
            price: 12999, 
            timeline: "2 Weeks", 
            description: "Standard business website without custom domain configuration.", 
            isRecommended: false, 
            isPopular: false, 
            displayOrder: 0, 
            status: "active", 
            features: ["Standard Code", "No Domain Included", "Responsive Layout"],
            questions: [
              { id: "extra-pages", text: "Extra Pages Needed", type: "counter", isRequired: false, displayOrder: 0, defaultValue: 0, priceModifier: 2500, modifierType: "flat" }
            ]
          },
          { 
            id: "web-std-with-domain", 
            name: "Standard (Code + Domain)", 
            price: 14999, 
            timeline: "2 Weeks", 
            description: "Standard business website with custom domain configuration included.", 
            isRecommended: false, 
            isPopular: false, 
            displayOrder: 1, 
            status: "active", 
            features: ["Standard Code", "Domain Included (1 Year)", "Responsive Layout"],
            questions: [
              { id: "extra-pages", text: "Extra Pages Needed", type: "counter", isRequired: false, displayOrder: 0, defaultValue: 0, priceModifier: 2500, modifierType: "flat" }
            ]
          },
          { 
            id: "web-nocode", 
            name: "No-Code Website", 
            price: 11999, 
            timeline: "1 Week", 
            description: "Standard website (4 pages, SEO, content). Note: The price mentioned is only for Development and Deployment. Platform fee has to be paid to the platform directly.", 
            isRecommended: false, 
            isPopular: false, 
            displayOrder: 2, 
            status: "active", 
            features: ["4 pages", "SEO", "Website Content"]
          },
          { 
            id: "web-dyn", 
            name: "Dynamic (Code + Domain)", 
            price: 19999, 
            timeline: "4 Weeks", 
            description: "Custom dynamic site with admin panel features and domain configuration.", 
            isRecommended: true, 
            isPopular: true, 
            displayOrder: 3, 
            status: "active", 
            features: ["Custom Code", "Admin Panel Integrations", "Domain Included (1 Year)"],
            questions: [
              { id: "extra-pages", text: "Extra Pages Needed", type: "counter", isRequired: false, displayOrder: 0, defaultValue: 0, priceModifier: 3500, modifierType: "flat" }
            ]
          }
        );
      } else if (s.id === "seo") {
        packages.push(
          { id: "seo-starter", name: "Starter", price: 9999, timeline: "Monthly", description: "Baseline search optimization services.", isRecommended: false, isPopular: false, displayOrder: 0, status: "active", features: ["On-Page SEO", "10 Keywords", "Search Console"] },
          { id: "seo-growth", name: "Growth", price: 19999, timeline: "Monthly", description: "Aggressive keyword ranking growth.", isRecommended: true, isPopular: true, displayOrder: 1, status: "active", features: ["Backlinks Building", "30 Keywords", "Competitor Review"] },
          { id: "seo-premium", name: "Premium", price: 29999, timeline: "Monthly", description: "Enterprise local and search positioning.", isRecommended: false, isPopular: false, displayOrder: 2, status: "active", features: ["Elite PR Placement", "Unlimited Keywords", "Dedicated Manager"] }
        );
      } else if (s.id === "ecommerce-dev") {
        packages.push(
          { id: "ecom-basic", name: "Code Basic", price: 50000, timeline: "2-4 Weeks", description: "Standard storefront package. Includes payment verification and delivery booking setup.", isRecommended: false, isPopular: false, displayOrder: 0, status: "active", features: ["Product Listing + Cart + Checkout", "UPI/QR Manual Payment", "Delhivery Manual Tracking", "Basic Product Variants"] },
          { id: "ecom-std", name: "Code Standard", price: 90000, timeline: "5-7 Weeks", description: "Automated payment and carrier integration for growing stores.", isRecommended: true, isPopular: true, displayOrder: 1, status: "active", features: ["Everything in Basic", "Razorpay/Cashfree Gateway", "WhatsApp Integration", "Semi-auto Shiprocket Courier"] },
          { id: "ecom-prem", name: "Code Premium", price: 120000, timeline: "8-10 Weeks", description: "Advanced storefront with full dashboard and real-time carrier automations.", isRecommended: false, isPopular: false, displayOrder: 2, status: "active", features: ["Everything in Standard", "Full Payment Webhooks", "Shiprocket Full Auto Pickup", "Advanced Variant & Search Filter"] },
          { id: "ecom-nocode", name: "No-Code E-Commerce", price: 30000, timeline: "1-2 Weeks", description: "No-Code storefront setup. Note: Price is exclusive of platform and subscription fees. Includes Basic SEO and Website Content.", isRecommended: false, isPopular: false, displayOrder: 3, status: "active", features: ["Basic SEO", "Website Content"] }
        );
      } else if (s.id === "branding") {
        packages.push(
          { id: "brand-logo", name: "Logo Design", price: 4999, timeline: "1 Week", description: "Creative logo assets and graphics drafts.", isRecommended: false, isPopular: false, displayOrder: 0, status: "active", features: ["3 Logo Draft Concepts", "Vector Output Deliverables"] },
          { id: "brand-guidelines", name: "Brand Guidelines", price: 9999, timeline: "2 Weeks", description: "Complete visual identity stylebook.", isRecommended: true, isPopular: true, displayOrder: 1, status: "active", features: ["Color Palette", "Typography Stylebook", "Logo Usage Rules"] }
        );
      } else if (s.id === "digital-marketing") {
        packages.push(
          { id: "marketing-std", name: "Digital Marketing Campaign", price: 14999, timeline: "Monthly", description: "Paid acquisition campaigns and content.", isRecommended: true, isPopular: true, displayOrder: 0, status: "active", features: ["Social Media Ads Setup", "Google Analytics Audit"] }
        );
      }

      const questionsList: Question[] = [];
      if (s.id === "branding") {
        questionsList.push({
          id: "custom-requirements",
          text: "Other Custom Requirements",
          description: "Specify any custom design assets (e.g. menu design, billboard, standee, etc.)",
          type: "text",
          isRequired: false,
          displayOrder: 10,
          defaultValue: "",
          priceModifier: 0,
          modifierType: "flat",
          options: []
        });
      } else if (s.questions) {
        s.questions.forEach((q: any, idx: number) => {
          questionsList.push({
            id: q.id,
            text: q.text,
            description: "",
            type: q.type as any,
            isRequired: true,
            displayOrder: idx,
            defaultValue: q.type === "checkbox" ? [] : "",
            options: q.options || []
          });
        });
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
        questions: questionsList,
        pricingComponents,
        packages
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
  return "General";
};

// Service Database Operations
export const getServices = (): Service[] => {
  if (!isClient) return [];
  initDb();
  const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
  try {
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to parse services data", err);
    return [];
  }
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
  try {
    return data ? JSON.parse(data) : DEFAULT_MULTIPLIERS;
  } catch (err) {
    console.error("Failed to parse multipliers data", err);
    return DEFAULT_MULTIPLIERS;
  }
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
  try {
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (err) {
    console.error("Failed to parse settings data", err);
    return DEFAULT_SETTINGS;
  }
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
  try {
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to parse estimates data", err);
    return [];
  }
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
  try {
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to parse enquiries data", err);
    return [];
  }
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

// Admin Session & Authentication
export type UserRole = "Admin";

export interface UserSession {
  email: string;
  role: UserRole;
  token: string;
  loginTime: string;
}

const MOCK_USERS = [
  { email: "admin@dezprox.com", password: "admin123", role: "Admin" as UserRole },
];

export const getCurrentSession = (): UserSession | null => {
  if (!isClient) return null;
  try {
    const data = localStorage.getItem("dezprox_session");
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Failed to parse active user session", err);
    return null;
  }
};

export const loginAdmin = (email: string, password: string): UserSession | null => {
  if (!isClient) return null;
  const storedPassword = localStorage.getItem("dezprox_admin_password") || "admin123";
  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || password !== storedPassword) return null;

  const session: UserSession = {
    email: user.email,
    role: user.role,
    token: `tok_${Math.random().toString(36).substr(2, 9)}`,
    loginTime: new Date().toISOString()
  };

  localStorage.setItem("dezprox_session", JSON.stringify(session));
  return session;
};

export const updateAdminPassword = (newPassword: string): boolean => {
  if (!isClient) return false;
  localStorage.setItem("dezprox_admin_password", newPassword);
  return true;
};

export const logoutAdmin = () => {
  if (!isClient) return;
  localStorage.removeItem("dezprox_session");
};

// Access Control Mapper for Protected Paths
export const hasAccessToRoute = (role: UserRole, path: string): boolean => {
  return true;
};
