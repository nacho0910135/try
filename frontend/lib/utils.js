import clsx from "clsx";
import {
  businessTypes,
  marketStatuses,
  propertyStatuses,
  propertyTypes,
  rentalArrangements,
  roommateGenderPreferences
} from "./constants";

export const cn = (...inputs) => clsx(inputs);

const propertyTypeMap = Object.fromEntries(propertyTypes.map((item) => [item.value, item.label]));
const businessTypeMap = Object.fromEntries(businessTypes.map((item) => [item.value, item.label]));
const statusMap = Object.fromEntries(propertyStatuses.map((item) => [item.value, item.label]));
const marketStatusMap = Object.fromEntries(marketStatuses.map((item) => [item.value, item.label]));
const rentalArrangementMap = Object.fromEntries(
  rentalArrangements.map((item) => [item.value, item.label])
);
const roommateGenderPreferenceMap = Object.fromEntries(
  roommateGenderPreferences.map((item) => [item.value, item.label])
);

export const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "CRC" ? 0 : 0
  }).format(value || 0);

const buildCompactCurrencyLabel = (amount, currency = "USD") => {
  const compactDisplay = currency === "CRC" ? "long" : "short";

  return new Intl.NumberFormat("es-CR", {
    notation: "compact",
    compactDisplay,
    maximumFractionDigits: 1
  }).format(amount);
};

const legacyFormatCompactCurrency = (value, currency = "USD") => {
  const amount = Number(value || 0);
  const symbol = currency === "CRC" ? "CRC " : "$";
  const compact = buildCompactCurrencyLabel(amount, currency);

  return `${symbol}${compact}`;
};

export const formatCompactCurrency = (value, currency = "USD") => {
  const amount = Number(value || 0);
  const symbol = currency === "CRC" ? "CRC " : "$";
  const compact = buildCompactCurrencyLabel(amount, currency);

  return `${symbol}${compact}`;
};

export const formatArea = (value) => `${Number(value || 0).toLocaleString("es-CR")} m2`;

export const formatPropertyType = (value) => propertyTypeMap[value] || value;

export const formatBusinessType = (value) => businessTypeMap[value] || value;

export const formatPropertyStatus = (value) => statusMap[value] || value;

export const formatMarketStatus = (value) => marketStatusMap[value] || value;

export const formatRentalArrangement = (value) => rentalArrangementMap[value] || value;

export const formatRoommateGenderPreference = (value) =>
  roommateGenderPreferenceMap[value] || value;

export const formatYesNo = (value) => (value ? "Sí" : "No");

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

export const buildPropertyPayload = (values, photos = [], videoUrls = []) => {
  const serviceDistances = {
    ...(values.serviceHospitalKm !== undefined && values.serviceHospitalKm !== ""
      ? { hospitalKm: Number(values.serviceHospitalKm) }
      : {}),
    ...(values.serviceSchoolKm !== undefined && values.serviceSchoolKm !== ""
      ? { schoolKm: Number(values.serviceSchoolKm) }
      : {}),
    ...(values.serviceHighSchoolKm !== undefined && values.serviceHighSchoolKm !== ""
      ? { highSchoolKm: Number(values.serviceHighSchoolKm) }
      : {})
  };
  const normalizedPhotos = photos.map((photo) => ({
    url: photo.url,
    publicId: photo.publicId || undefined,
    isPrimary: Boolean(photo.isPrimary),
    alt: photo.alt,
    ...(typeof photo.width === "number" ? { width: photo.width } : {}),
    ...(typeof photo.height === "number" ? { height: photo.height } : {})
  }));

  const media = [
    ...normalizedPhotos.map((photo, index) => ({
      type: "image",
      url: photo.url,
      thumbnailUrl: photo.url,
      publicId: photo.publicId || undefined,
      alt: photo.alt,
      isPrimary: photo.isPrimary,
      order: index,
      ...(typeof photo.width === "number" ? { width: photo.width } : {}),
      ...(typeof photo.height === "number" ? { height: photo.height } : {})
    })),
    ...videoUrls
      .filter(Boolean)
      .map((url, index) => ({
        type: "video",
        url,
        thumbnailUrl: photos[0]?.url,
        provider: "external",
        isPrimary: false,
        order: photos.length + index
      }))
  ];

  const sellerEmail = String(values.sellerEmail || "").trim();

  return {
    title: values.title,
    description: values.description,
    businessType: values.businessType,
    operationType: values.businessType,
    rentalArrangement:
      values.businessType === "rent"
        ? values.rentalArrangement || (values.propertyType === "room" ? "roommate" : "full-property")
        : "full-property",
    propertyType: values.propertyType,
    price: Number(values.price),
    finalPrice: values.finalPrice ? Number(values.finalPrice) : undefined,
    currency: values.currency,
    bedrooms: Number(values.bedrooms || 0),
    bathrooms: Number(values.bathrooms || 0),
    parkingSpaces: Number(values.parkingSpaces || 0),
    constructionArea: Number(values.constructionArea || 0),
    landArea: Number(values.landArea || values.lotArea || 0),
    lotArea: Number(values.lotArea || values.landArea || 0),
    furnished: Boolean(values.furnished),
    petsAllowed: values.businessType === "rent" ? Boolean(values.petsAllowed) : false,
    depositRequired: values.businessType === "rent" ? Boolean(values.depositRequired) : false,
    status: values.status,
    marketStatus: values.marketStatus,
    amenities: values.amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    photos: normalizedPhotos,
    media,
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
    },
    addressText: values.addressText || values.exactAddress || "",
    sellerInfo: {
      name: values.sellerName || undefined,
      phone: values.sellerPhone || undefined,
      email: sellerEmail || undefined,
      role: values.sellerRole || undefined
    },
    serviceDistances: Object.keys(serviceDistances).length ? serviceDistances : undefined,
    roommateDetails:
      values.businessType === "rent" &&
      (values.rentalArrangement === "roommate" || values.propertyType === "room")
        ? {
            privateRoom: Boolean(values.privateRoom),
            privateBathroom: Boolean(values.privateBathroom),
            utilitiesIncluded: Boolean(values.utilitiesIncluded),
            studentFriendly: Boolean(values.studentFriendly),
            availableRooms: Number(values.availableRooms || 1),
            currentRoommates: Number(values.currentRoommates || 0),
            maxRoommates: Number(values.maxRoommates || 0),
            genderPreference: values.genderPreference || "any",
            sharedAreas: values.sharedAreas
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          }
        : undefined
  };
};

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
