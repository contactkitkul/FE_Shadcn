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
    create: RolePriority.DataEntry,
    read: RolePriority.ReadOnly,
    update: RolePriority.DataEntry,
    delete: RolePriority.Admin,
  },

  orders: {
    create: RolePriority.DataEntry,
    read: RolePriority.ReadOnly,
    update: RolePriority.Moderator,
    delete: RolePriority.SuperAdmin,
  },

  customers: {
    create: RolePriority.DataEntry,
    read: RolePriority.Moderator,
    update: RolePriority.Moderator,
    delete: RolePriority.Admin,
  },

  // Financial Resources (Higher Security)
  payments: {
    create: RolePriority.Admin,
    read: RolePriority.Admin,
    update: RolePriority.SuperAdmin,
    delete: RolePriority.God,
  },

  refunds: {
    create: RolePriority.Admin,
    read: RolePriority.Admin,
    update: RolePriority.SuperAdmin,
    delete: RolePriority.God,
  },

  // Transactions (combined payments + refunds)
  transactions: {
    create: RolePriority.Admin,
    read: RolePriority.Admin,
    update: RolePriority.SuperAdmin,
    delete: RolePriority.God,
  },

  // Marketing & Discounts
  discounts: {
    create: RolePriority.Moderator,
    read: RolePriority.ReadOnly,
    update: RolePriority.Moderator,
    delete: RolePriority.Admin,
  },

  abandonedCarts: {
    create: RolePriority.DataEntry,
    read: RolePriority.Moderator,
    update: RolePriority.Moderator,
    delete: RolePriority.Admin,
  },

  // Shipping & Logistics
  shipments: {
    create: RolePriority.DataEntry,
    read: RolePriority.Moderator,
    update: RolePriority.Moderator,
    delete: RolePriority.Admin,
  },

  shipping: {
    create: RolePriority.Moderator,
    read: RolePriority.ReadOnly,
    update: RolePriority.Moderator,
    delete: RolePriority.Admin,
  },

  // Dashboard & Analytics
  dashboard: {
    create: RolePriority.God,
    read: RolePriority.ReadOnly,
    update: RolePriority.God,
    delete: RolePriority.God,
  },

  analytics: {
    create: RolePriority.God,
    read: RolePriority.ReadOnly,
    update: RolePriority.God,
    delete: RolePriority.God,
  },

  reports: {
    create: RolePriority.Moderator,
    read: RolePriority.ReadOnly,
    update: RolePriority.Moderator,
    delete: RolePriority.Admin,
  },

  // Order Logs (Audit Trail)
  orderLogs: {
    create: RolePriority.DataEntry,
    read: RolePriority.Moderator,
    update: RolePriority.God,
    delete: RolePriority.God,
  },

  activity: {
    create: RolePriority.DataEntry,
    read: RolePriority.Moderator,
    update: RolePriority.God,
    delete: RolePriority.God,
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
