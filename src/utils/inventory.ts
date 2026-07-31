import { MENU_ITEMS } from '../data/menuData';

const INVENTORY_STORAGE_KEY = 'frostys_inventory_stock_v1';

// Default initial stock quantities per item
export const DEFAULT_ITEM_STOCK: { [itemId: string]: number } = {
  'sundae-oreo': 12,
  'sundae-lotus': 8,
  'sundae-fudge': 10,
  'sundae-strawberry': 6,
  'shake-nutella': 15,
  'shake-ferrero': 10,
  'shake-brownie': 4, // low stock default to demonstrate badge!
  'shake-lotus': 12,
  'waffle-nutella': 8,
  'waffle-pancakes': 10,
  'waffle-lotus': 5, // low stock default
  'scoop-belgian': 25,
  'scoop-vanilla': 30,
  'scoop-pistachio': 14,
  'brownie-fudge-lava': 3, // low stock default!
  'brownie-smores-skillet': 6,
  'combo-sweet-tooth-night': 5,
  'combo-party-waffle-box': 4,
};

// Fallback default stock for any item not specified above
const FALLBACK_DEFAULT_STOCK = 15;

/**
 * Get current stock mapping from localStorage, initializing if empty.
 */
export function getStoredInventory(): { [itemId: string]: number } {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) {
      saveInventory(DEFAULT_ITEM_STOCK);
      return { ...DEFAULT_ITEM_STOCK };
    }
    const parsed = JSON.parse(raw);
    // Ensure all items in MENU_ITEMS have a stock value
    const merged = { ...parsed };
    MENU_ITEMS.forEach((item) => {
      if (merged[item.id] === undefined) {
        merged[item.id] = DEFAULT_ITEM_STOCK[item.id] ?? FALLBACK_DEFAULT_STOCK;
      }
    });
    return merged;
  } catch (err) {
    console.error('Failed to read inventory from localStorage:', err);
    return { ...DEFAULT_ITEM_STOCK };
  }
}

/**
 * Save current inventory mapping to localStorage
 */
export function saveInventory(stockMap: { [itemId: string]: number }): void {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(stockMap));
  } catch (err) {
    console.error('Failed to save inventory to localStorage:', err);
  }
}

/**
 * Update stock level for a specific item
 */
export function updateItemStockInStore(itemId: string, newStock: number): { [itemId: string]: number } {
  const current = getStoredInventory();
  current[itemId] = Math.max(0, newStock);
  saveInventory(current);
  return current;
}

/**
 * Automatically deduct ordered quantities after customer submits WhatsApp order
 */
export function deductStockFromOrder(
  orderItems: { id: string; quantity: number }[]
): { [itemId: string]: number } {
  const current = getStoredInventory();
  orderItems.forEach((item) => {
    const currentQty = current[item.id] ?? FALLBACK_DEFAULT_STOCK;
    current[item.id] = Math.max(0, currentQty - item.quantity);
  });
  saveInventory(current);
  return current;
}

/**
 * Count how many items have low stock (<= 5)
 */
export function countLowStockItems(stockMap: { [itemId: string]: number }): number {
  return Object.values(stockMap).filter((qty) => qty > 0 && qty <= 5).length;
}

/**
 * Reset all inventory back to default initial stock
 */
export function resetAllInventoryToDefault(): { [itemId: string]: number } {
  saveInventory(DEFAULT_ITEM_STOCK);
  return { ...DEFAULT_ITEM_STOCK };
}
