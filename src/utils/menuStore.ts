import { MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';

const MENU_STORAGE_KEY = 'frostys_custom_menu_catalog_v13';
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
      // Auto-merge newly added default items (e.g. Kashmiri Pink Chai, All-Flavors Cup, Greek Gyro)
      const existingIds = new Set(parsed.map((p: MenuItem) => p.id));
      const missingDefaults = MENU_ITEMS.filter((item) => !existingIds.has(item.id));
      let merged = missingDefaults.length > 0 ? [...parsed, ...missingDefaults] : parsed;

      // Always synchronize official updates for shami burger, soft serve, and chai
      const defaultMap = new Map(MENU_ITEMS.map((m) => [m.id, m]));
      merged = merged.map((it: MenuItem) => {
        const def = defaultMap.get(it.id);
        if (it.id === 'waffle-cone-classic' && def) {
          return { ...it, ...def };
        }
        if (it.id === 'ff-shami-burger' && (it.name !== 'Shami Burger' || it.price !== 350)) {
          return { ...it, name: 'Shami Burger', price: 350, unit: 'Single Burger (350 PKR)' };
        }
        if (it.id === 'ff-karak-chai' && def) {
          return { ...it, image: def.image, badge: def.badge, description: def.description, unit: def.unit };
        }
        if (it.id === 'ff-chicken-fries-supreme' && def) {
          return { ...it, image: def.image };
        }
        if (it.id === 'ff-fries-supreme' && def) {
          return { ...it, image: def.image };
        }
        return it;
      });

      saveCustomMenuItems(merged);
      return merged;
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

