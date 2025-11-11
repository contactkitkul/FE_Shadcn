/**
 * Address validation utilities
 * 
 * This provides basic validation for shipping addresses to catch common issues
 * that might make an order undeliverable.
 */

export interface AddressValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  name: string;
}

/**
 * Validates a shipping address for common issues
 */
export function validateAddress(address: Address): AddressValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for required fields
  if (!address.line1 || address.line1.trim().length === 0) {
    errors.push("Address line 1 is required");
  }

  if (!address.city || address.city.trim().length === 0) {
    errors.push("City is required");
  }

  if (!address.postalCode || address.postalCode.trim().length === 0) {
    errors.push("Postal code is required");
  }

  if (!address.country || address.country.trim().length === 0) {
    errors.push("Country is required");
  }

  if (!address.name || address.name.trim().length === 0) {
    errors.push("Recipient name is required");
  }

  // Check address line 1 for common issues
  if (address.line1) {
    const line1Lower = address.line1.toLowerCase().trim();
    
    // Check if address is too short (likely incomplete)
    if (line1Lower.length < 5) {
      warnings.push("Address seems too short - please verify it's complete");
    }

    // Check for PO Box (some carriers don't deliver to PO boxes)
    if (line1Lower.includes("po box") || line1Lower.includes("p.o. box") || /\bp\.?\s*o\.?\s*box/i.test(line1Lower)) {
      warnings.push("PO Box detected - some carriers may not deliver to PO boxes");
    }

    // Check if address contains only numbers (missing street name)
    if (/^\d+$/.test(line1Lower.trim())) {
      errors.push("Address appears to be missing street name");
    }

    // Check for common placeholder text
    const placeholders = ["test", "example", "sample", "n/a", "na", "none", "tbd", "unknown"];
    if (placeholders.some(p => line1Lower === p || line1Lower.includes(p))) {
      errors.push("Address appears to contain placeholder text");
    }
  }

  // Validate postal code format based on country
  if (address.postalCode && address.country) {
    const postalCode = address.postalCode.trim().replace(/\s/g, "");
    const country = address.country.toLowerCase();

    if (country === "uk" || country === "united kingdom" || country === "gb") {
      // UK postal code format
      if (!/^[A-Z]{1,2}\d{1,2}[A-Z]?\d[A-Z]{2}$/i.test(postalCode)) {
        warnings.push("UK postal code format may be invalid");
      }
    } else if (country === "us" || country === "usa" || country === "united states") {
      // US ZIP code format
      if (!/^\d{5}(-\d{4})?$/.test(postalCode)) {
        warnings.push("US ZIP code format may be invalid");
      }
    } else if (country === "france" || country === "fr") {
      // French postal code format
      if (!/^\d{5}$/.test(postalCode)) {
        warnings.push("French postal code format may be invalid");
      }
    } else if (country === "germany" || country === "de") {
      // German postal code format
      if (!/^\d{5}$/.test(postalCode)) {
        warnings.push("German postal code format may be invalid");
      }
    } else if (country === "spain" || country === "es") {
      // Spanish postal code format
      if (!/^\d{5}$/.test(postalCode)) {
        warnings.push("Spanish postal code format may be invalid");
      }
    }
  }

  // Check for very long address lines (might be truncated by carrier)
  if (address.line1 && address.line1.length > 100) {
    warnings.push("Address line 1 is very long and may be truncated by carrier");
  }

  if (address.line2 && address.line2.length > 100) {
    warnings.push("Address line 2 is very long and may be truncated by carrier");
  }

  // Check for missing apartment/unit number if line2 is empty and line1 suggests multi-unit
  if (!address.line2 && address.line1) {
    const line1Lower = address.line1.toLowerCase();
    if (line1Lower.includes("apartment") || line1Lower.includes("apt") || 
        line1Lower.includes("unit") || line1Lower.includes("suite") ||
        line1Lower.includes("floor") || line1Lower.includes("building")) {
      warnings.push("Address mentions apartment/unit but no specific number found in line 2");
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Formats an address for display
 */
export function formatAddress(address: Address): string {
  const parts = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ].filter(Boolean);

  return parts.join("\n");
}

/**
 * Checks if an address needs verification
 */
export function needsVerification(address: Address): boolean {
  const result = validateAddress(address);
  return !result.isValid || result.warnings.length > 0;
}
