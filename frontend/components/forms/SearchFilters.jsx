"use client";

import { ChevronDown, MapPinned, Search, Sparkles } from "lucide-react";
import {
  businessTypes,
  currencies,
  marketStatuses,
  propertyTypes,
  provinces,
  rentalArrangements
} from "@/lib/constants";
import {
  ensureOptionInList,
  getCantonsByProvince,
  getDistrictsByProvinceAndCanton
} from "@/lib/costa-rica-locations";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

const BUSINESS_LABELS = {
  sale: "options.sale",
  rent: "options.rent"
};

const PROPERTY_LABELS = {
  house: "options.house",
  apartment: "options.apartment",
  condominium: "options.condominium",
  lot: "options.lot",
  room: "options.room",
  commercial: "options.commercial"
};

const RENTAL_LABELS = {
  "full-property": "options.fullProperty",
  roommate: "options.roommate"
};

const MARKET_LABELS = {
  available: "options.available",
  reserved: "options.reserved",
  sold: "options.sold",
  rented: "options.rented",
  inactive: "options.inactive"
};

const PUBLIC_MARKET_STATUSES = marketStatuses.filter((item) => item.value !== "inactive");

const SORT_OPTIONS = [
  { value: "recent", label: "filters.sortRecent" },
  { value: "price-asc", label: "filters.sortPriceAsc" },
  { value: "price-desc", label: "filters.sortPriceDesc" },
  { value: "distance", label: "filters.sortDistance" }
];

const hasValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && value !== "" && value !== false;
};

const countActiveFilters = (values) => values.filter(hasValue).length;

function FilterSection({ title, caption, count, defaultOpen = false, children }) {
  return (
    <details
      className="surface-soft overflow-hidden border border-ink/10 bg-white/82"
      defaultOpen={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-ink">{title}</div>
          {caption ? <p className="mt-1 text-xs leading-5 text-ink/56">{caption}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {count ? (
            <span className="rounded-full bg-pine/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-pine">
              {count}
            </span>
          ) : null}
          <ChevronDown className="h-4 w-4 text-ink/45" />
        </div>
      </summary>
      <div className="border-t border-ink/8 px-4 pb-4 pt-4">{children}</div>
    </details>
  );
}

export function SearchFilters({
  values,
  onChange,
  onReset,
  onUseCurrentLocation,
  canAutoSave,
  autosaveStatus
}) {
  const { language, t } = useLanguage();
  const update = (key, value) => onChange({ [key]: value });
  const cantonOptions = ensureOptionInList(getCantonsByProvince(values.province), values.canton);
  const districtOptions = ensureOptionInList(
    getDistrictsByProvinceAndCanton(values.province, values.canton),
    values.district
  );

  const locationCount = countActiveFilters([
    values.canton,
    values.district,
    values.radiusKm,
    values.lat,
    values.lng,
    values.bounds,
    values.polygon
  ]);

  const pricingCount = countActiveFilters([
    values.minPrice,
    values.maxPrice,
    values.currency,
    values.marketStatus,
    values.sort,
    values.bedrooms,
    values.bathrooms,
    values.parkingSpaces,
    values.minConstructionArea,
    values.maxConstructionArea,
    values.minLotArea,
    values.maxLotArea
  ]);

  const smartCount = countActiveFilters([
    values.rentalArrangement,
    values.furnished,
    values.petsAllowed,
    values.depositRequired,
    values.featured,
    values.recent,
    values.privateRoom,
    values.privateBathroom,
    values.utilitiesIncluded,
    values.studentFriendly
  ]);

  const autosaveCopy = !canAutoSave
    ? t("searchPage.loginToSaveSearch")
    : autosaveStatus === "saving"
      ? language === "en"
        ? "Auto-saving current search..."
        : "Autoguardando la busqueda actual..."
      : autosaveStatus === "error"
        ? language === "en"
          ? "Auto-save could not be updated."
          : "No se pudo actualizar el autoguardado."
        : language === "en"
          ? "Your current search saves automatically."
          : "Tu busqueda actual se guarda automaticamente.";

  return (
    <div className="surface-elevated space-y-4 p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="text-xs font-medium leading-5 text-ink/56">{autosaveCopy}</div>
        <Button
          variant="secondary"
          onClick={onReset}
          className="w-full bg-lagoon/12 text-lagoon hover:bg-lagoon/18 sm:w-auto"
        >
          {t("filters.clear")}
        </Button>
      </div>

      <div className="surface-soft border border-ink/10 bg-white/85 p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-pine/68">
          <Search className="h-3.5 w-3.5" />
          {language === "en" ? "Quick filters" : "Filtros rapidos"}
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,1fr))_auto]">
          <div>
            <label className="field-label">{t("filters.searchText")}</label>
            <Input
              value={values.q || ""}
              onChange={(event) => update("q", event.target.value)}
              placeholder={t("filters.searchPlaceholder")}
            />
          </div>
          <div>
            <label className="field-label">{t("filters.business")}</label>
            <Select
              value={values.businessType || ""}
              onChange={(event) => update("businessType", event.target.value)}
            >
              <option value="">{t("common.all")}</option>
              {businessTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(BUSINESS_LABELS[item.value])}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">{t("filters.propertyType")}</label>
            <Select
              value={values.propertyType || ""}
              onChange={(event) => update("propertyType", event.target.value)}
            >
              <option value="">{t("common.all")}</option>
              {propertyTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(PROPERTY_LABELS[item.value])}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">{t("filters.province")}</label>
            <Select
              value={values.province || ""}
              onChange={(event) =>
                onChange({
                  province: event.target.value || undefined,
                  canton: undefined,
                  district: undefined,
                  lat: undefined,
                  lng: undefined,
                  bounds: undefined,
                  polygon: undefined
                })
              }
            >
              <option value="">{t("common.allFeminine")}</option>
              {provinces.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="success" className="w-full" onClick={onUseCurrentLocation}>
              {t("filters.nearMe")}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <FilterSection
          title={t("filters.location")}
          caption={
            language === "en"
              ? "District precision, radius, and map-driven positioning."
              : "Precision por canton, distrito, radio y posicion en mapa."
          }
          count={locationCount}
          defaultOpen={locationCount > 0}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="field-label">{t("filters.canton")}</label>
              <Select
                value={values.canton || ""}
                disabled={!values.province}
                onChange={(event) =>
                  onChange({
                    canton: event.target.value || undefined,
                    district: undefined,
                    lat: undefined,
                    lng: undefined,
                    bounds: undefined,
                    polygon: undefined
                  })
                }
              >
                <option value="">
                  {values.province ? t("common.all") : t("filters.selectProvince")}
                </option>
                {cantonOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="field-label">{t("filters.district")}</label>
              <Select
                value={values.district || ""}
                disabled={!values.province || !values.canton}
                onChange={(event) =>
                  onChange({
                    district: event.target.value || undefined,
                    lat: undefined,
                    lng: undefined,
                    bounds: undefined,
                    polygon: undefined
                  })
                }
              >
                <option value="">
                  {values.province && values.canton ? t("common.all") : t("filters.selectCanton")}
                </option>
                {districtOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="field-label">{t("filters.radius")}</label>
              <Input
                type="number"
                value={values.radiusKm || ""}
                onChange={(event) => update("radiusKm", event.target.value)}
                placeholder="20"
              />
            </div>
            <div className="rounded-2xl bg-mist px-4 py-3 text-xs leading-5 text-ink/58">
              <div className="flex items-center gap-2 font-semibold text-ink/70">
                <MapPinned className="h-3.5 w-3.5 text-terracotta" />
                {language === "en" ? "Map sync" : "Sincronizado con el mapa"}
              </div>
              <p className="mt-1.5">
                {language === "en"
                  ? "Province, district, drawn area, and nearby search stay connected with the live map."
                  : "Provincia, distrito, zona dibujada y cercania se mantienen conectados con el mapa en vivo."}
              </p>
            </div>
          </div>
        </FilterSection>

        <FilterSection
          title={t("filters.priceAndFeatures")}
          caption={
            language === "en"
              ? "Budget, market status, sort, and physical attributes."
              : "Presupuesto, estado comercial, orden y atributos fisicos."
          }
          count={pricingCount}
          defaultOpen={pricingCount > 0}
        >
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="field-label">{t("filters.minPrice")}</label>
                <Input
                  type="number"
                  value={values.minPrice || ""}
                  onChange={(event) => update("minPrice", event.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="field-label">{t("filters.maxPrice")}</label>
                <Input
                  type="number"
                  value={values.maxPrice || ""}
                  onChange={(event) => update("maxPrice", event.target.value)}
                  placeholder="500000"
                />
              </div>
              <div>
                <label className="field-label">{t("filters.currency")}</label>
                <Select
                  value={values.currency || ""}
                  onChange={(event) => update("currency", event.target.value)}
                >
                  <option value="">{t("common.both")}</option>
                  {currencies.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="field-label">{t("filters.status")}</label>
                <Select
                  value={values.marketStatus || ""}
                  onChange={(event) => update("marketStatus", event.target.value)}
                >
                  <option value="">{t("common.active")}</option>
                  {PUBLIC_MARKET_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {t(MARKET_LABELS[item.value])}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="field-label">{t("filters.sortBy")}</label>
                <Select
                  value={values.sort || ""}
                  onChange={(event) => update("sort", event.target.value || undefined)}
                >
                  <option value="">{t("filters.sortDefault")}</option>
                  {SORT_OPTIONS.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                      disabled={item.value === "distance" && !(values.lat && values.lng)}
                    >
                      {t(item.label)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
              <div>
                <label className="field-label">{t("filters.bedrooms")}</label>
                <Input
                  type="number"
                  value={values.bedrooms || ""}
                  onChange={(event) => update("bedrooms", event.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="field-label">{t("filters.bathrooms")}</label>
                <Input
                  type="number"
                  value={values.bathrooms || ""}
                  onChange={(event) => update("bathrooms", event.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="field-label">{t("filters.parkingSpaces")}</label>
                <Input
                  type="number"
                  value={values.parkingSpaces || ""}
                  onChange={(event) => update("parkingSpaces", event.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="field-label">{t("filters.minConstructionArea")}</label>
                <Input
                  type="number"
                  value={values.minConstructionArea || ""}
                  onChange={(event) => update("minConstructionArea", event.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="field-label">{t("filters.maxConstructionArea")}</label>
                <Input
                  type="number"
                  value={values.maxConstructionArea || ""}
                  onChange={(event) => update("maxConstructionArea", event.target.value)}
                  placeholder="400"
                />
              </div>
              <div>
                <label className="field-label">{t("filters.minLotArea")}</label>
                <Input
                  type="number"
                  value={values.minLotArea || ""}
                  onChange={(event) => update("minLotArea", event.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="field-label">{t("filters.maxLotArea")}</label>
                <Input
                  type="number"
                  value={values.maxLotArea || ""}
                  onChange={(event) => update("maxLotArea", event.target.value)}
                  placeholder="1000"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        <FilterSection
          title={t("filters.smartToggles")}
          caption={
            language === "en"
              ? "Rental mode and quick yes/no signals."
              : "Modalidad de renta y senales rapidas de si/no."
          }
          count={smartCount}
          defaultOpen={smartCount > 0}
        >
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="field-label">{t("filters.rentalArrangement")}</label>
                <Select
                  value={values.rentalArrangement || ""}
                  onChange={(event) => update("rentalArrangement", event.target.value)}
                >
                  <option value="">{t("common.allFeminine")}</option>
                  {rentalArrangements.map((item) => (
                    <option key={item.value} value={item.value}>
                      {t(RENTAL_LABELS[item.value])}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="rounded-2xl bg-mist px-4 py-3 text-xs leading-5 text-ink/56 md:col-span-1 xl:col-span-3">
                <div className="flex items-center gap-2 font-semibold text-ink/70">
                  <Sparkles className="h-3.5 w-3.5 text-terracotta" />
                  {language === "en" ? "Smart toggles" : "Senales rapidas"}
                </div>
                <p className="mt-1.5">
                  {language === "en"
                    ? "Use these to narrow down furnished listings, pet-friendly rentals, featured inventory, or roommate-specific supply."
                    : "Usa estas senales para acotar amueblados, mascotas, destacadas o inventario especifico para roomies."}
                </p>
              </div>
            </div>
            <div className="grid gap-x-5 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
              <Checkbox
                label={t("filters.furnished")}
                checked={Boolean(values.furnished)}
                onChange={(event) => update("furnished", event.target.checked ? true : undefined)}
              />
              <Checkbox
                label={t("filters.petsAllowed")}
                checked={Boolean(values.petsAllowed)}
                onChange={(event) => update("petsAllowed", event.target.checked ? true : undefined)}
              />
              <Checkbox
                label={t("filters.depositRequired")}
                checked={Boolean(values.depositRequired)}
                onChange={(event) =>
                  update("depositRequired", event.target.checked ? true : undefined)
                }
              />
              <Checkbox
                label={t("filters.featured")}
                checked={Boolean(values.featured)}
                onChange={(event) => update("featured", event.target.checked ? true : undefined)}
              />
              <Checkbox
                label={t("filters.recent")}
                checked={Boolean(values.recent)}
                onChange={(event) => update("recent", event.target.checked ? true : undefined)}
              />
              <Checkbox
                label={t("filters.privateRoom")}
                checked={Boolean(values.privateRoom)}
                onChange={(event) => update("privateRoom", event.target.checked ? true : undefined)}
              />
              <Checkbox
                label={t("filters.privateBathroom")}
                checked={Boolean(values.privateBathroom)}
                onChange={(event) =>
                  update("privateBathroom", event.target.checked ? true : undefined)
                }
              />
              <Checkbox
                label={t("filters.utilitiesIncluded")}
                checked={Boolean(values.utilitiesIncluded)}
                onChange={(event) =>
                  update("utilitiesIncluded", event.target.checked ? true : undefined)
                }
              />
              <Checkbox
                label={t("filters.studentFriendly")}
                checked={Boolean(values.studentFriendly)}
                onChange={(event) =>
                  update("studentFriendly", event.target.checked ? true : undefined)
                }
              />
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
