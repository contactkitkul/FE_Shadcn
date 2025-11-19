// Types based on Prisma Schema

export enum EnumCurrency {
  INR = "INR",
  EUR = "EUR",
  USD = "USD",
  GBP = "GBP",
  CHF = "CHF",
  AUD = "AUD",
  BGN = "BGN",
  CAD = "CAD",
  CNY = "CNY",
  CZK = "CZK",
  DKK = "DKK",
  HKD = "HKD",
  HUF = "HUF",
  JPY = "JPY",
  KRW = "KRW",
}

export enum EnumPatch {
  NO_PATCH = "NO_PATCH",
  CHAMPIONS_LEAGUE = "CHAMPIONS_LEAGUE",
  LEAGUE = "LEAGUE",
}

export enum EnumAddVerificationStatus {
  UNVERIFIED = "UNVERIFIED",
  VERIFIED_GOOD = "VERIFIED_GOOD",
  VEIFIED_BAD = "VEIFIED_BAD",
}

export enum EnumProductType {
  SHIRT = "SHIRT",
  CUSTOMISATION = "CUSTOMISATION",
  SHORTS = "SHORTS",
  SOCKS = "SOCKS",
}

export enum EnumProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export enum EnumLeague {
  PREMIER_LEAGUE = "PREMIER_LEAGUE",
  LA_LIGA = "LA_LIGA",
  SERIE_A = "SERIE_A",
  BUNDESLIGA = "BUNDESLIGA",
  LIGUE_1 = "LIGUE_1",
  REST_OF_THE_WORLD = "REST_OF_THE_WORLD",
  NATIONAL_TEAMS = "NATIONAL_TEAMS",
  MYSTERY = "MYSTERY",
}

export enum EnumHomeAway {
  HOME = "HOME",
  AWAY = "AWAY",
  THIRD = "THIRD",
  GOALKEEPER = "GOALKEEPER",
  SPECIAL_EDITION = "SPECIAL_EDITION",
  FOURTH = "FOURTH",
  FIFTH = "FIFTH",
  MYSTERY = "MYSTERY",
}

export enum EnumSize {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
  XXXL = "XXXL",
  XXXXL = "XXXXL",
}

export enum EnumShirtType {
  FAN = "FAN",
  KID = "KID",
  PLAYER = "PLAYER",
  RETRO = "RETRO",
}

export enum EnumOrderStatus {
  RECEIVED = "RECEIVED",
  PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED",
  FULFILLED = "FULFILLED",
  CANCELLED = "CANCELLED",
  FULLY_REFUNDED = "FULLY_REFUNDED",
}

export enum EnumPaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

export enum EnumShipmentStatus {
  LABEL_CREATED = "LABEL_CREATED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  RETURNED = "RETURNED",
  CANCELLED = "CANCELLED",
}

export enum EnumDiscountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  EXPIRED = "EXPIRED",
  REDEEMED_OUT = "REDEEMED_OUT",
}

export enum EnumDiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  X_FREE_ON_Y_PURCHASE = "X_FREE_ON_Y_PURCHASE",
}

export enum EnumDiscountReason {
  CHINA_MISTAKE = "CHINA_MISTAKE",
  EUROPE_MISTAKE = "EUROPE_MISTAKE",
  OTHERS = "OTHERS",
  NO_MISTAKE_EQUAL_HIT = "NO_MISTAKE_EQUAL_HIT",
}

export enum EnumRiskChargeback {
  EXTREMELY_SAFE = "EXTREMELY_SAFE",
  SAFE = "SAFE",
  MEDIUM = "MEDIUM",
  UNSAFE = "UNSAFE",
  EXTREMELY_UNSAFE = "EXTREMELY_UNSAFE",
}

export enum EnumNoStockStatus {
  NONE = "NONE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export interface Product {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sku: string;
  productStatus: EnumProductStatus;
  year: string;
  yearEnd: number;
  team?: string;
  teamIdentifier?: string;
  league?: EnumLeague;
  leagueIdentifier?: string;
  productType: EnumProductType;
  shirtType?: EnumShirtType;
  name: string;
  homeAway?: EnumHomeAway;
  description?: string;
  features?: string;
  featuresMore?: string;
  featuresMore2?: string;
  ProductImage?: ProductImage[];
  ProductVariant?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  size: EnumSize;
  patch: EnumPatch;
  sellPrice: number;
  costPrice: number;
}

export interface ProductImage {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  imageUrl: string;
  cloudflareId?: string;
  position: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  countryCode: string;
}

export interface Order {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  shippingName: string;
  shippingPhone?: string;
  shippingLine1: string;
  shippingLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingEmail: string;
  orderID: string;
  orderStatus: EnumOrderStatus;
  customerId: string;
  customer?: Customer;
  discountId?: string;
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  currencyPayment: EnumCurrency;
  riskChargeback: EnumRiskChargeback;
  notes?: string;
  tag?: string;
  addressVerified?: EnumAddVerificationStatus;
  shippingFees?: number;
  orderItems?: OrderItem[];
  payments?: Payment[];
  shipments?: Shipment[];
}

export interface OrderItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  orderId: string;
  productVariantId: string;
  productVariant?: ProductVariant;
  customisationString?: string;
  customisationPrice?: number;
  noStockStatus: EnumNoStockStatus;
  quantity: number;
}

export interface Payment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  orderId: string;
  paymentMethod: string;
  paymentStatus: EnumPaymentStatus;
  transactionId: string;
  paymentGateway: string;
  amountPaid: number;
  currencyPaid: EnumCurrency;
}

export interface Shipment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  trackingNumber: string;
  orderId: string;
  provider: string;
  status: EnumShipmentStatus;
}

export interface Discount {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  code: string;
  status: EnumDiscountStatus;
  expiryDate: Date;
  usageLimit: number;
  maxDiscountAmount?: number;
  minCartValue?: number;
  minQty?: number;
  description?: string;
  discountType: EnumDiscountType;
  discountReason?: EnumDiscountReason;
  timesUsed: number;
  discountPercentage?: number;
  discountAmount?: number;
  offerFreeQty?: number;
  offerBuyQty?: number;
}
