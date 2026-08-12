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
