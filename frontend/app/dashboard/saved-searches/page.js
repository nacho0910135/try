"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bell, BellRing, Mail, Radar, SlidersHorizontal, Sparkles } from "lucide-react";
import {
  createSavedSearch,
  deleteSavedSearch,
  getSavedSearches,
  sendSavedSearchAlert,
  updateSavedSearch
} from "@/lib/api";
import { businessTypes, propertyTypes, provinces } from "@/lib/constants";
import {
  ensureOptionInList,
  getCantonsByProvince,
  getDistrictsByProvinceAndCanton
} from "@/lib/costa-rica-locations";
import { formatCurrency, serializePropertyQuery } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Select } from "@/components/ui/Select";

const initialFormValues = {
  businessType: "",
  propertyType: "",
  province: "",
  canton: "",
  district: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  parkingSpaces: "",
  emailNotifications: false
};

const hasValue = (value) => value !== undefined && value !== null && value !== "";

const buildProgrammedFilters = (values) => {
  const filters = {};

  if (hasValue(values.businessType)) filters.businessType = values.businessType;
  if (hasValue(values.propertyType)) filters.propertyType = values.propertyType;
  if (hasValue(values.province)) filters.province = values.province;
  if (hasValue(values.canton)) filters.canton = values.canton;
  if (hasValue(values.district)) filters.district = values.district;
  if (hasValue(values.maxPrice)) filters.maxPrice = Number(values.maxPrice);
  if (hasValue(values.bedrooms)) filters.bedrooms = Number(values.bedrooms);
  if (hasValue(values.bathrooms)) filters.bathrooms = Number(values.bathrooms);
  if (hasValue(values.parkingSpaces)) filters.parkingSpaces = Number(values.parkingSpaces);

  return filters;
};

export default function DashboardSavedSearchesPage() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("success");
  const [creating, setCreating] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);

  const cantonOptions = useMemo(
    () => ensureOptionInList(getCantonsByProvince(formValues.province), formValues.canton),
    [formValues.canton, formValues.province]
  );
  const districtOptions = useMemo(
    () =>
      ensureOptionInList(
        getDistrictsByProvinceAndCanton(formValues.province, formValues.canton),
        formValues.district
      ),
    [formValues.canton, formValues.district, formValues.province]
  );
  const programmedFilters = useMemo(() => buildProgrammedFilters(formValues), [formValues]);
  const hasProgrammedFilters = Object.keys(programmedFilters).length > 0;

  const loadSavedSearches = async () => {
    const data = await getSavedSearches();
    setItems(data.items || []);
  };

  useEffect(() => {
    void loadSavedSearches();
  }, []);

  const updateForm = (patch) => {
    setFormValues((current) => ({
      ...current,
      ...patch
    }));
  };

  const resetForm = () => {
    setFormValues(initialFormValues);
  };

  const handleCreateNotification = async () => {
    if (!hasProgrammedFilters) {
      setFeedbackTone("error");
      setFeedback("Define al menos un criterio antes de programar la notificacion.");
      return;
    }

    setCreating(true);
    setFeedback("");
    setFeedbackTone("success");

    try {
      await createSavedSearch({
        filters: programmedFilters,
        alertsEnabled: true,
        emailNotifications: Boolean(formValues.emailNotifications)
      });
      setFeedback(
        formValues.emailNotifications
          ? "Notificacion programada. Aparecera en tu campanita y tambien por correo."
          : "Notificacion programada. Quedara activa solo en tu area de notificaciones."
      );
      resetForm();
      await loadSavedSearches();
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(
        error.response?.data?.message || "No se pudo programar esta notificacion."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (searchId) => {
    setBusyId(searchId);
    setFeedback("");
    setFeedbackTone("success");

    try {
      await deleteSavedSearch(searchId);
      setFeedback("Busqueda guardada eliminada.");
      await loadSavedSearches();
    } finally {
      setBusyId("");
    }
  };

  const handleToggleAlerts = async (item) => {
    setBusyId(item._id);
    setFeedback("");
    setFeedbackTone("success");

    try {
      await updateSavedSearch(item._id, {
        alertsEnabled: !item.alertsEnabled
      });
      setFeedback(
        !item.alertsEnabled
          ? "Alertas activadas para esta busqueda."
          : "Alertas desactivadas para esta busqueda."
      );
      await loadSavedSearches();
    } finally {
      setBusyId("");
    }
  };

  const handleToggleEmailChannel = async (item) => {
    const emailEnabled = item.emailNotifications !== false;

    setBusyId(item._id);
    setFeedback("");
    setFeedbackTone("success");

    try {
      await updateSavedSearch(item._id, {
        alertsEnabled: true,
        emailNotifications: !emailEnabled
      });
      setFeedback(
        !emailEnabled
          ? "Correo activado para esta notificacion."
          : "Esta notificacion quedara solo en tu area de notificaciones."
      );
      await loadSavedSearches();
    } finally {
      setBusyId("");
    }
  };

  const handleOpenSearch = async (item) => {
    setBusyId(item._id);
    setFeedback("");
    setFeedbackTone("success");

    try {
      await updateSavedSearch(item._id, {
        lastViewedAt: new Date().toISOString()
      });
    } catch (_error) {
      // If this lightweight mark fails, we still let the user continue.
    } finally {
      setBusyId("");
      router.push(`/search?${serializePropertyQuery(item.filters || {})}`);
    }
  };

  const handleSendAlertEmail = async (item) => {
    const emailEnabled = item.emailNotifications !== false;

    if (!emailEnabled) {
      return;
    }

    setBusyId(item._id);
    setFeedback("");
    setFeedbackTone("success");

    try {
      const data = await sendSavedSearchAlert(item._id);
      const mode = data.result?.email?.mode;
      setFeedback(
        mode === "smtp"
          ? "Alerta enviada por correo correctamente."
          : "El servicio de correo no esta configurado en este entorno."
      );
      await loadSavedSearches();
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(
        error.response?.data?.message || "No se pudo enviar la alerta por correo ahora mismo."
      );
    } finally {
      setBusyId("");
    }
  };

  if (!items) {
    return <LoadingState label="Cargando alertas de busqueda..." />;
  }

  return (
    <section className="space-y-6">
      <div className="surface bg-hero-grid p-8">
        <span className="eyebrow">Alertas y seguimiento</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold">Busquedas guardadas con radar</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/65">
          Programa criterios exactos para compra o alquiler y decide si quieres verlos solo en tu
          campanita o tambien por correo.
        </p>
        {feedback ? (
          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
              feedbackTone === "error" ? "bg-red-50 text-red-600" : "bg-pine/10 text-pine"
            }`}
          >
            {feedback}
          </div>
        ) : null}
      </div>

      <div className="surface-elevated p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <span className="eyebrow">Programar notificacion</span>
            <h2 className="mt-4 text-3xl font-semibold text-ink">
              Define exactamente que tipo de propiedad quieres vigilar
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              Compra o alquiler, casa o terreno, zona, precio maximo y condiciones clave. Cuando
              aparezca algo que cumpla, se activara tu radar.
            </p>
          </div>
          <div className="rounded-[24px] border border-pine/12 bg-pine/8 p-4 text-sm text-pine">
            <div className="flex items-center gap-2 font-semibold">
              <BellRing className="h-4 w-4" />
              La campanita queda activa siempre
            </div>
            <div className="mt-2 max-w-xs leading-6 text-ink/60">
              El check de correo es opcional. Si no lo marcas, la notificacion se guarda solo
              dentro de la plataforma.
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="field-label">Compra o alquiler</label>
            <Select
              value={formValues.businessType}
              onChange={(event) => updateForm({ businessType: event.target.value })}
            >
              <option value="">Cualquiera</option>
              {businessTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="field-label">Tipo de propiedad</label>
            <Select
              value={formValues.propertyType}
              onChange={(event) => updateForm({ propertyType: event.target.value })}
            >
              <option value="">Cualquiera</option>
              {propertyTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="field-label">Provincia</label>
            <Select
              value={formValues.province}
              onChange={(event) =>
                updateForm({
                  province: event.target.value,
                  canton: "",
                  district: ""
                })
              }
            >
              <option value="">Todas</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="field-label">Canton</label>
            <Select
              value={formValues.canton}
              disabled={!formValues.province}
              onChange={(event) =>
                updateForm({
                  canton: event.target.value,
                  district: ""
                })
              }
            >
              <option value="">{formValues.province ? "Todos" : "Selecciona provincia"}</option>
              {cantonOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="field-label">Distrito</label>
            <Select
              value={formValues.district}
              disabled={!formValues.province || !formValues.canton}
              onChange={(event) => updateForm({ district: event.target.value })}
            >
              <option value="">
                {formValues.province && formValues.canton ? "Todos" : "Selecciona canton"}
              </option>
              {districtOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="field-label">Precio maximo</label>
            <Input
              type="number"
              value={formValues.maxPrice}
              onChange={(event) => updateForm({ maxPrice: event.target.value })}
              placeholder="500000"
            />
          </div>

          <div>
            <label className="field-label">Cant. cuartos</label>
            <Input
              type="number"
              value={formValues.bedrooms}
              onChange={(event) => updateForm({ bedrooms: event.target.value })}
              placeholder="2"
            />
          </div>

          <div>
            <label className="field-label">Banos</label>
            <Input
              type="number"
              value={formValues.bathrooms}
              onChange={(event) => updateForm({ bathrooms: event.target.value })}
              placeholder="2"
            />
          </div>

          <div>
            <label className="field-label">Parqueo</label>
            <Input
              type="number"
              value={formValues.parkingSpaces}
              onChange={(event) => updateForm({ parkingSpaces: event.target.value })}
              placeholder="1"
            />
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-ink/10 bg-white/78 p-4">
          <Checkbox
            label="Quiero recibir tambien correo electronico"
            checked={Boolean(formValues.emailNotifications)}
            onChange={(event) => updateForm({ emailNotifications: event.target.checked })}
          />
          <p className="mt-2 text-sm leading-6 text-ink/58">
            Si no lo marcas, la notificacion aparecera solo en tu area de notificaciones.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="rounded-full bg-mist px-4 py-2 text-xs font-semibold text-ink/65">
            {hasProgrammedFilters
              ? `${Object.keys(programmedFilters).length} criterios listos para guardar`
              : "Agrega al menos un criterio para programar la notificacion"}
          </div>
          <Button
            variant="success"
            onClick={handleCreateNotification}
            disabled={creating}
            className="max-w-full rounded-full px-5 py-3 text-sm leading-5 sm:max-w-[560px]"
          >
            {creating
              ? "Programando..."
              : "Programar una notificacion cuando una propiedad con estos criterios aparezca"}
          </Button>
        </div>
      </div>

      {items.length ? (
        <div className="space-y-4">
          {items.map((item) => {
            const emailEnabled = item.emailNotifications !== false;

            return (
              <div key={item._id} className="surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-xl font-semibold text-ink">{item.name}</div>
                      {item.alertsEnabled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-pine px-3 py-1 text-xs font-semibold text-white">
                          <BellRing className="h-3.5 w-3.5" />
                          Alertas activas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink/65">
                          <Bell className="h-3.5 w-3.5" />
                          Alertas apagadas
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          emailEnabled
                            ? "bg-lagoon/10 text-lagoon"
                            : "bg-white text-ink/65 shadow-soft"
                        }`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {emailEnabled ? "Correo + campanita" : "Solo campanita"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink/55">
                      {Object.entries(item.filters || {})
                        .filter(([, value]) => value !== null && value !== undefined && value !== "")
                        .map(([key, value]) => `${key}: ${typeof value === "object" ? "mapa" : value}`)
                        .join(" | ")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={item.alertsEnabled ? "secondary" : "success"}
                      onClick={() => handleToggleAlerts(item)}
                      disabled={busyId === item._id}
                    >
                      {item.alertsEnabled ? "Silenciar alertas" : "Activar alertas"}
                    </Button>
                    <Button
                      variant={emailEnabled ? "secondary" : "accent"}
                      onClick={() => handleToggleEmailChannel(item)}
                      disabled={busyId === item._id}
                    >
                      {emailEnabled ? "Dejar solo campanita" : "Activar correo"}
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => handleSendAlertEmail(item)}
                      disabled={busyId === item._id || !emailEnabled}
                    >
                      {emailEnabled ? "Enviar email ahora" : "Correo apagado"}
                    </Button>
                    <Button
                      variant="accent"
                      onClick={() => handleOpenSearch(item)}
                      disabled={busyId === item._id}
                    >
                      Abrir
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(item._id)}
                      disabled={busyId === item._id}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="space-y-3">
                    <div className="rounded-[22px] border border-pine/12 bg-pine/8 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-pine">
                        <Radar className="h-4 w-4" />
                        Radar actual
                      </div>
                      <div className="mt-4 text-3xl font-semibold text-ink">
                        {item.alertPreview?.totalMatches || 0}
                      </div>
                      <div className="mt-1 text-sm text-ink/60">propiedades coinciden hoy</div>
                    </div>

                    <div className="rounded-[22px] border border-lagoon/12 bg-lagoon/8 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lagoon">
                        <Sparkles className="h-4 w-4" />
                        Novedades
                      </div>
                      <div className="mt-4 text-3xl font-semibold text-ink">
                        {item.alertPreview?.newMatches || 0}
                      </div>
                      <div className="mt-1 text-sm text-ink/60">
                        nuevas desde la ultima vez que abriste esta busqueda
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-terracotta/12 bg-terracotta/8 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">
                        <Mail className="h-4 w-4" />
                        Correo
                      </div>
                      <div className="mt-4 text-3xl font-semibold text-ink">
                        {emailEnabled ? item.alertPreview?.emailMatches || 0 : 0}
                      </div>
                      <div className="mt-1 text-sm text-ink/60">
                        {emailEnabled
                          ? "nuevas desde el ultimo correo enviado"
                          : "apagado para esta notificacion"}
                      </div>
                      <div className="mt-2 text-xs text-ink/55">
                        {emailEnabled
                          ? item.lastAlertSentAt
                            ? `Ultimo email: ${new Date(item.lastAlertSentAt).toLocaleDateString("es-CR")}`
                            : "Todavia no se ha enviado un correo"
                          : "Solo se guarda en tu area de notificaciones"}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-sun/15 bg-sun/10 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">
                        <SlidersHorizontal className="h-4 w-4" />
                        Bajadas de precio
                      </div>
                      <div className="mt-4 text-3xl font-semibold text-ink">
                        {item.alertPreview?.priceDropMatchesCount || 0}
                      </div>
                      <div className="mt-1 text-sm text-ink/60">
                        propiedades que ajustaron su precio desde el ultimo correo
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-ink/10 bg-white p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-ink">Coincidencias recientes</div>
                          <div className="mt-1 text-sm text-ink/55">
                            Vista rapida del inventario actual para esta alerta.
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {item.alertPreview?.recentMatches?.length ? (
                          item.alertPreview.recentMatches.map((property) => (
                            <div
                              key={property._id}
                              className="rounded-[20px] border border-ink/10 bg-mist p-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-ink">{property.title}</div>
                                  <div className="mt-1 text-sm text-ink/55">
                                    {property.address?.district}, {property.address?.canton},{" "}
                                    {property.address?.province}
                                  </div>
                                </div>
                                <Link
                                  href={`/properties/${property.slug}`}
                                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-pine shadow-soft"
                                >
                                  Ver
                                </Link>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-ink/55">
                            No hay coincidencias activas en este momento para esta busqueda.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-ink/10 bg-white p-5">
                      <div>
                        <div className="text-sm font-semibold text-ink">Ajustes recientes de precio</div>
                        <div className="mt-1 text-sm text-ink/55">
                          Oportunidades detectadas automaticamente para esta misma zona.
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {item.alertPreview?.recentPriceDrops?.length ? (
                          item.alertPreview.recentPriceDrops.map((property) => (
                            <div
                              key={`${property._id}-drop`}
                              className="rounded-[20px] border border-terracotta/12 bg-terracotta/6 p-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-ink">{property.title}</div>
                                  <div className="mt-1 text-sm text-ink/55">
                                    {property.address?.district}, {property.address?.canton},{" "}
                                    {property.address?.province}
                                  </div>
                                  <div className="mt-2 text-sm font-medium text-terracotta">
                                    Bajo de {formatCurrency(property.previousPrice, property.currency)} a{" "}
                                    {formatCurrency(property.currentPrice, property.currency)}
                                  </div>
                                </div>
                                <Link
                                  href={`/properties/${property.slug}`}
                                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-terracotta shadow-soft"
                                >
                                  Ver
                                </Link>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-ink/55">
                            Todavia no hay bajadas de precio registradas para esta alerta.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Todavia no has programado notificaciones"
          description="Usa el formulario de arriba para guardar un radar de compra o alquiler con los criterios que te importan."
        />
      )}
    </section>
  );
}
