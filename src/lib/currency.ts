// Currency formatting utilities for consistent display across the app

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF ",
  JPY: "¥",
  AED: "AED ",
  AUD: "A$",
  CAD: "C$",
  NZD: "NZ$",
  CNY: "¥",
  HKD: "HK$",
  SGD: "S$",
  INR: "₹",
  IDR: "Rp ",
  KRW: "₩",
  MYR: "RM ",
  PHP: "₱",
  THB: "฿",
  VND: "₫",
  MXN: "MX$",
  BRL: "R$",
  ZAR: "R ",
  ILS: "₪",
  BGN: "лв ",
  CZK: "Kč ",
  DKK: "kr ",
  HUF: "Ft ",
  ISK: "kr ",
  NOK: "kr ",
  PLN: "zł ",
  RON: "lei ",
  SEK: "kr ",
  TRY: "₺",
};

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || `${currency} `;
}

/**
 * Format amount with currency symbol
 * @param amount - Amount in major units (e.g., euros, not cents)
 * @param currency - Currency code (e.g., "EUR", "USD")
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency: string = "EUR",
  decimals: number = 2
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${getCurrencySymbol(currency)}0.00`;
  }
  return `${getCurrencySymbol(currency)}${amount.toFixed(decimals)}`;
}

/**
 * Format amount from cents to currency display
 * @param amountInCents - Amount in minor units (cents)
 * @param currency - Currency code
 */
export function formatCurrencyFromCents(
  amountInCents: number | undefined | null,
  currency: string = "EUR"
): string {
  if (
    amountInCents === undefined ||
    amountInCents === null ||
    isNaN(amountInCents)
  ) {
    return `${getCurrencySymbol(currency)}0.00`;
  }
  return formatCurrency(amountInCents / 100, currency);
}

/**
 * Convert amount from cents to major units
 */
export function centsToMajor(amountInCents: number): number {
  return amountInCents / 100;
}

/**
 * Convert amount from major units to cents
 */
export function majorToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Format multiple currencies total (for reports)
 * Returns primary currency total with note about mixed currencies
 */
export function formatMixedCurrencyTotal(
  items: Array<{ amount: number; currency: string }>,
  primaryCurrency: string = "EUR"
): { total: string; hasMixedCurrencies: boolean; currencies: string[] } {
  const currencies = Array.from(new Set(items.map((i) => i.currency)));
  const hasMixedCurrencies = currencies.length > 1;

  // Sum only items in primary currency for accurate total
  const primaryTotal = items
    .filter((i) => i.currency === primaryCurrency)
    .reduce((sum, i) => sum + i.amount, 0);

  return {
    total: formatCurrency(primaryTotal, primaryCurrency),
    hasMixedCurrencies,
    currencies,
  };
}
