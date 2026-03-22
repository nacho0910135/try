"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Heart, MessageCircleMore, PhoneCall } from "lucide-react";
import { addFavorite, getFavorites, getPropertyBySlug, removeFavorite } from "@/lib/api";
import { ContactLeadForm } from "@/components/forms/ContactLeadForm";
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
  const [message, setMessage] = useState("");

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
          </div>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold">{property.title}</h1>
          <p className="mt-3 text-base text-ink/60">{formatLocation(property)}</p>
        </div>

        <div className="surface min-w-[280px] p-5">
          <div className="text-3xl font-semibold">{formatCurrency(property.price, property.currency)}</div>
          {property.finalPrice ? (
            <div className="mt-2 text-sm text-ink/55">
              Precio final registrado: {formatCurrency(property.finalPrice, property.currency)}
            </div>
          ) : null}
          <div className="mt-2 text-sm text-ink/55">Publicado por {seller.name}</div>
          {sellerRoleLabel ? (
            <div className="mt-1 text-sm text-ink/55">{sellerRoleLabel}</div>
          ) : null}
          <div className="mt-5 flex gap-3">
            <Button variant={favorite ? "accent" : "secondary"} onClick={handleFavorite}>
              <Heart className={`mr-2 h-4 w-4 ${favorite ? "fill-current" : ""}`} />
              {favorite ? "Guardada" : "Guardar"}
            </Button>
            <Link href="/search">
              <Button variant="ghost">Volver a buscar</Button>
            </Link>
          </div>
          {message ? <p className="mt-3 text-sm text-ink/60">{message}</p> : null}
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
                  ? "Bano privado"
                  : `${property.bathrooms || 0} banos`}
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
                  {property.roommateDetails?.privateBathroom ? "Bano privado" : "Bano compartido"}
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
                  <div
                    key={service.label}
                    className="rounded-[24px] bg-mist p-4"
                  >
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/45">
                      {service.label}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-ink">
                      {service.value} km
                    </div>
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

          <ContactLeadForm propertyId={property._id} />
        </div>
      </div>
    </div>
  );
}
