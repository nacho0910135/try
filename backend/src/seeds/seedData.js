import { createPlaceholderImageDataUri } from "../utils/placeholderImage.js";

export const seedUsers = [
  {
    name: "BienesRaicesCR Admin",
    email: "admin@casacr.com",
    password: "Admin12345",
    phone: "+50670000001",
    role: "admin",
    avatar: "https://placehold.co/200x200/png?text=Admin"
  },
  {
    name: "Laura Mendez",
    email: "laura@casacr.com",
    password: "Laura12345",
    phone: "+50670000002",
    role: "agent",
    avatar: "https://placehold.co/200x200/png?text=Laura"
  },
  {
    name: "Diego Vargas",
    email: "diego@casacr.com",
    password: "Diego12345",
    phone: "+50670000003",
    role: "owner",
    avatar: "https://placehold.co/200x200/png?text=Diego"
  },
  {
    name: "Sofia Rojas",
    email: "sofia@casacr.com",
    password: "Sofia12345",
    phone: "+50670000004",
    role: "user",
    avatar: "https://placehold.co/200x200/png?text=Sofia"
  }
];

const samplePhotoLibrary = {
  house: [
    {
      url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
      alt: "fachada de casa moderna"
    },
    {
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      alt: "casa contemporanea con jardin"
    }
  ],
  apartment: [
    {
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      alt: "interior de apartamento moderno"
    },
    {
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      alt: "sala amplia con luz natural"
    }
  ],
  coastal: [
    {
      url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      alt: "residencia junto a la costa"
    },
    {
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      alt: "interior luminoso de propiedad vacacional"
    }
  ],
  lot: [
    {
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
      alt: "terreno amplio con vegetacion"
    },
    {
      url: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1600&q=80",
      alt: "lote abierto con entorno natural"
    }
  ],
  commercial: [
    {
      url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
      alt: "oficina comercial moderna"
    },
    {
      url: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80",
      alt: "espacio comercial con area de trabajo"
    }
  ],
  room: [
    {
      url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
      alt: "habitacion moderna amueblada"
    },
    {
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      alt: "area comun de residencia compartida"
    }
  ]
};

const inferPhotoProfile = (label = "") => {
  const normalized = label.toLowerCase();

  if (/(tamarindo|jaco|nosara)/i.test(normalized)) {
    return "coastal";
  }

  if (/(apartamento|condominio)/i.test(normalized)) {
    return "apartment";
  }

  if (/(lote|terreno)/i.test(normalized)) {
    return "lot";
  }

  if (/(comercial|local)/i.test(normalized)) {
    return "commercial";
  }

  if (/(habitacion|roomies|room)/i.test(normalized)) {
    return "room";
  }

  return "house";
};

const placeholderPhotos = (label) => {
  const profile = inferPhotoProfile(label);
  const photos = samplePhotoLibrary[profile];

  if (!photos?.length) {
    return [
      {
        url: createPlaceholderImageDataUri(`${label} principal`),
        publicId: null,
        isPrimary: true,
        alt: `${label} principal`
      },
      {
        url: createPlaceholderImageDataUri(`${label} secundaria`),
        publicId: null,
        isPrimary: false,
        alt: `${label} secundaria`
      }
    ];
  }

  return photos.map((photo, index) => ({
    url: photo.url,
    publicId: null,
    isPrimary: index === 0,
    alt: `${label} - ${photo.alt}`
  }));
};

const baseSeedProperties = (owners) => [
  {
    title: "Casa contemporanea con jardin en Escazu",
    description:
      "Propiedad amplia y luminosa en una calle tranquila de Escazu, con terraza, oficina y excelente conectividad hacia San Jose y Santa Ana.",
    businessType: "sale",
    propertyType: "house",
    price: 425000,
    currency: "USD",
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 2,
    constructionArea: 320,
    lotArea: 420,
    furnished: false,
    petsAllowed: true,
    featured: true,
    amenities: ["Terraza", "Oficina", "Jardin", "Bodega"],
    photos: placeholderPhotos("Escazu Casa"),
    location: { type: "Point", coordinates: [-84.1397, 9.9185] },
    address: {
      province: "San Jose",
      canton: "Escazu",
      district: "San Rafael",
      neighborhood: "Guachipelin",
      exactAddress: "Calle residencial cerca de Multiplaza",
      hideExactLocation: true
    },
    status: "published",
    marketStatus: "available",
    isApproved: true,
    publishedAt: new Date(),
    owner: owners.agentId
  },
  {
    title: "Apartamento amueblado en Santa Ana con amenidades",
    description:
      "Apartamento moderno para renta en Santa Ana, con linea blanca, balcon, piscina, cowork y acceso rapido a la Ruta 27.",
    businessType: "rent",
    propertyType: "apartment",
    price: 1750,
    currency: "USD",
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 2,
    constructionArea: 110,
    lotArea: 110,
    furnished: true,
    petsAllowed: true,
    depositRequired: true,
    featured: true,
    amenities: ["Piscina", "Cowork", "Gimnasio", "Seguridad"],
    photos: placeholderPhotos("Santa Ana Apartamento"),
    location: { type: "Point", coordinates: [-84.1817, 9.9326] },
    address: {
      province: "San Jose",
      canton: "Santa Ana",
      district: "Pozos",
      neighborhood: "Lindora",
      exactAddress: "Condominio cerca de oficentros y restaurantes",
      hideExactLocation: true
    },
    status: "published",
    marketStatus: "rented",
    finalPrice: 1650,
    isApproved: true,
    publishedAt: new Date("2025-11-01"),
    rentedAt: new Date("2025-12-20"),
    owner: owners.agentId
  },
  {
    title: "Condominio familiar en Heredia cerca de zonas francas",
    description:
      "Condominio ideal para familia o ejecutivos, con patio, cuarto de pilas y seguridad en zona de alta demanda de Heredia.",
    businessType: "sale",
    propertyType: "condominium",
    price: 215000,
    currency: "USD",
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    constructionArea: 185,
    lotArea: 200,
    furnished: false,
    petsAllowed: true,
    featured: false,
    amenities: ["Casa club", "Parque infantil", "Seguridad"],
    photos: placeholderPhotos("Heredia Condominio"),
    location: { type: "Point", coordinates: [-84.1165, 9.9982] },
    address: {
      province: "Heredia",
      canton: "Heredia",
      district: "Ulloa",
      neighborhood: "Lagunilla",
      exactAddress: "Condominio a minutos de zonas francas",
      hideExactLocation: true
    },
    status: "published",
    marketStatus: "available",
    isApproved: true,
    publishedAt: new Date(),
    owner: owners.ownerId
  },
  {
    title: "Lote residencial con vista en Cartago",
    description:
      "Terreno listo para desarrollar con vistas abiertas, clima fresco y acceso asfaltado en una zona tranquila de Cartago.",
    businessType: "sale",
    propertyType: "lot",
    price: 78000000,
    currency: "CRC",
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    constructionArea: 0,
    lotArea: 950,
    furnished: false,
    petsAllowed: false,
    featured: false,
    amenities: ["Uso residencial", "Servicios disponibles"],
    photos: placeholderPhotos("Cartago Lote"),
    location: { type: "Point", coordinates: [-83.9194, 9.8644] },
    address: {
      province: "Cartago",
      canton: "Cartago",
      district: "Guadalupe",
      neighborhood: "Quebradilla",
      exactAddress: "Lote con frente a calle publica",
      hideExactLocation: true
    },
    status: "published",
    marketStatus: "sold",
    finalPrice: 74000000,
    isApproved: true,
    publishedAt: new Date("2025-09-10"),
    soldAt: new Date("2025-12-05"),
    owner: owners.ownerId
  },
  {
    title: "Casa de playa para renta en Tamarindo",
    description:
      "Propiedad de dos niveles cerca de la playa, con piscina privada, terraza y perfecta para estadias largas en Guanacaste.",
    businessType: "rent",
    propertyType: "house",
    price: 3200,
    currency: "USD",
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    constructionArea: 240,
    lotArea: 380,
    furnished: true,
    petsAllowed: false,
    depositRequired: true,
    featured: true,
    amenities: ["Piscina", "Terraza", "Aire acondicionado"],
    photos: placeholderPhotos("Tamarindo Casa"),
    location: { type: "Point", coordinates: [-85.8384, 10.2993] },
    address: {
      province: "Guanacaste",
      canton: "Santa Cruz",
      district: "Tamarindo",
      neighborhood: "Tamarindo Centro",
      exactAddress: "A pocas cuadras de la playa",
      hideExactLocation: true
    },
    status: "published",
    marketStatus: "available",
    isApproved: true,
    publishedAt: new Date(),
    owner: owners.agentId
  },
  {
    title: "Apartamento con vista al mar en Jaco",
    description:
      "Unidad lista para vivir o rentar, con acceso a playa, balcon y amenidades de resort en el centro de Jaco.",
    businessType: "sale",
    propertyType: "apartment",
    price: 289000,
    currency: "USD",
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    constructionArea: 125,
    lotArea: 125,
    furnished: true,
    petsAllowed: true,
    featured: true,
    amenities: ["Vista al mar", "Piscina", "Ascensor", "Seguridad"],
    photos: placeholderPhotos("Jaco Apartamento"),
    location: { type: "Point", coordinates: [-84.6271, 9.6148] },
    address: {
      province: "Puntarenas",
      canton: "Garabito",
      district: "Jaco",
      neighborhood: "Centro",
      exactAddress: "Torre frente a la playa",
      hideExactLocation: true
    },
    status: "published",
    marketStatus: "available",
    isApproved: true,
    publishedAt: new Date(),
    owner: owners.ownerId
  },
  {
    title: "Local comercial en Liberia de alto trafico",
    description:
      "Espacio comercial versatil para oficina o retail, con parqueos y excelente exposicion en avenida principal.",
    businessType: "rent",
    propertyType: "commercial",
    price: 2200,
    currency: "USD",
    bedrooms: 0,
    bathrooms: 2,
    parkingSpaces: 6,
    constructionArea: 180,
    lotArea: 250,
    furnished: false,
    petsAllowed: false,
    depositRequired: true,
    featured: false,
    amenities: ["Frente a calle principal", "Bodega", "Parqueos"],
    photos: placeholderPhotos("Liberia Comercial"),
    location: { type: "Point", coordinates: [-85.4386, 10.635] },
    address: {
      province: "Guanacaste",
      canton: "Liberia",
      district: "Liberia",
      neighborhood: "Centro",
      exactAddress: "Avenida principal",
      hideExactLocation: true
    },
    status: "published",
    marketStatus: "available",
    isApproved: true,
    publishedAt: new Date(),
    owner: owners.agentId
  },
  {
    title: "Habitacion privada para renta en San Pedro",
    description:
      "Habitacion dentro de residencia compartida, ideal para estudiante o profesional, cerca de universidades y servicios.",
    businessType: "rent",
    propertyType: "room",
    rentalArrangement: "roommate",
    price: 185000,
    currency: "CRC",
    bedrooms: 1,
    bathrooms: 1,
    parkingSpaces: 0,
    constructionArea: 18,
    lotArea: 18,
    furnished: true,
    petsAllowed: false,
    depositRequired: false,
    featured: false,
    amenities: ["Internet", "Cocina compartida", "Lavanderia"],
    roommateDetails: {
      privateRoom: true,
      privateBathroom: true,
      utilitiesIncluded: true,
      studentFriendly: true,
      availableRooms: 1,
      currentRoommates: 2,
      maxRoommates: 3,
      genderPreference: "any",
      sharedAreas: ["Cocina", "Sala", "Lavanderia"]
    },
    photos: placeholderPhotos("San Pedro Habitacion"),
    location: { type: "Point", coordinates: [-84.0338, 9.9351] },
    address: {
      province: "San Jose",
      canton: "Montes de Oca",
      district: "San Pedro",
      neighborhood: "Los Yoses",
      exactAddress: "Residencia cerca de universidades",
      hideExactLocation: true
    },
    status: "published",
    marketStatus: "reserved",
    isApproved: true,
    publishedAt: new Date(),
    owner: owners.ownerId
  },
  {
    title: "Terreno para desarrollo en Nosara",
    description:
      "Lote amplio rodeado de naturaleza, con potencial residencial o vacacional y facil acceso a las playas de Nosara.",
    businessType: "sale",
    propertyType: "lot",
    price: 198000,
    currency: "USD",
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    constructionArea: 0,
    lotArea: 1800,
    furnished: false,
    petsAllowed: false,
    featured: true,
    amenities: ["Vista verde", "Topografia aprovechable"],
    photos: placeholderPhotos("Nosara Lote"),
    location: { type: "Point", coordinates: [-85.6593, 9.979] },
    address: {
      province: "Guanacaste",
      canton: "Nicoya",
      district: "Nosara",
      neighborhood: "Playa Guiones",
      exactAddress: "Zona de alta plusvalia",
      hideExactLocation: true
    },
    status: "paused",
    marketStatus: "inactive",
    isApproved: true,
    publishedAt: new Date("2025-10-12"),
    owner: owners.agentId
  },
  {
    title: "Casa lista para mudarse en Alajuela centro",
    description:
      "Casa renovada con excelente distribucion, patio trasero, cochera y acceso rapido al aeropuerto y comercios.",
    businessType: "sale",
    propertyType: "house",
    price: 115000000,
    currency: "CRC",
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    constructionArea: 210,
    lotArea: 260,
    furnished: false,
    petsAllowed: true,
    featured: false,
    amenities: ["Patio", "Bodega", "Cuarto de pilas"],
    photos: placeholderPhotos("Alajuela Casa"),
    location: { type: "Point", coordinates: [-84.2116, 10.0163] },
    address: {
      province: "Alajuela",
      canton: "Alajuela",
      district: "Alajuela",
      neighborhood: "Centro",
      exactAddress: "Zona urbana residencial",
      hideExactLocation: true
    },
    status: "published",
    marketStatus: "available",
    isApproved: true,
    publishedAt: new Date(),
    owner: owners.ownerId
  }
];

const generatedSeedLocations = [
  {
    province: "San Jose",
    canton: "Escazu",
    district: "San Rafael",
    neighborhood: "Guachipelin",
    exactAddress: "Residencial con acceso rapido a Multiplaza y Ruta 27",
    coordinates: [-84.1452, 9.9431],
    housePrice: 465000,
    apartmentPrice: 1850,
    lotPrice: 255000,
    roomPrice: 325000,
    commercialPrice: 2600,
    saleCurrency: "USD",
    rentCurrency: "USD",
    lotCurrency: "USD",
    roomCurrency: "CRC",
    amenities: ["Seguridad", "Terraza", "Jardin", "Bodega"]
  },
  {
    province: "San Jose",
    canton: "Santa Ana",
    district: "Pozos",
    neighborhood: "Lindora",
    exactAddress: "Condominio cerca de oficentros, restaurantes y supermercado",
    coordinates: [-84.1872, 9.9364],
    housePrice: 395000,
    apartmentPrice: 1650,
    lotPrice: 230000,
    roomPrice: 295000,
    commercialPrice: 2400,
    saleCurrency: "USD",
    rentCurrency: "USD",
    lotCurrency: "USD",
    roomCurrency: "CRC",
    amenities: ["Piscina", "Cowork", "Gimnasio", "Seguridad"]
  },
  {
    province: "Heredia",
    canton: "Heredia",
    district: "Ulloa",
    neighborhood: "Lagunilla",
    exactAddress: "Zona residencial cerca de zonas francas y colegios",
    coordinates: [-84.1168, 9.9978],
    housePrice: 255000,
    apartmentPrice: 1200,
    lotPrice: 98000000,
    roomPrice: 235000,
    commercialPrice: 1950,
    saleCurrency: "USD",
    rentCurrency: "USD",
    lotCurrency: "CRC",
    roomCurrency: "CRC",
    amenities: ["Casa club", "Parque infantil", "Seguridad", "Pet park"]
  },
  {
    province: "Alajuela",
    canton: "Alajuela",
    district: "Guacima",
    neighborhood: "La Guacima",
    exactAddress: "Residencial con rapido acceso a ruta principal y centros educativos",
    coordinates: [-84.2743, 10.0256],
    housePrice: 168000000,
    apartmentPrice: 780,
    lotPrice: 72000000,
    roomPrice: 190000,
    commercialPrice: 1650,
    saleCurrency: "CRC",
    rentCurrency: "USD",
    lotCurrency: "CRC",
    roomCurrency: "CRC",
    amenities: ["Patio", "Rancho BBQ", "Bodega", "Seguridad"]
  },
  {
    province: "Cartago",
    canton: "Cartago",
    district: "Guadalupe",
    neighborhood: "El Molino",
    exactAddress: "Barrio residencial con clima fresco y facil acceso al centro",
    coordinates: [-83.9048, 9.8519],
    housePrice: 128000000,
    apartmentPrice: 690,
    lotPrice: 64500000,
    roomPrice: 175000,
    commercialPrice: 1450,
    saleCurrency: "CRC",
    rentCurrency: "USD",
    lotCurrency: "CRC",
    roomCurrency: "CRC",
    amenities: ["Vista verde", "Terraza", "Cuarto de pilas", "Jardin"]
  },
  {
    province: "Guanacaste",
    canton: "Santa Cruz",
    district: "Tamarindo",
    neighborhood: "Tamarindo Centro",
    exactAddress: "Zona turistica a minutos de la playa y servicios",
    coordinates: [-85.8381, 10.3006],
    housePrice: 585000,
    apartmentPrice: 2400,
    lotPrice: 310000,
    roomPrice: 420000,
    commercialPrice: 2800,
    saleCurrency: "USD",
    rentCurrency: "USD",
    lotCurrency: "USD",
    roomCurrency: "CRC",
    amenities: ["Piscina", "Aire acondicionado", "Terraza", "Cerca de playa"]
  },
  {
    province: "Puntarenas",
    canton: "Garabito",
    district: "Jaco",
    neighborhood: "Centro",
    exactAddress: "Torre y residencias a pasos de la playa y comercios",
    coordinates: [-84.6282, 9.6164],
    housePrice: 365000,
    apartmentPrice: 1850,
    lotPrice: 225000,
    roomPrice: 260000,
    commercialPrice: 2350,
    saleCurrency: "USD",
    rentCurrency: "USD",
    lotCurrency: "USD",
    roomCurrency: "CRC",
    amenities: ["Vista parcial al mar", "Piscina", "Ascensor", "Seguridad"]
  },
  {
    province: "Guanacaste",
    canton: "Liberia",
    district: "Liberia",
    neighborhood: "Centro",
    exactAddress: "A pocas cuadras de comercio, aeropuerto y servicios",
    coordinates: [-85.4389, 10.6348],
    housePrice: 215000,
    apartmentPrice: 950,
    lotPrice: 88000000,
    roomPrice: 185000,
    commercialPrice: 1750,
    saleCurrency: "USD",
    rentCurrency: "USD",
    lotCurrency: "CRC",
    roomCurrency: "CRC",
    amenities: ["Parqueos", "Bodega", "Ventilacion natural", "Terraza"]
  },
  {
    province: "Guanacaste",
    canton: "Nicoya",
    district: "Nosara",
    neighborhood: "Playa Guiones",
    exactAddress: "Zona de alta plusvalia rodeada de naturaleza y servicios",
    coordinates: [-85.6591, 9.9794],
    housePrice: 620000,
    apartmentPrice: 2100,
    lotPrice: 345000,
    roomPrice: 355000,
    commercialPrice: 2450,
    saleCurrency: "USD",
    rentCurrency: "USD",
    lotCurrency: "USD",
    roomCurrency: "CRC",
    amenities: ["Vista verde", "Piscina", "Deck", "Cerca de playa"]
  },
  {
    province: "San Jose",
    canton: "Montes de Oca",
    district: "San Pedro",
    neighborhood: "Los Yoses",
    exactAddress: "Sector universitario con acceso a buses, comercios y universidades",
    coordinates: [-84.0346, 9.9362],
    housePrice: 245000,
    apartmentPrice: 980,
    lotPrice: 138000000,
    roomPrice: 215000,
    commercialPrice: 1850,
    saleCurrency: "USD",
    rentCurrency: "USD",
    lotCurrency: "CRC",
    roomCurrency: "CRC",
    amenities: ["Internet", "Lavanderia", "Cocina equipada", "Cerca de universidad"]
  }
];

const generatedOffsets = [
  [0, 0],
  [0.0062, 0.0041],
  [-0.0051, 0.0032],
  [0.0045, -0.0048]
];

const offsetCoordinates = (coordinates, offsetIndex) => {
  const [lngOffset, latOffset] = generatedOffsets[offsetIndex % generatedOffsets.length];

  return [
    Number((coordinates[0] + lngOffset).toFixed(6)),
    Number((coordinates[1] + latOffset).toFixed(6))
  ];
};

const buildAddress = (location, neighborhood, exactAddress) => ({
  province: location.province,
  canton: location.canton,
  district: location.district,
  neighborhood,
  exactAddress,
  hideExactLocation: true
});

const buildLifecycle = (marketStatus, publishedAt, finalPrice) => {
  const lifecycle = {
    status: "published",
    marketStatus,
    isApproved: true,
    publishedAt
  };

  if (typeof finalPrice === "number") {
    lifecycle.finalPrice = finalPrice;
  }

  if (marketStatus === "reserved") {
    lifecycle.reservedAt = new Date(publishedAt.getTime() + 12 * 24 * 60 * 60 * 1000);
  }

  if (marketStatus === "sold") {
    lifecycle.soldAt = new Date(publishedAt.getTime() + 58 * 24 * 60 * 60 * 1000);
  }

  if (marketStatus === "rented") {
    lifecycle.rentedAt = new Date(publishedAt.getTime() + 26 * 24 * 60 * 60 * 1000);
  }

  return lifecycle;
};

const generatedSeedProperties = (owners) =>
  generatedSeedLocations.flatMap((location, index) => {
    const owner = index % 2 === 0 ? owners.agentId : owners.ownerId;
    const publishedAtBase = new Date(2025, (index * 2) % 12, 4 + index);
    const houseMarketStatus = index % 6 === 0 ? "reserved" : "available";
    const apartmentMarketStatus = index % 7 === 0 ? "rented" : "available";
    const lotMarketStatus = index % 8 === 0 ? "sold" : "available";
    const extraMarketStatus = index % 9 === 0 ? "reserved" : "available";
    const housePrice = location.housePrice + index * 12000;
    const apartmentPrice = location.apartmentPrice + index * 45;
    const lotPrice = location.lotPrice + index * (location.lotCurrency === "CRC" ? 2500000 : 9000);
    const roomPrice = location.roomPrice + index * 10000;
    const commercialPrice = location.commercialPrice + index * 55;

    const houseNeighborhood = `${location.neighborhood} Norte`;
    const apartmentNeighborhood = `${location.neighborhood} Residencial`;
    const lotNeighborhood = `${location.neighborhood} Este`;
    const roomNeighborhood = `${location.neighborhood} Universitario`;
    const commercialNeighborhood = `${location.neighborhood} Comercial`;

    return [
      {
        title: `Casa moderna con patio en ${location.neighborhood}`,
        description: `Casa amplia y funcional en ${location.neighborhood}, ${location.canton}, ideal para familia o inversion. Combina buena ubicacion, espacios luminosos y acceso rapido a servicios clave de la zona.`,
        businessType: "sale",
        propertyType: "house",
        price: housePrice,
        currency: location.saleCurrency,
        bedrooms: 3 + (index % 3),
        bathrooms: 2 + (index % 2),
        parkingSpaces: 2 + (index % 2),
        constructionArea: 175 + index * 10,
        lotArea: 240 + index * 18,
        furnished: index % 4 === 0,
        petsAllowed: true,
        featured: index % 3 === 0,
        amenities: [...location.amenities, "Sala amplia"],
        photos: placeholderPhotos(`${location.neighborhood} Casa`),
        location: { type: "Point", coordinates: offsetCoordinates(location.coordinates, 0) },
        address: buildAddress(
          location,
          houseNeighborhood,
          `${location.exactAddress}. Casa en sector residencial.`
        ),
        owner,
        ...buildLifecycle(houseMarketStatus, publishedAtBase)
      },
      {
        title: `Apartamento amueblado en ${location.neighborhood}`,
        description: `Apartamento listo para habitar en ${location.neighborhood}, con distribucion eficiente, buena iluminacion y cercania a puntos de interes. Ideal para renta tradicional o ejecutiva.`,
        businessType: "rent",
        propertyType: "apartment",
        price: apartmentPrice,
        currency: location.rentCurrency,
        bedrooms: 1 + (index % 3),
        bathrooms: 1 + (index % 2),
        parkingSpaces: 1 + (index % 2),
        constructionArea: 62 + index * 6,
        lotArea: 62 + index * 6,
        furnished: true,
        petsAllowed: index % 2 === 0,
        depositRequired: index % 3 !== 0,
        featured: index % 4 === 0,
        amenities: [...location.amenities.slice(0, 3), "Balcon"],
        photos: placeholderPhotos(`${location.neighborhood} Apartamento`),
        location: { type: "Point", coordinates: offsetCoordinates(location.coordinates, 1) },
        address: buildAddress(
          location,
          apartmentNeighborhood,
          `${location.exactAddress}. Apartamento cerca de servicios.`
        ),
        owner,
        ...buildLifecycle(
          apartmentMarketStatus,
          new Date(publishedAtBase.getTime() + 8 * 24 * 60 * 60 * 1000),
          apartmentMarketStatus === "rented"
            ? Math.max(apartmentPrice - (location.rentCurrency === "USD" ? 75 : 35000), 0)
            : undefined
        )
      },
      {
        title: `Lote listo para desarrollar en ${location.neighborhood}`,
        description: `Terreno con excelente frente y topografia aprovechable en ${location.neighborhood}. Buena opcion para desarrollo residencial, vacacional o proyecto de inversion segun la zona.`,
        businessType: "sale",
        propertyType: "lot",
        price: lotPrice,
        currency: location.lotCurrency,
        bedrooms: 0,
        bathrooms: 0,
        parkingSpaces: 0,
        constructionArea: 0,
        lotArea: 520 + index * 95,
        furnished: false,
        petsAllowed: false,
        featured: index % 5 === 0,
        amenities: ["Uso residencial", "Servicios disponibles", "Acceso asfaltado"],
        photos: placeholderPhotos(`${location.neighborhood} Lote`),
        location: { type: "Point", coordinates: offsetCoordinates(location.coordinates, 2) },
        address: buildAddress(
          location,
          lotNeighborhood,
          `${location.exactAddress}. Lote con acceso vehicular.`
        ),
        owner,
        ...buildLifecycle(
          lotMarketStatus,
          new Date(publishedAtBase.getTime() + 16 * 24 * 60 * 60 * 1000),
          lotMarketStatus === "sold"
            ? Math.round(lotPrice * (location.lotCurrency === "CRC" ? 0.95 : 0.96))
            : undefined
        )
      },
      index % 2 === 0
        ? {
            title: `Habitacion para roomies en ${location.neighborhood}`,
            description: `Habitacion privada en alquiler compartido en ${location.neighborhood}, pensada para estudiantes y profesionales que quieren ubicacion practica, servicios incluidos y convivencia ordenada.`,
            businessType: "rent",
            propertyType: "room",
            rentalArrangement: "roommate",
            price: roomPrice,
            currency: location.roomCurrency,
            bedrooms: 1,
            bathrooms: 1,
            parkingSpaces: index % 3 === 0 ? 1 : 0,
            constructionArea: 18 + index,
            lotArea: 18 + index,
            furnished: true,
            petsAllowed: false,
            depositRequired: index % 3 === 0,
            featured: false,
            amenities: ["Internet", "Cocina compartida", "Lavanderia"],
            roommateDetails: {
              privateRoom: true,
              privateBathroom: index % 3 === 0,
              utilitiesIncluded: true,
              studentFriendly: true,
              availableRooms: 1 + (index % 2),
              currentRoommates: 1 + (index % 3),
              maxRoommates: 3 + (index % 2),
              genderPreference: "any",
              sharedAreas: ["Cocina", "Sala", "Lavanderia"]
            },
            photos: placeholderPhotos(`${location.neighborhood} Roomies`),
            location: { type: "Point", coordinates: offsetCoordinates(location.coordinates, 3) },
            address: buildAddress(
              location,
              roomNeighborhood,
              `${location.exactAddress}. Habitacion en residencia compartida.`
            ),
            owner,
            ...buildLifecycle(
              extraMarketStatus,
              new Date(publishedAtBase.getTime() + 22 * 24 * 60 * 60 * 1000)
            )
          }
        : {
            title: `Local comercial en ${location.neighborhood}`,
            description: `Espacio comercial de alto trafico en ${location.neighborhood}, ideal para oficina, consultorio, tienda o showroom. Buena visibilidad y acceso para clientes.`,
            businessType: "rent",
            propertyType: "commercial",
            price: commercialPrice,
            currency: location.rentCurrency,
            bedrooms: 0,
            bathrooms: 1 + (index % 2),
            parkingSpaces: 3 + (index % 3),
            constructionArea: 95 + index * 11,
            lotArea: 120 + index * 13,
            furnished: false,
            petsAllowed: false,
            depositRequired: true,
            featured: index % 5 === 0,
            amenities: ["Frente a calle principal", "Bodega", "Parqueos"],
            photos: placeholderPhotos(`${location.neighborhood} Comercial`),
            location: { type: "Point", coordinates: offsetCoordinates(location.coordinates, 3) },
            address: buildAddress(
              location,
              commercialNeighborhood,
              `${location.exactAddress}. Local con vitrina y acceso directo.`
            ),
            owner,
            ...buildLifecycle(
              extraMarketStatus,
              new Date(publishedAtBase.getTime() + 22 * 24 * 60 * 60 * 1000)
            )
          }
    ];
  });

export const seedProperties = (owners) => [
  ...baseSeedProperties(owners),
  ...generatedSeedProperties(owners)
];
