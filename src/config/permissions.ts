/**
 * Frontend Permission Configuration
 * Mirrors BE_Internal/src/config/permissions.ts
 * Used for RBAC-based UI visibility
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

export interface ResourcePermissions {
  create: number;
  read: number;
  update: number;
  delete: number;
}

/**
 * Permission definitions - must match backend
 *
 * ACCESS LEVELS:
 * - NewUser (0) / ReadOnly (10): No dashboard access → "Insufficient Permissions" page
 * - DataEntry (20): Orders only (no refunds/payments)
 * - Moderator (40): Orders, Products, Customers, Abandoned Carts, Discounts
 * - Admin (60)+: Full access including Dashboard, Analytics, Transactions
 */
export const PERMISSIONS: Record<string, ResourcePermissions> = {
  // ============================================================
  // DASHBOARD & ANALYTICS (Admin+ only)
  // ============================================================
  dashboard: {
    create: RolePriority.God, // 100 - no create
    read: RolePriority.Admin, // 60 - Admin+ only
    update: RolePriority.God, // 100 - no update
    delete: RolePriority.God, // 100 - no delete
  },

  analytics: {
    create: RolePriority.God, // 100 - no create
    read: RolePriority.Admin, // 60 - Admin+ only
    update: RolePriority.God, // 100 - no update
    delete: RolePriority.God, // 100 - no delete
  },

  // ============================================================
  // CORE BUSINESS (DataEntry can see orders, Moderator+ for rest)
  // ============================================================
  orders: {
    create: RolePriority.Admin, // 60 - system creates via API key
    read: RolePriority.DataEntry, // 20 - DataEntry can view orders
    update: RolePriority.Moderator, // 40
    delete: RolePriority.SuperAdmin, // 80 - orders should rarely be deleted
  },

  products: {
    create: RolePriority.Moderator, // 40
    read: RolePriority.Moderator, // 40 - Moderator+ only
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  customers: {
    create: RolePriority.Moderator, // 40
    read: RolePriority.Moderator, // 40 - sensitive PII
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  // ============================================================
  // FINANCIAL (Admin+ only - sensitive data)
  // ============================================================
  payments: {
    create: RolePriority.Admin, // 60 - system creates via API key
    read: RolePriority.Admin, // 60 - Admin+ only
    update: RolePriority.SuperAdmin, // 80
    delete: RolePriority.God, // 100 - never delete payments
  },

  refunds: {
    create: RolePriority.Admin, // 60 - system creates via API key
    read: RolePriority.Admin, // 60 - Admin+ only
    update: RolePriority.SuperAdmin, // 80
    delete: RolePriority.God, // 100
  },

  // ============================================================
  // MARKETING & DISCOUNTS (Moderator+)
  // ============================================================
  discounts: {
    create: RolePriority.Moderator, // 40
    read: RolePriority.Moderator, // 40 - Moderator+ only
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  abandonedCarts: {
    create: RolePriority.Admin, // 60 - system creates
    read: RolePriority.Moderator, // 40 - marketing data
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  // ============================================================
  // SHIPPING & LOGISTICS (Moderator+)
  // ============================================================
  shipments: {
    create: RolePriority.Moderator, // 40
    read: RolePriority.Moderator, // 40
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  orderTracking: {
    create: RolePriority.Admin, // 60 - system creates
    read: RolePriority.DataEntry, // 20 - DataEntry can see tracking
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  // ============================================================
  // CONTENT & CATALOG (Moderator+)
  // ============================================================
  leagues: {
    create: RolePriority.Moderator, // 40
    read: RolePriority.Moderator, // 40
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  leagueIdentifiers: {
    create: RolePriority.Moderator, // 40
    read: RolePriority.Moderator, // 40
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  // ============================================================
  // USER MANAGEMENT (Admin+)
  // ============================================================
  users: {
    create: RolePriority.Admin, // 60
    read: RolePriority.Admin, // 60
    update: RolePriority.Admin, // 60
    delete: RolePriority.SuperAdmin, // 80
  },

  userRoles: {
    create: RolePriority.SuperAdmin, // 80
    read: RolePriority.Admin, // 60
    update: RolePriority.SuperAdmin, // 80
    delete: RolePriority.God, // 100
  },

  // ============================================================
  // IMAGES & MEDIA (Moderator+)
  // ============================================================
  images: {
    create: RolePriority.Moderator, // 40
    read: RolePriority.Moderator, // 40
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  // ============================================================
  // ORDER ITEMS & LOGS (DataEntry can read items, Moderator+ for logs)
  // ============================================================
  orderItems: {
    create: RolePriority.Admin, // 60 - system creates
    read: RolePriority.DataEntry, // 20 - DataEntry can see order items
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  orderLogs: {
    create: RolePriority.Admin, // 60 - system creates audit logs
    read: RolePriority.Moderator, // 40
    update: RolePriority.God, // 100 - never update logs
    delete: RolePriority.God, // 100 - never delete logs
  },

  // ============================================================
  // DISCOUNT USAGE (Moderator+)
  // ============================================================
  discountUsage: {
    create: RolePriority.Admin, // 60 - system creates
    read: RolePriority.Moderator, // 40
    update: RolePriority.Admin, // 60
    delete: RolePriority.SuperAdmin, // 80
  },
};

/**
 * Check if a user with given priority can access a resource
 */
export function canAccess(
  userPriority: number,
  resource: keyof typeof PERMISSIONS,
  operation: keyof ResourcePermissions = "read"
): boolean {
  const resourcePerms = PERMISSIONS[resource];
  if (!resourcePerms) {
    return false;
  }
  return userPriority >= resourcePerms[operation];
}

/**
 * Get the minimum priority required for a resource
 */
export function getRequiredPriority(
  resource: keyof typeof PERMISSIONS,
  operation: keyof ResourcePermissions = "read"
): number {
  const resourcePerms = PERMISSIONS[resource];
  if (!resourcePerms) {
    return RolePriority.God;
  }
  return resourcePerms[operation];
}
