const MARKET_SCORE_LABELS = {
  "below-market": "Oportunidad por precio",
  "in-range": "Precio en rango",
  "above-market": "Precio por encima del promedio"
};

const MARKET_SCORE_LEVELS = {
  "below-market": "opportunity",
  "in-range": "balanced",
  "above-market": "premium"
};

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const uniqueList = (items = []) => [...new Set(items.filter(Boolean))];

const normalizeUploadUrl = (value) => {
  if (typeof value !== "string" || !value) {
    return value;
  }

  if (value.startsWith("/uploads/") || value.startsWith("data:")) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);

      if (parsed.pathname.startsWith("/uploads/")) {
        return parsed.pathname;
      }

      return value;
    } catch (_error) {
      return value;
    }
  }

  return value;
};

const normalizePropertyMediaUrls = (property) => ({
  ...property,
  photos: Array.isArray(property?.photos)
    ? property.photos.map((photo) => ({
        ...photo,
        url: normalizeUploadUrl(photo?.url)
      }))
    : property?.photos,
  media: Array.isArray(property?.media)
    ? property.media.map((item) => ({
        ...item,
        url: normalizeUploadUrl(item?.url),
        thumbnailUrl: normalizeUploadUrl(item?.thumbnailUrl)
      }))
    : property?.media
});

const countMedia = (property, type) =>
  Array.isArray(property?.media)
    ? property.media.filter((item) => item?.type === type).length
    : 0;

const hasServiceDistances = (property) =>
  Boolean(
    property?.serviceDistances?.hospitalKm !== undefined ||
      property?.serviceDistances?.schoolKm !== undefined ||
      property?.serviceDistances?.highSchoolKm !== undefined
  );

const getListingStartDate = (property) => property?.publishedAt || property?.createdAt || null;

const getListingEndDate = (property) =>
  property?.soldAt || property?.rentedAt || property?.inactivatedAt || new Date();

const differenceInDays = (fromDate, toDate = new Date()) => {
  if (!fromDate) {
    return null;
  }

  return Math.max(0, Math.round((new Date(toDate) - new Date(fromDate)) / DAY_IN_MS));
};

const buildPriceHistorySeries = (property) => {
  const history = Array.isArray(property?.priceHistory) ? property.priceHistory : [];

  if (!history.length && property?.price !== undefined) {
    return [
      {
        changedAt: property?.createdAt || new Date(),
        value: Number(property.finalPrice ?? property.price ?? 0),
        marketStatus: property?.marketStatus || "available"
      }
    ];
  }

  return history
    .map((entry) => ({
      changedAt: entry?.changedAt || property?.updatedAt || property?.createdAt || new Date(),
      value: Number(entry?.finalPrice ?? entry?.price ?? property?.price ?? 0),
      marketStatus: entry?.marketStatus || property?.marketStatus || "available",
      note: entry?.note || ""
    }))
    .filter((entry) => Number.isFinite(entry.value))
    .sort((first, second) => new Date(first.changedAt) - new Date(second.changedAt));
};

const buildTrustProfile = (property) => {
  const photosCount = Array.isArray(property?.photos) ? property.photos.length : 0;
  const videosCount = countMedia(property, "video");
  const hasContact = Boolean(
    property?.sellerInfo?.phone || property?.sellerInfo?.email || property?.owner?.phone || property?.owner?.email
  );
  const hasPinnedLocation = Array.isArray(property?.location?.coordinates) && property.location.coordinates.length === 2;
  const analyticsReady = Boolean(property?.analyticsSnapshot?.lastComputedAt || property?.analyticsSnapshot?.marketScore);
  const closeRecorded = Boolean(
    property?.finalPrice && ["sold", "rented"].includes(property?.marketStatus)
  );
  const sellerVerified = property?.owner?.verification?.status === "verified";

  const badges = [];
  let score = 0;

  if (sellerVerified) {
    badges.push({
      key: "verified-seller",
      label: "Anunciante verificado",
      tone: "success"
    });
    score += 20;
  }

  if (hasContact) {
    badges.push({
      key: "direct-contact",
      label: "Contacto directo",
      tone: "success"
    });
    score += 18;
  }

  if (photosCount >= 5 || videosCount > 0) {
    badges.push({
      key: "rich-media",
      label: photosCount >= 5 ? "Galeria completa" : "Video disponible",
      tone: "info"
    });
    score += 16;
  }

  if (hasPinnedLocation) {
    badges.push({
      key: "map-pin",
      label: property?.address?.hideExactLocation ? "Pin validado" : "Ubicacion visible",
      tone: property?.address?.hideExactLocation ? "neutral" : "success"
    });
    score += 12;
  }

  if (hasServiceDistances(property)) {
    badges.push({
      key: "service-distances",
      label: "Distancias declaradas",
      tone: "accent"
    });
    score += 10;
  }

  if (analyticsReady) {
    badges.push({
      key: "pricing-intel",
      label: "Precio analizado",
      tone: "accent"
    });
    score += 10;
  }

  if (closeRecorded) {
    badges.push({
      key: "recorded-close",
      label: "Cierre registrado",
      tone: "info"
    });
    score += 6;
  }

  score = clamp(score, 12, 100);

  const level = score >= 78 ? "high" : score >= 52 ? "solid" : "basic";
  const summary =
    level === "high"
      ? "Anuncio con muy buenas senales de confianza y contexto."
      : level === "solid"
        ? "Anuncio con base solida, aunque todavia puede reforzarse."
        : "Anuncio funcional, pero conviene completar mas contexto para generar confianza.";

  return {
    score,
    level,
    summary,
    photosCount,
    videosCount,
    sellerVerified,
    badges
  };
};

const buildPricingInsight = (property) => {
  const currentPrice = Number(property?.finalPrice ?? property?.price ?? 0);
  const area = Number(property?.constructionArea || property?.landArea || property?.lotArea || 0);
  const priceHistorySeries = buildPriceHistorySeries(property);
  const previousPoint =
    priceHistorySeries.length > 1 ? priceHistorySeries[priceHistorySeries.length - 2] : null;
  const previousPrice = previousPoint ? Number(previousPoint.value || 0) : null;
  const changeAmount = previousPrice !== null ? currentPrice - previousPrice : 0;
  const changePct =
    previousPrice && previousPrice > 0
      ? Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(1))
      : 0;
  const direction = changeAmount > 0 ? "up" : changeAmount < 0 ? "down" : "flat";
  const startDate = getListingStartDate(property);
  const endDate = getListingEndDate(property);
  const daysOnMarket = differenceInDays(startDate, endDate);
  const daysToClose =
    ["sold", "rented"].includes(property?.marketStatus) && startDate
      ? differenceInDays(startDate, property?.soldAt || property?.rentedAt)
      : null;
  const pricePerSquareMeter =
    Number(property?.analyticsSnapshot?.pricePerSquareMeter) ||
    (area > 0 ? Number((currentPrice / area).toFixed(2)) : null);
  const marketScore = property?.analyticsSnapshot?.marketScore || null;

  return {
    currentPrice,
    previousPrice,
    changeAmount,
    changePct,
    direction,
    daysOnMarket,
    daysToClose,
    pricePerSquareMeter,
    marketScore,
    marketScoreLabel: marketScore ? MARKET_SCORE_LABELS[marketScore] : "Sin comparables suficientes",
    marketScoreLevel: marketScore ? MARKET_SCORE_LEVELS[marketScore] : "neutral",
    suggestedPriceMin: property?.analyticsSnapshot?.suggestedPriceMin || null,
    suggestedPriceMax: property?.analyticsSnapshot?.suggestedPriceMax || null,
    lastPriceChangeAt: priceHistorySeries[priceHistorySeries.length - 1]?.changedAt || property?.updatedAt,
    priceHistorySeries
  };
};

const buildDecisionSummary = (property, pricingInsight) => {
  const idealFor = [];
  const highlights = [];
  const considerations = [];
  const photosCount = Array.isArray(property?.photos) ? property.photos.length : 0;

  if (property?.businessType === "sale" && property?.propertyType === "house" && Number(property?.bedrooms || 0) >= 3) {
    idealFor.push("Familias que buscan espacio para crecer");
  }

  if (property?.businessType === "rent" && property?.rentalArrangement === "roommate") {
    idealFor.push("Estudiantes o profesionales que quieren compartir gastos");
  }

  if (property?.businessType === "rent" && property?.petsAllowed) {
    idealFor.push("Inquilinos con mascotas");
  }

  if (property?.propertyType === "lot") {
    idealFor.push("Compra para construir o inversion de mediano plazo");
  }

  if (property?.propertyType === "commercial") {
    idealFor.push("Operacion comercial o renta corporativa");
  }

  if (["Guanacaste", "Puntarenas"].includes(property?.address?.province)) {
    idealFor.push("Compradores que priorizan estilo de vida o mercado turistico");
  }

  if (Number(property?.parkingSpaces || 0) > 0) {
    highlights.push(`${property.parkingSpaces} parqueo(s) registrados`);
  }

  if (Number(property?.bedrooms || 0) >= 3) {
    highlights.push("Distribucion comoda para familia o visitas");
  }

  if (property?.businessType === "rent" && property?.furnished) {
    highlights.push("Lista para mudarse sin invertir en mobiliario");
  }

  if (property?.businessType === "rent" && !property?.depositRequired) {
    highlights.push("No exige deposito al ingresar");
  }

  if (property?.rentalArrangement === "roommate" && property?.roommateDetails?.privateBathroom) {
    highlights.push("Incluye bano privado dentro del esquema compartido");
  }

  if (property?.serviceDistances?.hospitalKm !== undefined && Number(property.serviceDistances.hospitalKm) <= 3) {
    highlights.push("Hospital cercano segun lo declarado por el anunciante");
  }

  if (property?.serviceDistances?.schoolKm !== undefined && Number(property.serviceDistances.schoolKm) <= 3) {
    highlights.push("Escuela cercana para rutina familiar");
  }

  if (pricingInsight?.marketScore === "below-market") {
    highlights.push("Precio competitivo frente a comparables recientes");
  }

  if (property?.featured) {
    highlights.push("Publicacion destacada dentro de la plataforma");
  }

  if (property?.address?.hideExactLocation) {
    considerations.push("La ubicacion exacta esta protegida y se muestra de forma aproximada");
  }

  if (property?.businessType === "rent" && !property?.petsAllowed) {
    considerations.push("No acepta mascotas");
  }

  if (property?.businessType === "rent" && property?.depositRequired) {
    considerations.push("Requiere deposito para cerrar el alquiler");
  }

  if (!Number(property?.parkingSpaces || 0)) {
    considerations.push("No registra parqueo");
  }

  if (photosCount < 4) {
    considerations.push("La galeria aun es corta y conviene pedir mas contexto visual");
  }

  if (!hasServiceDistances(property)) {
    considerations.push("No declara distancias a hospital, escuela o colegio");
  }

  if (pricingInsight?.marketScore === "above-market") {
    considerations.push("El precio aparece por encima del rango comparado en la zona");
  }

  return {
    idealFor: uniqueList(idealFor).slice(0, 4),
    highlights: uniqueList(highlights).slice(0, 6),
    considerations: uniqueList(considerations).slice(0, 6)
  };
};

const buildListingInsights = (property, pricingInsight) => {
  const photosCount = Array.isArray(property?.photos) ? property.photos.length : 0;
  const amenitiesCount = Array.isArray(property?.amenities) ? property.amenities.length : 0;
  const descriptionLength = String(property?.description || "").trim().length;
  const hasContact = Boolean(property?.sellerInfo?.phone || property?.sellerInfo?.email);
  const views = Number(property?.views || property?.engagement?.views || 0);
  const leads = Number(property?.engagement?.leads || 0);
  const offers = Number(property?.engagement?.offers || 0);
  const favorites = Number(property?.engagement?.favorites || 0);

  let completenessScore = 0;
  if (descriptionLength >= 140) completenessScore += 18;
  else if (descriptionLength >= 70) completenessScore += 12;
  else if (descriptionLength >= 25) completenessScore += 6;
  completenessScore += clamp(photosCount * 5, 0, 25);
  completenessScore += clamp(amenitiesCount * 3, 0, 12);
  if (hasContact) completenessScore += 12;
  if (hasServiceDistances(property)) completenessScore += 10;
  if (pricingInsight?.marketScore) completenessScore += 8;
  if (property?.address?.district && property?.address?.canton && property?.address?.province) completenessScore += 8;
  if (property?.featured) completenessScore += 7;
  completenessScore = clamp(completenessScore, 18, 100);

  const strengths = [];
  const actionItems = [];

  if (photosCount >= 5) strengths.push("Galeria visual suficiente para inspirar confianza");
  if (amenitiesCount >= 4) strengths.push("Lista de amenidades bastante completa");
  if (hasContact) strengths.push("Contacto directo listo para convertir interes en lead");
  if (pricingInsight?.marketScore === "below-market") strengths.push("Precio competitivo frente a la zona");
  if (favorites >= 5) strengths.push("Ya genera senales de interes organico");
  if (leads > 0) strengths.push("El anuncio ya convierte visitas en conversaciones");

  if (photosCount < 5) {
    actionItems.push("Sube al menos 5 fotos bien iluminadas para mejorar confianza.");
  }

  if (descriptionLength < 120) {
    actionItems.push("Amplia la descripcion con contexto del vecindario, distribucion y beneficios.");
  }

  if (amenitiesCount < 3) {
    actionItems.push("Agrega amenidades clave para aparecer en mas filtros y comparaciones.");
  }

  if (!hasServiceDistances(property)) {
    actionItems.push("Completa las distancias a hospital, escuela y colegio para enriquecer la ficha.");
  }

  if (views >= 40 && leads === 0) {
    actionItems.push("Hay vistas pero no leads: revisa la portada, el precio y la claridad del titulo.");
  }

  if (leads >= 3 && offers === 0) {
    actionItems.push("Ya generas interes; agrega mas detalle comercial y seguimiento para mover ofertas.");
  }

  if (!property?.featured && views >= 60) {
    actionItems.push("Esta propiedad ya tiene traccion; destacarla podria acelerar contactos y ofertas.");
  }

  const attentionLevel =
    views >= 40 && leads === 0
      ? "urgent"
      : completenessScore < 60 || actionItems.length >= 3
        ? "watch"
        : "healthy";

  return {
    completenessScore,
    attentionLevel,
    strengths: uniqueList(strengths).slice(0, 4),
    actionItems: uniqueList(actionItems).slice(0, 5)
  };
};

export const enrichPropertyForClient = (property) => {
  const rawBase = property?.toObject ? property.toObject({ virtuals: true }) : { ...property };
  const base = normalizePropertyMediaUrls(rawBase);
  const trustProfile = buildTrustProfile(base);
  const pricingInsight = buildPricingInsight(base);
  const decisionSummary = buildDecisionSummary(base, pricingInsight);
  const listingInsights = buildListingInsights(base, pricingInsight);

  return {
    ...base,
    trustProfile,
    pricingInsight,
    decisionSummary,
    listingInsights
  };
};

export const enrichPropertyCollection = (items = []) => items.map((item) => enrichPropertyForClient(item));
