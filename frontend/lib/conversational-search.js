import { provinces } from "./constants";
import { costaRicaLocations } from "./costa-rica-locations";
import { mapContextLayers } from "./costa-rica-map-context";

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s$₡/.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const parseLooseNumber = (value = "") => {
  const normalized = String(value).replace(/[^\d.,]/g, "");

  if (!normalized) {
    return null;
  }

  const compact = normalized.replace(/,/g, "").replace(/\s/g, "");
  const parsed = Number(compact);
  return Number.isFinite(parsed) ? parsed : null;
};

const hasAny = (source, terms = []) => terms.some((term) => source.includes(term));

const createAliasSet = (...values) =>
  [...new Set(values.filter(Boolean).map((item) => normalizeText(item)))];

const provinceEntries = provinces.map((province) => ({
  province,
  aliases: createAliasSet(province)
}));

const cantonEntries = Object.entries(costaRicaLocations).flatMap(([province, cantons]) =>
  Object.keys(cantons).map((canton) => ({
    province,
    canton,
    aliases: createAliasSet(canton, `${canton} ${province}`)
  }))
);

const districtEntries = Object.entries(costaRicaLocations).flatMap(([province, cantons]) =>
  Object.entries(cantons).flatMap(([canton, districts]) =>
    districts.map((district) => ({
      province,
      canton,
      district,
      aliases: createAliasSet(district, `${district} ${canton}`, `${district} ${province}`)
    }))
  )
);

const contextPointEntries = mapContextLayers.flatMap((layer) =>
  layer.points.map((point) => ({
    ...point,
    layerId: layer.id,
    layerColor: layer.color,
    aliases: createAliasSet(
      point.name,
      point.shortLabel,
      point.district,
      `${point.name} ${point.district}`,
      `${point.name} ${point.canton}`
    )
  }))
);

const findBestLocationMatch = (source, entries, predicate = () => true) =>
  entries
    .filter((entry) => predicate(entry) && entry.aliases.some((alias) => source.includes(alias)))
    .sort((first, second) => {
      const firstAliasLength = Math.max(...first.aliases.map((alias) => alias.length));
      const secondAliasLength = Math.max(...second.aliases.map((alias) => alias.length));
      return secondAliasLength - firstAliasLength;
    })[0] || null;

const getBedroomMatch = (source) =>
  source.match(/(\d+)\s*(hab(?:itaciones?)?|bed(?:rooms?)?|cuartos?)/i);

const getBathroomMatch = (source) =>
  source.match(/(\d+)\s*(banos?|bath(?:rooms?)?)/i);

const getParkingMatch = (source) =>
  source.match(/(\d+)\s*(parqueos?|parkings?|garages?)/i);

const getRadiusMatch = (source) =>
  source.match(/(\d+)\s*(km|kilometros?|kilometers?)/i);

const getPriceBetweenMatch = (source) =>
  source.match(
    /(entre|between)\s*(\$|usd|dolares|dolares|₡|crc|colones?)?\s*([\d.,]+)\s*(y|and|-)\s*(\$|usd|dolares|₡|crc|colones?)?\s*([\d.,]+)/i
  );

const getMaxPriceMatch = (source) =>
  source.match(
    /(hasta|max(?:imo)?|under|less than|menos de)\s*(\$|usd|dolares|₡|crc|colones?)?\s*([\d.,]+)/i
  );

const getMinPriceMatch = (source) =>
  source.match(
    /(desde|min(?:imo)?|more than|over|mas de)\s*(\$|usd|dolares|₡|crc|colones?)?\s*([\d.,]+)/i
  );

const resolveCurrency = (source, ...tokens) => {
  const joined = normalizeText([source, ...tokens].filter(Boolean).join(" "));

  if (joined.includes("crc") || joined.includes("colon") || joined.includes("₡")) {
    return "CRC";
  }

  if (joined.includes("$") || joined.includes("usd") || joined.includes("dolar")) {
    return "USD";
  }

  return undefined;
};

export const parseConversationalSearch = (input, language = "es") => {
  const source = normalizeText(input);
  const filters = {};
  const contextLayerIds = new Set();
  const summaryTokens = [];

  if (!source) {
    return {
      filters,
      contextLayerIds: [],
      focusedPoint: null,
      summaryTokens,
      message:
        language === "en"
          ? "Describe the kind of property or area you want to explore."
          : "Describe el tipo de propiedad o zona que quieres explorar.",
      usedFallbackText: false
    };
  }

  if (
    hasAny(source, [
      "alquiler",
      "renta",
      "rent",
      "rental",
      "roomies",
      "roommate",
      "cuarto",
      "habitacion"
    ])
  ) {
    filters.businessType = "rent";
    summaryTokens.push(language === "en" ? "Rent" : "Renta");
  } else if (
    hasAny(source, ["venta", "vender", "comprar", "buy", "sale", "for sale"])
  ) {
    filters.businessType = "sale";
    summaryTokens.push(language === "en" ? "Sale" : "Venta");
  }

  if (hasAny(source, ["roomies", "roommate", "shared", "compartido", "cuarto"])) {
    filters.businessType = "rent";
    filters.rentalArrangement = "roommate";
    if (!filters.propertyType) {
      filters.propertyType = "room";
    }
    summaryTokens.push(language === "en" ? "Roommates" : "Roomies");
  }

  const propertyTypeRules = [
    { value: "house", terms: ["casa", "house", "home"] },
    { value: "apartment", terms: ["apartamento", "apart", "apartment"] },
    { value: "condominium", terms: ["condominio", "condo", "condominium"] },
    { value: "lot", terms: ["lote", "terreno", "land", "lot"] },
    { value: "room", terms: ["habitacion", "cuarto", "room"] },
    { value: "commercial", terms: ["comercial", "local", "office", "oficina", "commercial"] }
  ];

  const matchedType = propertyTypeRules.find((item) => hasAny(source, item.terms));
  if (matchedType) {
    filters.propertyType = matchedType.value;
    summaryTokens.push(
      language === "en"
        ? matchedType.value === "lot"
          ? "Lot / Land"
          : matchedType.value === "commercial"
            ? "Commercial"
            : matchedType.value.charAt(0).toUpperCase() + matchedType.value.slice(1)
        : matchedType.value === "house"
          ? "Casa"
          : matchedType.value === "apartment"
            ? "Apartamento"
            : matchedType.value === "condominium"
              ? "Condominio"
              : matchedType.value === "lot"
                ? "Lote / Terreno"
                : matchedType.value === "room"
                  ? "Habitacion"
                  : "Comercial"
    );
  }

  const bedroomMatch = getBedroomMatch(source);
  if (bedroomMatch) {
    filters.bedrooms = Number(bedroomMatch[1]);
    summaryTokens.push(
      language === "en"
        ? `${filters.bedrooms} bedroom${filters.bedrooms === 1 ? "" : "s"}`
        : `${filters.bedrooms} habitacion${filters.bedrooms === 1 ? "" : "es"}`
    );
  }

  const bathroomMatch = getBathroomMatch(source);
  if (bathroomMatch) {
    filters.bathrooms = Number(bathroomMatch[1]);
    summaryTokens.push(
      language === "en"
        ? `${filters.bathrooms} bathroom${filters.bathrooms === 1 ? "" : "s"}`
        : `${filters.bathrooms} bano${filters.bathrooms === 1 ? "" : "s"}`
    );
  }

  const parkingMatch = getParkingMatch(source);
  if (parkingMatch) {
    filters.parkingSpaces = Number(parkingMatch[1]);
    summaryTokens.push(
      language === "en"
        ? `${filters.parkingSpaces} parking`
        : `${filters.parkingSpaces} parqueo${filters.parkingSpaces === 1 ? "" : "s"}`
    );
  }

  if (hasAny(source, ["pet friendly", "acepta mascotas", "con mascotas", "pets"])) {
    filters.petsAllowed = true;
    summaryTokens.push(language === "en" ? "Pet-friendly" : "Acepta mascotas");
  }

  if (hasAny(source, ["sin mascotas", "no mascotas", "no pets"])) {
    filters.petsAllowed = false;
    summaryTokens.push(language === "en" ? "No pets" : "Sin mascotas");
  }

  if (hasAny(source, ["sin deposito", "sin deposito", "no deposit"])) {
    filters.depositRequired = false;
    summaryTokens.push(language === "en" ? "No deposit" : "Sin deposito");
  } else if (hasAny(source, ["con deposito", "deposito", "deposit required"])) {
    filters.depositRequired = true;
    summaryTokens.push(language === "en" ? "With deposit" : "Con deposito");
  }

  if (hasAny(source, ["amueblado", "furnished"])) {
    filters.furnished = true;
    summaryTokens.push(language === "en" ? "Furnished" : "Amueblado");
  }

  if (hasAny(source, ["servicios incluidos", "utilities included"])) {
    filters.utilitiesIncluded = true;
    summaryTokens.push(language === "en" ? "Utilities included" : "Servicios incluidos");
  }

  if (hasAny(source, ["cuarto privado", "private room"])) {
    filters.privateRoom = true;
    summaryTokens.push(language === "en" ? "Private room" : "Cuarto privado");
  }

  if (hasAny(source, ["bano privado", "private bath", "private bathroom"])) {
    filters.privateBathroom = true;
    summaryTokens.push(language === "en" ? "Private bathroom" : "Bano privado");
  }

  if (hasAny(source, ["estudiante", "universitario", "student"])) {
    filters.studentFriendly = true;
    contextLayerIds.add("universities");
    summaryTokens.push(language === "en" ? "Student-friendly" : "Estudiantil");
  }

  if (hasAny(source, ["disponible", "available"])) {
    filters.marketStatus = "available";
  } else if (hasAny(source, ["vendida", "vendido", "sold"])) {
    filters.marketStatus = "sold";
  } else if (hasAny(source, ["reservada", "reservado", "reserved"])) {
    filters.marketStatus = "reserved";
  } else if (hasAny(source, ["alquilada", "rentada", "rented"])) {
    filters.marketStatus = "rented";
  }

  const radiusMatch = getRadiusMatch(source);
  if (radiusMatch) {
    filters.radiusKm = Number(radiusMatch[1]);
    summaryTokens.push(
      language === "en" ? `${filters.radiusKm} km radius` : `Radio de ${filters.radiusKm} km`
    );
  }

  const priceBetweenMatch = getPriceBetweenMatch(source);
  if (priceBetweenMatch) {
    filters.minPrice = parseLooseNumber(priceBetweenMatch[3]);
    filters.maxPrice = parseLooseNumber(priceBetweenMatch[6]);
    filters.currency = resolveCurrency(source, priceBetweenMatch[2], priceBetweenMatch[5]);
  } else {
    const maxPriceMatch = getMaxPriceMatch(source);
    const minPriceMatch = getMinPriceMatch(source);

    if (maxPriceMatch) {
      filters.maxPrice = parseLooseNumber(maxPriceMatch[3]);
      filters.currency = resolveCurrency(source, maxPriceMatch[2]);
    }

    if (minPriceMatch) {
      filters.minPrice = parseLooseNumber(minPriceMatch[3]);
      filters.currency = resolveCurrency(source, minPriceMatch[2], filters.currency);
    }
  }

  if (filters.minPrice || filters.maxPrice) {
    summaryTokens.push(
      language === "en"
        ? filters.minPrice && filters.maxPrice
          ? `Budget ${filters.minPrice} - ${filters.maxPrice} ${filters.currency || ""}`.trim()
          : filters.maxPrice
            ? `Up to ${filters.maxPrice} ${filters.currency || ""}`.trim()
            : `From ${filters.minPrice} ${filters.currency || ""}`.trim()
        : filters.minPrice && filters.maxPrice
          ? `Presupuesto ${filters.minPrice} - ${filters.maxPrice} ${filters.currency || ""}`.trim()
          : filters.maxPrice
            ? `Hasta ${filters.maxPrice} ${filters.currency || ""}`.trim()
            : `Desde ${filters.minPrice} ${filters.currency || ""}`.trim()
    );
  }

  const focusedPoint = findBestLocationMatch(source, contextPointEntries);
  if (focusedPoint) {
    contextLayerIds.add(focusedPoint.layerId);
    filters.province = focusedPoint.province;
    filters.canton = focusedPoint.canton;
    filters.district = focusedPoint.district;
    filters.lat = focusedPoint.lat;
    filters.lng = focusedPoint.lng;
    filters.radiusKm = filters.radiusKm || 8;
    summaryTokens.push(
      language === "en" ? `Near ${focusedPoint.name}` : `Cerca de ${focusedPoint.name}`
    );
  }

  const layerRules = [
    { layerId: "universities", terms: ["universidad", "universitario", "campus", "student"] },
    { layerId: "hospitals", terms: ["hospital", "clinica", "medical", "salud"] },
    { layerId: "beaches", terms: ["playa", "beach", "surf", "vacacional"] },
    { layerId: "business", terms: ["trabajo", "oficina", "office", "corporativo", "ejecutivo"] },
    { layerId: "family", terms: ["familia", "family", "residencial", "children", "ninos"] },
    {
      layerId: "investment",
      terms: ["inversion", "investment", "plusvalia", "turismo", "airbnb", "apreciacion"]
    }
  ];

  layerRules.forEach((rule) => {
    if (hasAny(source, rule.terms)) {
      contextLayerIds.add(rule.layerId);
    }
  });

  const provinceMatch = findBestLocationMatch(source, provinceEntries);
  if (provinceMatch && !focusedPoint) {
    filters.province = provinceMatch.province;
    summaryTokens.push(provinceMatch.province);
  }

  const cantonMatch = findBestLocationMatch(source, cantonEntries, (entry) =>
    filters.province ? entry.province === filters.province : true
  );
  if (cantonMatch && !focusedPoint) {
    filters.province = cantonMatch.province;
    filters.canton = cantonMatch.canton;
    summaryTokens.push(cantonMatch.canton);
  }

  const districtMatch = findBestLocationMatch(source, districtEntries, (entry) => {
    if (filters.province && entry.province !== filters.province) {
      return false;
    }
    if (filters.canton && entry.canton !== filters.canton) {
      return false;
    }
    return true;
  });

  if (districtMatch && !focusedPoint) {
    filters.province = districtMatch.province;
    filters.canton = districtMatch.canton;
    filters.district = districtMatch.district;
    summaryTokens.push(districtMatch.district);
  }

  const usedFallbackText = !summaryTokens.length;
  if (usedFallbackText) {
    filters.q = input.trim();
  }

  const message =
    language === "en"
      ? usedFallbackText
        ? `We applied a text search for "${input.trim()}".`
        : `Smart search applied: ${summaryTokens.slice(0, 5).join(" · ")}.`
      : usedFallbackText
        ? `Aplicamos una busqueda por texto para "${input.trim()}".`
        : `Busqueda inteligente aplicada: ${summaryTokens.slice(0, 5).join(" · ")}.`;

  return {
    filters,
    contextLayerIds: [...contextLayerIds],
    focusedPoint: focusedPoint
      ? {
          id: focusedPoint.id,
          name: focusedPoint.name,
          shortLabel: focusedPoint.shortLabel,
          province: focusedPoint.province,
          canton: focusedPoint.canton,
          district: focusedPoint.district,
          lat: focusedPoint.lat,
          lng: focusedPoint.lng,
          layerId: focusedPoint.layerId,
          color: focusedPoint.layerColor,
          summaryEs: focusedPoint.summaryEs,
          summaryEn: focusedPoint.summaryEn
        }
      : null,
    summaryTokens,
    message,
    usedFallbackText
  };
};
