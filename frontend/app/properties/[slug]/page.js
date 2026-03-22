"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircleMore, PhoneCall } from "lucide-react";
import { addFavorite, getFavorites, getPropertyBySlug, removeFavorite } from "@/lib/api";
import { ContactLeadForm } from "@/components/forms/ContactLeadForm";
import { PropertyMapPreview } from "@/components/map/PropertyMapPreview";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  formatBusinessType,
  formatCurrency,
  formatLocation,
  formatPhoneForWhatsApp,
  formatPropertyType
} from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

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

  const whatsappLink = property.owner?.phone
    ? `https://wa.me/${formatPhoneForWhatsApp(property.owner.phone)}?text=${encodeURIComponent(
        `Hola, me interesa la propiedad ${property.title}`
      )}`
    : null;

  return (
    <div className="app-shell section-pad space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="accent">{formatBusinessType(property.businessType)}</Badge>
            <Badge>{formatPropertyType(property.propertyType)}</Badge>
            {property.featured ? <Badge variant="info">Destacada</Badge> : null}
          </div>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold">{property.title}</h1>
          <p className="mt-3 text-base text-ink/60">{formatLocation(property)}</p>
        </div>

        <div className="surface min-w-[280px] p-5">
          <div className="text-3xl font-semibold">{formatCurrency(property.price, property.currency)}</div>
          <div className="mt-2 text-sm text-ink/55">Publicado por {property.owner?.name}</div>
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

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="surface p-6">
            <h2 className="text-2xl font-semibold">Resumen</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <span className="data-pill">{property.bedrooms || 0} habitaciones</span>
              <span className="data-pill">{property.bathrooms || 0} banos</span>
              <span className="data-pill">{property.parkingSpaces || 0} parqueos</span>
              <span className="data-pill">{property.constructionArea || property.lotArea || 0} m²</span>
            </div>
            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-ink/70">
              {property.description}
            </p>
          </div>

          <div className="surface p-6">
            <h2 className="text-2xl font-semibold">Amenidades y detalles</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {property.amenities?.length ? (
                property.amenities.map((amenity) => <span key={amenity} className="data-pill">{amenity}</span>)
              ) : (
                <span className="text-sm text-ink/55">Sin amenidades adicionales registradas.</span>
              )}
            </div>
          </div>

          <PropertyMapPreview property={property} />
        </div>

        <div className="space-y-6">
          <div className="surface space-y-4 p-6">
            <h2 className="text-2xl font-semibold">Anunciante</h2>
            <p className="text-sm text-ink/70">{property.owner?.name}</p>
            {property.owner?.phone ? (
              <a
                href={`tel:${property.owner.phone}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-lagoon"
              >
                <PhoneCall className="h-4 w-4" />
                {property.owner.phone}
              </a>
            ) : null}
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-2xl bg-pine px-4 py-3 text-sm font-semibold text-white"
                rel="noreferrer"
              >
                <MessageCircleMore className="h-4 w-4" />
                Contactar por WhatsApp
              </a>
            ) : null}
          </div>

          <ContactLeadForm propertyId={property._id} />
        </div>
      </div>
    </div>
  );
}

