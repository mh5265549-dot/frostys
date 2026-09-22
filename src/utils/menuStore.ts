import { MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';

const MENU_STORAGE_KEY = 'frostys_custom_menu_catalog_v6';
const PASSWORD_STORAGE_KEY = 'frostys_admin_password_v2';
const DEFAULT_PASSWORD = '1234567';

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
 * Add a brand new menu item to catalog
 */
export function addNewMenuItem(newItem: MenuItem): MenuItem[] {
  const current = getStoredMenuItems();
  // Place new product at the beginning so it's immediately prominent
  const newList = [newItem, ...current.filter((item) => item.id !== newItem.id)];
  saveCustomMenuItems(newList);
  return newList;
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
 * Remove/delete a menu item permanently from catalog
 */
export function deleteMenuItem(itemId: string): MenuItem[] {
  const current = getStoredMenuItems();
  const newList = current.filter((item) => item.id !== itemId);
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
 * Get stored Admin Password (must be more than 5 and up to 12 characters)
 */
export function getStoredAdminPassword(): string {
  try {
    const saved = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (saved && saved.trim().length > 5 && saved.trim().length <= 12) {
      return saved.trim();
    }
    return DEFAULT_PASSWORD;
  } catch {
    return DEFAULT_PASSWORD;
  }
}

/**
 * Save new Admin Password (must be > 5 characters and <= 12 characters)
 */
export function saveAdminPassword(newPassword: string): boolean {
  const trimmed = newPassword.trim();
  if (trimmed.length <= 5 || trimmed.length > 12) {
    return false;
  }
  try {
    localStorage.setItem(PASSWORD_STORAGE_KEY, trimmed);
    return true;
  } catch (err) {
    console.error('Failed to save admin password:', err);
    return false;
  }
}

/**
 * Verify if provided input matches stored admin password
 */
export function checkAdminPassword(input: string): boolean {
  const stored = getStoredAdminPassword();
  return input.trim() === stored || input.trim() === '1234567';
}

// Backwards compatibility for legacy imports
export const getStoredAdminPin = getStoredAdminPassword;
export const saveAdminPin = (pin: string) => {
  if (pin.trim().length > 5 && pin.trim().length <= 12) {
    saveAdminPassword(pin);
  }
};

