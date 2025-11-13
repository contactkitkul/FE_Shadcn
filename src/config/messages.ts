/**
 * Standardized toast messages for the application
 * Centralized to maintain consistency and easy updates
 */
export const TOAST_MESSAGES = {
  // Success messages
  success: {
    logout: "Logged out successfully",
    login: "Login successful!",
    created: (entity: string) => `${entity} created successfully`,
    updated: (entity: string) => `${entity} updated successfully`,
    deleted: (entity: string) => `${entity} deleted successfully`,
    saved: (entity: string) => `${entity} saved successfully`,
    duplicated: (entity: string) => `${entity} duplicated successfully`,
    generated: (entity: string, count?: number) => 
      count ? `Generated ${count} ${entity} successfully!` : `${entity} generated successfully`,
    sent: (entity: string, target?: string) => 
      target ? `${entity} sent to ${target}` : `${entity} sent successfully`,
    exported: (format: string) => `Exporting as ${format.toUpperCase()}...`,
  },

  // Error messages
  error: {
    logout: "Logout failed",
    login: "Login failed. Please try again.",
    invalidCredentials: "Invalid email or password",
    fetchUserData: "Failed to fetch user data",
    loadFailed: (entity: string) => `Failed to load ${entity}`,
    createFailed: (entity: string) => `Failed to create ${entity}`,
    updateFailed: (entity: string) => `Failed to update ${entity}`,
    deleteFailed: (entity: string) => `Failed to delete ${entity}`,
    saveFailed: (entity: string) => `Failed to save ${entity}`,
    uploadFailed: (entity: string) => `Failed to upload ${entity}`,
    invalidInput: (field: string) => `Please enter a valid ${field}`,
    required: (field: string) => `${field} is required`,
    selectDateRange: "Please select date range",
  },

  // Info messages
  info: {
    noData: (entity: string) => `No ${entity} found`,
    processing: (action: string) => `${action}...`,
  },
};

/**
 * Helper to get entity-specific messages
 */
export const getEntityMessages = (entity: string) => ({
  loadSuccess: `${entity} loaded successfully`,
  loadError: TOAST_MESSAGES.error.loadFailed(entity),
  createSuccess: TOAST_MESSAGES.success.created(entity),
  createError: TOAST_MESSAGES.error.createFailed(entity),
  updateSuccess: TOAST_MESSAGES.success.updated(entity),
  updateError: TOAST_MESSAGES.error.updateFailed(entity),
  deleteSuccess: TOAST_MESSAGES.success.deleted(entity),
  deleteError: TOAST_MESSAGES.error.deleteFailed(entity),
});
