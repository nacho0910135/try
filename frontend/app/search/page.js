"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BellRing } from "lucide-react";
import {
  createSavedSearch,
  getFavorites,
  getProperties,
  getSavedSearches,
  updateSavedSearch
} from "@/lib/api";
import { boostMetrics, trackBoostMetricOnce } from "@/lib/boost-metrics";
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
import { Input } from "@/components/ui/Input";
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

const getSearchPropertyTypeLabel = (propertyType, language = "es") => {
  if (propertyType === "house") {
    return language === "en" ? "House" : "Casa";
  }

  if (propertyType === "lot") {
    return language === "en" ? "Lot" : "Terreno";
  }

  if (propertyType === "apartment") {
    return language === "en" ? "Apartment" : "Apartamento";
  }

  if (propertyType === "room") {
    return language === "en" ? "Room" : "Habitacion";
  }

  if (propertyType === "commercial") {
    return language === "en" ? "Commercial" : "Comercial";
  }

  if (propertyType === "condominium") {
    return language === "en" ? "Condominium" : "Condominio";
  }

  return "";
};

const getSearchBusinessTypeLabel = (businessType, language = "es") => {
  if (businessType === "rent") {
    return language === "en" ? "Rent" : "Alquiler";
  }

  if (businessType === "sale") {
    return language === "en" ? "Sale" : "Venta";
  }

  return "";
};

const getSearchBusinessTypePhrase = (businessType, language = "es") => {
  if (businessType === "rent") {
    return language === "en" ? "for rent" : "en alquiler";
  }

  if (businessType === "sale") {
    return language === "en" ? "for sale" : "en venta";
  }

  return "";
};

const buildSearchAlertName = (filters = {}, language = "es") => {
  const location = filters.district || filters.canton || filters.province || "";
  const typeLabel = getSearchPropertyTypeLabel(filters.propertyType, language);
  const businessLabel = getSearchBusinessTypeLabel(filters.businessType, language);
  const budget =
    filters.maxPrice !== undefined && filters.maxPrice !== ""
      ? language === "en"
        ? `under ${filters.maxPrice}`
        : `menos de ${filters.maxPrice}`
      : "";

  return [businessLabel, typeLabel, location, budget].filter(Boolean).join(" · ") ||
    (language === "en" ? "Current search alert" : "Alerta de busqueda actual");
};

const buildSearchAlertSummary = (filters = {}, language = "es") => {
  const parts = [];

  if (filters.businessType === "rent") {
    parts.push(language === "en" ? "rent" : "alquiler");
  } else if (filters.businessType === "sale") {
    parts.push(language === "en" ? "sale" : "venta");
  }

  if (filters.propertyType) {
    parts.push(getSearchPropertyTypeLabel(filters.propertyType, language));
  }

  if (filters.district) {
    parts.push(language === "en" ? `district ${filters.district}` : `distrito ${filters.district}`);
  } else if (filters.canton) {
    parts.push(language === "en" ? `canton ${filters.canton}` : `canton ${filters.canton}`);
  } else if (filters.province) {
    parts.push(language === "en" ? `province ${filters.province}` : `provincia ${filters.province}`);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== "") {
    parts.push(language === "en" ? `max price ${filters.maxPrice}` : `precio tope ${filters.maxPrice}`);
  }

  return parts.join(" · ");
};

const buildPriceAlertScope = (filters = {}, language = "es") => {
  const location = filters.district || filters.canton || filters.province || "";
  const typeLabel = getSearchPropertyTypeLabel(filters.propertyType, language);
  const businessLabel = getSearchBusinessTypePhrase(filters.businessType, language);
  const baseScope =
    [typeLabel, businessLabel]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    (language === "en" ? "matching listings" : "publicaciones que coincidan");

  if (!location) {
    return baseScope;
  }

  return language === "en" ? `${baseScope} in ${location}` : `${baseScope} en ${location}`;
};

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
  const [promotedProperties, setPromotedProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [activeContextLayers, setActiveContextLayers] = useState([]);
  const [focusedContextPoint, setFocusedContextPoint] = useState(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [autosaveStatus, setAutosaveStatus] = useState("idle");
  const [savedSearchMeta, setSavedSearchMeta] = useState({
    id: "",
    name: "",
    alertsEnabled: false
  });
  const [alertActionBusy, setAlertActionBusy] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState("");
  const [alertFeedbackTone, setAlertFeedbackTone] = useState("success");
  const contextRadiusKm = Number(filters.radiusKm || 8);
  const canAccessDashboard = hasCommercialDashboardAccess(user);
  const publishHref = canAccessDashboard ? "/dashboard/properties/new" : token ? "/favorites" : "/login";
  const hasAutosaivableSearch = useMemo(() => hasMeaningfulSearchState(filters), [filters]);
  const hasMaxPriceFilter = filters.maxPrice !== undefined && filters.maxPrice !== "";
  const generatedAlertName = useMemo(
    () => buildSearchAlertName(filters, language),
    [filters, language]
  );
  const alertSummary = useMemo(
    () => buildSearchAlertSummary(filters, language),
    [filters, language]
  );
  const autosavePayload = useMemo(
    () => ({
      name: savedSearchMeta.name?.trim() || generatedAlertName,
      filters,
      mapArea: toPolygonGeometry(filters.polygon),
      bounds: filters.bounds,
      alertsEnabled: Boolean(savedSearchMeta.alertsEnabled)
    }),
    [filters, generatedAlertName, savedSearchMeta.alertsEnabled, savedSearchMeta.name]
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

  const boostedResults = useMemo(
    () => contextualProperties.filter((property) => property.featured),
    [contextualProperties]
  );

  const promotedShowcase = useMemo(() => {
    const seen = new Set();

    return [...promotedProperties, ...boostedResults].filter((property) => {
      if (!property?._id || seen.has(property._id)) {
        return false;
      }

      seen.add(property._id);
      return true;
    });
  }, [boostedResults, promotedProperties]);

  const boostedResultsCount = promotedShowcase.length;

  useEffect(() => {
    promotedShowcase.forEach((property) => {
      if (!property?.featured || !property?._id) {
        return;
      }

      void trackBoostMetricOnce(
        property._id,
        boostMetrics.searchRailImpression,
        "search-rail"
      );
    });
  }, [promotedShowcase]);

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
        if (page === 1) {
          setPromotedProperties(data.promotedItems || []);
        }
        setPagination(data.pagination);
        router.replace(`/search?${serializePropertyQuery(filters)}`, { scroll: false });
      } catch (error) {
        if (requestId !== requestSequenceRef.current) {
          return;
        }

        if (page === 1) {
          setProperties([]);
          setPromotedProperties([]);
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
      setSavedSearchMeta({ id: "", name: "", alertsEnabled: false });
      return;
    }

    const storedId = window.localStorage.getItem(SEARCH_AUTOSAVE_STORAGE_KEY) || "";
    autosaveIdRef.current = storedId || null;

    if (!storedId) {
      setSavedSearchMeta({ id: "", name: "", alertsEnabled: false });
      return;
    }

    const loadSavedSearchMeta = async () => {
      try {
        const data = await getSavedSearches();
        const match = (data.items || []).find((item) => item._id === storedId);

        if (!match) {
          setSavedSearchMeta({ id: storedId, name: "", alertsEnabled: false });
          return;
        }

        setSavedSearchMeta({
          id: match._id,
          name: match.name || "",
          alertsEnabled: Boolean(match.alertsEnabled)
        });
      } catch (_error) {
        setSavedSearchMeta({ id: storedId, name: "", alertsEnabled: false });
      }
    };

    void loadSavedSearchMeta();
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
        const nextItem = created?.item;
        const nextId = nextItem?._id;

        if (typeof window !== "undefined" && nextId) {
          window.localStorage.setItem(SEARCH_AUTOSAVE_STORAGE_KEY, nextId);
        }

        autosaveIdRef.current = nextId || null;
        setSavedSearchMeta({
          id: nextId || "",
          name: nextItem?.name || autosavePayload.name,
          alertsEnabled: Boolean(nextItem?.alertsEnabled ?? autosavePayload.alertsEnabled)
        });
      };

      try {
        if (autosaveIdRef.current) {
          const updated = await updateSavedSearch(autosaveIdRef.current, autosavePayload);
          const nextItem = updated?.item;

          if (nextItem?._id) {
            setSavedSearchMeta({
              id: nextItem._id,
              name: nextItem.name || autosavePayload.name,
              alertsEnabled: Boolean(nextItem.alertsEnabled ?? autosavePayload.alertsEnabled)
            });
          }
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
    setAlertFeedback("");
  };

  const persistAlertConfiguration = async (patch = {}) => {
    if (!token || !hasAutosaivableSearch) {
      return null;
    }

    const payload = {
      ...autosavePayload,
      ...patch,
      name: patch.name?.trim() || savedSearchMeta.name?.trim() || generatedAlertName
    };

    if (savedSearchMeta.id || autosaveIdRef.current) {
      const updated = await updateSavedSearch(savedSearchMeta.id || autosaveIdRef.current, payload);
      const item = updated?.item;

      if (item?._id && typeof window !== "undefined") {
        window.localStorage.setItem(SEARCH_AUTOSAVE_STORAGE_KEY, item._id);
      }

      autosaveIdRef.current = item?._id || autosaveIdRef.current;
      setSavedSearchMeta({
        id: item?._id || savedSearchMeta.id || "",
        name: item?.name || payload.name,
        alertsEnabled: Boolean(item?.alertsEnabled ?? payload.alertsEnabled)
      });

      return item;
    }

    const created = await createSavedSearch(payload);
    const item = created?.item;

    if (item?._id && typeof window !== "undefined") {
      window.localStorage.setItem(SEARCH_AUTOSAVE_STORAGE_KEY, item._id);
    }

    autosaveIdRef.current = item?._id || null;
    setSavedSearchMeta({
      id: item?._id || "",
      name: item?.name || payload.name,
      alertsEnabled: Boolean(item?.alertsEnabled ?? payload.alertsEnabled)
    });

    return item;
  };

  const handleAlertToggle = async () => {
    if (!hasAutosaivableSearch) {
      setAlertFeedbackTone("error");
      setAlertFeedback(
        language === "en"
          ? "Define the search first so we can turn it into an alert."
          : "Define primero la busqueda para convertirla en alerta."
      );
      return;
    }

    setAlertActionBusy(true);
    setAlertFeedback("");
    setAlertFeedbackTone("success");

    try {
      const nextValue = !savedSearchMeta.alertsEnabled;
      await persistAlertConfiguration({ alertsEnabled: nextValue });
      setAlertFeedback(
        nextValue
          ? language === "en"
            ? "Alerts activated for this search."
            : "Alertas activadas para esta busqueda."
          : language === "en"
            ? "Alerts muted for this search."
            : "Alertas silenciadas para esta busqueda."
      );
    } catch (error) {
      setAlertFeedbackTone("error");
      setAlertFeedback(
        error.response?.data?.message ||
          (language === "en"
            ? "We could not update this alert right now."
            : "No se pudo actualizar esta alerta en este momento.")
      );
    } finally {
      setAlertActionBusy(false);
    }
  };

  const priceAlertPrompt = !hasMaxPriceFilter
    ? null
    : {
        visible: true,
        checked: Boolean(savedSearchMeta.alertsEnabled),
        disabled:
          !token || !hasAutosaivableSearch || alertActionBusy || autosaveStatus === "saving",
        onChange: handleAlertToggle,
        label:
          language === "en"
            ? "Notify me if a listing appears at this price or less"
            : "Notificarme si aparece una propiedad por este precio o menos",
        badge: language === "en" ? "On" : "Activa",
        description:
          language === "en"
            ? `Applies to ${buildPriceAlertScope(filters, language)}.`
            : `Aplica para ${buildPriceAlertScope(filters, language)}.`,
        helper:
          alertActionBusy || autosaveStatus === "saving"
            ? language === "en"
              ? "Updating your bell..."
              : "Actualizando tu campanita..."
            : !token
              ? language === "en"
                ? "Sign in to turn it on."
                : "Inicia sesion para activarla."
              : savedSearchMeta.alertsEnabled
                ? language === "en"
                  ? "Ready. This search is already saved in your bell."
                  : "Listo. Esta busqueda ya quedo guardada en tu campanita."
                : language === "en"
                  ? "Turn it on and we will watch new matching listings for you."
                  : "Activalo y vigilaremos nuevas publicaciones que coincidan."
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
    <div className="app-shell section-pad space-y-5 sm:space-y-6">
      <div>
        <span className="eyebrow">{t("searchPage.eyebrow")}</span>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="font-serif text-[2.1rem] font-semibold leading-[1.02] sm:text-[2.9rem] lg:text-[3.35rem]">
              {t("searchPage.title")}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-ink/65 sm:text-[15px] sm:leading-7">
              {t("searchPage.description")}
            </p>
          </div>
          <div className="surface-soft w-full border border-pine/15 bg-pine/10 p-3.5 lg:min-w-[260px] lg:max-w-[340px]">
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
        priceAlert={priceAlertPrompt}
      />

      {token ? (
        <section className="surface-soft border border-ink/10 bg-white/88 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex max-w-3xl items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  savedSearchMeta.alertsEnabled
                    ? "bg-pine/10 text-pine"
                    : "bg-mist text-ink/55"
                }`}
              >
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">
                  {!hasAutosaivableSearch
                    ? language === "en"
                      ? "Program this search"
                      : "Programa tu busqueda"
                    : savedSearchMeta.alertsEnabled
                    ? language === "en"
                      ? "Search scheduled in your bell"
                      : "Busqueda programada en tu campanita"
                    : hasMaxPriceFilter
                      ? language === "en"
                        ? "Schedule it from max price"
                        : "Programa tu busqueda desde precio maximo"
                      : language === "en"
                        ? "Schedule this search"
                        : "Programa tu busqueda"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-ink/62">
                  {!hasAutosaivableSearch
                    ? language === "en"
                      ? "Choose province, property type, price, or any other filter and we will turn this into a notification-ready search."
                      : "Elige provincia, tipo de propiedad, precio u otro filtro y convertiremos esto en una busqueda lista para notificaciones."
                    : savedSearchMeta.alertsEnabled
                    ? language === "en"
                      ? "If someone publishes a listing that matches these criteria, we will notify you so you can see it first."
                      : "Si alguien publica una propiedad que coincida con estos criterios, te avisaremos para que seas de los primeros en verla."
                    : hasMaxPriceFilter
                      ? language === "en"
                        ? "With a max price set, use the checkbox inside that filter and we will notify you when something appears within that budget."
                        : "Con un precio maximo definido, usa la casilla dentro de ese filtro y te avisaremos cuando aparezca algo dentro de ese presupuesto."
                      : language === "en"
                        ? "If someone publishes a property with these criteria in the future, we will send you an alert so you are among the first to know."
                        : "Si alguien publica una propiedad con estos criterios en el futuro, te notificaremos con una alerta para que seas el primero en saberlo."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {alertSummary ? (
                <div className="inline-flex rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-ink/68">
                  {alertSummary}
                </div>
              ) : null}
              <Link href="/dashboard/saved-searches">
                <Button variant="secondary" className="gap-2">
                  <BellRing className="h-4 w-4" />
                  {language === "en" ? "Open bell" : "Ver campanita"}
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <label className="field-label">
                {language === "en" ? "Alert name" : "Nombre de esta alerta"}
              </label>
              <Input
                value={savedSearchMeta.name || generatedAlertName}
                disabled={!hasAutosaivableSearch}
                onChange={(event) => {
                  setSavedSearchMeta((current) => ({
                    ...current,
                    name: event.target.value
                  }));
                }}
                placeholder={generatedAlertName}
              />
            </div>
            {!hasMaxPriceFilter ? (
              <div className="flex items-end gap-3">
                <Button
                  variant={savedSearchMeta.alertsEnabled ? "secondary" : "success"}
                  disabled={
                    !hasAutosaivableSearch || alertActionBusy || autosaveStatus === "saving"
                  }
                  onClick={handleAlertToggle}
                >
                  {alertActionBusy
                    ? language === "en"
                      ? "Saving..."
                      : "Guardando..."
                    : savedSearchMeta.alertsEnabled
                      ? language === "en"
                        ? "Mute alert"
                        : "Silenciar alerta"
                      : language === "en"
                        ? "Schedule notification"
                        : "Programar notificacion"}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mt-3 text-xs leading-6 text-ink/58">
            {!hasAutosaivableSearch
              ? language === "en"
                ? "As soon as you define criteria, this panel will stay here and let you schedule the notification."
                : "En cuanto definas criterios, este panel seguira aqui y te permitira programar la notificacion."
              : language === "en"
                ? "This search stays synced with your current filters and will keep living inside your bell."
                : "Esta busqueda seguira sincronizada con tus filtros actuales y quedara guardada dentro de tu campanita."}
          </div>

          {alertFeedback ? (
            <div
              className={`mt-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                alertFeedbackTone === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-white text-pine"
              }`}
            >
              {alertFeedback}
            </div>
          ) : null}
        </section>
      ) : null}

      {message ? (
        <p className="rounded-2xl bg-mist px-4 py-3 text-sm leading-6 text-ink/70">{message}</p>
      ) : null}

      {promotedShowcase.length && !filters.featured ? (
        <section className="surface-elevated overflow-hidden border border-[#f0dab4] bg-[linear-gradient(135deg,rgba(255,248,234,0.94),rgba(255,240,214,0.98)_42%,rgba(255,248,234,0.94))] p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow text-[#8f540d]">
                {language === "en" ? "Featured" : "Destacadas"}
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-ink">
                {language === "en"
                  ? "Featured listings"
                  : "Propiedades destacadas"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/62">
                {language === "en"
                  ? "They appear first in this block and keep a stronger visual presence on the map."
                  : "Aparecen primero en este bloque y mantienen una presencia visual mas fuerte en el mapa."}
              </p>
            </div>
            <span className="rounded-full border border-[#eccb8e] bg-white/82 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f540d] shadow-soft">
              {boostedResultsCount} {language === "en" ? "featured now" : "destacadas ahora"}
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {promotedShowcase.slice(0, 3).map((property) => (
              <PropertyCard
                key={`promoted-${property._id}`}
                property={property}
                boostSurface="search-rail"
                selected={selectedPropertyId === property._id}
                isFavorite={favoriteIds.includes(property._id)}
                contextMatches={property.contextMatches || []}
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
        </section>
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
            {boostedResultsCount && !filters.featured ? (
              <span className="rounded-full border border-[#f0dab4] bg-[#fff8ea] px-3 py-1.5 text-[11px] font-semibold text-[#8f540d] shadow-soft">
                {boostedResultsCount} {language === "en" ? "featured" : "destacadas"}
              </span>
            ) : null}
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
