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

// Permission definitions - must match backend
export const PERMISSIONS: Record<string, ResourcePermissions> = {
  // Core Business Resources
  products: {
    create: RolePriority.DataEntry, // 20
    read: RolePriority.ReadOnly, // 10
    update: RolePriority.DataEntry, // 20
    delete: RolePriority.Admin, // 60
  },

  orders: {
    create: RolePriority.DataEntry, // 20
    read: RolePriority.ReadOnly, // 10
    update: RolePriority.Moderator, // 40
    delete: RolePriority.SuperAdmin, // 80 - orders should rarely be deleted
  },

  customers: {
    create: RolePriority.DataEntry, // 20
    read: RolePriority.Moderator, // 40 - sensitive PII
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  // Financial Resources (Higher Security)
  payments: {
    create: RolePriority.Admin, // 60
    read: RolePriority.Admin, // 60 - sensitive financial data
    update: RolePriority.SuperAdmin, // 80
    delete: RolePriority.God, // 100 - never delete payments
  },

  refunds: {
    create: RolePriority.Admin, // 60
    read: RolePriority.Admin, // 60
    update: RolePriority.SuperAdmin, // 80
    delete: RolePriority.God, // 100
  },

  // Marketing & Discounts
  discounts: {
    create: RolePriority.Moderator, // 40
    read: RolePriority.ReadOnly, // 10
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  abandonedCarts: {
    create: RolePriority.DataEntry, // 20
    read: RolePriority.Moderator, // 40 - marketing data
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  // Shipping & Logistics
  shipments: {
    create: RolePriority.DataEntry, // 20
    read: RolePriority.Moderator, // 40
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  orderTracking: {
    create: RolePriority.DataEntry, // 20
    read: RolePriority.ReadOnly, // 10
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  // Content & Catalog
  leagues: {
    create: RolePriority.Moderator, // 40
    read: RolePriority.NewUser, // 0 - public data
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  leagueIdentifiers: {
    create: RolePriority.Moderator, // 40
    read: RolePriority.ReadOnly, // 10
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  // Dashboard & Analytics
  dashboard: {
    create: RolePriority.God, // 100 - no create
    read: RolePriority.ReadOnly, // 10
    update: RolePriority.God, // 100 - no update
    delete: RolePriority.God, // 100 - no delete
  },

  // User Management (Highest Security)
  users: {
    create: RolePriority.Admin, // 60
    read: RolePriority.Moderator, // 40
    update: RolePriority.Admin, // 60
    delete: RolePriority.SuperAdmin, // 80
  },

  userRoles: {
    create: RolePriority.SuperAdmin, // 80
    read: RolePriority.Admin, // 60
    update: RolePriority.SuperAdmin, // 80
    delete: RolePriority.God, // 100
  },

  // Images & Media
  images: {
    create: RolePriority.DataEntry, // 20
    read: RolePriority.NewUser, // 0 - public
    update: RolePriority.DataEntry, // 20
    delete: RolePriority.Moderator, // 40
  },

  // Order Items
  orderItems: {
    create: RolePriority.DataEntry, // 20
    read: RolePriority.ReadOnly, // 10
    update: RolePriority.Moderator, // 40
    delete: RolePriority.Admin, // 60
  },

  // Order Logs (Audit Trail)
  orderLogs: {
    create: RolePriority.DataEntry, // 20 - system creates these
    read: RolePriority.Moderator, // 40
    update: RolePriority.God, // 100 - never update logs
    delete: RolePriority.God, // 100 - never delete logs
  },

  // Discount Usage
  discountUsage: {
    create: RolePriority.DataEntry, // 20
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
