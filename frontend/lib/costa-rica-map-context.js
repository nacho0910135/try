export const mapContextLayers = [
  {
    id: "universities",
    labelEs: "Universidades",
    labelEn: "Universities",
    descriptionEs: "Ideal para roomies, estudiantes y rentas cerca de campus.",
    descriptionEn: "Great for roommates, students, and rentals near campus areas.",
    color: "#0f4ea9",
    points: [
      {
        id: "ucr-san-pedro",
        name: "UCR San Pedro",
        shortLabel: "UCR",
        province: "San Jose",
        canton: "Montes de Oca",
        district: "San Pedro",
        lat: 9.9364,
        lng: -84.0516,
        summaryEs: "Zona universitaria con alta demanda de habitaciones y alquiler compartido.",
        summaryEn: "Student zone with strong demand for rooms and shared rentals."
      },
      {
        id: "tec-cartago",
        name: "TEC Cartago",
        shortLabel: "TEC",
        province: "Cartago",
        canton: "Cartago",
        district: "Oriental",
        lat: 9.8546,
        lng: -83.9117,
        summaryEs: "Buen punto para captar estudiantes, roomies y renta compacta.",
        summaryEn: "Strong area for students, roommates, and compact rental demand."
      },
      {
        id: "una-heredia",
        name: "UNA Heredia",
        shortLabel: "UNA",
        province: "Heredia",
        canton: "Heredia",
        district: "Heredia",
        lat: 9.9984,
        lng: -84.1118,
        summaryEs: "Mercado activo para alquiler estudiantil y ejecutivos jovenes.",
        summaryEn: "Active market for student rentals and young professionals."
      },
      {
        id: "ulatina-san-pedro",
        name: "ULatina San Pedro",
        shortLabel: "ULatina",
        province: "San Jose",
        canton: "Montes de Oca",
        district: "San Pedro",
        lat: 9.9337,
        lng: -84.0457,
        summaryEs: "Complementa la demanda estudiantil del este de San Jose.",
        summaryEn: "Adds to the student-driven demand in east San Jose."
      }
    ]
  },
  {
    id: "hospitals",
    labelEs: "Hospitales",
    labelEn: "Hospitals",
    descriptionEs: "Contexto util para familias, adultos mayores y renta medica.",
    descriptionEn: "Useful context for families, seniors, and healthcare-driven demand.",
    color: "#d9485f",
    points: [
      {
        id: "hospital-mexico",
        name: "Hospital Mexico",
        shortLabel: "Mexico",
        province: "San Jose",
        canton: "San Jose",
        district: "Uruca",
        lat: 9.9575,
        lng: -84.1047,
        summaryEs: "Referencia clave para accesibilidad medica dentro del GAM.",
        summaryEn: "Important healthcare anchor inside the Greater Metro Area."
      },
      {
        id: "hospital-cima",
        name: "Hospital CIMA",
        shortLabel: "CIMA",
        province: "San Jose",
        canton: "Escazu",
        district: "San Rafael",
        lat: 9.9491,
        lng: -84.1534,
        summaryEs: "Punto premium para familias y expatriados en el oeste del GAM.",
        summaryEn: "Premium healthcare anchor for families and expats in west GAM."
      },
      {
        id: "san-juan-de-dios",
        name: "Hospital San Juan de Dios",
        shortLabel: "San Juan",
        province: "San Jose",
        canton: "San Jose",
        district: "Hospital",
        lat: 9.932,
        lng: -84.0847,
        summaryEs: "Zona centrica con conectividad y demanda historica.",
        summaryEn: "Central area with strong connectivity and historic demand."
      },
      {
        id: "hospital-liberia",
        name: "Hospital Enrique Baltodano",
        shortLabel: "Liberia",
        province: "Guanacaste",
        canton: "Liberia",
        district: "Liberia",
        lat: 10.6348,
        lng: -85.4424,
        summaryEs: "Referencia medica clave para Liberia y corredores del norte.",
        summaryEn: "Key healthcare reference for Liberia and northern corridors."
      }
    ]
  },
  {
    id: "beaches",
    labelEs: "Playas",
    labelEn: "Beaches",
    descriptionEs: "Perfecto para lifestyle, vacacional e inversion turistica.",
    descriptionEn: "Ideal for lifestyle, vacation, and tourism-focused investment.",
    color: "#0b8a6a",
    points: [
      {
        id: "tamarindo",
        name: "Tamarindo",
        shortLabel: "Tamarindo",
        province: "Guanacaste",
        canton: "Santa Cruz",
        district: "Tamarindo",
        lat: 10.2993,
        lng: -85.8371,
        summaryEs: "Alta visibilidad para renta vacacional y segunda vivienda.",
        summaryEn: "Strong visibility for vacation rentals and second homes."
      },
      {
        id: "jaco",
        name: "Jaco",
        shortLabel: "Jaco",
        province: "Puntarenas",
        canton: "Garabito",
        district: "Jaco",
        lat: 9.6147,
        lng: -84.6297,
        summaryEs: "Mercado mixto de lifestyle, surf y renta de corta estancia.",
        summaryEn: "Mixed market for lifestyle, surf, and short-stay rentals."
      },
      {
        id: "nosara",
        name: "Nosara",
        shortLabel: "Nosara",
        province: "Guanacaste",
        canton: "Nicoya",
        district: "Nosara",
        lat: 9.9785,
        lng: -85.6533,
        summaryEs: "Destino premium para bienestar, retiro y hospedaje boutique.",
        summaryEn: "Premium destination for wellness, retreats, and boutique stays."
      },
      {
        id: "cobano",
        name: "Cobano / Santa Teresa",
        shortLabel: "Cobano",
        province: "Puntarenas",
        canton: "Cobano",
        district: "Cobano",
        lat: 9.6408,
        lng: -85.1551,
        summaryEs: "Zona costera con fuerte narrativa de inversion y lifestyle.",
        summaryEn: "Coastal zone with strong investment and lifestyle appeal."
      }
    ]
  },
  {
    id: "business",
    labelEs: "Hubs de trabajo",
    labelEn: "Work hubs",
    descriptionEs: "Bueno para renta ejecutiva, oficinas y demanda profesional.",
    descriptionEn: "Useful for executive rentals, offices, and professional demand.",
    color: "#f59e0b",
    points: [
      {
        id: "sabana",
        name: "La Sabana",
        shortLabel: "Sabana",
        province: "San Jose",
        canton: "San Jose",
        district: "Mata Redonda",
        lat: 9.9368,
        lng: -84.1034,
        summaryEs: "Nodo corporativo y residencial de alta conectividad.",
        summaryEn: "Corporate and residential node with strong connectivity."
      },
      {
        id: "escazu-corporativo",
        name: "Escazu corporativo",
        shortLabel: "Escazu",
        province: "San Jose",
        canton: "Escazu",
        district: "San Rafael",
        lat: 9.9388,
        lng: -84.1521,
        summaryEs: "Mercado premium para ejecutivos, expatriados y oficinas.",
        summaryEn: "Premium market for executives, expats, and office demand."
      },
      {
        id: "santa-ana-lindora",
        name: "Lindora / Santa Ana",
        shortLabel: "Lindora",
        province: "San Jose",
        canton: "Santa Ana",
        district: "Pozos",
        lat: 9.9435,
        lng: -84.1848,
        summaryEs: "Fuerte mezcla de condominios, renta ejecutiva y servicios.",
        summaryEn: "Strong mix of condominiums, executive rentals, and services."
      },
      {
        id: "ultrapark-heredia",
        name: "Ultrapark Heredia",
        shortLabel: "Ultrapark",
        province: "Heredia",
        canton: "Heredia",
        district: "Ulloa",
        lat: 9.9898,
        lng: -84.1775,
        summaryEs: "Hub corporativo que empuja demanda residencial cercana.",
        summaryEn: "Corporate hub that drives nearby residential demand."
      }
    ]
  },
  {
    id: "family",
    labelEs: "Zonas familiares",
    labelEn: "Family zones",
    descriptionEs: "Sectores con oferta pensada para familias, colegios y vida residencial.",
    descriptionEn: "Areas with family-oriented supply, schools, and residential rhythm.",
    color: "#7c3aed",
    points: [
      {
        id: "curridabat-family",
        name: "Curridabat / Granadilla",
        shortLabel: "Curridabat",
        province: "San Jose",
        canton: "Curridabat",
        district: "Granadilla",
        lat: 9.9177,
        lng: -84.0347,
        summaryEs: "Zona residencial fuerte para familias con acceso rapido al este del GAM.",
        summaryEn: "Strong residential area for families with fast access across east GAM."
      },
      {
        id: "moravia-family",
        name: "Moravia",
        shortLabel: "Moravia",
        province: "San Jose",
        canton: "Moravia",
        district: "San Vicente",
        lat: 9.9614,
        lng: -84.0477,
        summaryEs: "Buena mezcla de casas, servicios y ritmo barrial estable.",
        summaryEn: "Good mix of houses, services, and a stable neighborhood pace."
      },
      {
        id: "santa-ana-family",
        name: "Santa Ana / Piedades",
        shortLabel: "Santa Ana",
        province: "San Jose",
        canton: "Santa Ana",
        district: "Piedades",
        lat: 9.9319,
        lng: -84.1974,
        summaryEs: "Residencial de alto valor para familias que buscan espacio y conectividad.",
        summaryEn: "High-value residential pocket for families seeking space and connectivity."
      },
      {
        id: "heredia-family",
        name: "Heredia / San Francisco",
        shortLabel: "Heredia",
        province: "Heredia",
        canton: "Heredia",
        district: "San Francisco",
        lat: 9.9921,
        lng: -84.1203,
        summaryEs: "Muy buscada por familias que quieren estar cerca de servicios del GAM.",
        summaryEn: "Popular with families who want to stay close to GAM services."
      }
    ]
  },
  {
    id: "investment",
    labelEs: "Corredores de inversion",
    labelEn: "Investment corridors",
    descriptionEs: "Zonas con narrativa fuerte de plusvalia, turismo o renta flexible.",
    descriptionEn: "Areas with strong upside narratives around appreciation, tourism, or flexible rentals.",
    color: "#be123c",
    points: [
      {
        id: "liberia-airport",
        name: "Liberia / Aeropuerto",
        shortLabel: "Liberia",
        province: "Guanacaste",
        canton: "Liberia",
        district: "Liberia",
        lat: 10.5933,
        lng: -85.5444,
        summaryEs: "Nodo estrategico para turismo, second homes y distribucion en Guanacaste.",
        summaryEn: "Strategic node for tourism, second homes, and Guanacaste distribution."
      },
      {
        id: "la-fortuna",
        name: "La Fortuna",
        shortLabel: "Fortuna",
        province: "Alajuela",
        canton: "San Carlos",
        district: "Fortuna",
        lat: 10.4714,
        lng: -84.6454,
        summaryEs: "Mercado fuerte para hospitalidad, turismo y propiedad de experiencia.",
        summaryEn: "Strong market for hospitality, tourism, and experience-based real estate."
      },
      {
        id: "tamarindo-investment",
        name: "Tamarindo inversion",
        shortLabel: "Tamarindo+",
        province: "Guanacaste",
        canton: "Santa Cruz",
        district: "Tamarindo",
        lat: 10.2993,
        lng: -85.8371,
        summaryEs: "Corredor premium para renta corta, lifestyle y capital internacional.",
        summaryEn: "Premium corridor for short-stay rentals, lifestyle, and international capital."
      },
      {
        id: "jaco-investment",
        name: "Jaco inversion",
        shortLabel: "Jaco+",
        province: "Puntarenas",
        canton: "Garabito",
        district: "Jaco",
        lat: 9.6147,
        lng: -84.6297,
        summaryEs: "Liquidez alta para turismo, playa y rotacion de alquileres.",
        summaryEn: "High liquidity for tourism, beach lifestyle, and rental turnover."
      }
    ]
  }
];

export const getMapContextLayer = (layerId) =>
  mapContextLayers.find((layer) => layer.id === layerId) || null;

export const getMapContextPoint = (pointId) =>
  mapContextLayers.flatMap((layer) => layer.points).find((point) => point.id === pointId) || null;

export const getVisibleMapContextPoints = (activeLayerIds = []) =>
  mapContextLayers
    .filter((layer) => activeLayerIds.includes(layer.id))
    .flatMap((layer) =>
      layer.points.map((point) => ({
        ...point,
        layerId: layer.id,
        color: layer.color
      }))
    );
