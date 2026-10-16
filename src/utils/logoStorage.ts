import { useState, useEffect } from 'react';
import defaultLogoImg from '../assets/images/frostys_snowman_parlour_grill_logo_1791736660141.jpg';

export const DEFAULT_LOGO_URL = defaultLogoImg;
export const LOGO_STORAGE_KEY = 'frostys_custom_logo';
export const LOGO_CHANGE_EVENT = 'frostys-logo-changed';

export function getStoredLogo(): string {
  try {
    const saved = localStorage.getItem(LOGO_STORAGE_KEY);
    // If user previously stored an older generated logo path, update to new logo
    if (saved && (saved.includes('frostys_ice_cream_grill_official_logo') || saved.includes('frostys_official_emblem_logo'))) {
      localStorage.removeItem(LOGO_STORAGE_KEY);
      return DEFAULT_LOGO_URL;
    }
    if (saved && saved.trim().length > 0) {
      return saved;
    }
  } catch (e) {
    // localStorage not accessible
  }
  return DEFAULT_LOGO_URL;
}

export function saveCustomLogo(dataUrlOrPath: string): void {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, dataUrlOrPath);
  } catch (e) {
    console.error('Failed to save logo to localStorage:', e);
  }
  window.dispatchEvent(new CustomEvent(LOGO_CHANGE_EVENT, { detail: dataUrlOrPath }));
}

export function resetToDefaultLogo(): void {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset logo:', e);
  }
  window.dispatchEvent(new CustomEvent(LOGO_CHANGE_EVENT, { detail: DEFAULT_LOGO_URL }));
}

export function useBrandLogo(): {
  logoUrl: string;
  isCustom: boolean;
  setLogo: (url: string) => void;
  resetLogo: () => void;
} {
  const [logoUrl, setLogoUrl] = useState<string>(() => getStoredLogo());

  useEffect(() => {
    const handleLogoChange = (event: Event) => {
      const customEvt = event as CustomEvent<string>;
      if (customEvt.detail) {
        setLogoUrl(customEvt.detail);
      } else {
        setLogoUrl(getStoredLogo());
      }
    };

    window.addEventListener(LOGO_CHANGE_EVENT, handleLogoChange);
    window.addEventListener('storage', handleLogoChange);

    return () => {
      window.removeEventListener(LOGO_CHANGE_EVENT, handleLogoChange);
      window.removeEventListener('storage', handleLogoChange);
    };
  }, []);

  const isCustom = logoUrl !== DEFAULT_LOGO_URL;

  return {
    logoUrl,
    isCustom,
    setLogo: saveCustomLogo,
    resetLogo: resetToDefaultLogo,
  };
}
