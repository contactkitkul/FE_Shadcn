/**
 * Frontend Permission Configuration
 *
 * PURPOSE: Controls UI VISIBILITY (what users can SEE)
 * This is different from backend permissions which control API access.
 *
 * Frontend uses simple "minimum priority to view" for each page/feature.
 */

// Role priorities matching backend schema
export enum RolePriority {
  NewUser = 0,
  ReadOnly = 10,
  DataEntry = 20,
  Moderator = 40,
  Admin = 60,
  SuperAdmin = 80,
  God = 100,
}

/**
 * PAGE VISIBILITY PERMISSIONS
 *
 * Defines minimum priority required to VIEW each dashboard page.
 *
 * ACCESS LEVELS:
 * - NewUser (0) / ReadOnly (10): No dashboard access → "Insufficient Permissions" page
 * - DataEntry (20): Orders page only
 * - Moderator (40): Orders, Products, Customers, Abandoned Carts, Discounts, Shipping
 * - Admin (60)+: Full access including Dashboard, Analytics, Transactions, Activity
 */
export const PAGE_VISIBILITY: Record<string, number> = {
  // Overview pages (Admin+ only)
  dashboard: RolePriority.Admin, // 60 - Main dashboard with stats
  analytics: RolePriority.Admin, // 60 - Analytics & reports

  // Core business pages
  orders: RolePriority.DataEntry, // 20 - Order management
  products: RolePriority.Moderator, // 40 - Product catalog
  customers: RolePriority.Moderator, // 40 - Customer data (PII)

  // Financial pages (Admin+ only)
  transactions: RolePriority.Admin, // 60 - Payments & refunds
  payments: RolePriority.Admin, // 60 - Payment records
  refunds: RolePriority.Admin, // 60 - Refund records

  // Marketing pages
  discounts: RolePriority.Moderator, // 40 - Discount codes
  abandonedCarts: RolePriority.Moderator, // 40 - Cart recovery

  // Shipping & logistics
  shipping: RolePriority.Moderator, // 40 - Shipping fees
  shipments: RolePriority.Moderator, // 40 - Shipment tracking

  // Audit & activity
  activity: RolePriority.Moderator, // 40 - Activity logs
  orderLogs: RolePriority.Moderator, // 40 - Order audit trail

  // Settings & admin
  settings: RolePriority.Admin, // 60 - System settings
  users: RolePriority.Admin, // 60 - User management
};

/**
 * FEATURE VISIBILITY
 *
 * Controls visibility of specific UI features within pages.
 * For example: can user see "Export" button, "Delete" action, etc.
 */
export const FEATURE_VISIBILITY: Record<string, number> = {
  // Export features
  exportOrders: RolePriority.Moderator, // 40
  exportCustomers: RolePriority.Admin, // 60 - PII export
  exportTransactions: RolePriority.Admin, // 60 - Financial data

  // Destructive actions
  deleteOrders: RolePriority.SuperAdmin, // 80
  deleteProducts: RolePriority.Admin, // 60
  deleteCustomers: RolePriority.Admin, // 60

  // Create actions
  createProducts: RolePriority.Moderator, // 40
  createDiscounts: RolePriority.Moderator, // 40
  createShipping: RolePriority.Moderator, // 40

  // Edit actions
  editOrders: RolePriority.Moderator, // 40
  editProducts: RolePriority.Moderator, // 40
  editCustomers: RolePriority.Moderator, // 40

  // Admin features
  manageUsers: RolePriority.Admin, // 60
  viewAuditLogs: RolePriority.Moderator, // 40
  systemSettings: RolePriority.SuperAdmin, // 80
};

/**
 * Check if user can VIEW a page
 */
export function canViewPage(
  userPriority: number,
  page: keyof typeof PAGE_VISIBILITY
): boolean {
  const requiredPriority = PAGE_VISIBILITY[page];
  if (requiredPriority === undefined) {
    return false;
  }
  return userPriority >= requiredPriority;
}

/**
 * Check if user can see a specific feature
 */
export function canUseFeature(
  userPriority: number,
  feature: keyof typeof FEATURE_VISIBILITY
): boolean {
  const requiredPriority = FEATURE_VISIBILITY[feature];
  if (requiredPriority === undefined) {
    return false;
  }
  return userPriority >= requiredPriority;
}

/**
 * Get minimum priority required to view a page
 */
export function getPagePriority(page: string): number {
  return PAGE_VISIBILITY[page] ?? RolePriority.God;
}

/**
 * Legacy compatibility - maps to PAGE_VISIBILITY for route checks
 * Used by sidebar/routes to check page access
 */
export function canAccess(userPriority: number, resource: string): boolean {
  const requiredPriority = PAGE_VISIBILITY[resource] ?? RolePriority.God;
  return userPriority >= requiredPriority;
}
