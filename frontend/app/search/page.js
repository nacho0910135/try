"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSavedSearch, getFavorites, getProperties, updateSavedSearch } from "@/lib/api";
import { serializePropertyQuery } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useSearchStore } from "@/store/search-store";
import { SearchFilters } from "@/components/forms/SearchFilters";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { MapLoadingShell } from "@/components/map/MapLoadingShell";
import { MapContextInsights } from "@/components/map/MapContextInsights";
import { MapContextPanel } from "@/components/map/MapContextPanel";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ConversationalSearchPanel } from "@/components/search/ConversationalSearchPanel";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { SectionErrorBoundary } from "@/components/ui/SectionErrorBoundary";
import { hasCommercialDashboardAccess } from "@/lib/user-access";
import {
  buildContextResultsSummary,
  getPropertyContextMatches
} from "@/lib/map-context-insights";

const SearchMap = dynamic(
  () =>
    import("@/components/map/SearchMap").then((module) => ({
      default: module.SearchMap
    })),
  {
    ssr: false,
    loading: () => <MapLoadingShell minHeight={520} label="Cargando mapa de precios..." />
  }
);

const CostaRicaProvinceExplorer = dynamic(
  () =>
    import("@/components/map/CostaRicaProvinceExplorer").then((module) => ({
      default: module.CostaRicaProvinceExplorer
    })),
  {
    ssr: false,
    loading: () => <MapLoadingShell minHeight={280} label="Cargando provincias..." />
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

const SEARCH_AUTOSAVE_STORAGE_KEY = "alquiventascr-search-autosave-id";

const hasMeaningfulSearchState = (filters = {}) =>
  Object.entries(filters).some(([key, value]) => {
    if (key === "bounds") {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (value && typeof value === "object") {
      return Object.keys(value).length > 0;
    }

    return value !== undefined && value !== null && value !== "" && value !== false;
  });

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const requestSequenceRef = useRef(0);
  const autosaveIdRef = useRef(null);
  const autosaveSequenceRef = useRef(0);
  const { token, user } = useAuthStore();
  const { language, t } = useLanguage();
  const { filters, replaceFilters, setFilters, selectedPropertyId, setSelectedPropertyId } =
    useSearchStore();
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [activeContextLayers, setActiveContextLayers] = useState([]);
  const [focusedContextPoint, setFocusedContextPoint] = useState(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [autosaveStatus, setAutosaveStatus] = useState("idle");
  const contextRadiusKm = Number(filters.radiusKm || 8);
  const canAccessDashboard = hasCommercialDashboardAccess(user);
  const publishHref = canAccessDashboard ? "/dashboard/properties/new" : token ? "/favorites" : "/login";
  const hasAutosaivableSearch = useMemo(() => hasMeaningfulSearchState(filters), [filters]);
  const autosavePayload = useMemo(
    () => ({
      name: language === "en" ? "Current search" : "Busqueda actual",
      filters,
      mapArea: toPolygonGeometry(filters.polygon),
      bounds: filters.bounds,
      alertsEnabled: false
    }),
    [filters, language]
  );
  const autoFitKey = useMemo(
    () =>
      JSON.stringify({
        q: filters.q,
        businessType: filters.businessType,
        propertyType: filters.propertyType,
        province: filters.province,
        canton: filters.canton,
        district: filters.district,
        lat: filters.lat,
        lng: filters.lng,
        radiusKm: filters.radiusKm,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        currency: filters.currency,
        marketStatus: filters.marketStatus,
        sort: filters.sort,
        bedrooms: filters.bedrooms,
        bathrooms: filters.bathrooms,
        parkingSpaces: filters.parkingSpaces,
        minConstructionArea: filters.minConstructionArea,
        maxConstructionArea: filters.maxConstructionArea,
        minLotArea: filters.minLotArea,
        maxLotArea: filters.maxLotArea,
        rentalArrangement: filters.rentalArrangement,
        furnished: filters.furnished,
        petsAllowed: filters.petsAllowed,
        depositRequired: filters.depositRequired,
        featured: filters.featured,
        recent: filters.recent,
        privateRoom: filters.privateRoom,
        privateBathroom: filters.privateBathroom,
        utilitiesIncluded: filters.utilitiesIncluded,
        studentFriendly: filters.studentFriendly,
        polygonPoints: filters.polygon?.length || 0,
        activeContextLayers,
        focusedContextPoint: focusedContextPoint?.id || null
      }),
    [activeContextLayers, filters, focusedContextPoint]
  );

  const contextualProperties = useMemo(
    () =>
      properties.map((property) => ({
        ...property,
        contextMatches: getPropertyContextMatches(property, activeContextLayers, contextRadiusKm)
      })),
    [properties, activeContextLayers, contextRadiusKm]
  );

  const contextSummary = useMemo(
    () => buildContextResultsSummary(properties, activeContextLayers, contextRadiusKm),
    [properties, activeContextLayers, contextRadiusKm]
  );

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

    const requestId = ++requestSequenceRef.current;
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setMessage("");
        const data = await getProperties({ ...filters, page, limit: 12 });

        if (requestId !== requestSequenceRef.current) {
          return;
        }

        setProperties((current) => (page === 1 ? data.items : [...current, ...data.items]));
        setPagination(data.pagination);
        router.replace(`/search?${serializePropertyQuery(filters)}`, { scroll: false });
      } catch (error) {
        if (requestId !== requestSequenceRef.current) {
          return;
        }

        if (page === 1) {
          setProperties([]);
          setPagination({ page: 1, totalPages: 1, total: 0 });
        }
        setMessage(error.response?.data?.message || t("searchPage.searchFailed"));
      } finally {
        if (requestId === requestSequenceRef.current) {
          setLoading(false);
        }
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters, page, retryNonce, router, t]);

  useEffect(() => {
    if (!token) {
      setFavoriteIds([]);
      return;
    }

    const loadFavorites = async () => {
      try {
        const data = await getFavorites();
        setFavoriteIds(data.items.map((item) => item.property?._id).filter(Boolean));
      } catch (_error) {
        setFavoriteIds([]);
      }
    };

    loadFavorites();
  }, [token]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!token) {
      autosaveIdRef.current = null;
      setAutosaveStatus("idle");
      return;
    }

    autosaveIdRef.current = window.localStorage.getItem(SEARCH_AUTOSAVE_STORAGE_KEY) || null;
  }, [token]);

  useEffect(() => {
    if (!token || !initializedRef.current || !hasAutosaivableSearch) {
      if (!hasAutosaivableSearch) {
        setAutosaveStatus("idle");
      }
      return;
    }

    const requestId = ++autosaveSequenceRef.current;
    setAutosaveStatus("saving");

    const timeout = setTimeout(async () => {
      const persistNewAutosave = async () => {
        const created = await createSavedSearch(autosavePayload);
        const nextId = created?.item?._id;

        if (typeof window !== "undefined" && nextId) {
          window.localStorage.setItem(SEARCH_AUTOSAVE_STORAGE_KEY, nextId);
        }

        autosaveIdRef.current = nextId || null;
      };

      try {
        if (autosaveIdRef.current) {
          await updateSavedSearch(autosaveIdRef.current, autosavePayload);
        } else {
          await persistNewAutosave();
        }

        if (requestId === autosaveSequenceRef.current) {
          setAutosaveStatus("saved");
        }
      } catch (error) {
        if (error.response?.status === 404 && requestId === autosaveSequenceRef.current) {
          try {
            await persistNewAutosave();
            if (requestId === autosaveSequenceRef.current) {
              setAutosaveStatus("saved");
            }
            return;
          } catch (_retryError) {
            // Fall through to the shared error state below.
          }
        }

        if (requestId === autosaveSequenceRef.current) {
          setAutosaveStatus("error");
        }
      }
    }, 700);

    return () => clearTimeout(timeout);
  }, [autosavePayload, hasAutosaivableSearch, token]);

  const updateFilters = useCallback(
    (patch) => {
      setPage(1);
      if (
        "province" in patch ||
        "canton" in patch ||
        "district" in patch ||
        "lat" in patch ||
        "lng" in patch ||
        "bounds" in patch ||
        "polygon" in patch
      ) {
        setFocusedContextPoint(null);
        setSelectedPropertyId(null);
      }
      setFilters(patch);
    },
    [setFilters, setSelectedPropertyId]
  );

  const handleReset = () => {
    setPage(1);
    setFocusedContextPoint(null);
    setActiveContextLayers([]);
    replaceFilters({});
    setMessage("");
  };

  const handleConversationalSearch = (result) => {
    const hasFilters = Object.keys(result.filters || {}).length > 0;
    const hasContextLayers = Boolean(result.contextLayerIds?.length);

    if (!hasFilters && !result.focusedPoint && !hasContextLayers) {
      handleReset();
      return;
    }

    setSelectedPropertyId(null);
    setPage(1);
    setFocusedContextPoint(result.focusedPoint || null);
    setActiveContextLayers(hasContextLayers ? result.contextLayerIds : []);

    replaceFilters({
      ...result.filters
    });
    setMessage(result.message || "");
  };

  const handleUseCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setMessage(t("searchPage.geoError"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFocusedContextPoint(null);
        updateFilters({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          radiusKm: filters.radiusKm || 15,
          bounds: undefined,
          polygon: undefined
        });
      },
      () => setMessage(t("searchPage.geoError")),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000
      }
    );
  };

  const handleProvinceAtlasSelection = useCallback(
    (provinceName) => {
      setSelectedPropertyId(null);
      setPage(1);
      setFocusedContextPoint(null);
      setFilters({
        province: provinceName,
        canton: undefined,
        district: undefined,
        lat: undefined,
        lng: undefined,
        bounds: undefined,
        polygon: undefined
      });
      setMessage("");
    },
    [setFilters, setSelectedPropertyId]
  );

  const toggleContextLayer = useCallback((layerId) => {
    setActiveContextLayers((current) =>
      current.includes(layerId)
        ? current.filter((item) => item !== layerId)
        : [...current, layerId]
    );
  }, []);

  const handleFocusContextPoint = useCallback(
    (point) => {
      setFocusedContextPoint(point);
      setSelectedPropertyId(null);
      setPage(1);
      setFilters({
        province: point.province,
        canton: point.canton,
        district: point.district,
        lat: point.lat,
        lng: point.lng,
        radiusKm: filters.radiusKm || 8,
        bounds: undefined,
        polygon: undefined
      });
      setMessage(
        language === "en"
          ? `Showing listings near ${point.name}.`
          : `Mostrando propiedades cerca de ${point.name}.`
      );
    },
    [filters.radiusKm, language, setFilters, setSelectedPropertyId]
  );

  const handleMapDistrictSelection = useCallback(
    ({ province, canton, district }) => {
      setFocusedContextPoint(null);
      updateFilters({
        province,
        canton,
        district,
        lat: undefined,
        lng: undefined,
        bounds: undefined,
        polygon: undefined
      });
    },
    [updateFilters]
  );

  const handleMapBoundsChange = useCallback(
    (bounds) => {
      setFocusedContextPoint(null);
      updateFilters({
        lat: undefined,
        lng: undefined,
        bounds,
        polygon: undefined
      });
    },
    [updateFilters]
  );

  const handleMapPolygonChange = useCallback(
    (polygon) => {
      setFocusedContextPoint(null);
      updateFilters({
        lat: undefined,
        lng: undefined,
        polygon,
        bounds: undefined
      });
    },
    [updateFilters]
  );

  const handleClearContextFocus = useCallback(() => {
    setFocusedContextPoint(null);
    updateFilters({
      lat: undefined,
      lng: undefined,
      bounds: undefined
    });
    setMessage("");
  }, [updateFilters]);

  return (
    <div className="app-shell section-pad space-y-6 sm:space-y-7">
      <div>
        <span className="eyebrow">{t("searchPage.eyebrow")}</span>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="hidden flex-wrap gap-2 sm:flex">
              <span className="stat-chip">
                {language === "en" ? "Map-led exploration" : "Exploracion guiada por mapa"}
              </span>
              <span className="stat-chip">
                {language === "en" ? "Live price field" : "Campo de precios en vivo"}
              </span>
            </div>
            <h1 className="font-serif text-[2.4rem] font-semibold leading-[1.02] sm:text-[3.35rem] lg:text-[4rem]">
              {t("searchPage.title")}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-ink/65 sm:text-[15px] sm:leading-7">
              {t("searchPage.description")}
            </p>
          </div>
          <div className="surface-soft w-full border border-pine/15 bg-pine/10 p-4 lg:min-w-[280px] lg:max-w-[360px]">
            <p className="text-sm font-semibold text-pine">
              {token
                ? t("searchPage.publishPromptLoggedIn")
                : t("searchPage.publishPromptLoggedOut")}
            </p>
            <div className="mt-3">
              <Link href={publishHref}>
                <Button variant="success" className="w-full shadow-soft">
                  {token
                    ? t("searchPage.publishButtonLoggedIn")
                    : t("searchPage.publishButtonLoggedOut")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SearchFilters
        values={filters}
        onChange={updateFilters}
        onReset={handleReset}
        onUseCurrentLocation={handleUseCurrentLocation}
        canAutoSave={Boolean(token)}
        autosaveStatus={autosaveStatus}
      />

      {message ? (
        <p className="rounded-2xl bg-mist px-4 py-3 text-sm leading-6 text-ink/70">{message}</p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-5">
        <div className="order-2 xl:order-1 xl:sticky xl:top-24 xl:h-fit xl:self-start">
          <SectionErrorBoundary
            source="search-province-explorer"
            resetKeys={[filters.province, language]}
            title={language === "en" ? "Province map unavailable" : "Mapa de provincias no disponible"}
            description={
              language === "en"
                ? "The quick province explorer failed, but you can still use the filters and listings."
                : "El explorador rapido de provincias fallo, pero aun puedes usar filtros y publicaciones."
            }
          >
            <CostaRicaProvinceExplorer
              selectedProvince={filters.province}
              onSelectProvince={handleProvinceAtlasSelection}
              compact
              navigateOnSelect={false}
              mapMinHeight={280}
            />
          </SectionErrorBoundary>
        </div>

        <div className="order-1 xl:order-2">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-ink/10 bg-white/88 px-3 py-1.5 text-[11px] font-semibold text-ink/68 shadow-soft">
              {pagination.total} {language === "en" ? "results" : "resultados"}
            </span>
            <span className="rounded-full border border-ink/10 bg-white/88 px-3 py-1.5 text-[11px] font-semibold text-ink/68 shadow-soft">
              {filters.province || (language === "en" ? "All Costa Rica" : "Todo Costa Rica")}
            </span>
          </div>
          <SectionErrorBoundary
            source="search-price-map"
            resetKeys={[
              filters.province,
              filters.canton,
              filters.district,
              selectedPropertyId,
              activeContextLayers.join("|"),
              focusedContextPoint?.id || ""
            ]}
            title={language === "en" ? "Price map unavailable" : "Mapa de precios no disponible"}
            description={
              language === "en"
                ? "The interactive map failed, but the rest of the search experience is still available below."
                : "El mapa interactivo fallo, pero el resto de la busqueda sigue disponible mas abajo."
            }
          >
            <SearchMap
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              selectedProvince={filters.province}
              selectedDistrict={filters.district}
              activeContextLayers={activeContextLayers}
              focusedContextPoint={focusedContextPoint}
              onSelectProperty={setSelectedPropertyId}
              onSelectContextPoint={handleFocusContextPoint}
              onSelectDistrict={handleMapDistrictSelection}
              onBoundsChange={handleMapBoundsChange}
              onPolygonChange={handleMapPolygonChange}
              autoFitKey={autoFitKey}
              minHeight={760}
            />
          </SectionErrorBoundary>
        </div>
      </div>

      <SectionErrorBoundary
        source="search-context-panel"
        resetKeys={[activeContextLayers.join("|"), focusedContextPoint?.id || "", filters.radiusKm || ""]}
        title={language === "en" ? "Context panel unavailable" : "Panel de contexto no disponible"}
        description={
          language === "en"
            ? "The context tools failed, but you can still browse properties."
            : "Las herramientas de contexto fallaron, pero aun puedes explorar propiedades."
        }
      >
        <MapContextPanel
          activeLayerIds={activeContextLayers}
          focusedPointId={focusedContextPoint?.id}
          radiusKm={filters.radiusKm}
          onToggleLayer={toggleContextLayer}
          onFocusPoint={handleFocusContextPoint}
          onClearFocus={handleClearContextFocus}
        />
      </SectionErrorBoundary>

      <ConversationalSearchPanel onApply={handleConversationalSearch} />

      <SectionErrorBoundary
        source="search-context-insights"
        resetKeys={[activeContextLayers.join("|"), focusedContextPoint?.id || "", contextRadiusKm]}
        title={language === "en" ? "Zone insights unavailable" : "Insights de zona no disponibles"}
        description={
          language === "en"
            ? "The insight summary failed, but search results are still available."
            : "El resumen de zona fallo, pero los resultados siguen disponibles."
        }
      >
        <MapContextInsights
          summary={contextSummary}
          radiusKm={contextRadiusKm}
          focusedPoint={focusedContextPoint}
        />
      </SectionErrorBoundary>

      <div className="space-y-5">
        <div className="surface-soft flex items-center justify-between px-4 py-3">
          <p className="text-sm text-ink/55">
            {loading
              ? t("searchPage.searching")
              : t("searchPage.resultsFound", { count: pagination.total })}
          </p>
          <Link href={publishHref} className="text-sm font-semibold text-pine">
            {token
              ? t("searchPage.publishLinkLoggedIn")
              : t("searchPage.publishLinkLoggedOut")}
          </Link>
        </div>

        {loading && page === 1 ? (
          <LoadingState label={t("searchPage.loadingProperties")} />
        ) : message && !contextualProperties.length ? (
          <EmptyState
            title={language === "en" ? "We could not load listings" : "No pudimos cargar las publicaciones"}
            description={
              language === "en"
                ? "Check that the backend is available on your local network and try again."
                : "Verifica que el backend este disponible en tu red local y vuelve a intentarlo."
            }
            actionLabel={language === "en" ? "Retry" : "Reintentar"}
            onAction={() => {
              setMessage("");
              setRetryNonce((current) => current + 1);
            }}
          />
        ) : contextualProperties.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {contextualProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                selected={selectedPropertyId === property._id}
                isFavorite={favoriteIds.includes(property._id)}
                contextMatches={property.contextMatches}
                compact
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
          </div>
        ) : (
          <EmptyState
            title={t("searchPage.noResultsTitle")}
            description={t("searchPage.noResultsDescription")}
            actionLabel={t("searchPage.clearFilters")}
            onAction={handleReset}
          />
        )}

        {!loading && properties.length && page < pagination.totalPages ? (
          <div className="flex justify-center">
            <Button variant="secondary" onClick={() => setPage((current) => current + 1)}>
              {t("searchPage.loadMore")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="app-shell section-pad"><LoadingState label="Cargando mapa..." /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
