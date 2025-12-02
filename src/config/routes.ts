import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart3,
  Package,
  ShoppingCart,
  CreditCard,
  Percent,
  ShoppingBag,
  RefreshCcw,
  Activity,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Route {
  label: string;
  icon: LucideIcon;
  href: string;
}

export const dashboardRoutes: Route[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    href: "/dashboard/orders",
  },
  {
    label: "Products",
    icon: Package,
    href: "/dashboard/products",
  },
  {
    label: "Discounts",
    icon: Percent,
    href: "/dashboard/discounts",
  },
  {
    label: "Shipping Fees",
    icon: Settings,
    href: "/dashboard/shipping",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/dashboard/customers",
  },
  {
    label: "Abandoned Carts",
    icon: ShoppingBag,
    href: "/dashboard/abandoned-carts",
  },
  {
    label: "Activity",
    icon: Activity,
    href: "/dashboard/activity",
  },
  {
    label: "Payments",
    icon: CreditCard,
    href: "/dashboard/payments",
  },
  {
    label: "Refunds",
    icon: RefreshCcw,
    href: "/dashboard/refunds",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/dashboard/reports",
  },
];
