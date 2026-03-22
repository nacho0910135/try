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
  TriangleAlert
} from "lucide-react";
import { addFavorite, getFavorites, getPropertyBySlug, removeFavorite } from "@/lib/api";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
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
  }, [property?._id, property?.slug]);

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

  return (
    <div className="app-shell section-pad space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
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
          <h1 className="mt-4 max-w-4xl font-serif text-[2.2rem] font-semibold leading-tight sm:mt-5 sm:text-4xl lg:text-5xl">
            {property.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink/60 sm:text-base">{formatLocation(property)}</p>
        </div>

        <div className="surface w-full min-w-0 p-4 sm:p-5 lg:max-w-[380px]">
          <div className="text-2xl font-semibold sm:text-3xl">
            {formatCurrency(property.price, property.currency)}
          </div>
          {property.finalPrice ? (
            <div className="mt-2 text-sm leading-6 text-ink/55">
              Precio final registrado: {formatCurrency(property.finalPrice, property.currency)}
            </div>
          ) : null}
          <div className="mt-2 text-sm text-ink/55">Publicado por {seller.name}</div>
          {sellerRoleLabel ? <div className="mt-1 text-sm text-ink/55">{sellerRoleLabel}</div> : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button
              variant={favorite ? "accent" : "secondary"}
              onClick={handleFavorite}
              className="w-full"
            >
              <Heart className={`mr-2 h-4 w-4 ${favorite ? "fill-current" : ""}`} />
              {favorite ? "Guardada" : "Guardar"}
            </Button>
            <Link href="/search" className="block">
              <Button variant="ghost" className="w-full">Volver a buscar</Button>
            </Link>
          </div>
        </div>
      </div>

      <PropertyGallery media={property.media} photos={property.photos} title={property.title} />

      <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <div className="surface p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">Resumen</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <span className="data-pill">
                {isRoommateListing
                  ? `${property.roommateDetails?.availableRooms || 1} cuarto disponible`
                  : `${property.bedrooms || 0} habitaciones`}
              </span>
              <span className="data-pill">
                {isRoommateListing && property.roommateDetails?.privateBathroom
                  ? "Ba\u00f1o privado"
                  : `${property.bathrooms || 0} ba\u00f1os`}
              </span>
              <span className="data-pill">{property.parkingSpaces || 0} parqueos</span>
              <span className="data-pill">
                {formatArea(property.constructionArea || property.lotArea || 0)}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="data-pill">
                {images.length} {images.length === 1 ? "imagen" : "imagenes"}
              </span>
              <span className="data-pill">
                {videos.length} {videos.length === 1 ? "video" : "videos"}
              </span>
              {property.media?.some((item) => item.isPrimary) ? (
                <span className="data-pill">Portada multimedia configurada</span>
              ) : null}
            </div>
            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-ink/70">
              {property.description}
            </p>
          </div>

          <div className="surface p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">Lectura rapida para decidir</h2>
            <p className="mt-2 text-sm text-ink/60">
              Un resumen pensado para comprador o inquilino: donde encaja mejor esta propiedad y que conviene revisar antes de avanzar.
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-3 lg:gap-5">
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

          <div className="surface p-5 sm:p-6">
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
            <div className="surface p-5 sm:p-6">
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
            <div className="surface p-5 sm:p-6">
              <h2 className="text-2xl font-semibold">Detalles para roomies</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <span className="data-pill">
                  {property.roommateDetails?.privateRoom ? "Cuarto privado" : "Cuarto compartido"}
                </span>
                <span className="data-pill">
                  {property.roommateDetails?.privateBathroom
                    ? "Ba\u00f1o privado"
                    : "Ba\u00f1o compartido"}
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

          {serviceDistanceItems.length ? (
            <div className="surface p-5 sm:p-6">
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
          <div className="surface space-y-5 p-5 sm:p-7">
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
              propertyTitle={property.title}
              propertySlug={property.slug}
              propertyType={property.propertyType}
              businessType={property.businessType}
              currency={property.currency}
              askingPrice={property.price}
            />
          ) : null}

          <ContactLeadForm
            propertyId={property._id}
            propertyTitle={property.title}
            propertySlug={property.slug}
            businessType={property.businessType}
            propertyType={property.propertyType}
          />
        </div>
      </div>
    </div>
  );
}
