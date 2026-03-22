"use client";

import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Car, Heart, MapPin, Square } from "lucide-react";
import { addFavorite, removeFavorite } from "@/lib/api";
import {
  formatBusinessType,
  formatCurrency,
  formatLocation,
  formatPropertyType,
  getMainPhoto
} from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Badge } from "../ui/Badge";

export function PropertyCard({
  property,
  isFavorite = false,
  selected = false,
  onSelected,
  onFavoriteChange
}) {
  const { token } = useAuthStore();
  const mainPhoto = getMainPhoto(property);

  const toggleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (isFavorite) {
      await removeFavorite(property._id);
      onFavoriteChange?.(property._id, false);
      return;
    }

    await addFavorite(property._id);
    onFavoriteChange?.(property._id, true);
  };

  return (
    <Link
      href={`/properties/${property.slug}`}
      onMouseEnter={() => onSelected?.(property._id)}
      className={`surface group block overflow-hidden transition ${
        selected ? "ring-2 ring-terracotta/40" : "hover:-translate-y-1"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={mainPhoto?.url || "https://placehold.co/1200x900/png?text=Casa+CR"}
          alt={mainPhoto?.alt || property.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge variant="accent">{formatBusinessType(property.businessType)}</Badge>
          {property.featured ? <Badge variant="info">Destacada</Badge> : null}
        </div>
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute right-4 top-4 rounded-full bg-white/90 p-3 shadow-soft"
          aria-label="Guardar en favoritos"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-terracotta text-terracotta" : ""}`} />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">{formatCurrency(property.price, property.currency)}</div>
            <h3 className="mt-2 text-lg font-semibold leading-snug">{property.title}</h3>
          </div>
          <span className="text-sm text-ink/45">{formatPropertyType(property.propertyType)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-ink/60">
          <MapPin className="h-4 w-4" />
          <span>{formatLocation(property)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-ink/70 sm:grid-cols-4">
          <span className="data-pill">
            <BedDouble className="h-4 w-4" />
            {property.bedrooms || 0}
          </span>
          <span className="data-pill">
            <Bath className="h-4 w-4" />
            {property.bathrooms || 0}
          </span>
          <span className="data-pill">
            <Car className="h-4 w-4" />
            {property.parkingSpaces || 0}
          </span>
          <span className="data-pill">
            <Square className="h-4 w-4" />
            {property.constructionArea || property.lotArea || 0} m²
          </span>
        </div>
      </div>
    </Link>
  );
}

