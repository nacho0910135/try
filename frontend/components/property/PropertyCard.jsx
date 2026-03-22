"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bath, BedDouble, Car, Heart, MapPin, ShieldCheck, Sparkles, Square, TimerReset } from "lucide-react";
import { addFavorite, removeFavorite } from "@/lib/api";
import { useLanguage } from "@/components/layout/LanguageProvider";
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getMainPhoto
} from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Badge } from "../ui/Badge";

const BUSINESS_LABELS = {
  sale: { es: "Venta", en: "Sale" },
  rent: { es: "Renta", en: "Rent" }
};

const TYPE_LABELS = {
  house: { es: "Casa", en: "House" },
  apartment: { es: "Apartamento", en: "Apartment" },
  condominium: { es: "Condominio", en: "Condominium" },
  lot: { es: "Lote / Terreno", en: "Lot / Land" },
  room: { es: "Habitacion", en: "Room" },
  commercial: { es: "Comercial", en: "Commercial" }
};

const MARKET_LABELS = {
  available: { es: "Disponible", en: "Available" },
  reserved: { es: "Reservada", en: "Reserved" },
  sold: { es: "Vendida", en: "Sold" },
  rented: { es: "Alquilada", en: "Rented" },
  inactive: { es: "Inactiva", en: "Inactive" }
};

const RENTAL_LABELS = {
  "full-property": { es: "Propiedad completa", en: "Full property" },
  roommate: { es: "Roomies / alquiler compartido", en: "Roommates / shared rental" }
};

export function PropertyCard({
  property,
  isFavorite = false,
  selected = false,
  onSelected,
  onFavoriteChange,
  compact = false
}) {
  const { token } = useAuthStore();
  const { language, t } = useLanguage();
  const mainPhoto = getMainPhoto(property);
  const fallbackSrc = "/property-placeholder.svg";
  const [favoriteState, setFavoriteState] = useState(isFavorite);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    setFavoriteState(isFavorite);
  }, [isFavorite]);

  const toggleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const nextState = !favoriteState;
    setFavoriteState(nextState);
    setFavoriteBusy(true);

    try {
      if (favoriteState) {
        await removeFavorite(property._id);
        onFavoriteChange?.(property._id, false);
      } else {
        await addFavorite(property._id);
        onFavoriteChange?.(property._id, true);
      }
    } catch (_error) {
      setFavoriteState(!nextState);
    } finally {
      setFavoriteBusy(false);
    }
  };

  const boolLabel = (value) => (value ? t("common.yes") : t("common.no"));
  const businessLabel = BUSINESS_LABELS[property.businessType]?.[language] || property.businessType;
  const typeLabel = TYPE_LABELS[property.propertyType]?.[language] || property.propertyType;
  const marketLabel =
    MARKET_LABELS[property.marketStatus]?.[language] || property.marketStatus;
  const rentalLabel =
    RENTAL_LABELS[property.rentalArrangement]?.[language] || property.rentalArrangement;
  const trustLabel =
    property.trustProfile?.level === "high"
      ? language === "en"
        ? "Verified"
        : "Verificada"
      : property.trustProfile?.level === "solid"
        ? language === "en"
          ? "Reliable"
          : "Confiable"
        : null;
  const priceSignalLabel =
    property.pricingInsight?.marketScore === "below-market"
      ? language === "en"
        ? "Opportunity"
        : "Oportunidad"
      : property.pricingInsight?.marketScore === "in-range"
        ? language === "en"
          ? "In range"
          : "En rango"
        : null;
  const daysOnMarket = property.pricingInsight?.daysOnMarket;

  return (
    <Link
      href={`/properties/${property.slug}`}
      onMouseEnter={() => onSelected?.(property._id)}
      className={`surface group block overflow-hidden transition ${
        selected ? "ring-2 ring-terracotta/40" : "hover:-translate-y-1"
      }`}
    >
      <div className={`relative overflow-hidden ${compact ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
        <img
          src={mainPhoto?.url || fallbackSrc}
          alt={mainPhoto?.alt || property.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackSrc;
          }}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant="accent">{businessLabel}</Badge>
          {property.rentalArrangement === "roommate" ? (
            <Badge variant="success">{rentalLabel}</Badge>
          ) : null}
          {property.marketStatus && property.marketStatus !== "available" ? (
            <Badge variant="info">{marketLabel}</Badge>
          ) : null}
          {property.featured ? <Badge variant="info">{t("propertyCard.featured")}</Badge> : null}
          {trustLabel ? <Badge variant="success">{trustLabel}</Badge> : null}
          {priceSignalLabel ? <Badge variant="accent">{priceSignalLabel}</Badge> : null}
        </div>
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={favoriteBusy}
          className={`absolute right-3 top-3 rounded-full shadow-soft transition ${
            favoriteState
              ? "bg-rose-50 text-rose-500 ring-2 ring-rose-200"
              : "bg-white/90 text-ink hover:bg-white"
          } ${compact ? "p-2" : "p-2.5"}`}
          aria-label={t("propertyCard.favoriteAria")}
        >
          <Heart
            className={`transition ${
              favoriteState ? "fill-rose-500 text-rose-500 scale-110" : ""
            } ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`}
          />
        </button>
      </div>

      <div className={`${compact ? "space-y-2.5 p-3" : "space-y-3 p-4"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={compact ? "text-lg font-semibold" : "text-xl font-semibold"}>
              {formatCurrency(property.price, property.currency)}
            </div>
            <h3 className={`font-semibold leading-snug ${compact ? "mt-1 text-sm" : "mt-1.5 text-base"}`}>
              {property.title}
            </h3>
          </div>
          <span className={compact ? "text-xs text-ink/45" : "text-sm text-ink/45"}>{typeLabel}</span>
        </div>

        <div className={`flex items-center gap-2 text-ink/60 ${compact ? "text-xs" : "text-sm"}`}>
          <MapPin className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span>{formatLocation(property)}</span>
        </div>

        {(property.trustProfile?.score || daysOnMarket !== undefined) ? (
          <div className={`flex flex-wrap text-ink/60 ${compact ? "gap-1.5 text-[11px]" : "gap-2 text-xs"}`}>
            {property.trustProfile?.score ? (
              <span className="data-pill">
                <ShieldCheck className="h-3.5 w-3.5" />
                {property.trustProfile.score}/100
              </span>
            ) : null}
            {daysOnMarket !== null && daysOnMarket !== undefined ? (
              <span className="data-pill">
                <TimerReset className="h-3.5 w-3.5" />
                {daysOnMarket} {language === "en" ? "days" : "dias"}
              </span>
            ) : null}
            {property.pricingInsight?.marketScoreLabel ? (
              <span className="data-pill">
                <Sparkles className="h-3.5 w-3.5" />
                {property.pricingInsight.marketScoreLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className={`grid grid-cols-2 text-xs text-ink/70 sm:grid-cols-4 ${compact ? "gap-1.5" : "gap-2"}`}>
          <span className="data-pill">
            <BedDouble className="h-4 w-4" />
            {property.rentalArrangement === "roommate"
              ? `${property.roommateDetails?.availableRooms || property.bedrooms || 1} ${t("propertyCard.room")}`
              : `${property.bedrooms || 0} ${t("propertyCard.roomsShort")}`}
          </span>
          <span className="data-pill">
            <Bath className="h-4 w-4" />
            {property.rentalArrangement === "roommate" && property.roommateDetails?.privateBathroom
              ? t("propertyCard.privateBath")
              : `${property.bathrooms || 0} ${t("propertyCard.bathroomsShort")}`}
          </span>
          <span className="data-pill">
            <Car className="h-4 w-4" />
            {property.parkingSpaces || 0}
          </span>
          <span className="data-pill">
            <Square className="h-4 w-4" />
            {formatArea(property.constructionArea || property.lotArea || 0)}
          </span>
        </div>

        {property.businessType === "rent" ? (
          <div className={`flex flex-wrap text-xs text-ink/60 ${compact ? "gap-1.5" : "gap-2"}`}>
            <span className="data-pill">
              {t("propertyCard.pets")}: {boolLabel(property.petsAllowed)}
            </span>
            <span className="data-pill">
              {t("propertyCard.deposit")}: {boolLabel(property.depositRequired)}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
