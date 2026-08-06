import { MenuItem } from '../types';

/**
 * Valid dessert/ice cream scoop categories that support Cone vs Cup serving options.
 */
export const CONE_CUP_VALID_CATEGORIES = new Set<string>([
  'scoops',
  'soft-serve',
  'ice-cream',
  'ice_cream_scoops',
]);

/**
 * Explicit non-dessert or non-scoop keywords (burgers, tacos, drinks, etc.)
 * to prevent false positives.
 */
export const EXCLUDED_NON_SCOOP_KEYWORDS = [
  'burger',
  'taco',
  'barbecue',
  'bbq',
  'savory',
  'fastfood',
  'sandwich',
  'fry',
  'fries',
  'pizza',
  'pasta',
  'shake',
  'milkshake',
  'coffee',
  'latte',
  'frappe',
  'soda',
  'chiller',
  'kulfi',
  'drink',
  'beverage',
  'deal',
  'combo',
];

/**
 * Returns true IF AND ONLY IF the product is a valid dessert/ice cream scoop item
 * that can be served in a Cone or a Cup.
 * Excludes savory items (burgers, tacos, barbecue) and non-scoop items (beverages, drinks, shakes).
 */
export function isConeCupApplicable(item: MenuItem | null | undefined): boolean {
  if (!item) return false;

  // 1. If explicit item-level property `isConeCupAllowed` is specified, respect it
  if (typeof item.isConeCupAllowed === 'boolean') {
    return item.isConeCupAllowed;
  }

  // 2. Category check: must belong to valid ice cream scoop categories
  const cat = (item.category || '').trim().toLowerCase();
  if (!CONE_CUP_VALID_CATEGORIES.has(cat)) {
    return false;
  }

  // 3. Name & tag sanity check to filter out non-scoop items
  const nameLower = (item.name || '').toLowerCase();
  for (const keyword of EXCLUDED_NON_SCOOP_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates and sanitizes customization container selections when adding to cart or checking out.
 * Ensures that non-applicable items (savory food, drinks, etc.) NEVER have Cone/Cup assigned,
 * and valid scoop items default to 'Cone' if container choice was not explicitly provided.
 */
export function validateItemCustomizationContainer(
  item: MenuItem | null | undefined,
  selectedContainer?: 'Cone' | 'Cup'
): 'Cone' | 'Cup' | undefined {
  if (!item || !isConeCupApplicable(item)) {
    return undefined; // Non-applicable items must not carry Cone/Cup serving options
  }
  return selectedContainer || 'Cone';
}
