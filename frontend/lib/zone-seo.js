import { costaRicaLocations } from "./costa-rica-locations";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const slugifyLocation = (value = "") =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getProvinces = () => Object.keys(costaRicaLocations);

export const findProvinceBySlug = (slug = "") =>
  getProvinces().find((province) => slugifyLocation(province) === slug);

export const getCantons = (province) =>
  province && costaRicaLocations[province] ? Object.keys(costaRicaLocations[province]) : [];

export const findCantonBySlug = (province, slug = "") =>
  getCantons(province).find((canton) => slugifyLocation(canton) === slug);

export const getDistricts = (province, canton) =>
  province && canton && costaRicaLocations[province]?.[canton]
    ? costaRicaLocations[province][canton]
    : [];

export const findDistrictBySlug = (province, canton, slug = "") =>
  getDistricts(province, canton).find((district) => slugifyLocation(district) === slug);

export const buildZonePath = ({ province, canton, district }) => {
  const parts = [province, canton, district].filter(Boolean).map(slugifyLocation);
  return `/zona/${parts.join("/")}`;
};

export const getZoneChildren = ({ province, canton }) => {
  if (!province) {
    return getProvinces().map((item) => ({
      label: item,
      path: buildZonePath({ province: item }),
      level: "province"
    }));
  }

  if (!canton) {
    return getCantons(province).map((item) => ({
      label: item,
      path: buildZonePath({ province, canton: item }),
      level: "canton"
    }));
  }

  return getDistricts(province, canton).map((item) => ({
    label: item,
    path: buildZonePath({ province, canton, district: item }),
    level: "district"
  }));
};

export const getSiteUrl = () => SITE_URL;

export const fetchZoneSeoData = async ({ province, canton, district, limit = 9 }) => {
  const params = new URLSearchParams();

  if (province) params.set("province", province);
  if (canton) params.set("canton", canton);
  if (district) params.set("district", district);
  params.set("limit", String(limit));

  const response = await fetch(`${API_URL}/properties/seo/zone?${params.toString()}`, {
    next: { revalidate: 1800 }
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el contenido SEO de la zona.");
  }

  return response.json();
};

export const buildZoneTitle = ({ province, canton, district }) => {
  if (district && canton) {
    return `Propiedades en ${district}, ${canton} | AlquiVentasCR`;
  }

  if (canton && province) {
    return `Casas, apartamentos y lotes en ${canton}, ${province} | AlquiVentasCR`;
  }

  return `Propiedades en ${province}, Costa Rica | AlquiVentasCR`;
};

export const buildZoneDescription = ({ province, canton, district }, summary = {}) => {
  const zoneLabel = [district, canton, province].filter(Boolean).join(", ");
  const total = Number(summary.totalListings || 0);
  const sale = Number(summary.saleListings || 0);
  const rent = Number(summary.rentListings || 0);

  return `Explora ${total} propiedades activas en ${zoneLabel} con mapa, filtros y analisis local. Actualmente hay ${sale} opciones en venta y ${rent} en renta en AlquiVentasCR.`;
};
