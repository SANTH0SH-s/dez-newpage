import { 
  Globe, 
  Smartphone, 
  Palette, 
  Megaphone, 
  Search, 
  Award, 
  Code, 
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
  type: "radio" | "checkbox" | "select" | "counter" | "number" | "text" | "toggle";
  options: QuestionOption[];
  isRequired?: boolean;
  displayOrder?: number;
  defaultValue?: string | number | boolean | string[];
  priceModifier?: number;
  modifierType?: "flat" | "multiplier";
  conditionalParentId?: string;
  conditionalParentValue?: string;
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
    basePrice: 12999,
    questions: []
  },
  {
    id: "ecommerce-dev",
    name: "E-Commerce",
    description: "Stunning digital shopfronts integrated with secure payment systems and inventory management.",
    iconName: "ShoppingBag",
    basePrice: 30000,
    questions: []
  },
  {
    id: "branding",
    name: "Graphic Design",
    description: "Memorable corporate identity, brand books, custom logos, and guidelines design.",
    iconName: "Award",
    basePrice: 4999,
    questions: []
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    description: "High-yield lead generation, paid acquisition campaigns, and strategic content planning.",
    iconName: "Megaphone",
    basePrice: 999,
    questions: []
  },
  {
    id: "seo",
    name: "SEO Packages",
    description: "Boost organic search rankings, domain authority, and targeted search traffic.",
    iconName: "Search",
    basePrice: 9999,
    questions: []
  },
  {
    id: "uiux-design",
    name: "UI/UX Design",
    description: "Stunning user experience journeys and interfaces backed by extensive user research.",
    iconName: "Palette",
    basePrice: 0,
    questions: []
  },
  {
    id: "mobile-app",
    name: "App Development",
    description: "Premium iOS and Android apps crafted using state-of-the-art native and hybrid frameworks.",
    iconName: "Smartphone",
    basePrice: 0,
    questions: []
  },
  {
    id: "software-dev",
    name: "Custom Software",
    description: "Custom ERPs, API architectures, and enterprise business automation portals.",
    iconName: "Code",
    basePrice: 0,
    questions: []
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
    case "Code": return Code;
    case "ShoppingBag": return ShoppingBag;
    default: return Globe;
  }
};
