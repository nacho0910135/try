"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

const legacyAuthKey = "casa-cr-auth";

const authStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(name) || window.localStorage.getItem(legacyAuthKey);
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
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? authStorage : noopStorage
      ),
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
