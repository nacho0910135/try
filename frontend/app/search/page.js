"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSavedSearch, getFavorites, getProperties } from "@/lib/api";
import { serializePropertyQuery } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useSearchStore } from "@/store/search-store";
import { SearchFilters } from "@/components/forms/SearchFilters";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { MapContextInsights } from "@/components/map/MapContextInsights";
import { MapContextPanel } from "@/components/map/MapContextPanel";
import { SearchMap } from "@/components/map/SearchMap";
import { CostaRicaProvinceExplorer } from "@/components/map/CostaRicaProvinceExplorer";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ConversationalSearchPanel } from "@/components/search/ConversationalSearchPanel";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  buildContextResultsSummary,
  getPropertyContextMatches
} from "@/lib/map-context-insights";

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

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const { token } = useAuthStore();
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
  const contextRadiusKm = Number(filters.radiusKm || 8);

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

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setMessage("");
        const data = await getProperties({ ...filters, page, limit: 12 });

        setProperties((current) => (page === 1 ? data.items : [...current, ...data.items]));
        setPagination(data.pagination);
        router.replace(`/search?${serializePropertyQuery(filters)}`, { scroll: false });
      } catch (error) {
        if (page === 1) {
          setProperties([]);
          setPagination({ page: 1, totalPages: 1, total: 0 });
        }
        setMessage(error.response?.data?.message || t("searchPage.searchFailed"));
      } finally {
        setLoading(false);
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

  const updateFilters = (patch) => {
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
  };

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
      () => setMessage(t("searchPage.geoError"))
    );
  };

  const handleSaveSearch = async () => {
    if (!token) return;

    try {
      await createSavedSearch({
        filters,
        mapArea: toPolygonGeometry(filters.polygon),
        bounds: filters.bounds
      });
      setMessage(t("searchPage.saveSearchSuccess"));
    } catch (error) {
      setMessage(error.response?.data?.message || t("searchPage.saveSearchFailed"));
    }
  };

  const handleProvinceAtlasSelection = (provinceName) => {
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
  };

  const toggleContextLayer = (layerId) => {
    setActiveContextLayers((current) =>
      current.includes(layerId)
        ? current.filter((item) => item !== layerId)
        : [...current, layerId]
    );
  };

  const handleFocusContextPoint = (point) => {
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
  };

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
              <Link href={token ? "/dashboard/properties/new" : "/login"}>
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
        onSaveSearch={handleSaveSearch}
        canSave={Boolean(token)}
      />

      {message ? (
        <p className="rounded-2xl bg-mist px-4 py-3 text-sm leading-6 text-ink/70">{message}</p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-5">
        <div className="order-2 xl:order-1 xl:sticky xl:top-24 xl:h-fit xl:self-start">
          <CostaRicaProvinceExplorer
            selectedProvince={filters.province}
            onSelectProvince={handleProvinceAtlasSelection}
            compact
            navigateOnSelect={false}
            mapMinHeight={280}
          />
        </div>

        <div className="order-1 xl:order-2">
          <div className="surface-soft mb-4 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pine/70">
                  {language === "en" ? "Main view" : "Vista principal"}
                </div>
                <h2 className="mt-2 text-base font-semibold text-ink sm:text-xl">
                  {language === "en" ? "Price map" : "Mapa de precios"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-ink/60">
                  {language === "en"
                    ? "The live price map stays front and center. Tap a price bubble to open the listing."
                    : "El mapa de precios se mantiene como protagonista. Toca una nube de precio para abrir la publicacion."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="stat-chip">
                  {pagination.total} {language === "en" ? "matches" : "resultados"}
                </span>
                <span className="stat-chip">
                  {filters.province || (language === "en" ? "All Costa Rica" : "Todo Costa Rica")}
                </span>
              </div>
            </div>
          </div>
          <SearchMap
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            selectedProvince={filters.province}
            selectedDistrict={filters.district}
            activeContextLayers={activeContextLayers}
            focusedContextPoint={focusedContextPoint}
            onSelectProperty={setSelectedPropertyId}
            onSelectContextPoint={handleFocusContextPoint}
            onSelectDistrict={({ province, canton, district }) => {
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
            }}
            onBoundsChange={(bounds) => {
              setFocusedContextPoint(null);
              updateFilters({
                lat: undefined,
                lng: undefined,
                bounds,
                polygon: undefined
              });
            }}
            onPolygonChange={(polygon) => {
              setFocusedContextPoint(null);
              updateFilters({
                lat: undefined,
                lng: undefined,
                polygon,
                bounds: undefined
              });
            }}
            minHeight={760}
          />
        </div>
      </div>

      <MapContextPanel
        activeLayerIds={activeContextLayers}
        focusedPointId={focusedContextPoint?.id}
        radiusKm={filters.radiusKm}
        onToggleLayer={toggleContextLayer}
        onFocusPoint={handleFocusContextPoint}
        onClearFocus={() => {
          setFocusedContextPoint(null);
          updateFilters({
            lat: undefined,
            lng: undefined,
            bounds: undefined
          });
          setMessage("");
        }}
      />

      <ConversationalSearchPanel onApply={handleConversationalSearch} />

      <MapContextInsights
        summary={contextSummary}
        radiusKm={contextRadiusKm}
        focusedPoint={focusedContextPoint}
      />

      <div className="space-y-5">
        <div className="surface-soft flex items-center justify-between px-4 py-3">
          <p className="text-sm text-ink/55">
            {loading
              ? t("searchPage.searching")
              : t("searchPage.resultsFound", { count: pagination.total })}
          </p>
          <Link
            href={token ? "/dashboard/properties/new" : "/login"}
            className="text-sm font-semibold text-pine"
          >
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
