"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Eye,
  Heart,
  MessageCircleMore,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  TriangleAlert
} from "lucide-react";
import { addFavorite, getFavorites, getPropertyBySlug, removeFavorite } from "@/lib/api";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { ContactLeadForm } from "@/components/forms/ContactLeadForm";
import { OfferForm } from "@/components/forms/OfferForm";
import { MapLoadingShell } from "@/components/map/MapLoadingShell";
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

const PropertyMapPreview = dynamic(
  () =>
    import("@/components/map/PropertyMapPreview").then((module) => ({
      default: module.PropertyMapPreview
    })),
  {
    ssr: false,
    loading: () => <MapLoadingShell minHeight={280} label="Cargando mapa de ubicacion..." />
  }
);

const sellerRoleLabels = {
  owner: "Propietario",
  "sales-agent": "Agente de ventas",
  advisor: "Asesor inmobiliario",
  broker: "Broker",
  developer: "Desarrollador",
  "property-manager": "Administrador de propiedades"
};

const hasValue = (value) => value !== undefined && value !== null && value !== "";

function DetailMetaItem({ label, value }) {
  if (!hasValue(value)) {
    return null;
  }

  return (
    <div className="rounded-[20px] border border-ink/10 bg-mist/70 p-3.5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/42">
        {label}
      </div>
      <div className="mt-1.5 text-sm font-semibold leading-6 text-ink">{value}</div>
    </div>
  );
}

function DetailDisclosure({ title, subtitle, defaultOpen = false, children }) {
  return (
    <details className="surface overflow-hidden" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div>
          <div className="text-lg font-semibold text-ink">{title}</div>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-ink/58">{subtitle}</p> : null}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink/45" />
      </summary>
      <div className="border-t border-ink/8 px-5 py-5 sm:px-6">{children}</div>
    </details>
  );
}

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

  useEffect(() => {
    if (!property?._id) {
      return;
    }

    trackEvent(analyticsEvents.propertyViewed, {
      propertyId: property._id,
      slug: property.slug,
      businessType: property.businessType,
      propertyType: property.propertyType,
      province: property.address?.province,
      canton: property.address?.canton,
      district: property.address?.district
    });
  }, [
    property?._id,
    property?.slug,
    property?.businessType,
    property?.propertyType,
    property?.address?.province,
    property?.address?.canton,
    property?.address?.district
  ]);

  const handleFavorite = async () => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (favorite) {
      await removeFavorite(property._id);
      setFavorite(false);
      trackEvent(analyticsEvents.favoriteRemoved, {
        propertyId: property._id,
        slug: property.slug,
        businessType: property.businessType,
        propertyType: property.propertyType
      });
      return;
    }

    await addFavorite(property._id);
    setFavorite(true);
    trackEvent(analyticsEvents.favoriteAdded, {
      propertyId: property._id,
      slug: property.slug,
      businessType: property.businessType,
      propertyType: property.propertyType
    });
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
  const images = property.media?.filter((item) => item.type === "image") || property.photos || [];
  const isRoommateListing = property.rentalArrangement === "roommate";
  const canReceiveOffers = property.marketStatus === "available";
  const trustProfile = property.trustProfile || { badges: [] };
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
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${property.location.coordinates[1]},${property.location.coordinates[0]}`;
  const descriptionText =
    property.description?.trim() || "El anunciante no agrego una descripcion detallada.";
  const normalizedDescription = descriptionText.replace(/\s+/g, " ").trim();
  const showFullDescription = normalizedDescription.length > 260 || descriptionText.includes("\n");
  const descriptionPreview = showFullDescription
    ? `${normalizedDescription.slice(0, 260).trim()}...`
    : descriptionText;
  const quickFacts = [
    isRoommateListing
      ? `${property.roommateDetails?.availableRooms || property.bedrooms || 1} cuarto disponible`
      : `${property.bedrooms || 0} habitaciones`,
    isRoommateListing && property.roommateDetails?.privateBathroom
      ? "Bano privado"
      : `${property.bathrooms || 0} banos`,
    `${property.parkingSpaces || 0} parqueos`,
    formatArea(property.constructionArea || property.lotArea || 0),
    `${images.length} ${images.length === 1 ? "imagen" : "imagenes"}`,
    videos.length ? `${videos.length} ${videos.length === 1 ? "video" : "videos"}` : null
  ].filter(Boolean);
  const technicalDetails = [
    { label: "Negocio", value: formatBusinessType(property.businessType) },
    { label: "Tipo", value: formatPropertyType(property.propertyType) },
    { label: "Estado", value: formatMarketStatus(property.marketStatus) },
    {
      label: "Modalidad",
      value:
        property.businessType === "rent" ? formatRentalArrangement(property.rentalArrangement) : null
    },
    {
      label: isRoommateListing ? "Cuartos disponibles" : "Habitaciones",
      value: isRoommateListing
        ? property.roommateDetails?.availableRooms || property.bedrooms || 1
        : property.bedrooms || 0
    },
    {
      label: "Banos",
      value:
        isRoommateListing && property.roommateDetails?.privateBathroom
          ? "Privado"
          : property.bathrooms || 0
    },
    { label: "Parqueos", value: property.parkingSpaces || 0 },
    {
      label: "Construccion",
      value: property.constructionArea ? formatArea(property.constructionArea) : null
    },
    { label: "Lote", value: property.lotArea ? formatArea(property.lotArea) : null },
    { label: "Provincia", value: property.address?.province },
    { label: "Canton", value: property.address?.canton },
    { label: "Distrito", value: property.address?.district },
    { label: "Barrio", value: property.address?.neighborhood },
    {
      label: "Ubicacion exacta",
      value: property.address?.hideExactLocation
        ? "Protegida por el anunciante"
        : property.address?.exactAddress || property.addressText
    },
    {
      label: "Precio final",
      value: property.finalPrice ? formatCurrency(property.finalPrice, property.currency) : null
    }
  ].filter((item) => hasValue(item.value));
  const conditionPills = [
    property.furnished !== undefined ? `Amueblado: ${formatYesNo(property.furnished)}` : null,
    property.businessType === "rent"
      ? `Acepta mascotas: ${formatYesNo(property.petsAllowed)}`
      : null,
    property.businessType === "rent"
      ? `Requiere deposito: ${formatYesNo(property.depositRequired)}`
      : null,
    property.featured ? "Publicacion destacada" : null,
    trustProfile.level === "high" ? "Perfil verificado" : null
  ].filter(Boolean);
  const roommatePills = isRoommateListing
    ? [
        property.roommateDetails?.privateRoom ? "Cuarto privado" : "Cuarto compartido",
        property.roommateDetails?.privateBathroom ? "Bano privado" : "Bano compartido",
        property.roommateDetails?.utilitiesIncluded ? "Servicios incluidos" : "Servicios aparte",
        property.roommateDetails?.studentFriendly ? "Ideal para estudiantes" : "Uso general",
        `Actuales: ${property.roommateDetails?.currentRoommates || 0}`,
        `Maximo: ${property.roommateDetails?.maxRoommates || 0}`,
        `Preferencia: ${formatRoommateGenderPreference(
          property.roommateDetails?.genderPreference || "any"
        )}`,
        ...(property.roommateDetails?.sharedAreas || [])
      ]
    : [];
  const decisionHasContent =
    Boolean(decisionSummary.idealFor?.length) ||
    Boolean(decisionSummary.highlights?.length) ||
    Boolean(decisionSummary.considerations?.length);

  return (
    <div className="app-shell section-pad">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_360px] xl:items-start">
        <div className="space-y-5">
          <section className="surface p-5 sm:p-6">
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

            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h1 className="max-w-4xl font-serif text-[1.8rem] font-semibold leading-tight sm:text-[2.2rem] lg:text-[2.7rem]">
                  {property.title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-ink/60 sm:text-[15px]">
                  {formatLocation(property)}
                </p>
              </div>

              <div className="min-w-[220px] rounded-[24px] border border-ink/10 bg-mist/75 p-4 sm:p-5">
                <div className="text-[1.75rem] font-semibold leading-none text-ink sm:text-[2rem]">
                  {formatCurrency(property.price, property.currency)}
                </div>
                {property.finalPrice ? (
                  <div className="mt-2 text-sm leading-6 text-ink/55">
                    Precio final: {formatCurrency(property.finalPrice, property.currency)}
                  </div>
                ) : null}
                <div className="mt-2 text-sm text-ink/55">Publicado por {seller.name}</div>
                {sellerRoleLabel ? <div className="mt-1 text-sm text-ink/50">{sellerRoleLabel}</div> : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {quickFacts.map((fact) => (
                <span key={fact} className="data-pill">
                  {fact}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant={favorite ? "accent" : "secondary"}
                onClick={handleFavorite}
                className="min-w-[150px]"
              >
                <Heart className={`mr-2 h-4 w-4 ${favorite ? "fill-current" : ""}`} />
                {favorite ? "Guardada" : "Guardar"}
              </Button>
              <Link href="/search" className="block">
                <Button variant="ghost">Volver a buscar</Button>
              </Link>
            </div>
          </section>

          <PropertyGallery
            media={property.media}
            photos={property.photos}
            title={property.title}
            compact
          />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section className="surface p-5 sm:p-6">
              <div className="text-lg font-semibold text-ink">Descripcion</div>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/70">
                {descriptionPreview}
              </p>
              {showFullDescription ? (
                <details className="mt-4 rounded-[22px] border border-ink/10 bg-mist/55">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-lagoon">
                    Ver descripcion completa
                  </summary>
                  <div className="border-t border-ink/8 px-4 py-4 text-sm leading-7 text-ink/68">
                    <p className="whitespace-pre-line">{descriptionText}</p>
                  </div>
                </details>
              ) : null}
            </section>

            <section className="surface p-5 sm:p-6">
              <div className="text-lg font-semibold text-ink">Ficha tecnica</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {technicalDetails.map((item) => (
                  <DetailMetaItem
                    key={`${item.label}-${item.value}`}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </section>
          </div>

          {property.amenities?.length || conditionPills.length || roommatePills.length || serviceDistanceItems.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="surface p-5 sm:p-6">
                <div className="text-lg font-semibold text-ink">Detalles y amenidades</div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {property.amenities?.length ? (
                    property.amenities.map((amenity) => (
                      <span key={amenity} className="data-pill">
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-ink/55">Sin amenidades adicionales registradas.</span>
                  )}
                  {conditionPills.map((item) => (
                    <span key={item} className="data-pill">
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              {(roommatePills.length || serviceDistanceItems.length) ? (
                <section className="surface p-5 sm:p-6">
                  <div className="text-lg font-semibold text-ink">
                    {isRoommateListing ? "Convivencia y entorno" : "Entorno cercano"}
                  </div>
                  {roommatePills.length ? (
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {roommatePills.map((item) => (
                        <span key={item} className="data-pill">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {serviceDistanceItems.length ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {serviceDistanceItems.map((service) => (
                        <div key={service.label} className="rounded-[20px] border border-ink/10 bg-mist/70 p-3.5">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/42">
                            {service.label}
                          </div>
                          <div className="mt-1.5 text-sm font-semibold text-ink">{service.value} km</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>
          ) : null}

          {decisionHasContent ? (
            <DetailDisclosure
              title="Lectura rapida"
              subtitle="Una sintesis para decidir mas rapido, sin inflar la pagina principal."
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-[22px] border border-pine/15 bg-pine/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-pine">
                    <Sparkles className="h-4 w-4" />
                    Ideal para
                  </div>
                  <div className="mt-3 space-y-2.5 text-sm leading-6 text-ink/68">
                    {decisionSummary.idealFor?.length ? (
                      decisionSummary.idealFor.map((item) => (
                        <div key={item} className="flex gap-2.5">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-pine" />
                          <span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <p>Sin perfil objetivo definido todavia.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[22px] border border-lagoon/15 bg-lagoon/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-lagoon">
                    <ShieldCheck className="h-4 w-4" />
                    Puntos a favor
                  </div>
                  <div className="mt-3 space-y-2.5 text-sm leading-6 text-ink/68">
                    {decisionSummary.highlights?.length ? (
                      decisionSummary.highlights.map((item) => (
                        <div key={item} className="flex gap-2.5">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-lagoon" />
                          <span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <p>Sin destacados adicionales calculados.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[22px] border border-terracotta/15 bg-terracotta/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-terracotta">
                    <TriangleAlert className="h-4 w-4" />
                    Antes de decidir
                  </div>
                  <div className="mt-3 space-y-2.5 text-sm leading-6 text-ink/68">
                    {decisionSummary.considerations?.length ? (
                      decisionSummary.considerations.map((item) => (
                        <div key={item} className="flex gap-2.5">
                          <TriangleAlert className="mt-1 h-4 w-4 shrink-0 text-terracotta" />
                          <span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <p>No hay alertas relevantes registradas.</p>
                    )}
                  </div>
                </div>
              </div>
            </DetailDisclosure>
          ) : null}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className="surface space-y-4 p-5 sm:p-6">
            <div>
              <div className="text-lg font-semibold text-ink">Anunciante</div>
              <p className="mt-1 text-sm leading-6 text-ink/58">
                Contacto directo y accesos rapidos desde una sola columna.
              </p>
            </div>

            <div className="rounded-[22px] border border-ink/10 bg-mist/75 p-4">
              <div className="text-base font-semibold text-ink">{seller.name}</div>
              {sellerRoleLabel ? <div className="mt-1 text-sm text-ink/55">{sellerRoleLabel}</div> : null}
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
          </section>

          <PropertyMapPreview property={property} />

          {canReceiveOffers ? (
            <DetailDisclosure
              title={property.businessType === "rent" ? "Proponer renta" : "Enviar oferta"}
              subtitle={`Precio publicado: ${formatCurrency(property.price, property.currency)}`}
            >
              <OfferForm
                propertyId={property._id}
                propertyTitle={property.title}
                propertySlug={property.slug}
                propertyType={property.propertyType}
                businessType={property.businessType}
                currency={property.currency}
                askingPrice={property.price}
                embedded
              />
            </DetailDisclosure>
          ) : null}

          <DetailDisclosure
            title="Contactar anunciante"
            subtitle="Haz la consulta solo cuando estes listo para avanzar."
          >
            <ContactLeadForm
              propertyId={property._id}
              propertyTitle={property.title}
              propertySlug={property.slug}
              businessType={property.businessType}
              propertyType={property.propertyType}
              embedded
            />
          </DetailDisclosure>
        </aside>
      </div>
    </div>
  );
}
