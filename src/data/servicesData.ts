import { 
  Globe, 
  Smartphone, 
  Palette, 
  Megaphone, 
  Search, 
  Award, 
  Cpu, 
  Code, 
  Cloud, 
  ShoppingBag 
} from "lucide-react";

export interface QuestionOption {
  value: string;
  label: string;
  priceModifier: number; // Flat fee or multiplier
  modifierType: "flat" | "multiplier";
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  type: "radio" | "checkbox" | "select";
  options: QuestionOption[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  iconName: string;
  basePrice: number;
  questions: Question[];
}

export const SERVICES_DATA: Service[] = [
  {
    id: "website-dev",
    name: "Website Development",
    description: "Tailor-made, responsive websites built for speed, SEO, and conversions.",
    iconName: "Globe",
    basePrice: 3500,
    questions: [
      {
        id: "site-type",
        text: "What type of website do you need?",
        type: "radio",
        options: [
          { value: "landing", label: "Single-Page / Landing Page", priceModifier: 0, modifierType: "flat", description: "Ideal for high-converting marketing campaigns" },
          { value: "corporate", label: "Corporate Multi-Page Site", priceModifier: 1500, modifierType: "flat", description: "Standard business website (5-10 pages)" },
          { value: "custom-web-app", label: "Custom Interactive Web Application", priceModifier: 4000, modifierType: "flat", description: "Complex user interactions, APIs, and dashboard views" }
        ]
      },
      {
        id: "cms-pref",
        text: "Do you need Content Management System (CMS) integration?",
        type: "radio",
        options: [
          { value: "none", label: "No CMS (Static Code Only)", priceModifier: 1.0, modifierType: "multiplier", description: "No editing panel needed, managed by developers" },
          { value: "headless", label: "Headless CMS (Sanity / Contentful)", priceModifier: 1.25, modifierType: "multiplier", description: "Modern, high-speed, secure editor panel" },
          { value: "wordpress", label: "WordPress Custom Development", priceModifier: 1.15, modifierType: "multiplier", description: "Traditional easy-to-use publishing interface" }
        ]
      },
      {
        id: "extra-features",
        text: "Select any additional requirements:",
        type: "checkbox",
        options: [
          { value: "multilingual", label: "Multi-Language Support", priceModifier: 800, modifierType: "flat" },
          { value: "animations", label: "Premium Interactive Animations", priceModifier: 1200, modifierType: "flat" },
          { value: "custom-api", label: "Third-Party API Integrations", priceModifier: 1500, modifierType: "flat" }
        ]
      }
    ]
  },
  {
    id: "mobile-app",
    name: "Mobile App Development",
    description: "Premium iOS and Android apps crafted using state-of-the-art native/hybrid tech.",
    iconName: "Smartphone",
    basePrice: 8000,
    questions: [
      {
        id: "platforms",
        text: "Which platforms do you want to target?",
        type: "radio",
        options: [
          { value: "ios", label: "iOS App Only", priceModifier: 0, modifierType: "flat" },
          { value: "android", label: "Android App Only", priceModifier: 0, modifierType: "flat" },
          { value: "both", label: "Cross-Platform (iOS & Android)", priceModifier: 1.5, modifierType: "multiplier", description: "Built using Flutter or React Native for shared codebase efficiency" }
        ]
      },
      {
        id: "complexity",
        text: "What level of app complexity is expected?",
        type: "radio",
        options: [
          { value: "mvp", label: "Basic MVP / Prototype", priceModifier: 0, modifierType: "flat", description: "Simple features, core UI flow, testing viability" },
          { value: "medium", label: "Medium / Highly Interactive App", priceModifier: 4000, modifierType: "flat", description: "Integrates authentication, payments, push notifications" },
          { value: "enterprise", label: "Enterprise Custom App", priceModifier: 9500, modifierType: "flat", description: "Deep integrations, offline mode, multi-role dashboard" }
        ]
      },
      {
        id: "app-features",
        text: "Select specific app capabilities required:",
        type: "checkbox",
        options: [
          { value: "biometrics", label: "Biometric Authentication (FaceID/TouchID)", priceModifier: 500, modifierType: "flat" },
          { value: "geolocation", label: "Real-Time Geolocation & Maps", priceModifier: 1800, modifierType: "flat" },
          { value: "in-app-purchases", label: "Subscriptions & In-App Purchases", priceModifier: 1200, modifierType: "flat" }
        ]
      }
    ]
  },
  {
    id: "uiux-design",
    name: "UI/UX Design",
    description: "Stunning user experience journeys and interfaces backed by extensive research.",
    iconName: "Palette",
    basePrice: 2000,
    questions: [
      {
        id: "design-scope",
        text: "What is the primary scope of the design work?",
        type: "radio",
        options: [
          { value: "website", label: "Website Design", priceModifier: 500, modifierType: "flat" },
          { value: "mobile", label: "Mobile App Design", priceModifier: 1000, modifierType: "flat" },
          { value: "web-portal", label: "Complex Web Portal / Software UX", priceModifier: 2500, modifierType: "flat" }
        ]
      },
      {
        id: "screen-count",
        text: "How many screens or pages need to be designed?",
        type: "radio",
        options: [
          { value: "small", label: "1 - 10 screens", priceModifier: 1.0, modifierType: "multiplier" },
          { value: "medium", label: "11 - 25 screens", priceModifier: 1.4, modifierType: "multiplier" },
          { value: "large", label: "26+ screens", priceModifier: 1.9, modifierType: "multiplier" }
        ]
      },
      {
        id: "deliverables",
        text: "Choose design deliverables needed:",
        type: "checkbox",
        options: [
          { value: "interactive-proto", label: "Figma Interactive Clickable Prototype", priceModifier: 600, modifierType: "flat" },
          { value: "design-system", label: "Complete Scalable Design System", priceModifier: 1200, modifierType: "flat" },
          { value: "illustrations", label: "Custom 3D/Vector Illustrations", priceModifier: 900, modifierType: "flat" }
        ]
      }
    ]
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    description: "High-yield lead generation, paid acquisition campaigns, and strategic content planning.",
    iconName: "Megaphone",
    basePrice: 1500,
    questions: [
      {
        id: "marketing-channels",
        text: "Which channels would you like to run campaigns on?",
        type: "checkbox",
        options: [
          { value: "meta", label: "Meta Ads (Facebook & Instagram)", priceModifier: 500, modifierType: "flat" },
          { value: "google", label: "Google PPC Search & Display Ads", priceModifier: 600, modifierType: "flat" },
          { value: "linkedin", label: "B2B LinkedIn Ads Campaign", priceModifier: 800, modifierType: "flat" },
          { value: "email", label: "Email Marketing & Automation", priceModifier: 400, modifierType: "flat" }
        ]
      },
      {
        id: "campaign-duration",
        text: "What is the expected duration of the initial campaign?",
        type: "radio",
        options: [
          { value: "one-month", label: "1 Month Pilot Setup", priceModifier: 1.0, modifierType: "multiplier" },
          { value: "three-months", label: "3 Months (Recommended setup & optimization)", priceModifier: 2.5, modifierType: "multiplier" },
          { value: "six-months", label: "6 Months Retainer (Discounted rate)", priceModifier: 4.5, modifierType: "multiplier" }
        ]
      }
    ]
  },
  {
    id: "seo",
    name: "SEO Services",
    description: "Boost organic search rankings, site authority, and targeted search traffic.",
    iconName: "Search",
    basePrice: 1200,
    questions: [
      {
        id: "seo-type",
        text: "What scale of SEO campaign do you need?",
        type: "radio",
        options: [
          { value: "local", label: "Local SEO (Target regional customers)", priceModifier: 0, modifierType: "flat" },
          { value: "national", label: "National / Multi-region SEO", priceModifier: 1000, modifierType: "flat" },
          { value: "ecom-seo", label: "E-Commerce SEO (Products and category optimization)", priceModifier: 1800, modifierType: "flat" }
        ]
      },
      {
        id: "competitors",
        text: "What is the keyword competition level in your niche?",
        type: "radio",
        options: [
          { value: "low", label: "Low Competition Niche", priceModifier: 1.0, modifierType: "multiplier" },
          { value: "med", label: "Moderate Competition Niche", priceModifier: 1.25, modifierType: "multiplier" },
          { value: "high", label: "High-Volume / Aggressive Competition Niche", priceModifier: 1.5, modifierType: "multiplier" }
        ]
      }
    ]
  },
  {
    id: "branding",
    name: "Branding",
    description: "Memorable corporate identity, brand books, and custom collateral design.",
    iconName: "Award",
    basePrice: 2500,
    questions: [
      {
        id: "branding-scope",
        text: "What brand identity assets do you require?",
        type: "checkbox",
        options: [
          { value: "logo", label: "Primary Logo & Icon Variations", priceModifier: 500, modifierType: "flat" },
          { value: "guidelines", label: "Brand Book & Styling Guidelines", priceModifier: 800, modifierType: "flat" },
          { value: "stationery", label: "Business Card, Email Signatures & Stationery", priceModifier: 400, modifierType: "flat" },
          { value: "decks", label: "Custom Pitch Deck & Presentation Templates", priceModifier: 1000, modifierType: "flat" }
        ]
      }
    ]
  },
  {
    id: "ai-solutions",
    name: "AI Solutions",
    description: "Automate procedures and build smart algorithms using OpenAI, LLMs, and computer vision.",
    iconName: "Cpu",
    basePrice: 6000,
    questions: [
      {
        id: "ai-type",
        text: "What category of AI solution matches your target?",
        type: "radio",
        options: [
          { value: "chatbot", label: "Conversational AI / RAG Chatbot", priceModifier: 1200, modifierType: "flat" },
          { value: "prediction", label: "Predictive Analytics & Data Science Modeling", priceModifier: 3000, modifierType: "flat" },
          { value: "automation", label: "Intelligent Document Processing / Workflow Automation", priceModifier: 2500, modifierType: "flat" }
        ]
      },
      {
        id: "data-prep",
        text: "What is the status of your data sources?",
        type: "radio",
        options: [
          { value: "ready", label: "Clean, organized and API-accessible", priceModifier: 1.0, modifierType: "multiplier" },
          { value: "unstructured", label: "Unstructured / Needs collection & preparation", priceModifier: 1.3, modifierType: "multiplier" },
          { value: "none", label: "No data exists (Requires synthetic data or tracking setup)", priceModifier: 1.6, modifierType: "multiplier" }
        ]
      }
    ]
  },
  {
    id: "software-dev",
    name: "Software Development",
    description: "Custom ERPs, API architectures, and enterprise business automation portals.",
    iconName: "Code",
    basePrice: 7000,
    questions: [
      {
        id: "platform-type",
        text: "What software format do you need?",
        type: "radio",
        options: [
          { value: "web-portal", label: "Custom Business Web Portal", priceModifier: 0, modifierType: "flat" },
          { value: "desktop", label: "Desktop Application (Windows/macOS)", priceModifier: 2000, modifierType: "flat" },
          { value: "headless-api", label: "Dedicated Microservices API System", priceModifier: 1500, modifierType: "flat" }
        ]
      },
      {
        id: "integrations",
        text: "Specify legacy integration requirements:",
        type: "radio",
        options: [
          { value: "none", label: "Greenfield project (No integrations needed)", priceModifier: 1.0, modifierType: "multiplier" },
          { value: "modern", label: "Integration with standard modern SaaS APIs", priceModifier: 1.15, modifierType: "multiplier" },
          { value: "legacy", label: "Integration with complex legacy mainframe systems", priceModifier: 1.4, modifierType: "multiplier" }
        ]
      }
    ]
  },
  {
    id: "cloud-services",
    name: "Cloud Services",
    description: "Secure, reliable, and auto-scaling infrastructure designs built on AWS and GCP.",
    iconName: "Cloud",
    basePrice: 4000,
    questions: [
      {
        id: "cloud-scope",
        text: "What type of cloud service is required?",
        type: "radio",
        options: [
          { value: "migration", label: "Legacy-to-Cloud Migration", priceModifier: 2500, modifierType: "flat" },
          { value: "devops", label: "CI/CD & DevOps Pipeline Automation", priceModifier: 1500, modifierType: "flat" },
          { value: "audit", label: "Cloud Cost & Security Audit", priceModifier: 0, modifierType: "flat" }
        ]
      },
      {
        id: "scale",
        text: "What is your estimated traffic scale?",
        type: "radio",
        options: [
          { value: "small", label: "Low traffic (< 50,000 monthly hits)", priceModifier: 1.0, modifierType: "multiplier" },
          { value: "medium", label: "Medium traffic (50k - 500k monthly hits)", priceModifier: 1.25, modifierType: "multiplier" },
          { value: "large", label: "Enterprise/High scale (Millions of daily hits)", priceModifier: 1.6, modifierType: "multiplier" }
        ]
      }
    ]
  },
  {
    id: "ecommerce-dev",
    name: "E-Commerce Development",
    description: "Stunning digital shopfronts integrated with secure gateways and logistics CMS systems.",
    iconName: "ShoppingBag",
    basePrice: 5000,
    questions: [
      {
        id: "ecom-platform",
        text: "Which platform do you prefer for your shop?",
        type: "radio",
        options: [
          { value: "shopify", label: "Shopify Custom Theme & Development", priceModifier: 0, modifierType: "flat" },
          { value: "custom-next", label: "Custom Headless Next.js Commerce App", priceModifier: 4000, modifierType: "flat", description: "Ultra-fast, customizable, high-end conversions" },
          { value: "woocommerce", label: "WooCommerce / WordPress Storefront", priceModifier: -500, modifierType: "flat" }
        ]
      },
      {
        id: "catalog-size",
        text: "How many products do you expect to sell?",
        type: "radio",
        options: [
          { value: "small", label: "1 - 100 products", priceModifier: 1.0, modifierType: "multiplier" },
          { value: "medium", label: "101 - 1,000 products", priceModifier: 1.2, modifierType: "multiplier" },
          { value: "large", label: "1000+ products", priceModifier: 1.45, modifierType: "multiplier" }
        ]
      },
      {
        id: "ecom-integrations",
        text: "Select any specialized store components needed:",
        type: "checkbox",
        options: [
          { value: "subscriptions", label: "Recurring Subscriptions / Billing System", priceModifier: 1200, modifierType: "flat" },
          { value: "inventory-sync", label: "Real-Time ERP/Inventory Synchronization", priceModifier: 1800, modifierType: "flat" },
          { value: "tax-calc", label: "Automatic Real-Time Multi-State Tax Calculator", priceModifier: 700, modifierType: "flat" }
        ]
      }
    ]
  }
];

export const getIcon = (iconName: string) => {
  switch (iconName) {
    case "Globe": return Globe;
    case "Smartphone": return Smartphone;
    case "Palette": return Palette;
    case "Megaphone": return Megaphone;
    case "Search": return Search;
    case "Award": return Award;
    case "Cpu": return Cpu;
    case "Code": return Code;
    case "Cloud": return Cloud;
    case "ShoppingBag": return ShoppingBag;
    default: return Globe;
  }
};
