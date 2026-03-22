"use client";

import { create } from "zustand";

export const useSearchStore = create((set) => ({
  filters: {},
  selectedPropertyId: null,
  setFilters: (patch) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...patch
      }
    })),
  replaceFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: {}, selectedPropertyId: null }),
  setSelectedPropertyId: (selectedPropertyId) => set({ selectedPropertyId })
}));
