import { formatCurrency, formatLocation } from "./utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const propertyTypeSchemaMap = {
  house: "SingleFamilyResidence",
  apartment: "Apartment",
  condominium: "Apartment",
  room: "Room",
  lot: "Place",
  commercial: "Place"
};

const availabilityMap = {
  available: "https://schema.org/InStock",
  reserved: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
  rented: "https://schema.org/SoldOut",
  inactive: "https://schema.org/Discontinued"
};

const trimText = (value = "", maxLength = 170) => {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}...`;
};

const getCanonicalUrl = (slug) => `${SITE_URL.replace(/\/$/, "")}/properties/${slug}`;

const getPrimaryImage = (property) =>
  property?.media?.find?.((item) => item.type === "image" && item.url)?.url ||
  property?.photos?.find?.((item) => item.isPrimary)?.url ||
  property?.photos?.[0]?.url ||
  `${SITE_URL.replace(/\/$/, "")}/property-placeholder.svg`;

const getPropertyImages = (property) => {
  const images = [
    ...(property?.media || []).filter((item) => item.type === "image").map((item) => item.url),
    ...(property?.photos || []).map((item) => item.url)
  ].filter(Boolean);

  return [...new Set(images)].slice(0, 8);
};

const buildPropertyDescription = (property) => {
  const location = formatLocation(property);
  const price = formatCurrency(property?.price, property?.currency);
  const summary = trimText(property?.description || "", 118);
  const parts = [price, location === "Costa Rica" ? "" : location, summary].filter(Boolean);
  return trimText(parts.join(" · "), 158);
};

const buildPropertyTitle = (property) => {
  const location = [property?.address?.district, property?.address?.canton, property?.address?.province]
    .filter(Boolean)
    .join(", ");

  return location ? `${property.title} | ${location}` : property.title;
};

const buildPostalAddress = (property) => ({
  "@type": "PostalAddress",
  addressCountry: "CR",
  addressRegion: property?.address?.province,
  addressLocality: property?.address?.canton,
  addressNeighborhood: property?.address?.district
});

export const fetchPropertySeoData = async (slug) => {
  const response = await fetch(`${API_URL}/properties/slug/${slug}/seo`, {
    next: { revalidate: 900 }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("No se pudo cargar la propiedad para SEO.");
  }

  return response.json();
};

export const buildPropertyMetadata = (property) => {
  const title = buildPropertyTitle(property);
  const description = buildPropertyDescription(property);
  const canonicalUrl = getCanonicalUrl(property.slug);
  const image = getPrimaryImage(property);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title,
      description,
      siteName: "BienesRaicesCR",
      locale: "es_CR",
      images: [
        {
          url: image,
          alt: property.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
};

export const buildPropertyStructuredData = (property) => {
  const canonicalUrl = getCanonicalUrl(property.slug);
  const propertyType = propertyTypeSchemaMap[property.propertyType] || "Place";
  const images = getPropertyImages(property);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": propertyType,
    name: property.title,
    description: buildPropertyDescription(property),
    url: canonicalUrl,
    image: images.length ? images : [getPrimaryImage(property)],
    address: buildPostalAddress(property),
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      price: Number(property.price || 0),
      priceCurrency: property.currency || "USD",
      availability:
        availabilityMap[property.marketStatus] || "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition"
    }
  };

  if (Number.isFinite(Number(property.bedrooms)) && Number(property.bedrooms) > 0) {
    structuredData.numberOfRooms = Number(property.bedrooms);
  }

  if (Number.isFinite(Number(property.bathrooms)) && Number(property.bathrooms) > 0) {
    structuredData.numberOfBathroomsTotal = Number(property.bathrooms);
  }

  if (Number.isFinite(Number(property.constructionArea)) && Number(property.constructionArea) > 0) {
    structuredData.floorSize = {
      "@type": "QuantitativeValue",
      value: Number(property.constructionArea),
      unitCode: "MTK"
    };
  }

  if (
    !property?.address?.hideExactLocation &&
    Array.isArray(property?.location?.coordinates) &&
    property.location.coordinates.length === 2
  ) {
    structuredData.geo = {
      "@type": "GeoCoordinates",
      longitude: Number(property.location.coordinates[0]),
      latitude: Number(property.location.coordinates[1])
    };
  }

  return structuredData;
};
