"use client";

import { businessTypes, currencies, propertyTypes, provinces } from "@/lib/constants";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

export function SearchFilters({
  values,
  onChange,
  onReset,
  onUseCurrentLocation,
  savedSearchName,
  onSavedSearchNameChange,
  onSaveSearch,
  canSave
}) {
  const update = (key, value) => onChange({ [key]: value });

  return (
    <div className="surface space-y-5 p-5">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="field-label">Buscar por texto</label>
          <Input
            value={values.q || ""}
            onChange={(event) => update("q", event.target.value)}
            placeholder="Escazu, Tamarindo, vista al mar, jardin..."
          />
        </div>
        <div>
          <label className="field-label">Negocio</label>
          <Select
            value={values.businessType || ""}
            onChange={(event) => update("businessType", event.target.value)}
          >
            <option value="">Todos</option>
            {businessTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="field-label">Tipo</label>
          <Select
            value={values.propertyType || ""}
            onChange={(event) => update("propertyType", event.target.value)}
          >
            <option value="">Todos</option>
            {propertyTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div>
          <label className="field-label">Precio min</label>
          <Input
            type="number"
            value={values.minPrice || ""}
            onChange={(event) => update("minPrice", event.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="field-label">Precio max</label>
          <Input
            type="number"
            value={values.maxPrice || ""}
            onChange={(event) => update("maxPrice", event.target.value)}
            placeholder="500000"
          />
        </div>
        <div>
          <label className="field-label">Moneda</label>
          <Select value={values.currency || ""} onChange={(event) => update("currency", event.target.value)}>
            <option value="">Ambas</option>
            {currencies.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="field-label">Habitaciones</label>
          <Input
            type="number"
            value={values.bedrooms || ""}
            onChange={(event) => update("bedrooms", event.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="field-label">Banos</label>
          <Input
            type="number"
            value={values.bathrooms || ""}
            onChange={(event) => update("bathrooms", event.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="field-label">Parqueos</label>
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
          <label className="field-label">Provincia</label>
          <Select value={values.province || ""} onChange={(event) => update("province", event.target.value)}>
            <option value="">Todas</option>
            {provinces.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="field-label">Canton</label>
          <Input
            value={values.canton || ""}
            onChange={(event) => update("canton", event.target.value)}
            placeholder="Escazu"
          />
        </div>
        <div>
          <label className="field-label">Distrito</label>
          <Input
            value={values.district || ""}
            onChange={(event) => update("district", event.target.value)}
            placeholder="San Rafael"
          />
        </div>
        <div>
          <label className="field-label">Radio (km)</label>
          <Input
            type="number"
            value={values.radiusKm || ""}
            onChange={(event) => update("radiusKm", event.target.value)}
            placeholder="20"
          />
        </div>
        <div className="flex items-end">
          <Button variant="secondary" className="w-full" onClick={onUseCurrentLocation}>
            Cerca de mi
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Checkbox
          label="Amueblado"
          checked={Boolean(values.furnished)}
          onChange={(event) => update("furnished", event.target.checked ? true : undefined)}
        />
        <Checkbox
          label="Mascotas"
          checked={Boolean(values.petsAllowed)}
          onChange={(event) => update("petsAllowed", event.target.checked ? true : undefined)}
        />
        <Checkbox
          label="Destacadas"
          checked={Boolean(values.featured)}
          onChange={(event) => update("featured", event.target.checked ? true : undefined)}
        />
        <Checkbox
          label="Recientes"
          checked={Boolean(values.recent)}
          onChange={(event) => update("recent", event.target.checked ? true : undefined)}
        />
      </div>

      <div className="grid gap-4 border-t border-ink/10 pt-5 md:grid-cols-[1fr_auto]">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <Input
            value={savedSearchName}
            onChange={(event) => onSavedSearchNameChange(event.target.value)}
            placeholder="Nombre para guardar esta busqueda"
          />
          <Button variant="accent" onClick={onSaveSearch} disabled={!canSave}>
            Guardar busqueda
          </Button>
        </div>
        <Button variant="ghost" onClick={onReset}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
