"use client";

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

export function SearchFilters({
  values,
  onChange,
  onReset,
  onUseCurrentLocation,
  onSaveSearch,
  canSave
}) {
  const { t } = useLanguage();
  const update = (key, value) => onChange({ [key]: value });
  const cantonOptions = ensureOptionInList(getCantonsByProvince(values.province), values.canton);
  const districtOptions = ensureOptionInList(
    getDistrictsByProvinceAndCanton(values.province, values.canton),
    values.district
  );

  return (
    <div className="surface-elevated space-y-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pine/70">
            {t("searchPage.eyebrow")}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-ink">
            {t("filters.title")}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/62">
            {t("filters.description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="stat-chip">
            {t("filters.business")}
          </span>
          <span className="stat-chip">
            {t("filters.province")}
          </span>
          <span className="stat-chip">
            {t("filters.radius")}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="surface-soft space-y-4 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-pine/68">
            {t("filters.searchText")}
          </div>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
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
          </div>
        </div>

        <div className="surface-soft space-y-4 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-pine/68">
            {t("filters.location")}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
            <div className="flex items-end">
              <Button variant="success" className="w-full" onClick={onUseCurrentLocation}>
                {t("filters.nearMe")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-soft space-y-4 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-pine/68">
          {t("filters.priceAndFeatures")}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
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

      <div className="surface-soft space-y-4 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-pine/68">
          {t("filters.smartToggles")}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
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
            onChange={(event) => update("depositRequired", event.target.checked ? true : undefined)}
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
            onChange={(event) => update("privateBathroom", event.target.checked ? true : undefined)}
          />
          <Checkbox
            label={t("filters.utilitiesIncluded")}
            checked={Boolean(values.utilitiesIncluded)}
            onChange={(event) => update("utilitiesIncluded", event.target.checked ? true : undefined)}
          />
          <Checkbox
            label={t("filters.studentFriendly")}
            checked={Boolean(values.studentFriendly)}
            onChange={(event) => update("studentFriendly", event.target.checked ? true : undefined)}
          />
        </div>
      </div>

      <div className="grid gap-4 border-t border-ink/10 pt-5 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button variant="accent" onClick={onSaveSearch} disabled={!canSave} className="w-full sm:w-auto">
            {t("filters.saveSearch")}
          </Button>
          {!canSave ? (
            <span className="self-center text-xs font-medium text-ink/52">
              {t("searchPage.loginToSaveSearch")}
            </span>
          ) : null}
        </div>
        <Button variant="ghost" onClick={onReset} className="w-full sm:w-auto">
          {t("filters.clear")}
        </Button>
      </div>
    </div>
  );
}
