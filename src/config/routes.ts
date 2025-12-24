import {
  LayoutDashboard,
  Users,
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
import { PERMISSIONS } from "./permissions";

export interface Route {
  label: string;
  icon: LucideIcon;
  href: string;
  resource: keyof typeof PERMISSIONS; // Resource for permission check
}

export interface RouteGroup {
  label: string;
  routes: Route[];
}

// Grouped routes for professional sidebar organization
// Each route has a 'resource' that maps to PERMISSIONS for RBAC
export const routeGroups: RouteGroup[] = [
  {
    label: "Overview",
    routes: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        resource: "dashboard", // Admin+ (60)
      },
      {
        label: "Analytics",
        icon: BarChart3,
        href: "/dashboard/analytics",
        resource: "analytics", // Admin+ (60)
      },
    ],
  },
  {
    label: "Management",
    routes: [
      {
        label: "Orders",
        icon: ShoppingCart,
        href: "/dashboard/orders",
        resource: "orders",
      },
      {
        label: "Products",
        icon: Package,
        href: "/dashboard/products",
        resource: "products",
      },
      {
        label: "Discounts",
        icon: Percent,
        href: "/dashboard/discounts",
        resource: "discounts",
      },
      {
        label: "Shipping Fees",
        icon: Truck,
        href: "/dashboard/shipping",
        resource: "shipments", // Uses shipments permission
      },
    ],
  },
  {
    label: "Audit",
    routes: [
      {
        label: "Customers",
        icon: Users,
        href: "/dashboard/customers",
        resource: "customers",
      },
      {
        label: "Transactions",
        icon: CreditCard,
        href: "/dashboard/transactions",
        resource: "payments", // Uses payments permission (Admin+)
      },
      {
        label: "Abandoned Carts",
        icon: ShoppingBag,
        href: "/dashboard/abandoned-carts",
        resource: "abandonedCarts",
      },
      {
        label: "Activity Log",
        icon: Activity,
        href: "/dashboard/activity",
        resource: "orderLogs", // Uses orderLogs permission
      },
    ],
  },
];

// Flat list for backward compatibility
export const dashboardRoutes: Route[] = routeGroups.flatMap(
  (group) => group.routes
);
