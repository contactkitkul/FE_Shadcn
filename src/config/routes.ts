import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart3,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  Tag,
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
    label: "Customers",
    icon: Users,
    href: "/dashboard/customers",
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
  {
    label: "Discounts",
    icon: Tag,
    href: "/dashboard/discounts",
  },
  {
    label: "Shipments",
    icon: Truck,
    href: "/dashboard/shipments",
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
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];
