"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  Heart,
  MessageCircleMore,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert
} from "lucide-react";
import { addFavorite, getFavorites, getPropertyBySlug, removeFavorite } from "@/lib/api";
import { MiniLineChart } from "@/components/analysis/VisualCharts";
import { ContactLeadForm } from "@/components/forms/ContactLeadForm";
import { OfferForm } from "@/components/forms/OfferForm";
import { PropertyMapPreview } from "@/components/map/PropertyMapPreview";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  formatArea,
  formatBusinessType,
  formatCurrency,
  formatLocation,
  formatMarketStatus,
  formatPhoneForWhatsApp,
  formatPropertyType,
  formatRentalArrangement,
  formatRoommateGenderPreference,
  formatYesNo
} from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const sellerRoleLabels = {
  owner: "Propietario",
  "sales-agent": "Agente de ventas",
  advisor: "Asesor inmobiliario",
  broker: "Broker",
  developer: "Desarrollador",
  "property-manager": "Administrador de propiedades"
};

export default function PropertyDetailPage({ params }) {
  const { token } = useAuthStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const data = await getPropertyBySlug(params.slug);
        setProperty(data.property);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [params.slug]);

  useEffect(() => {
    if (!token || !property?._id) return;

    const loadFavorites = async () => {
      const data = await getFavorites();
      setFavorite(data.items.some((item) => item.property?._id === property._id));
    };

    loadFavorites();
  }, [token, property?._id]);

  const handleFavorite = async () => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (favorite) {
      await removeFavorite(property._id);
      setFavorite(false);
      return;
    }

    await addFavorite(property._id);
    setFavorite(true);
  };

  if (loading) {
    return (
      <div className="app-shell section-pad">
        <LoadingState label="Cargando detalle..." />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="app-shell section-pad">
        <p className="rounded-2xl bg-white p-6 text-sm text-ink/70">
          La propiedad no esta disponible.
        </p>
      </div>
    );
  }

  const seller = property.sellerInfo || property.owner || {};
  const sellerRoleLabel = sellerRoleLabels[seller.role] || seller.role;
  const whatsappLink = seller.phone
    ? `https://wa.me/${formatPhoneForWhatsApp(seller.phone)}?text=${encodeURIComponent(
        `Hola, me interesa la propiedad ${property.title}`
      )}`
    : null;
  const videos = property.media?.filter((item) => item.type === "video") || [];
  const isRoommateListing = property.rentalArrangement === "roommate";
  const canReceiveOffers = property.marketStatus === "available";
  const trustProfile = property.trustProfile || { badges: [] };
  const pricingInsight = property.pricingInsight || {};
  const decisionSummary = property.decisionSummary || {};
  const serviceDistanceItems = [
    {
      label: "Hospital mas cercano",
      value: property.serviceDistances?.hospitalKm ?? property.nearestHospital?.distanceKm
    },
    {
      label: "Escuela mas cercana",
      value: property.serviceDistances?.schoolKm ?? property.nearestSchool?.distanceKm
    },
    {
      label: "Colegio mas cercano",
      value: property.serviceDistances?.highSchoolKm ?? property.nearestHighSchool?.distanceKm
    }
  ]
    .map((item) => ({
      ...item,
      value: Number(item.value)
    }))
    .filter((item) => Number.isFinite(item.value));
  const priceHistorySeries = (pricingInsight.priceHistorySeries || []).map((item) => ({
    label: new Date(item.changedAt).toLocaleDateString("es-CR", {
      month: "short",
      day: "2-digit"
    }),
    value: Number(item.value || 0)
  }));
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${property.location.coordinates[1]},${property.location.coordinates[0]}`;
  const trustLevelLabel =
    trustProfile.level === "high"
      ? "Confianza alta"
      : trustProfile.level === "solid"
        ? "Confianza solida"
        : "Base por reforzar";
  const trustToneClass =
    trustProfile.level === "high"
      ? "bg-pine/10 text-pine"
      : trustProfile.level === "solid"
        ? "bg-lagoon/10 text-lagoon"
        : "bg-terracotta/10 text-terracotta";
  const marketToneClass =
    pricingInsight.marketScoreLevel === "opportunity"
      ? "bg-pine/10 text-pine"
      : pricingInsight.marketScoreLevel === "balanced"
        ? "bg-lagoon/10 text-lagoon"
        : pricingInsight.marketScoreLevel === "premium"
          ? "bg-terracotta/10 text-terracotta"
          : "bg-mist text-ink/70";
  const priceChangeToneClass =
    pricingInsight.direction === "down"
      ? "text-pine"
      : pricingInsight.direction === "up"
        ? "text-terracotta"
        : "text-ink/55";

  return (
    <div className="app-shell section-pad space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="accent">{formatBusinessType(property.businessType)}</Badge>
            <Badge>{formatPropertyType(property.propertyType)}</Badge>
            {isRoommateListing ? (
              <Badge variant="success">{formatRentalArrangement(property.rentalArrangement)}</Badge>
            ) : null}
            <Badge variant="info">{formatMarketStatus(property.marketStatus)}</Badge>
            {property.featured ? <Badge variant="info">Destacada</Badge> : null}
            {trustProfile.level === "high" ? <Badge variant="success">Verificada</Badge> : null}
          </div>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold">{property.title}</h1>
          <p className="mt-3 text-base text-ink/60">{formatLocation(property)}</p>
        </div>

        <div className="surface min-w-[300px] p-5">
          <div className="text-3xl font-semibold">{formatCurrency(property.price, property.currency)}</div>
          {property.finalPrice ? (
            <div className="mt-2 text-sm text-ink/55">
              Precio final registrado: {formatCurrency(property.finalPrice, property.currency)}
            </div>
          ) : null}
          <div className="mt-2 text-sm text-ink/55">Publicado por {seller.name}</div>
          {sellerRoleLabel ? <div className="mt-1 text-sm text-ink/55">{sellerRoleLabel}</div> : null}
          <div className="mt-5 flex gap-3">
            <Button variant={favorite ? "accent" : "secondary"} onClick={handleFavorite}>
              <Heart className={`mr-2 h-4 w-4 ${favorite ? "fill-current" : ""}`} />
              {favorite ? "Guardada" : "Guardar"}
            </Button>
            <Link href="/search">
              <Button variant="ghost">Volver a buscar</Button>
            </Link>
          </div>
        </div>
      </div>

      <PropertyGallery photos={property.photos} title={property.title} />

      <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <div className="surface p-6">
            <h2 className="text-2xl font-semibold">Resumen</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <span className="data-pill">
                {isRoommateListing
                  ? `${property.roommateDetails?.availableRooms || 1} cuarto disponible`
                  : `${property.bedrooms || 0} habitaciones`}
              </span>
              <span className="data-pill">
                {isRoommateListing && property.roommateDetails?.privateBathroom
                  ? "Baño privado"
                  : `${property.bathrooms || 0} baños`}
              </span>
              <span className="data-pill">{property.parkingSpaces || 0} parqueos</span>
              <span className="data-pill">
                {formatArea(property.constructionArea || property.lotArea || 0)}
              </span>
            </div>
            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-ink/70">
              {property.description}
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="surface p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-pine">
                    <ShieldCheck className="h-4 w-4" />
                    Confianza del anuncio
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold">Senales para decidir con mas seguridad</h2>
                </div>
                <div className={`rounded-full px-4 py-2 text-sm font-semibold ${trustToneClass}`}>
                  {trustLevelLabel}
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[28px] bg-mist p-5 text-center">
                  <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Trust score</div>
                  <div className="mt-3 text-5xl font-semibold text-ink">{trustProfile.score || 0}</div>
                  <div className="mt-2 text-sm text-ink/60">{trustProfile.summary}</div>
                </div>
                <div className="space-y-3">
                  {trustProfile.badges?.length ? (
                    trustProfile.badges.map((badge) => (
                      <div
                        key={badge.key}
                        className="rounded-[20px] border border-ink/10 bg-white px-4 py-3 text-sm text-ink/70"
                      >
                        <Badge variant={badge.tone || "neutral"}>{badge.label}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[20px] border border-ink/10 bg-white px-4 py-3 text-sm text-ink/60">
                      Aun faltan senales suficientes para reforzar la confianza del anuncio.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="surface p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-lagoon">
                <TrendingUp className="h-4 w-4" />
                Inteligencia de precio
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">Como se ve esta propiedad frente al mercado</h2>
                <div className={`rounded-full px-4 py-2 text-sm font-semibold ${marketToneClass}`}>
                  {pricingInsight.marketScoreLabel || "Sin comparables suficientes"}
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-mist p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Dias en mercado</div>
                  <div className="mt-2 text-2xl font-semibold text-ink">
                    {pricingInsight.daysToClose ?? pricingInsight.daysOnMarket ?? "-"}
                  </div>
                </div>
                <div className="rounded-[22px] bg-mist p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Precio por m2</div>
                  <div className="mt-2 text-2xl font-semibold text-ink">
                    {pricingInsight.pricePerSquareMeter
                      ? `${formatCurrency(pricingInsight.pricePerSquareMeter, property.currency)} / m2`
                      : "-"}
                  </div>
                </div>
                <div className="rounded-[22px] bg-mist p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Cambio reciente</div>
                  <div className={`mt-2 text-2xl font-semibold ${priceChangeToneClass}`}>
                    {pricingInsight.previousPrice
                      ? `${pricingInsight.changeAmount > 0 ? "+" : ""}${formatCurrency(
                          pricingInsight.changeAmount,
                          property.currency
                        )}`
                      : "Sin cambios"}
                  </div>
                  {pricingInsight.previousPrice ? (
                    <div className="mt-1 text-sm text-ink/55">{pricingInsight.changePct}% vs. ajuste anterior</div>
                  ) : null}
                </div>
                <div className="rounded-[22px] bg-mist p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Rango sugerido</div>
                  <div className="mt-2 text-sm font-semibold text-ink">
                    {pricingInsight.suggestedPriceMin && pricingInsight.suggestedPriceMax
                      ? `${formatCurrency(pricingInsight.suggestedPriceMin, property.currency)} - ${formatCurrency(
                          pricingInsight.suggestedPriceMax,
                          property.currency
                        )}`
                      : "Aun no hay rango sugerido"}
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink/45">
                  Historial reciente de precio
                </div>
                <MiniLineChart
                  series={priceHistorySeries}
                  stroke="#0f4ea9"
                  fill="rgba(15, 78, 169, 0.12)"
                  emptyLabel="Aun no hay suficiente historial de precio"
                />
              </div>
            </div>
          </div>

          <div className="surface p-6">
            <h2 className="text-2xl font-semibold">Lectura rapida para decidir</h2>
            <p className="mt-2 text-sm text-ink/60">
              Un resumen pensado para comprador o inquilino: donde encaja mejor esta propiedad y que conviene revisar antes de avanzar.
            </p>
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <div className="rounded-[24px] border border-pine/15 bg-pine/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-pine">
                  <Sparkles className="h-4 w-4" />
                  Ideal para
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                  {decisionSummary.idealFor?.length ? (
                    decisionSummary.idealFor.map((item) => (
                      <div key={item} className="flex gap-3">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-pine" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p>Aun no hay un perfil claro calculado para esta publicacion.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-lagoon/15 bg-lagoon/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-lagoon">
                  <ShieldCheck className="h-4 w-4" />
                  Puntos a favor
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                  {decisionSummary.highlights?.length ? (
                    decisionSummary.highlights.map((item) => (
                      <div key={item} className="flex gap-3">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-lagoon" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p>Sin destacados especiales registrados todavia.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-terracotta/15 bg-terracotta/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-terracotta">
                  <TriangleAlert className="h-4 w-4" />
                  Antes de decidir
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                  {decisionSummary.considerations?.length ? (
                    decisionSummary.considerations.map((item) => (
                      <div key={item} className="flex gap-3">
                        <TriangleAlert className="mt-1 h-4 w-4 shrink-0 text-terracotta" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p>No se detectan alertas importantes con la informacion actual.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="surface p-6">
            <h2 className="text-2xl font-semibold">Amenidades y detalles</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {property.amenities?.length ? (
                property.amenities.map((amenity) => (
                  <span key={amenity} className="data-pill">
                    {amenity}
                  </span>
                ))
              ) : (
                <span className="text-sm text-ink/55">Sin amenidades adicionales registradas.</span>
              )}
            </div>
          </div>

          {property.businessType === "rent" ? (
            <div className="surface p-6">
              <h2 className="text-2xl font-semibold">Condiciones de alquiler</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <span className="data-pill">Acepta mascotas: {formatYesNo(property.petsAllowed)}</span>
                <span className="data-pill">
                  Requiere deposito: {formatYesNo(property.depositRequired)}
                </span>
              </div>
            </div>
          ) : null}

          {isRoommateListing ? (
            <div className="surface p-6">
              <h2 className="text-2xl font-semibold">Detalles para roomies</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <span className="data-pill">
                  {property.roommateDetails?.privateRoom ? "Cuarto privado" : "Cuarto compartido"}
                </span>
                <span className="data-pill">
                  {property.roommateDetails?.privateBathroom ? "Baño privado" : "Baño compartido"}
                </span>
                <span className="data-pill">
                  {property.roommateDetails?.utilitiesIncluded
                    ? "Servicios incluidos"
                    : "Servicios aparte"}
                </span>
                <span className="data-pill">
                  {property.roommateDetails?.studentFriendly ? "Ideal para estudiantes" : "General"}
                </span>
                <span className="data-pill">
                  {property.roommateDetails?.currentRoommates || 0} roomies actuales
                </span>
                <span className="data-pill">
                  Max {property.roommateDetails?.maxRoommates || 0} roomies
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="data-pill">
                  Preferencia:{" "}
                  {formatRoommateGenderPreference(property.roommateDetails?.genderPreference || "any")}
                </span>
                {(property.roommateDetails?.sharedAreas || []).map((area) => (
                  <span key={area} className="data-pill">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {videos.length ? (
            <div className="surface p-6">
              <h2 className="text-2xl font-semibold">Videos</h2>
              <div className="mt-5 grid gap-4">
                {videos.map((video) =>
                  video.url.endsWith(".mp4") ? (
                    <video
                      key={video.url}
                      src={video.url}
                      controls
                      className="w-full rounded-[24px] bg-black"
                    />
                  ) : (
                    <a
                      key={video.url}
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-[24px] border border-ink/10 bg-white p-4 text-sm font-semibold text-lagoon"
                    >
                      Abrir video
                    </a>
                  )
                )}
              </div>
            </div>
          ) : null}

          {serviceDistanceItems.length ? (
            <div className="surface p-6">
              <h2 className="text-2xl font-semibold">Servicios cercanos</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {serviceDistanceItems.map((service) => (
                  <div key={service.label} className="rounded-[24px] bg-mist p-4">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
                      {service.label}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-ink">{service.value} km</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <PropertyMapPreview property={property} />
        </div>

        <div className="space-y-6">
          <div className="surface space-y-5 p-7">
            <h2 className="text-2xl font-semibold">Anunciante</h2>
            <div className="rounded-[24px] bg-mist p-5">
              <p className="text-lg font-semibold text-ink">{seller.name}</p>
              {sellerRoleLabel ? <p className="mt-1 text-sm text-ink/55">{sellerRoleLabel}</p> : null}
              {property.owner?.verification?.status === "verified" ? (
                <div className="mt-3">
                  <Badge variant="success">Anunciante verificado</Badge>
                </div>
              ) : null}
            </div>
            {seller.phone ? (
              <a
                href={`tel:${seller.phone}`}
                className="inline-flex w-full items-center gap-2 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-lagoon"
              >
                <PhoneCall className="h-4 w-4" />
                {seller.phone}
              </a>
            ) : null}
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-pine px-4 py-3 text-sm font-semibold text-white"
                rel="noreferrer"
              >
                <MessageCircleMore className="h-4 w-4" />
                Contactar por WhatsApp
              </a>
            ) : null}
            {!property.address?.hideExactLocation ? (
              <a
                href={streetViewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-lagoon px-4 py-3 text-sm font-semibold text-white"
              >
                <Eye className="h-4 w-4" />
                Ver Street View
              </a>
            ) : null}
          </div>

          {canReceiveOffers ? (
            <OfferForm
              propertyId={property._id}
              businessType={property.businessType}
              currency={property.currency}
              askingPrice={property.price}
            />
          ) : null}

          <ContactLeadForm propertyId={property._id} />
        </div>
      </div>
    </div>
  );
}
