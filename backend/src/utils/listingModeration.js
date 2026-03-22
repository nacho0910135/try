const normalizeText = (value = "") =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value = "") =>
  normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 3);

const jaccardSimilarity = (firstText = "", secondText = "") => {
  const first = new Set(tokenize(firstText));
  const second = new Set(tokenize(secondText));

  if (!first.size && !second.size) {
    return 0;
  }

  let intersection = 0;
  first.forEach((token) => {
    if (second.has(token)) {
      intersection += 1;
    }
  });

  const union = new Set([...first, ...second]).size || 1;
  return intersection / union;
};

const coordinateDistance = (first = [], second = []) => {
  if (!Array.isArray(first) || !Array.isArray(second) || first.length !== 2 || second.length !== 2) {
    return Number.POSITIVE_INFINITY;
  }

  const [firstLng, firstLat] = first.map(Number);
  const [secondLng, secondLat] = second.map(Number);
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRad(secondLat - firstLat);
  const deltaLng = toRad(secondLng - firstLng);
  const latA = toRad(firstLat);
  const latB = toRad(secondLat);

  const angle =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(angle), Math.sqrt(1 - angle)));
};

const calculateUppercaseRatio = (value = "") => {
  const letters = String(value || "").replace(/[^a-zA-Z\u00C0-\u017F]/g, "");

  if (!letters.length) {
    return 0;
  }

  const upper = letters.split("").filter((character) => character === character.toUpperCase()).length;
  return upper / letters.length;
};

const hasContactInfo = (value = "") =>
  /(\+?\d[\d\s-]{6,}\d)|([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i.test(String(value || ""));

const hasRepeatedPunctuation = (value = "") => /([!?.,])\1{2,}/.test(String(value || ""));

const hasRepeatedCharacter = (value = "") => /(.)\1{4,}/i.test(String(value || ""));

const buildSuspiciousFlags = (listing = {}) => {
  const flags = [];
  const title = String(listing.title || "");
  const description = String(listing.description || "");
  const photoCount = Number(listing.photos?.length || listing.media?.filter?.((item) => item.type === "image")?.length || 0);

  if (description.trim().length < 40) {
    flags.push("descripcion_muy_corta");
  }

  if (title.trim().length < 12) {
    flags.push("titulo_muy_corto");
  }

  if (calculateUppercaseRatio(title) > 0.7) {
    flags.push("titulo_con_muchas_mayusculas");
  }

  if (hasContactInfo(`${title} ${description}`)) {
    flags.push("datos_de_contacto_en_texto");
  }

  if (hasRepeatedPunctuation(`${title} ${description}`) || hasRepeatedCharacter(`${title} ${description}`)) {
    flags.push("texto_con_patrones_poco_naturales");
  }

  if (!photoCount) {
    flags.push("sin_fotos");
  }

  return flags;
};

const scoreDuplicateCandidate = (candidate = {}, existing = {}) => {
  let score = 0;
  const reasons = [];

  const titleSimilarity = jaccardSimilarity(candidate.title, existing.title);
  const descriptionSimilarity = jaccardSimilarity(candidate.description, existing.description);
  const sameProvince =
    normalizeText(candidate.address?.province) === normalizeText(existing.address?.province);
  const sameCanton = normalizeText(candidate.address?.canton) === normalizeText(existing.address?.canton);
  const sameDistrict =
    normalizeText(candidate.address?.district) === normalizeText(existing.address?.district);
  const sameType = candidate.propertyType === existing.propertyType;
  const sameBusiness = candidate.businessType === existing.businessType;
  const priceA = Number(candidate.price || 0);
  const priceB = Number(existing.price || 0);
  const priceDelta = Math.abs(priceA - priceB);
  const priceDeltaRatio = Math.max(priceA, priceB) ? priceDelta / Math.max(priceA, priceB) : 0;
  const areaA = Number(candidate.constructionArea || candidate.lotArea || candidate.landArea || 0);
  const areaB = Number(existing.constructionArea || existing.lotArea || existing.landArea || 0);
  const areaDeltaRatio = Math.max(areaA, areaB) ? Math.abs(areaA - areaB) / Math.max(areaA, areaB) : 1;
  const distanceKm = coordinateDistance(candidate.location?.coordinates, existing.location?.coordinates);
  const mainPhotoA = candidate.photos?.find?.((photo) => photo.isPrimary)?.url || candidate.photos?.[0]?.url;
  const mainPhotoB = existing.photos?.find?.((photo) => photo.isPrimary)?.url || existing.photos?.[0]?.url;

  if (sameProvince && sameCanton && sameDistrict) {
    score += 12;
    reasons.push("misma_zona");
  }

  if (sameType && sameBusiness) {
    score += 10;
    reasons.push("mismo_tipo_y_negocio");
  }

  if (titleSimilarity >= 0.9) {
    score += 26;
    reasons.push("titulo_casi_identico");
  } else if (titleSimilarity >= 0.7) {
    score += 16;
    reasons.push("titulo_muy_parecido");
  }

  if (descriptionSimilarity >= 0.92) {
    score += 18;
    reasons.push("descripcion_casi_identica");
  } else if (descriptionSimilarity >= 0.75) {
    score += 10;
    reasons.push("descripcion_muy_parecida");
  }

  if (priceDeltaRatio <= 0.02) {
    score += 12;
    reasons.push("precio_casi_igual");
  } else if (priceDeltaRatio <= 0.06) {
    score += 6;
    reasons.push("precio_parecido");
  }

  if (areaA && areaB && areaDeltaRatio <= 0.08) {
    score += 7;
    reasons.push("area_muy_parecida");
  }

  if (
    Number(candidate.bedrooms || 0) === Number(existing.bedrooms || 0) &&
    Number(candidate.bathrooms || 0) === Number(existing.bathrooms || 0)
  ) {
    score += 5;
    reasons.push("misma_distribucion");
  }

  if (distanceKm <= 0.08) {
    score += 24;
    reasons.push("misma_ubicacion_aproximada");
  } else if (distanceKm <= 0.25) {
    score += 10;
    reasons.push("ubicacion_muy_cercana");
  }

  if (mainPhotoA && mainPhotoB && mainPhotoA === mainPhotoB) {
    score += 18;
    reasons.push("foto_principal_igual");
  }

  return {
    score,
    reasons
  };
};

export const analyzeListingModeration = (listing = {}, existingListings = []) => {
  const suspiciousFlags = buildSuspiciousFlags(listing);
  const duplicateCandidates = existingListings
    .map((existing) => {
      const scored = scoreDuplicateCandidate(listing, existing);

      return {
        propertyId: existing._id,
        slug: existing.slug,
        title: existing.title,
        ...scored
      };
    })
    .filter((item) => item.score >= 35)
    .sort((first, second) => second.score - first.score)
    .slice(0, 5);

  const duplicateScore = duplicateCandidates[0]?.score || 0;
  const penalty = suspiciousFlags.length * 9 + (duplicateScore >= 70 ? 20 : duplicateScore >= 45 ? 10 : 0);
  const contentQualityScore = Math.max(100 - penalty, 35);

  let reviewStatus = "clean";

  if (duplicateScore >= 70 || suspiciousFlags.includes("datos_de_contacto_en_texto")) {
    reviewStatus = "review";
  } else if (duplicateScore >= 45 || suspiciousFlags.length >= 2) {
    reviewStatus = "watch";
  }

  return {
    duplicateScore,
    duplicateCandidateCount: duplicateCandidates.length,
    duplicateCandidates,
    suspiciousFlags,
    contentQualityScore,
    reviewStatus,
    lastAnalyzedAt: new Date()
  };
};
