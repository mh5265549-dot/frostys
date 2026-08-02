import { MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';

const MENU_STORAGE_KEY = 'frostys_custom_menu_catalog_v3';
const PIN_STORAGE_KEY = 'frostys_admin_pin_v1';
const DEFAULT_PIN = '1234';

/**
 * Retrieve menu items from localStorage or fallback to default MENU_ITEMS catalog
 */
export function getStoredMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) {
      return MENU_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse custom menu items from localStorage:', err);
  }
  return MENU_ITEMS;
}

/**
 * Persist modified menu items to localStorage
 */
export function saveCustomMenuItems(items: MenuItem[]): void {
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save custom menu catalog:', err);
  }
}

/**
 * Update a single menu item (price, description, badge, etc.)
 */
export function updateSingleMenuItem(updatedItem: MenuItem): MenuItem[] {
  const current = getStoredMenuItems();
  const index = current.findIndex((item) => item.id === updatedItem.id);

  let newList: MenuItem[];
  if (index > -1) {
    newList = [...current];
    newList[index] = updatedItem;
  } else {
    newList = [updatedItem, ...current];
  }

  saveCustomMenuItems(newList);
  return newList;
}

/**
 * Reset custom menu catalog back to initial default items
 */
export function resetMenuCatalogToDefault(): MenuItem[] {
  try {
    localStorage.removeItem(MENU_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset menu catalog:', err);
  }
  return MENU_ITEMS;
}

/**
 * Get stored Admin PIN or fallback to default '1234'
 */
export function getStoredAdminPin(): string {
  try {
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

/**
 * Save new Admin PIN
 */
export function saveAdminPin(newPin: string): void {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
  } catch (err) {
    console.error('Failed to save admin PIN:', err);
  }
}
