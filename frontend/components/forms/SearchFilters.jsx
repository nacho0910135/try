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
    <div className="surface space-y-5 p-5">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
          <Select value={values.currency || ""} onChange={(event) => update("currency", event.target.value)}>
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
            {marketStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {t(MARKET_LABELS[item.value])}
              </option>
            ))}
          </Select>
        </div>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="field-label">{t("filters.province")}</label>
          <Select
            value={values.province || ""}
            onChange={(event) =>
              onChange({
                province: event.target.value || undefined,
                canton: undefined,
                district: undefined
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
                district: undefined
              })
            }
          >
            <option value="">{values.province ? t("common.all") : t("filters.selectProvince")}</option>
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
            onChange={(event) => update("district", event.target.value || undefined)}
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
          <Button variant="secondary" className="w-full" onClick={onUseCurrentLocation}>
            {t("filters.nearMe")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
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

      <div className="grid gap-4 border-t border-ink/10 pt-5 md:grid-cols-[1fr_auto]">
        <div>
          <Button variant="accent" onClick={onSaveSearch} disabled={!canSave}>
            {t("filters.saveSearch")}
          </Button>
        </div>
        <Button variant="ghost" onClick={onReset}>
          {t("filters.clear")}
        </Button>
      </div>
    </div>
  );
}
