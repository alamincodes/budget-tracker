import {
  DollarSign,
  Briefcase,
  Home,
  ShoppingCart,
  Bus,
  Film,
  Utensils,
  Heart,
  GraduationCap,
  Gift,
  Zap,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  DollarSign,
  Briefcase,
  Home,
  ShoppingCart,
  Bus,
  Film,
  Utensils,
  Heart,
  GraduationCap,
  Gift,
  Zap,
  Smartphone,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? DollarSign;
}
