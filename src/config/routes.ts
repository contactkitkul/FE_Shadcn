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
  Upload,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { PAGE_VISIBILITY } from "./permissions";

export interface Route {
  label: string;
  icon: LucideIcon;
  href: string;
  resource: keyof typeof PAGE_VISIBILITY; // Page for visibility check
}

export interface RouteGroup {
  label: string;
  routes: Route[];
}

// Grouped routes for professional sidebar organization
// Each route has a 'resource' that maps to PAGE_VISIBILITY for access control
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
        resource: "shipping", // Shipping fees page
      },
      {
        label: "Shipping Codes",
        icon: Upload,
        href: "/dashboard/shipping-codes",
        resource: "shipping", // Bulk upload shipping codes
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
        resource: "transactions", // Transactions page (Admin+)
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
        resource: "activity", // Activity log page
      },
    ],
  },
];

// Flat list for backward compatibility
export const dashboardRoutes: Route[] = routeGroups.flatMap(
  (group) => group.routes
);
