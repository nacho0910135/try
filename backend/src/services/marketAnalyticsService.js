import { Property } from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";
import { buildPublicAnalyticsPropertyFilter } from "../utils/publicPropertyVisibility.js";

const safeArea = (property) =>
  property.constructionArea || property.landArea || property.lotArea || 1;

const pricePerSquareMeter = (property) =>
  (property.finalPrice || property.price || 0) / safeArea(property);

const average = (values) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const diffDays = (start, end) => {
  if (!start || !end) return null;
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
};

const haversineKm = (origin, destination) => {
  if (!origin?.length || !destination?.length) return null;

  const [lng1, lat1] = origin;
  const [lng2, lat2] = destination;
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const groupAverages = (properties, keyGetter) => {
  const groups = new Map();

  properties.forEach((property) => {
    const key = keyGetter(property);
    if (!key) return;

    const current = groups.get(key) || [];
    current.push(property);
    groups.set(key, current);
  });

  return Array.from(groups.entries())
    .map(([label, items]) => ({
      label,
      count: items.length,
      averagePrice: Math.round(average(items.map((item) => item.price || 0))),
      averageFinalPrice: Math.round(
        average(items.map((item) => item.finalPrice || item.price || 0))
      ),
      averagePpsm: Math.round(average(items.map((item) => pricePerSquareMeter(item))))
    }))
    .sort((first, second) => second.count - first.count);
};

const scoreProperty = (currentPpsm, comparableAveragePpsm) => {
  if (!comparableAveragePpsm) {
    return {
      marketScore: "in-range",
      deltaPct: 0
    };
  }

  const deltaPct = ((currentPpsm - comparableAveragePpsm) / comparableAveragePpsm) * 100;

  if (deltaPct <= -12) {
    return {
      marketScore: "below-market",
      deltaPct
    };
  }

  if (deltaPct >= 12) {
    return {
      marketScore: "above-market",
      deltaPct
    };
  }

  return {
    marketScore: "in-range",
    deltaPct
  };
};

export const marketAnalyticsService = {
  async getOverview() {
    const properties = await Property.find(buildPublicAnalyticsPropertyFilter()).lean();
    const activeListings = properties.filter(
      (property) =>
        property.status === "published" &&
        ["available", "reserved"].includes(property.marketStatus)
    );
    const soldListings = properties.filter(
      (property) => property.marketStatus === "sold" && property.soldAt
    );
    const rentedListings = properties.filter(
      (property) => property.marketStatus === "rented" && property.rentedAt
    );

    const saleDurations = soldListings
      .map((property) => diffDays(property.publishedAt || property.createdAt, property.soldAt))
      .filter(Boolean);
    const rentDurations = rentedListings
      .map((property) => diffDays(property.publishedAt || property.createdAt, property.rentedAt))
      .filter(Boolean);

    const groupedByDistrict = groupAverages(
      activeListings,
      (property) => `${property.address?.district || ""}, ${property.address?.canton || ""}`
    );

    const demandByZone = groupedByDistrict
      .map((item) => {
        const matching = activeListings.filter(
          (property) =>
            `${property.address?.district || ""}, ${property.address?.canton || ""}` === item.label
        );

        return {
          ...item,
          demandSignal: matching.reduce(
            (sum, property) =>
              sum +
              (property.views || 0) +
              (property.engagement?.favorites || 0) * 3 +
              (property.engagement?.leads || 0) * 5,
            0
          )
        };
      })
      .sort((first, second) => second.demandSignal - first.demandSignal)
      .slice(0, 8);

    const priceEvolutionMap = new Map();
    [...soldListings, ...rentedListings].forEach((property) => {
      const closedAt = property.soldAt || property.rentedAt;
      if (!closedAt) return;

      const monthKey = new Date(closedAt).toISOString().slice(0, 7);
      const current = priceEvolutionMap.get(monthKey) || [];
      current.push(property);
      priceEvolutionMap.set(monthKey, current);
    });

    const priceEvolution = Array.from(priceEvolutionMap.entries())
      .map(([month, items]) => ({
        month,
        averageFinalPrice: Math.round(
          average(items.map((item) => item.finalPrice || item.price || 0))
        ),
        averagePpsm: Math.round(average(items.map((item) => pricePerSquareMeter(item))))
      }))
      .sort((first, second) => first.month.localeCompare(second.month))
      .slice(-12);

    const liquidityRanking = groupAverages(
      [...activeListings, ...soldListings, ...rentedListings],
      (property) => `${property.address?.district || ""}, ${property.address?.canton || ""}`
    )
      .map((item) => {
        const activeCount = activeListings.filter(
          (property) =>
            `${property.address?.district || ""}, ${property.address?.canton || ""}` === item.label
        ).length;
        const closedProperties = [...soldListings, ...rentedListings].filter(
          (property) =>
            `${property.address?.district || ""}, ${property.address?.canton || ""}` === item.label
        );

        return {
          label: item.label,
          activeCount,
          closedCount: closedProperties.length,
          averageDaysOnMarket: Math.round(
            average(
              closedProperties
                .map((property) =>
                  diffDays(property.publishedAt || property.createdAt, property.soldAt || property.rentedAt)
                )
                .filter(Boolean)
            )
          ) || null
        };
      })
      .sort((first, second) => {
        if (first.averageDaysOnMarket && second.averageDaysOnMarket) {
          return first.averageDaysOnMarket - second.averageDaysOnMarket;
        }

        return second.closedCount - first.closedCount;
      })
      .slice(0, 8);

    return {
      summary: {
        activeListings: activeListings.length,
        reservedListings: properties.filter((property) => property.marketStatus === "reserved").length,
        soldListings: soldListings.length,
        rentedListings: rentedListings.length,
        inactiveListings: properties.filter((property) => property.marketStatus === "inactive").length,
        averageSaleDays: Math.round(average(saleDurations)) || 0,
        averageRentDays: Math.round(average(rentDurations)) || 0,
        averageActivePpsm: Math.round(average(activeListings.map((item) => pricePerSquareMeter(item)))) || 0
      },
      priceByProvince: groupAverages(activeListings, (property) => property.address?.province).slice(0, 7),
      priceByCanton: groupAverages(
        activeListings,
        (property) => `${property.address?.canton || ""}, ${property.address?.province || ""}`
      ).slice(0, 10),
      priceByDistrict: groupedByDistrict.slice(0, 10),
      priceEvolution,
      topDemandZones: demandByZone,
      topSupplyZones: groupedByDistrict.slice(0, 8),
      liquidityRanking
    };
  },

  async getPropertyIntelligence(propertyId) {
    const property = await Property.findById(propertyId).lean();

    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    const targetArea = safeArea(property);
    const comparableCandidates = await Property.find({
      ...buildPublicAnalyticsPropertyFilter(),
      _id: { $ne: property._id },
      propertyType: property.propertyType,
      operationType: property.operationType,
      marketStatus: { $in: ["sold", "rented"] },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: property.location.coordinates
          },
          $maxDistance: 15000
        }
      }
    })
      .limit(25)
      .lean();

    const comparables = comparableCandidates
      .map((candidate) => {
        const distanceKm = haversineKm(
          property.location.coordinates,
          candidate.location.coordinates
        );
        const candidateArea = safeArea(candidate);
        const areaRatio = candidateArea / targetArea;
        const ppsm = pricePerSquareMeter(candidate);
        const similarityPenalty = Math.abs(1 - areaRatio) * 35 + (distanceKm || 0) * 2;

        return {
          ...candidate,
          distanceKm: Number((distanceKm || 0).toFixed(2)),
          pricePerSquareMeter: Math.round(ppsm),
          similarityScore: Number(Math.max(0, 100 - similarityPenalty).toFixed(1))
        };
      })
      .filter((candidate) => candidate.similarityScore > 25)
      .sort((first, second) => second.similarityScore - first.similarityScore);

    const nearbyClosings = comparables.slice(0, 6).map((candidate) => ({
      _id: candidate._id,
      title: candidate.title,
      slug: candidate.slug,
      finalPrice: candidate.finalPrice || candidate.price,
      marketStatus: candidate.marketStatus,
      distanceKm: candidate.distanceKm,
      soldAt: candidate.soldAt,
      rentedAt: candidate.rentedAt,
      pricePerSquareMeter: candidate.pricePerSquareMeter,
      address: candidate.address
    }));

    const averageComparablePpsm = average(
      comparables.map((candidate) => candidate.pricePerSquareMeter)
    );
    const subjectPpsm = pricePerSquareMeter(property);
    const valuationScore = scoreProperty(subjectPpsm, averageComparablePpsm);
    const estimatedMid = averageComparablePpsm * targetArea;
    const estimatedRange = {
      min: Math.round(estimatedMid * 0.9) || 0,
      max: Math.round(estimatedMid * 1.1) || 0
    };

    const analyticsSnapshot = {
      pricePerSquareMeter: Math.round(subjectPpsm),
      comparableAveragePpsm: Math.round(averageComparablePpsm) || 0,
      marketScore: valuationScore.marketScore,
      suggestedPriceMin: estimatedRange.min,
      suggestedPriceMax: estimatedRange.max,
      lastComputedAt: new Date()
    };

    await Property.updateOne({ _id: property._id }, { analyticsSnapshot });

    return {
      property: {
        _id: property._id,
        title: property.title,
        slug: property.slug,
        price: property.price,
        finalPrice: property.finalPrice,
        currency: property.currency,
        operationType: property.operationType,
        propertyType: property.propertyType,
        address: property.address,
        marketStatus: property.marketStatus,
        analyticsSnapshot
      },
      valuation: {
        ...analyticsSnapshot,
        deltaPct: Number(valuationScore.deltaPct.toFixed(1))
      },
      recentNearbyClosings: nearbyClosings,
      comparables: comparables.slice(0, 10).map((candidate) => ({
        _id: candidate._id,
        title: candidate.title,
        slug: candidate.slug,
        finalPrice: candidate.finalPrice || candidate.price,
        pricePerSquareMeter: candidate.pricePerSquareMeter,
        distanceKm: candidate.distanceKm,
        similarityScore: candidate.similarityScore,
        soldAt: candidate.soldAt,
        rentedAt: candidate.rentedAt,
        address: candidate.address
      })),
      historicalSignals: {
        nearbyClosingsCount: comparables.length,
        averageDaysOnMarketNearby: Math.round(
          average(
            comparables
              .map((candidate) =>
                diffDays(
                  candidate.publishedAt || candidate.createdAt,
                  candidate.soldAt || candidate.rentedAt
                )
              )
              .filter(Boolean)
          )
        ) || 0
      },
      nearestServices: property.serviceDistances || null
    };
  }
};
