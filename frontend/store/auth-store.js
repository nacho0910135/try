"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
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
      name: "casa-cr-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
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

