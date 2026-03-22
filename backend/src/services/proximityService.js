// Extension point for Google Places, Mapbox Search, Foursquare or a national dataset.
// For now we leave deterministic stubs so the domain and UI can consume nearby services
// without blocking the rest of the product rollout.
export const proximityService = {
  buildDefaultStubs() {
    return {
      nearestHospital: {
        placeType: "hospital",
        dataSource: "pending-external-api",
        isStub: true
      },
      nearestSchool: {
        placeType: "school",
        dataSource: "pending-external-api",
        isStub: true
      },
      nearestHighSchool: {
        placeType: "high-school",
        dataSource: "pending-external-api",
        isStub: true
      }
    };
  }
};

