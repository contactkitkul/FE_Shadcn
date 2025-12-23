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
  Activity,
  Truck,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Route {
  label: string;
  icon: LucideIcon;
  href: string;
  group?: string;
}

export interface RouteGroup {
  label: string;
  routes: Route[];
}

// Grouped routes for professional sidebar organization
export const routeGroups: RouteGroup[] = [
  {
    label: "Overview",
    routes: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
      { label: "Reports", icon: FileText, href: "/dashboard/reports" },
    ],
  },
  {
    label: "Management",
    routes: [
      { label: "Orders", icon: ShoppingCart, href: "/dashboard/orders" },
      { label: "Products", icon: Package, href: "/dashboard/products" },
      { label: "Discounts", icon: Percent, href: "/dashboard/discounts" },
      { label: "Shipping Fees", icon: Truck, href: "/dashboard/shipping" },
    ],
  },
  {
    label: "Audit",
    routes: [
      { label: "Customers", icon: Users, href: "/dashboard/customers" },
      {
        label: "Transactions",
        icon: CreditCard,
        href: "/dashboard/transactions",
      },
      {
        label: "Abandoned Carts",
        icon: ShoppingBag,
        href: "/dashboard/abandoned-carts",
      },
      { label: "Activity Log", icon: Activity, href: "/dashboard/activity" },
    ],
  },
];

// Flat list for backward compatibility
export const dashboardRoutes: Route[] = routeGroups.flatMap(
  (group) => group.routes
);
