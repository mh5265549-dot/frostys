export interface DeliveryZoneConfig {
  id: string;
  name: string;
  fee: number;
  minOrder: number;
  freeDeliveryThreshold?: number;
  isActive: boolean;
  estimatedMins: string;
  note?: string;
}

export interface StoreOperationalSettings {
  isStoreManuallyClosed: boolean;
  closedReason: string;
  overrideSchedule: boolean; // if true, manual switch overrides automated hours
  freeDeliveryGlobalThreshold: number; // e.g. 1500 PKR
  roleView: 'admin' | 'staff';
}

export interface AddonPricingConfig {
  extraScoopPrice: number;
  dipCoatingPrice: number;
  waffleConeUpgradePrice: number;
  extraToppingPrice: number;
}

const STORE_SETTINGS_KEY = 'frostys_store_operational_settings_v1';
const DELIVERY_ZONES_KEY = 'frostys_delivery_zones_v1';
const DELIVERY_RESTRICTIONS_KEY = 'frostys_item_delivery_restrictions_v1';
const OUT_STOCK_FLAVORS_KEY = 'frostys_out_stock_flavors_v1';
const OUT_STOCK_TOPPINGS_KEY = 'frostys_out_stock_toppings_v1';
const ADDON_PRICING_KEY = 'frostys_addon_pricing_v1';

export const DEFAULT_DELIVERY_ZONES: DeliveryZoneConfig[] = [
  {
    id: 'greencity',
    name: 'Green City (Main & Commercial)',
    fee: 0,
    minOrder: 0,
    freeDeliveryThreshold: 0,
    isActive: true,
    estimatedMins: '20-30 mins',
    note: 'Free Delivery for all neighborhood residents',
  },
  {
    id: 'paragon',
    name: 'Paragon City (Imperial, Barki Road)',
    fee: 100,
    minOrder: 0,
    freeDeliveryThreshold: 1500,
    isActive: true,
    estimatedMins: '30-40 mins',
    note: 'Rs. 100 delivery fee (Free for orders above Rs. 1,500)',
  },
  {
    id: 'barkat',
    name: 'Barkat Market / Commercial Corridor',
    fee: 150,
    minOrder: 500,
    freeDeliveryThreshold: 2000,
    isActive: true,
    estimatedMins: '35-45 mins',
    note: 'Rs. 150 delivery fee (Min. order Rs. 500)',
  },
];

export const DEFAULT_ADDON_PRICING: AddonPricingConfig = {
  extraScoopPrice: 100,
  dipCoatingPrice: 50,
  waffleConeUpgradePrice: 30,
  extraToppingPrice: 50,
};

// Items that by default melt during transport and must be Dine-In / Takeaway only
export const DEFAULT_MELTING_RESTRICTED_ITEMS = [
  'waffle-cone-classic',
  'ice-cream-cone-vanilla',
  'ice-cream-cone-chocolate',
  'soft-serve-swirl',
  'kulfi-traditional',
];

/**
 * Get Store Operational Status (Open / Closed)
 */
export function getStoreOperationalSettings(): StoreOperationalSettings {
  try {
    const raw = localStorage.getItem(STORE_SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse store operational settings', e);
  }
  return {
    isStoreManuallyClosed: false,
    closedReason: 'Kitchen currently preparing for late-night rush. We will be back online shortly!',
    overrideSchedule: true,
    freeDeliveryGlobalThreshold: 1500,
    roleView: 'admin',
  };
}

export function saveStoreOperationalSettings(settings: Partial<StoreOperationalSettings>): StoreOperationalSettings {
  const current = getStoreOperationalSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save store operational settings', e);
  }
  return updated;
}

/**
 * Check if customer ordering is currently accepted
 */
export function isStoreAcceptingOrders(): { isAccepting: boolean; message?: string } {
  const settings = getStoreOperationalSettings();
  if (settings.isStoreManuallyClosed) {
    return {
      isAccepting: false,
      message: settings.closedReason || 'Store is currently paused by kitchen management.',
    };
  }
  return { isAccepting: true };
}

/**
 * Delivery Zones Config
 */
export function getDeliveryZones(): DeliveryZoneConfig[] {
  try {
    const raw = localStorage.getItem(DELIVERY_ZONES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse delivery zones', e);
  }
  return DEFAULT_DELIVERY_ZONES;
}

export function saveDeliveryZones(zones: DeliveryZoneConfig[]): void {
  try {
    localStorage.setItem(DELIVERY_ZONES_KEY, JSON.stringify(zones));
  } catch (e) {
    console.error('Failed to save delivery zones', e);
  }
}

export function toggleDeliveryZone(zoneId: string, isActive: boolean): DeliveryZoneConfig[] {
  const zones = getDeliveryZones();
  const updated = zones.map((z) => (z.id === zoneId ? { ...z, isActive } : z));
  saveDeliveryZones(updated);
  return updated;
}

/**
 * Per-Item Delivery Restrictions
 * Maps itemId -> allowForDelivery (boolean)
 */
export function getItemDeliveryRestrictions(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(DELIVERY_RESTRICTIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse delivery restrictions', e);
  }

  // Build default restrictions: Cones and melting items are restricted to Dine-in / Takeaway
  const defaults: Record<string, boolean> = {};
  DEFAULT_MELTING_RESTRICTED_ITEMS.forEach((id) => {
    defaults[id] = false;
  });
  return defaults;
}

export function setItemDeliveryAllowed(itemId: string, allowed: boolean): Record<string, boolean> {
  const current = getItemDeliveryRestrictions();
  const updated = { ...current, [itemId]: allowed };
  try {
    localStorage.setItem(DELIVERY_RESTRICTIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save delivery restriction', e);
  }
  return updated;
}

export function isItemAllowedForDelivery(itemId: string, itemName: string, container?: string): boolean {
  // If customer selected "Cone" container, it melts during rider transport
  if (container?.toLowerCase() === 'cone') {
    return false;
  }
  const restrictions = getItemDeliveryRestrictions();
  if (restrictions[itemId] !== undefined) {
    return restrictions[itemId];
  }
  const lowerName = itemName.toLowerCase();
  if (lowerName.includes('cone') && !lowerName.includes('tub') && !lowerName.includes('cup')) {
    return false;
  }
  return true;
}

/**
 * Out of Stock Flavors & Toppings Management
 */
export function getOutStockFlavors(): string[] {
  try {
    const raw = localStorage.getItem(OUT_STOCK_FLAVORS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse out of stock flavors', e);
  }
  return [];
}

export function toggleFlavorStock(flavor: string, inStock: boolean): string[] {
  const current = getOutStockFlavors();
  const updated = inStock
    ? current.filter((f) => f.toLowerCase() !== flavor.toLowerCase())
    : [...current.filter((f) => f.toLowerCase() !== flavor.toLowerCase()), flavor];
  try {
    localStorage.setItem(OUT_STOCK_FLAVORS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save out of stock flavors', e);
  }
  return updated;
}

export function getOutStockToppings(): string[] {
  try {
    const raw = localStorage.getItem(OUT_STOCK_TOPPINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse out of stock toppings', e);
  }
  return [];
}

export function toggleToppingStock(toppingId: string, inStock: boolean): string[] {
  const current = getOutStockToppings();
  const updated = inStock
    ? current.filter((t) => t !== toppingId)
    : [...current.filter((t) => t !== toppingId), toppingId];
  try {
    localStorage.setItem(OUT_STOCK_TOPPINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save out of stock toppings', e);
  }
  return updated;
}

/**
 * Add-on Pricing Configuration
 */
export function getAddonPricing(): AddonPricingConfig {
  try {
    const raw = localStorage.getItem(ADDON_PRICING_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse addon pricing', e);
  }
  return DEFAULT_ADDON_PRICING;
}

export function saveAddonPricing(pricing: Partial<AddonPricingConfig>): AddonPricingConfig {
  const current = getAddonPricing();
  const updated = { ...current, ...pricing };
  try {
    localStorage.setItem(ADDON_PRICING_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save addon pricing', e);
  }
  return updated;
}
