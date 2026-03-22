"use client";

import { useEffect, useState } from "react";
import { getFavorites } from "@/lib/api";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PropertyCard } from "@/components/property/PropertyCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuthStore } from "@/store/auth-store";

export default function FavoritesPage() {
  const { token } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const loadFavorites = async () => {
      try {
        const data = await getFavorites();
        setItems(data.items || []);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [token]);

  return (
    <ProtectedRoute>
      <div className="app-shell section-pad space-y-6">
        <div>
          <span className="eyebrow">Favoritos</span>
          <h1 className="mt-4 font-serif text-5xl font-semibold">Tus propiedades guardadas</h1>
        </div>

        {loading ? (
          <LoadingState label="Cargando favoritos..." />
        ) : items.length ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <PropertyCard key={item._id} property={item.property} isFavorite />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavia no has guardado propiedades"
            description="Explora el mapa, abre detalles y usa el corazon para armar tu shortlist."
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
