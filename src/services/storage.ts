import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * Storage backend for persisted state. Kept behind this interface so it can be
 * swapped (e.g. for IndexedDB or a sync service) without touching stores.
 */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* storage full or blocked: progress just won't persist */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const appStorage = createJSONStorage(() => safeLocalStorage);
