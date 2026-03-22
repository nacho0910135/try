import { Property } from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";
import { deepseekService } from "./deepseekService.js";
import { marketAnalyticsService } from "./marketAnalyticsService.js";

const ACTIVE_STATUSES = ["available", "reserved"];
const CLOSED_STATUSES = ["sold", "rented"];

const safeArea = (property) =>
  property?.constructionArea || property?.landArea || property?.lotArea || 1;

const average = (values = []) =>
  values.length
    ? values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length
    : 0;

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
};

const pricePerSquareMeter = (property) => {
  const area = safeArea(property);
  return area ? (property?.finalPrice || property?.price || 0) / area : 0;
};

const slugMonth = (value) => new Date(value).toISOString().slice(0, 7);

const toSeriesPoints = (items = []) =>
  items
    .filter((item) => item.month && Number.isFinite(item.averagePpsm))
    .map((item, index) => ({ x: index + 1, y: Number(item.averagePpsm), month: item.month }));

const linearRegression = (points = []) => {
  if (points.length < 2) {
    return null;
  }

  const n = points.length;
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  const denominator = n * sumXX - sumX ** 2;

  if (!denominator) {
    return null;
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const predict = (x) => slope * x + intercept;

  return { slope, intercept, predict };
};

const buildTrendDirection = (percentage) => {
  if (percentage >= 4) return "up";
  if (percentage <= -4) return "down";
  return "stable";
};

const translateScore = (marketScore, language) => {
  const labels = {
    "below-market": {
      es: "Debajo del mercado",
      en: "Below market"
    },
    "in-range": {
      es: "En rango",
      en: "In range"
    },
    "above-market": {
      es: "Por encima del mercado",
      en: "Above market"
    }
  };

  return labels[marketScore]?.[language] || marketScore;
};

const labelStatus = (status, language) => {
  const labels = {
    sale: { es: "Venta", en: "Sale" },
    rent: { es: "Renta", en: "Rent" },
    house: { es: "Casa", en: "House" },
    apartment: { es: "Apartamento", en: "Apartment" },
    condominium: { es: "Condominio", en: "Condominium" },
    lot: { es: "Lote / Terreno", en: "Lot / Land" },
    room: { es: "Habitacion", en: "Room" },
    commercial: { es: "Comercial", en: "Commercial" },
    available: { es: "Disponible", en: "Available" },
    reserved: { es: "Reservada", en: "Reserved" },
    sold: { es: "Vendida", en: "Sold" },
    rented: { es: "Alquilada", en: "Rented" }
  };

  return labels[status]?.[language] || status;
};

const sanitizeLocation = (property = {}) => ({
  province: property.address?.province || "",
  canton: property.address?.canton || "",
  district: property.address?.district || "",
  neighborhood: property.address?.neighborhood || ""
});

const sanitizePropertyForAnalysis = (property = {}, intelligence = null, language = "es") => ({
  _id: String(property._id),
  title: property.title,
  slug: property.slug,
  businessType: property.businessType,
  businessTypeLabel: labelStatus(property.businessType, language),
  propertyType: property.propertyType,
  propertyTypeLabel: labelStatus(property.propertyType, language),
  marketStatus: property.marketStatus,
  marketStatusLabel: labelStatus(property.marketStatus, language),
  price: property.price,
  finalPrice: property.finalPrice || null,
  currency: property.currency,
  bedrooms: property.bedrooms || 0,
  bathrooms: property.bathrooms || 0,
  parkingSpaces: property.parkingSpaces || 0,
  constructionArea: property.constructionArea || 0,
  landArea: property.landArea || property.lotArea || 0,
  furnished: Boolean(property.furnished),
  petsAllowed: Boolean(property.petsAllowed),
  depositRequired: Boolean(property.depositRequired),
  rentalArrangement: property.rentalArrangement || null,
  roomiesFriendly: Boolean(
    property.rentalArrangement === "roommate" || property.roommateDetails?.availableRooms
  ),
  roommateDetails: property.roommateDetails
    ? {
        privateRoom: Boolean(property.roommateDetails.privateRoom),
        privateBathroom: Boolean(property.roommateDetails.privateBathroom),
        utilitiesIncluded: Boolean(property.roommateDetails.utilitiesIncluded),
        studentFriendly: Boolean(property.roommateDetails.studentFriendly),
        availableRooms: property.roommateDetails.availableRooms || 0
      }
    : null,
  serviceDistances: property.serviceDistances || null,
  engagement: {
    views: property.views || property.engagement?.views || 0,
    favorites: property.engagement?.favorites || 0,
    leads: property.engagement?.leads || 0
  },
  analyticsSnapshot: intelligence?.valuation
    ? {
        marketScore: intelligence.valuation.marketScore,
        marketScoreLabel: translateScore(intelligence.valuation.marketScore, language),
        pricePerSquareMeter: intelligence.valuation.pricePerSquareMeter,
        comparableAveragePpsm: intelligence.valuation.comparableAveragePpsm,
        deltaPct: intelligence.valuation.deltaPct,
        suggestedPriceMin: intelligence.valuation.suggestedPriceMin,
        suggestedPriceMax: intelligence.valuation.suggestedPriceMax
      }
    : property.analyticsSnapshot || null,
  historicalSignals: intelligence?.historicalSignals || null,
  location: sanitizeLocation(property)
});

const pickWinner = (firstValue, secondValue, mode = "higher") => {
  if (firstValue === secondValue) {
    return "tie";
  }

  if (mode === "lower") {
    return firstValue < secondValue ? "first" : "second";
  }

  return firstValue > secondValue ? "first" : "second";
};

const scoreMarketAlignment = (marketScore) => {
  if (marketScore === "below-market") return 3;
  if (marketScore === "in-range") return 2;
  if (marketScore === "above-market") return 1;
  return 0;
};

const scoreServices = (serviceDistances) => {
  if (!serviceDistances) return null;

  const values = [
    serviceDistances.hospitalKm,
    serviceDistances.schoolKm,
    serviceDistances.highSchoolKm
  ].filter((value) => Number.isFinite(value));

  if (!values.length) {
    return null;
  }

  return average(values);
};

const buildMetricBattle = (first, second, language) => {
  const labels = {
    affordability: {
      es: "Accesibilidad de precio",
      en: "Price accessibility"
    },
    ppsm: {
      es: "Precio por m2",
      en: "Price per m2"
    },
    size: {
      es: "Espacio construido",
      en: "Built area"
    },
    bedrooms: {
      es: "Habitaciones",
      en: "Bedrooms"
    },
    bathrooms: {
      es: "Baños",
      en: "Bathrooms"
    },
    marketFit: {
      es: "Ajuste al mercado",
      en: "Market fit"
    },
    interest: {
      es: "Interes del mercado",
      en: "Market interest"
    },
    services: {
      es: "Servicios cercanos",
      en: "Nearby services"
    },
    rentFlexibility: {
      es: "Flexibilidad de renta",
      en: "Rental flexibility"
    }
  };

  const sameCurrency = first.currency === second.currency;
  const mixedCurrencyNote =
    language === "en"
      ? "Different currencies. Values are shown separately."
      : "Monedas distintas. Los valores se muestran por separado.";

  const firstInterest =
    (first.engagement.views || 0) +
    (first.engagement.favorites || 0) * 3 +
    (first.engagement.leads || 0) * 5;
  const secondInterest =
    (second.engagement.views || 0) +
    (second.engagement.favorites || 0) * 3 +
    (second.engagement.leads || 0) * 5;
  const firstServiceScore = scoreServices(first.serviceDistances);
  const secondServiceScore = scoreServices(second.serviceDistances);
  const firstRentFlex =
    (first.petsAllowed ? 1 : 0) +
    (!first.depositRequired ? 1 : 0) +
    (first.roomiesFriendly ? 1 : 0);
  const secondRentFlex =
    (second.petsAllowed ? 1 : 0) +
    (!second.depositRequired ? 1 : 0) +
    (second.roomiesFriendly ? 1 : 0);

  const metrics = [
    {
      key: "affordability",
      label: labels.affordability[language],
      firstValue: first.price || 0,
      secondValue: second.price || 0,
      firstCurrency: first.currency,
      secondCurrency: second.currency,
      preferred: sameCurrency ? "lower" : "neutral",
      note: sameCurrency ? null : mixedCurrencyNote
    },
    {
      key: "ppsm",
      label: labels.ppsm[language],
      firstValue: first.analyticsSnapshot?.pricePerSquareMeter || pricePerSquareMeter(first),
      secondValue: second.analyticsSnapshot?.pricePerSquareMeter || pricePerSquareMeter(second),
      firstCurrency: first.currency,
      secondCurrency: second.currency,
      preferred: sameCurrency ? "lower" : "neutral",
      note: sameCurrency ? null : mixedCurrencyNote
    },
    {
      key: "size",
      label: labels.size[language],
      firstValue: first.constructionArea || first.landArea || 0,
      secondValue: second.constructionArea || second.landArea || 0,
      preferred: "higher"
    },
    {
      key: "bedrooms",
      label: labels.bedrooms[language],
      firstValue: first.bedrooms || 0,
      secondValue: second.bedrooms || 0,
      preferred: "higher"
    },
    {
      key: "bathrooms",
      label: labels.bathrooms[language],
      firstValue: first.bathrooms || 0,
      secondValue: second.bathrooms || 0,
      preferred: "higher"
    },
    {
      key: "marketFit",
      label: labels.marketFit[language],
      firstValue: scoreMarketAlignment(first.analyticsSnapshot?.marketScore),
      secondValue: scoreMarketAlignment(second.analyticsSnapshot?.marketScore),
      preferred: "higher"
    },
    {
      key: "interest",
      label: labels.interest[language],
      firstValue: firstInterest,
      secondValue: secondInterest,
      preferred: "higher"
    }
  ];

  if (firstServiceScore !== null && secondServiceScore !== null) {
    metrics.push({
      key: "services",
      label: labels.services[language],
      firstValue: round(firstServiceScore, 1),
      secondValue: round(secondServiceScore, 1),
      preferred: "lower"
    });
  }

  if (first.businessType === "rent" || second.businessType === "rent") {
    metrics.push({
      key: "rentFlexibility",
      label: labels.rentFlexibility[language],
      firstValue: firstRentFlex,
      secondValue: secondRentFlex,
      preferred: "higher"
    });
  }

  return metrics.map((metric) => ({
    ...metric,
    winner:
      metric.preferred === "neutral"
        ? "tie"
        : pickWinner(
            metric.firstValue,
            metric.secondValue,
            metric.preferred === "lower" ? "lower" : "higher"
          )
  }));
};

const buildProsAndCons = (property, competitor, language) => {
  const pros = [];
  const cons = [];
  const sameCurrency = property.currency === competitor.currency;

  if ((property.analyticsSnapshot?.marketScore || "") === "below-market") {
    pros.push(
      language === "en"
        ? "Pricing looks attractive relative to nearby comparables."
        : "El precio luce atractivo frente a comparables cercanos."
    );
  }

  if ((property.analyticsSnapshot?.marketScore || "") === "above-market") {
    cons.push(
      language === "en"
        ? "It appears above the nearby market range."
        : "Se ve por encima del rango de mercado cercano."
    );
  }

  if ((property.constructionArea || 0) > (competitor.constructionArea || 0)) {
    pros.push(
      language === "en"
        ? "Offers more usable space than the alternative."
        : "Ofrece mas espacio util que la alternativa."
    );
  }

  if ((property.bedrooms || 0) > (competitor.bedrooms || 0)) {
    pros.push(
      language === "en"
        ? "Provides more bedrooms for flexible living or work use."
        : "Da mas habitaciones para vivir, trabajar o crecer."
    );
  }

  if (sameCurrency && (property.price || 0) > (competitor.price || 0)) {
    cons.push(
      language === "en"
        ? "Has a higher entry price than the other option."
        : "Tiene un precio de entrada mas alto que la otra opcion."
    );
  }

  if (property.businessType === "rent" && property.depositRequired) {
    cons.push(
      language === "en"
        ? "Requires a deposit, which adds upfront cash pressure."
        : "Requiere deposito, lo que sube el costo inicial."
    );
  }

  if (property.businessType === "rent" && property.petsAllowed) {
    pros.push(
      language === "en"
        ? "Pet-friendly conditions add flexibility."
        : "Aceptar mascotas agrega flexibilidad."
    );
  }

  if (scoreServices(property.serviceDistances) !== null && scoreServices(competitor.serviceDistances) !== null) {
    if (scoreServices(property.serviceDistances) < scoreServices(competitor.serviceDistances)) {
      pros.push(
        language === "en"
          ? "Shows shorter distances to key nearby services."
          : "Muestra distancias mas cortas a servicios clave."
      );
    }
  }

  return {
    pros: pros.slice(0, 3),
    cons: cons.slice(0, 3)
  };
};

const fallbackBattleNarrative = (first, second, winner, language) => {
  const mixedCurrencies = first.currency !== second.currency;

  if (winner === "tie") {
    return language === "en"
      ? `Both properties are very close in overall value.${mixedCurrencies ? " Because they use different currencies, monetary metrics were treated carefully." : ""} The best choice depends on whether you prioritize price, space, or rental flexibility.`
      : `Ambas propiedades estan muy cerca en valor general.${mixedCurrencies ? " Como usan monedas distintas, los metricos monetarios se trataron con cuidado." : ""} La mejor eleccion depende de si priorizas precio, espacio o flexibilidad de renta.`;
  }

  const selected = winner === "first" ? first : second;
  const other = winner === "first" ? second : first;

  return language === "en"
    ? `${selected.title} edges ahead thanks to a stronger balance between market fit, practical features, and overall decision value versus ${other.title}.${mixedCurrencies ? " Price values were reviewed as separate currencies rather than forced into a direct price winner." : ""}`
    : `${selected.title} toma ventaja por un mejor balance entre ajuste al mercado, caracteristicas practicas y valor general frente a ${other.title}.${mixedCurrencies ? " Los precios se revisaron como monedas separadas en vez de forzar una ganadora solo por precio." : ""}`;
};

const normalizeQuestion = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const resolvePersonaIntent = (normalizedQuestion) => {
  if (/\b(familia|family|ninos|children|hogar)\b/.test(normalizedQuestion)) {
    return "family";
  }

  if (/\b(roomies|roommate|shared|estudiant|student|universitari|cuarto)\b/.test(normalizedQuestion)) {
    return "roomies";
  }

  if (/\b(ejecutiv|executive|corporativ|office|oficina|reubic)\b/.test(normalizedQuestion)) {
    return "executive";
  }

  if (/\b(inversion|investment|plusvalia|coast|coastal|playa|beach|airbnb|turis)\b/.test(normalizedQuestion)) {
    return "coastal";
  }

  return null;
};

const buildPersonaFallback = ({ overview, personaId, language }) => {
  const board = overview?.personaBoards?.find((item) => item.id === personaId);

  if (!board?.items?.length) {
    return null;
  }

  const [first, second] = board.items;

  if (language === "en") {
    return second
      ? `${board.title} currently points first to ${first.label}, with ${first.subtitle}. A second strong zone is ${second.label}, which also shows solid fit for that profile.`
      : `${board.title} currently points first to ${first.label}, with ${first.subtitle}.`;
  }

  return second
    ? `${board.title} apunta primero a ${first.label}, con ${first.subtitle}. Otra zona fuerte para ese perfil es ${second.label}, que tambien viene mostrando buena afinidad.`
    : `${board.title} apunta primero a ${first.label}, con ${first.subtitle}.`;
};

const buildMomentumFallback = ({ overview, language }) => {
  const positiveMomentum = overview?.zoneMomentum?.find((item) => item.projectedDeltaPct > 0);
  const coolingMomentum = overview?.zoneMomentum?.find((item) => item.projectedDeltaPct < 0);

  if (!positiveMomentum && !coolingMomentum) {
    return null;
  }

  if (language === "en") {
    if (positiveMomentum && coolingMomentum) {
      return `${positiveMomentum.label} shows the strongest positive momentum right now at ${positiveMomentum.projectedDeltaPct}% projected change, while ${coolingMomentum.label} is the clearest cooling signal at ${coolingMomentum.projectedDeltaPct}%.`;
    }

    if (positiveMomentum) {
      return `${positiveMomentum.label} shows the strongest positive momentum right now, with a projected ${positiveMomentum.projectedDeltaPct}% move.`;
    }

    return `${coolingMomentum.label} is the clearest cooling signal right now, with a projected ${coolingMomentum.projectedDeltaPct}% move.`;
  }

  if (positiveMomentum && coolingMomentum) {
    return `${positiveMomentum.label} muestra el momentum positivo mas fuerte ahora mismo con una variacion proyectada de ${positiveMomentum.projectedDeltaPct}%, mientras ${coolingMomentum.label} es la senal mas clara de enfriamiento con ${coolingMomentum.projectedDeltaPct}%.`;
  }

  if (positiveMomentum) {
    return `${positiveMomentum.label} muestra el momentum positivo mas fuerte ahora mismo, con una variacion proyectada de ${positiveMomentum.projectedDeltaPct}%.`;
  }

  return `${coolingMomentum.label} es la senal mas clara de enfriamiento ahora mismo, con una variacion proyectada de ${coolingMomentum.projectedDeltaPct}%.`;
};

const buildFallbackChat = ({ question, overview, comparison, language }) => {
  const topZone = overview?.opportunityZones?.[0];

  if (comparison?.winner && /cual|cu[aá]l|which|better|mejor/i.test(question)) {
    const winner = comparison.winner === "first"
      ? comparison.properties[0]
      : comparison.properties[1];

    return language === "en"
      ? `Based on the current analysis, ${winner.title} looks like the stronger option. It stands out mainly for market fit, value, and practical decision score.`
      : `Segun el analisis actual, ${winner.title} luce como la opcion mas fuerte. Destaca principalmente por ajuste al mercado, valor y puntaje practico.`;
  }

  if (topZone) {
    return language === "en"
      ? `The strongest opportunity signal right now is ${topZone.label}, with an opportunity score of ${topZone.opportunityScore}/100 and a demand signal of ${topZone.demandSignal}.`
      : `La señal de oportunidad mas fuerte ahora es ${topZone.label}, con un puntaje de ${topZone.opportunityScore}/100 y una demanda de ${topZone.demandSignal}.`;
  }

  return language === "en"
    ? "I can help with prices, comparables, market momentum, and property trade-offs using sanitized listing data."
    : "Puedo ayudarte con precios, comparables, momentum de mercado y trade-offs entre propiedades usando datos sanitizados del inventario.";
};

const buildFallbackChatSafe = ({ question, overview, comparison, language }) => {
  const normalizedQuestion = normalizeQuestion(question);
  const topZone = overview?.opportunityZones?.[0];
  const personaIntent = resolvePersonaIntent(normalizedQuestion);

  if (
    /\b(momentum|tendencia|trend|zona|zone|district|distrito|plusvalia|appreciation)\b/.test(
      normalizedQuestion
    )
  ) {
    const momentumAnswer = buildMomentumFallback({ overview, language });
    if (momentumAnswer) {
      return momentumAnswer;
    }
  }

  if (personaIntent) {
    const personaAnswer = buildPersonaFallback({ overview, personaId: personaIntent, language });
    if (personaAnswer) {
      return personaAnswer;
    }
  }

  if (comparison?.winner && /\b(cual|cu\u00e1l|which|better|mejor)\b/i.test(question)) {
    if (comparison.winner === "tie") {
      return language === "en"
        ? "The comparison is still very close. I would decide based on your main priority: price efficiency, more space, or rental flexibility."
        : "La comparacion sigue muy cerrada. Yo decidiria segun tu prioridad principal: eficiencia de precio, mas espacio o flexibilidad de renta.";
    }

    const winner =
      comparison.winner === "first"
        ? comparison.properties[0]
        : comparison.properties[1];

    return language === "en"
      ? `Based on the current analysis, ${winner.title} looks like the stronger option. It stands out mainly for market fit, value, and practical decision score.`
      : `Segun el analisis actual, ${winner.title} luce como la opcion mas fuerte. Destaca principalmente por ajuste al mercado, valor y puntaje practico.`;
  }

  if (topZone) {
    return language === "en"
      ? `The strongest opportunity signal right now is ${topZone.label}, with an opportunity score of ${topZone.opportunityScore}/100 and a demand signal of ${topZone.demandSignal}.`
      : `La senal de oportunidad mas fuerte ahora es ${topZone.label}, con un puntaje de ${topZone.opportunityScore}/100 y una demanda de ${topZone.demandSignal}.`;
  }

  return language === "en"
    ? "I can help with prices, comparables, market momentum, best zones by buyer profile, and property trade-offs using sanitized listing data."
    : "Puedo ayudarte con precios, comparables, momentum de mercado, mejores zonas por perfil y trade-offs entre propiedades usando datos sanitizados del inventario.";
};

const buildOpportunityZones = (overview = {}) => {
  const priceByDistrictMap = new Map(
    (overview.priceByDistrict || []).map((item) => [item.label, item])
  );
  const liquidityMap = new Map(
    (overview.liquidityRanking || []).map((item) => [item.label, item])
  );

  return (overview.topDemandZones || [])
    .map((item) => {
      const pricing = priceByDistrictMap.get(item.label);
      const liquidity = liquidityMap.get(item.label);
      const priceScore = pricing?.averagePpsm
        ? Math.max(15, Math.min(100, round(100 / (1 + pricing.averagePpsm / 1800))))
        : 50;
      const demandScore = Math.min(100, Math.round((item.demandSignal || 0) / 6));
      const liquidityScore = liquidity?.averageDaysOnMarket
        ? Math.max(10, 100 - Math.min(100, liquidity.averageDaysOnMarket))
        : 55;
      const opportunityScore = round(
        demandScore * 0.45 + priceScore * 0.25 + liquidityScore * 0.3,
        1
      );

      return {
        label: item.label,
        demandSignal: item.demandSignal,
        averagePpsm: pricing?.averagePpsm || 0,
        averageDaysOnMarket: liquidity?.averageDaysOnMarket || null,
        activeCount: liquidity?.activeCount || 0,
        closedCount: liquidity?.closedCount || 0,
        opportunityScore
      };
    })
    .sort((first, second) => second.opportunityScore - first.opportunityScore)
    .slice(0, 8);
};

const buildForecasts = (properties = []) => {
  const grouped = new Map();

  properties
    .filter((property) => property.marketStatus && property.currency)
    .forEach((property) => {
      const closedAt = property.soldAt || property.rentedAt || property.publishedAt || property.createdAt;
      if (!closedAt) return;

      const month = slugMonth(closedAt);
      const key = `${property.address?.province || "Costa Rica"}|${property.currency}`;
      const current = grouped.get(key) || [];
      current.push({
        month,
        ppsm: pricePerSquareMeter(property)
      });
      grouped.set(key, current);
    });

  return Array.from(grouped.entries())
    .map(([compoundKey, rows]) => {
      const [zone, currency] = compoundKey.split("|");
      const monthMap = new Map();

      rows.forEach((row) => {
        const current = monthMap.get(row.month) || [];
        current.push(row.ppsm);
        monthMap.set(row.month, current);
      });

      const series = Array.from(monthMap.entries())
        .map(([month, values]) => ({
          month,
          averagePpsm: round(average(values))
        }))
        .sort((first, second) => first.month.localeCompare(second.month))
        .slice(-8);

      const points = toSeriesPoints(series);
      const regression = linearRegression(points);

      if (!regression || points.length < 3) {
        return null;
      }

      const currentAveragePpsm = points[points.length - 1].y;
      const projectedNextQuarter = regression.predict(points.length + 3);
      const projectedDeltaPct = currentAveragePpsm
        ? ((projectedNextQuarter - currentAveragePpsm) / currentAveragePpsm) * 100
        : 0;

      return {
        zone,
        currency,
        currentAveragePpsm: round(currentAveragePpsm),
        projectedNextQuarterPpsm: round(projectedNextQuarter),
        projectedDeltaPct: round(projectedDeltaPct, 1),
        trend: buildTrendDirection(projectedDeltaPct),
        sampleSize: rows.length,
        series
      };
    })
    .filter(Boolean)
    .sort((first, second) => Math.abs(second.projectedDeltaPct) - Math.abs(first.projectedDeltaPct))
    .slice(0, 8);
};

const buildBusinessMix = (properties = []) => {
  const active = properties.filter((property) => ACTIVE_STATUSES.includes(property.marketStatus));
  const byBusiness = ["sale", "rent"].map((businessType) => ({
    businessType,
    count: active.filter((property) => property.businessType === businessType).length
  }));
  const byPropertyType = [...new Set(active.map((property) => property.propertyType))]
    .map((propertyType) => ({
      propertyType,
      count: active.filter((property) => property.propertyType === propertyType).length
    }))
    .sort((first, second) => second.count - first.count)
    .slice(0, 8);

  return {
    byBusiness,
    byPropertyType
  };
};

const buildDecisionSignals = (properties = []) => {
  const active = properties.filter((property) => ACTIVE_STATUSES.includes(property.marketStatus));
  const sale = active.filter((property) => property.businessType === "sale");
  const rent = active.filter((property) => property.businessType === "rent");
  const avgArea = round(average(active.map((property) => safeArea(property))));
  const avgBedrooms = round(average(active.map((property) => property.bedrooms || 0)), 1);
  const avgBathrooms = round(average(active.map((property) => property.bathrooms || 0)), 1);

  return {
    petFriendlyRentals: rent.filter((property) => property.petsAllowed).length,
    depositFreeRentals: rent.filter((property) => !property.depositRequired).length,
    furnishedRentals: rent.filter((property) => property.furnished).length,
    roommateListings: rent.filter(
      (property) =>
        property.rentalArrangement === "roommate" || property.propertyType === "room"
    ).length,
    familyReadyListings: sale.filter(
      (property) => (property.bedrooms || 0) >= 3 && (property.bathrooms || 0) >= 2
    ).length,
    averageActiveArea: avgArea,
    averageBedrooms: avgBedrooms,
    averageBathrooms: avgBathrooms
  };
};

const buildZoneMomentum = (properties = []) => {
  const grouped = new Map();

  properties
    .filter((property) => CLOSED_STATUSES.includes(property.marketStatus))
    .forEach((property) => {
      const zone = `${property.address?.district || ""}, ${property.address?.canton || ""}`;
      const currency = property.currency || "USD";
      const closedAt = property.soldAt || property.rentedAt || property.publishedAt || property.createdAt;

      if (!zone.trim() || !closedAt) {
        return;
      }

      const key = `${zone}|${currency}`;
      const current = grouped.get(key) || [];
      current.push({
        month: slugMonth(closedAt),
        ppsm: pricePerSquareMeter(property)
      });
      grouped.set(key, current);
    });

  return Array.from(grouped.entries())
    .map(([compoundKey, rows]) => {
      const [zone, currency] = compoundKey.split("|");
      const monthMap = new Map();

      rows.forEach((row) => {
        const current = monthMap.get(row.month) || [];
        current.push(row.ppsm);
        monthMap.set(row.month, current);
      });

      const series = Array.from(monthMap.entries())
        .map(([month, values]) => ({
          month,
          averagePpsm: round(average(values))
        }))
        .sort((first, second) => first.month.localeCompare(second.month))
        .slice(-6);

      const points = toSeriesPoints(series);
      const regression = linearRegression(points);

      if (!regression || points.length < 3) {
        return null;
      }

      const currentAveragePpsm = points[points.length - 1].y;
      const projectedNextQuarter = regression.predict(points.length + 3);
      const projectedDeltaPct = currentAveragePpsm
        ? ((projectedNextQuarter - currentAveragePpsm) / currentAveragePpsm) * 100
        : 0;

      return {
        label: zone,
        currency,
        currentAveragePpsm: round(currentAveragePpsm),
        projectedNextQuarterPpsm: round(projectedNextQuarter),
        projectedDeltaPct: round(projectedDeltaPct, 1),
        trend: buildTrendDirection(projectedDeltaPct),
        sampleSize: rows.length,
        series
      };
    })
    .filter(Boolean)
    .sort((first, second) => Math.abs(second.projectedDeltaPct) - Math.abs(first.projectedDeltaPct))
    .slice(0, 8);
};

const buildPersonaZoneBoard = ({
  id,
  title,
  description,
  properties,
  scoreProperty,
  subtitleBuilder
}) => {
  const grouped = new Map();

  properties.forEach((property) => {
    const zone = `${property.address?.district || ""}, ${property.address?.canton || ""}`;
    if (!zone.trim()) {
      return;
    }

    const score = scoreProperty(property);
    if (!score) {
      return;
    }

    const current = grouped.get(zone) || [];
    current.push({ property, score });
    grouped.set(zone, current);
  });

  const items = Array.from(grouped.entries())
    .map(([label, entries]) => ({
      label,
      value: round(entries.reduce((sum, item) => sum + item.score, 0)),
      subtitle: subtitleBuilder(entries.map((item) => item.property))
    }))
    .sort((first, second) => second.value - first.value)
    .slice(0, 5);

  return {
    id,
    title,
    description,
    items
  };
};

const buildPersonaBoards = (properties = []) => {
  const active = properties.filter((property) => ACTIVE_STATUSES.includes(property.marketStatus));

  return [
    buildPersonaZoneBoard({
      id: "family",
      title: "Family-ready zones",
      description: "Large homes, multiple baths, and family fit.",
      properties: active,
      scoreProperty: (property) => {
        if ((property.bedrooms || 0) < 3 || (property.bathrooms || 0) < 2) {
          return 0;
        }
        return 12 + (property.parkingSpaces || 0) * 2 + safeArea(property) / 90;
      },
      subtitleBuilder: (items) =>
        `${items.length} listings · ${round(average(items.map((item) => safeArea(item))))} m2 avg`
    }),
    buildPersonaZoneBoard({
      id: "roomies",
      title: "Roomies and student zones",
      description: "Shared living, student-friendly, and flexible rental setup.",
      properties: active,
      scoreProperty: (property) => {
        const sharedLiving =
          property.rentalArrangement === "roommate" || property.propertyType === "room";
        if (!sharedLiving && !property.roommateDetails?.studentFriendly) {
          return 0;
        }
        return (
          14 +
          (property.roommateDetails?.studentFriendly ? 4 : 0) +
          (property.roommateDetails?.privateRoom ? 3 : 0) +
          (!property.depositRequired ? 2 : 0)
        );
      },
      subtitleBuilder: (items) =>
        `${items.length} listings · ${items.filter((item) => item.petsAllowed).length} pet-friendly`
    }),
    buildPersonaZoneBoard({
      id: "executive",
      title: "Executive relocation zones",
      description: "Furnished inventory, condos, and practical work-oriented fit.",
      properties: active,
      scoreProperty: (property) => {
        const executiveFriendly =
          property.furnished ||
          ["apartment", "condominium", "commercial"].includes(property.propertyType);
        if (!executiveFriendly) {
          return 0;
        }
        return 10 + (property.furnished ? 5 : 0) + ((property.parkingSpaces || 0) > 0 ? 2 : 0);
      },
      subtitleBuilder: (items) =>
        `${items.length} listings · ${items.filter((item) => item.furnished).length} furnished`
    }),
    buildPersonaZoneBoard({
      id: "coastal",
      title: "Coastal investment zones",
      description: "Beach-facing supply and lifestyle-driven momentum.",
      properties: active,
      scoreProperty: (property) => {
        const coastal = ["Guanacaste", "Puntarenas", "Limon"].includes(
          property.address?.province
        );
        if (!coastal) {
          return 0;
        }
        return 9 + (property.featured ? 3 : 0) + (property.businessType === "rent" ? 2 : 0);
      },
      subtitleBuilder: (items) =>
        `${items.length} listings · ${items.filter((item) => item.featured).length} featured`
    })
  ].filter((board) => board.items.length);
};

const buildPrivacySafeContext = ({ overview, comparison, question, language }) => ({
  language,
  userQuestion: question,
  marketSummary: overview.summary,
  businessMix: overview.businessMix,
  decisionSignals: overview.decisionSignals,
  opportunityZones: overview.opportunityZones.slice(0, 5),
  zoneMomentum: overview.zoneMomentum.slice(0, 5),
  personaBoards: overview.personaBoards.slice(0, 4),
  forecasts: overview.forecasts.slice(0, 5).map((item) => ({
    zone: item.zone,
    currency: item.currency,
    currentAveragePpsm: item.currentAveragePpsm,
    projectedNextQuarterPpsm: item.projectedNextQuarterPpsm,
    projectedDeltaPct: item.projectedDeltaPct,
    trend: item.trend
  })),
  comparison: comparison
    ? {
        winner: comparison.winner,
        properties: comparison.properties,
        metrics: comparison.metrics
      }
    : null
});

export const interactiveAnalysisService = {
  async getOverview() {
    const [overview, properties] = await Promise.all([
      marketAnalyticsService.getOverview(),
      Property.find({ isApproved: true, status: "published" }).lean()
    ]);

    return {
      ...overview,
      businessMix: buildBusinessMix(properties),
      decisionSignals: buildDecisionSignals(properties),
      forecasts: buildForecasts(
        properties.filter((property) => CLOSED_STATUSES.includes(property.marketStatus))
      ),
      zoneMomentum: buildZoneMomentum(properties),
      personaBoards: buildPersonaBoards(properties),
      opportunityZones: buildOpportunityZones(overview),
      modelNotes: [
        "Linear regression over monthly price-per-square-meter history by zone and currency.",
        "Comparable-based valuation already stored in analyticsSnapshot for supported listings.",
        "Opportunity ranking blends demand signal, local liquidity, and relative price intensity."
      ],
      privacyPolicy: {
        excludedFields: ["owner", "sellerPhone", "sellerEmail", "exactAddress"],
        sharedWithAi: [
          "price",
          "currency",
          "province",
          "canton",
          "district",
          "bedrooms",
          "bathrooms",
          "parkingSpaces",
          "constructionArea",
          "landArea",
          "serviceDistances",
          "marketScore"
        ]
      },
      aiAvailable: deepseekService.isConfigured()
    };
  },

  async compareProperties(propertyIds = [], { language = "es" } = {}) {
    const uniqueIds = [...new Set(propertyIds.map(String))];

    if (uniqueIds.length !== 2) {
      throw new ApiError(400, "Exactly two properties are required for comparison");
    }

    const properties = await Property.find({
      _id: { $in: uniqueIds },
      isApproved: true,
      status: "published"
    }).lean();

    if (properties.length !== 2) {
      throw new ApiError(404, "Some selected properties are no longer available for comparison");
    }

    const intelligenceList = await Promise.all(
      uniqueIds.map((propertyId) => marketAnalyticsService.getPropertyIntelligence(propertyId))
    );

    const cards = intelligenceList.map((intelligence) => {
      const property = properties.find(
        (item) => String(item._id) === String(intelligence.property._id)
      );
      return sanitizePropertyForAnalysis(property, intelligence, language);
    });

    const metrics = buildMetricBattle(cards[0], cards[1], language);
    const currencyMode = cards[0].currency === cards[1].currency ? "same" : "mixed";
    const firstWins = metrics.filter((metric) => metric.winner === "first").length;
    const secondWins = metrics.filter((metric) => metric.winner === "second").length;
    const winner =
      firstWins === secondWins ? "tie" : firstWins > secondWins ? "first" : "second";

    const firstProsAndCons = buildProsAndCons(cards[0], cards[1], language);
    const secondProsAndCons = buildProsAndCons(cards[1], cards[0], language);

    let narrative = fallbackBattleNarrative(cards[0], cards[1], winner, language);
    let generatedBy = "heuristic";

    if (deepseekService.isConfigured()) {
      try {
        const aiResponse = await deepseekService.createChatCompletion({
          messages: [
            {
              role: "system",
              content:
                language === "en"
                  ? "You are a neutral real estate comparison analyst for AlquiVentasCR. Use only the sanitized data provided. Never invent owner details, private contact data, or legal/financial guarantees. Answer with a concise verdict, strongest pros, strongest cons, and what kind of buyer or renter each property fits best. If the question or context touches demand, appreciation, family fit, roommates, executive relocation, or coastal investment, ground the answer in zone momentum and buyer-profile signals when they are available in the provided context."
                  : "Eres un analista neutral de comparacion inmobiliaria para AlquiVentasCR. Usa solo los datos sanitizados entregados. Nunca inventes datos de propietarios, datos privados ni garantias legales o financieras. Responde con un veredicto breve, mejores pros, principales contras y el tipo de comprador o inquilino al que mejor le conviene cada propiedad. Si la pregunta o el contexto toca demanda, plusvalia, ajuste familiar, roomies, reubicacion ejecutiva o inversion costera, apoya la respuesta en momentum de zona y senales por perfil cuando esten disponibles en el contexto entregado."
            },
            {
              role: "user",
              content: JSON.stringify({
                properties: cards,
                metrics,
                winner
              })
            }
          ],
          maxTokens: 700
        });

        if (aiResponse.content) {
          narrative = aiResponse.content;
          generatedBy = "deepseek";
        }
      } catch (_error) {
        generatedBy = "heuristic";
      }
    }

    return {
      generatedBy,
      currencyMode,
      winner,
      score: {
        first: firstWins,
        second: secondWins
      },
      properties: [
        {
          ...cards[0],
          pros: firstProsAndCons.pros,
          cons: firstProsAndCons.cons
        },
        {
          ...cards[1],
          pros: secondProsAndCons.pros,
          cons: secondProsAndCons.cons
        }
      ],
      metrics,
      narrative,
      suggestedQuestions:
        language === "en"
          ? [
              "Which one gives me better long-term value?",
              "Which option is stronger for renting later?",
              "How much does the market-fit score matter here?"
            ]
          : [
              "Cual me da mejor valor a largo plazo?",
              "Cual luce mas fuerte para alquilar despues?",
              "Cuanto pesa aqui el ajuste al mercado?"
            ]
    };
  },

  async askAssistant({
    question,
    propertyIds = [],
    language = "es",
    history = []
  }) {
    const overview = await this.getOverview();
    const comparison =
      propertyIds.length === 2
        ? await this.compareProperties(propertyIds, { language })
        : null;

    if (!deepseekService.isConfigured()) {
      return {
        generatedBy: "heuristic",
        answer: buildFallbackChatSafe({ question, overview, comparison, language }),
        contextPreview: buildPrivacySafeContext({ overview, comparison, question, language })
      };
    }

    try {
      const context = buildPrivacySafeContext({ overview, comparison, question, language });
      const aiResponse = await deepseekService.createChatCompletion({
        messages: [
          {
            role: "system",
            content:
              language === "en"
                ? "You are the AlquiVentasCR interactive analysis assistant. Use only the sanitized property and market context provided. Never reveal owner identities, emails, phone numbers, exact hidden addresses, or any personal data. Be direct, useful, and transparent when data is missing. When the user asks about where to buy, rent, invest, relocate, or share a home, actively use the available zone momentum and buyer-profile boards to explain which districts fit best and why."
                : "Eres el asistente de analisis interactivo de AlquiVentasCR. Usa solo el contexto sanitizado de mercado y propiedades entregado. Nunca reveles identidades de propietarios, correos, telefonos, direcciones exactas ocultas ni datos personales. Se directo, util y transparente cuando falte informacion. Cuando el usuario pregunte donde comprar, rentar, invertir, reubicarse o vivir con roomies, usa activamente el momentum de zona y los tableros por perfil disponibles para explicar que distritos encajan mejor y por que."
          },
          ...history.map((item) => ({
            role: item.role,
            content: item.content
          })),
          {
            role: "user",
            content: JSON.stringify(context)
          }
        ],
        maxTokens: 850
      });

      return {
        generatedBy: "deepseek",
        answer:
          aiResponse.content ||
          buildFallbackChatSafe({ question, overview, comparison, language }),
        contextPreview: context
      };
    } catch (_error) {
      return {
        generatedBy: "heuristic",
        answer: buildFallbackChatSafe({ question, overview, comparison, language }),
        contextPreview: buildPrivacySafeContext({ overview, comparison, question, language })
      };
    }
  }
};
