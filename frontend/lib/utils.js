import clsx from "clsx";
import { businessTypes, propertyStatuses, propertyTypes } from "./constants";

export const cn = (...inputs) => clsx(inputs);

const propertyTypeMap = Object.fromEntries(propertyTypes.map((item) => [item.value, item.label]));
const businessTypeMap = Object.fromEntries(businessTypes.map((item) => [item.value, item.label]));
const statusMap = Object.fromEntries(propertyStatuses.map((item) => [item.value, item.label]));

export const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "CRC" ? 0 : 0
  }).format(value || 0);

export const formatArea = (value) => `${Number(value || 0).toLocaleString("es-CR")} m²`;

export const formatPropertyType = (value) => propertyTypeMap[value] || value;

export const formatBusinessType = (value) => businessTypeMap[value] || value;

export const formatPropertyStatus = (value) => statusMap[value] || value;

export const getMainPhoto = (property) =>
  property?.photos?.find((photo) => photo.isPrimary) || property?.photos?.[0] || null;

export const formatLocation = (property) => {
  if (!property?.address) return "Costa Rica";

  const parts = [
    property.address.neighborhood,
    property.address.district,
    property.address.canton,
    property.address.province
  ].filter(Boolean);

  return parts.join(", ");
};

export const buildPropertyPayload = (values, photos = []) => ({
  title: values.title,
  description: values.description,
  businessType: values.businessType,
  propertyType: values.propertyType,
  price: Number(values.price),
  currency: values.currency,
  bedrooms: Number(values.bedrooms || 0),
  bathrooms: Number(values.bathrooms || 0),
  parkingSpaces: Number(values.parkingSpaces || 0),
  constructionArea: Number(values.constructionArea || 0),
  lotArea: Number(values.lotArea || 0),
  furnished: Boolean(values.furnished),
  petsAllowed: Boolean(values.petsAllowed),
  status: values.status,
  amenities: values.amenities
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  photos,
  location: {
    lng: Number(values.lng),
    lat: Number(values.lat)
  },
  address: {
    province: values.province,
    canton: values.canton,
    district: values.district,
    neighborhood: values.neighborhood || "",
    exactAddress: values.exactAddress || "",
    hideExactLocation: Boolean(values.hideExactLocation)
  }
});

export const serializePropertyQuery = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (typeof value === "object") {
      params.set(key, JSON.stringify(value));
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
};

export const formatPhoneForWhatsApp = (phone = "") => phone.replace(/[^\d]/g, "");

