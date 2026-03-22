"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSavedSearch, getFavorites, getProperties } from "@/lib/api";
import { serializePropertyQuery } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useSearchStore } from "@/store/search-store";
import { SearchFilters } from "@/components/forms/SearchFilters";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

const SearchMap = dynamic(
  () => import("@/components/map/SearchMap").then((module) => module.SearchMap),
  {
    ssr: false,
    loading: () => <LoadingState label="Cargando mapa..." />
  }
);

const parseFilterValue = (value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value && (value.startsWith("{") || value.startsWith("["))) {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return value;
    }
  }
  if (!Number.isNaN(Number(value)) && value !== "") {
    return Number(value);
  }
  return value;
};

const toPolygonGeometry = (polygon) => {
  if (!polygon?.length) return undefined;

  const first = polygon[0];
  const last = polygon[polygon.length - 1];
  const closed =
    first[0] === last[0] && first[1] === last[1] ? polygon : [...polygon, first];

  return {
    type: "Polygon",
    coordinates: [closed]
  };
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const { token } = useAuthStore();
  const { filters, replaceFilters, setFilters, selectedPropertyId, setSelectedPropertyId } =
    useSearchStore();
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savedSearchName, setSavedSearchName] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    if (initializedRef.current) return;

    const parsed = {};
    searchParams.forEach((value, key) => {
      parsed[key] = parseFilterValue(value);
    });

    replaceFilters(parsed);
    initializedRef.current = true;
  }, [searchParams, replaceFilters]);

  useEffect(() => {
    if (!initializedRef.current) return;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await getProperties({ ...filters, page, limit: 12 });

        setProperties((current) => (page === 1 ? data.items : [...current, ...data.items]));
        setPagination(data.pagination);
        router.replace(`/search?${serializePropertyQuery(filters)}`, { scroll: false });
      } catch (error) {
        setMessage(error.response?.data?.message || "No se pudo cargar la busqueda");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters, page, router]);

  useEffect(() => {
    if (!token) {
      setFavoriteIds([]);
      return;
    }

    const loadFavorites = async () => {
      const data = await getFavorites();
      setFavoriteIds(data.items.map((item) => item.property?._id).filter(Boolean));
    };

    loadFavorites();
  }, [token]);

  const updateFilters = (patch) => {
    setPage(1);
    setFilters(patch);
  };

  const handleReset = () => {
    setPage(1);
    replaceFilters({});
    setMessage("");
  };

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFilters({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          radiusKm: filters.radiusKm || 15,
          bounds: undefined,
          polygon: undefined
        });
      },
      () => setMessage("No fue posible acceder a tu ubicacion.")
    );
  };

  const handleSaveSearch = async () => {
    if (!token || !savedSearchName.trim()) return;

    try {
      await createSavedSearch({
        name: savedSearchName,
        filters,
        mapArea: toPolygonGeometry(filters.polygon),
        bounds: filters.bounds
      });
      setSavedSearchName("");
      setMessage("Busqueda guardada correctamente.");
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo guardar la busqueda");
    }
  };

  return (
    <div className="app-shell section-pad space-y-6">
      <div>
        <span className="eyebrow">Exploracion</span>
        <h1 className="mt-4 font-serif text-5xl font-semibold">Busca propiedades en Costa Rica</h1>
        <p className="mt-3 max-w-3xl text-base text-ink/65">
          Usa filtros avanzados, mapa visible, dibujo de zona y busqueda por GPS para encontrar oportunidades reales.
        </p>
      </div>

      <SearchFilters
        values={filters}
        onChange={updateFilters}
        onReset={handleReset}
        onUseCurrentLocation={handleUseCurrentLocation}
        savedSearchName={savedSearchName}
        onSavedSearchNameChange={setSavedSearchName}
        onSaveSearch={handleSaveSearch}
        canSave={Boolean(token && savedSearchName.trim())}
      />

      {message ? <p className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/70">{message}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink/55">
              {loading ? "Buscando..." : `${pagination.total} propiedades encontradas`}
            </p>
            <Link href="/dashboard/properties/new" className="text-sm font-semibold text-lagoon">
              Publicar propiedad
            </Link>
          </div>

          {loading && page === 1 ? (
            <LoadingState label="Buscando propiedades..." />
          ) : properties.length ? (
            <div className="space-y-5">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  selected={selectedPropertyId === property._id}
                  isFavorite={favoriteIds.includes(property._id)}
                  onSelected={setSelectedPropertyId}
                  onFavoriteChange={(propertyId, nextState) => {
                    setFavoriteIds((current) =>
                      nextState
                        ? [...new Set([...current, propertyId])]
                        : current.filter((item) => item !== propertyId)
                    );
                  }}
                />
              ))}
              {page < pagination.totalPages ? (
                <Button variant="secondary" onClick={() => setPage((current) => current + 1)}>
                  Cargar mas
                </Button>
              ) : null}
            </div>
          ) : (
            <EmptyState
              title="No encontramos propiedades"
              description="Prueba ajustar tus filtros, mover el mapa o usar una busqueda mas amplia."
              actionLabel="Limpiar filtros"
              onAction={handleReset}
            />
          )}
        </div>

        <div className="xl:sticky xl:top-24 xl:h-fit">
          <SearchMap
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={setSelectedPropertyId}
            onBoundsChange={(bounds) => updateFilters({ bounds, polygon: undefined })}
            onPolygonChange={(polygon) => updateFilters({ polygon, bounds: undefined })}
          />
        </div>
      </div>
    </div>
  );
}

