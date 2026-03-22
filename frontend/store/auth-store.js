"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const legacyAuthKey = "casa-cr-auth";

const readValidPersistedAuth = (...keys) => {
  if (typeof window === "undefined") return null;

  for (const key of keys) {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      continue;
    }

    try {
      JSON.parse(storedValue);
      return storedValue;
    } catch (_error) {
      window.localStorage.removeItem(key);
    }
  }

  return null;
};

const authStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    return readValidPersistedAuth(name, legacyAuthKey);
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
    window.localStorage.removeItem(legacyAuthKey);
  }
};

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setAuth: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      markHydrated: () => set({ hydrated: true })
    }),
    {
      name: "alquiventascr-auth",
      storage: createJSONStorage(() => authStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      }
    }
  )
);
