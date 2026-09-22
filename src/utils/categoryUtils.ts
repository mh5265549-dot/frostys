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
 * Categories that legitimately offer free flavor syrups and standard/premium toppings customization.
 * Specifically Ice Cream Scoops & Cones, and Specialty Sundaes / Banana Splits.
 */
export const SYRUP_TOPPING_ALLOWED_CATEGORIES = new Set<string>([
  'scoops',
  'sundaes',
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

/**
 * Returns true if an item should display the flavor syrups and dessert toppings sections.
 * Explicitly excludes:
 * - Kulfi (traditional stick kulfi)
 * - Shakes & Milkshakes (Oreo shake, fruit milkshakes, etc.)
 * - Golden Chicken Burger, Ground Chicken Burger, all burgers & grill items
 * - Savory grill, barbecue, fries, tacos, sandwiches, chai, coffees, sodas, and deals.
 */
export function allowsSyrupAndToppings(item: MenuItem | null | undefined): boolean {
  if (!item) return false;

  const cat = (item.category || '').trim().toLowerCase();
  const name = (item.name || '').toLowerCase();
  const id = (item.id || '').toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase());

  // 1. Explicitly check for Kulfi (stick or dessert)
  if (cat === 'kulfi' || id.includes('kulfi') || name.includes('kulfi') || tags.includes('kulfi')) {
    return false;
  }

  // 2. Explicitly check for Shakes & Milkshakes & Beverages
  if (
    cat === 'shakes' ||
    cat === 'coffees' ||
    cat === 'sodas' ||
    id.includes('shake') ||
    name.includes('shake') ||
    name.includes('milkshake') ||
    tags.some((t) => t.includes('shake') || t.includes('milkshake'))
  ) {
    return false;
  }

  // 3. Explicitly check for Golden Chicken Burger, Ground Chicken Burger, all burgers & grill items
  if (
    cat === 'fast-food-bbq' ||
    cat === 'burger' ||
    cat === 'tacos' ||
    cat === 'chai' ||
    cat === 'sandwich' ||
    cat === 'wrap' ||
    cat === 'fries' ||
    cat === 'combo' ||
    name.includes('burger') ||
    name.includes('golden chicken') ||
    name.includes('ground chicken') ||
    name.includes('grilled chicken') ||
    name.includes('shami') ||
    name.includes('smash') ||
    name.includes('taco') ||
    name.includes('sandwich') ||
    name.includes('wrap') ||
    name.includes('fries') ||
    name.includes('chai') ||
    tags.some((t) => /burger|grill|bbq|taco|sandwich|wrap|fries/i.test(t))
  ) {
    return false;
  }

  // 4. Deals (deal-crispy-burger-meal, deal-twin-burger-duo, etc.)
  if (cat === 'deals') {
    return false;
  }

  // 5. Positive check: Must belong to valid ice cream scoop or sundae category
  return SYRUP_TOPPING_ALLOWED_CATEGORIES.has(cat);
}
