import { costaRicaProvinces } from "./costa-rica-provinces";

const provinceByName = new Map(costaRicaProvinces.map((province) => [province.name, province]));
const provinceByCode = new Map(costaRicaProvinces.map((province) => [province.code, province]));

export const getProvinceCode = (provinceName = "") => provinceByName.get(provinceName)?.code;

export const getProvinceByName = (provinceName = "") => provinceByName.get(provinceName);

export const getProvinceByCode = (provinceCode = "") => provinceByCode.get(String(provinceCode));

export const normalizeGeoLabel = (value = "") =>
  String(value)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .replace(/\bJose\b/g, "Jose")
    .replace(/\bLimon\b/g, "Limon")
    .replace(/\bBelen\b/g, "Belen")
    .replace(/\bAsuncion\b/g, "Asuncion");
