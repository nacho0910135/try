export const seedUsers = [
  {
    name: "Casa CR Admin",
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

const placeholderPhotos = (label) => [
  {
    url: `https://placehold.co/1400x900/png?text=${encodeURIComponent(`${label}+1`)}`,
    publicId: null,
    isPrimary: true,
    alt: `${label} principal`
  },
  {
    url: `https://placehold.co/1400x900/png?text=${encodeURIComponent(`${label}+2`)}`,
    publicId: null,
    isPrimary: false,
    alt: `${label} secundaria`
  }
];

export const seedProperties = (owners) => [
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
    isApproved: true,
    publishedAt: new Date(),
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
    isApproved: true,
    publishedAt: new Date(),
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
    price: 185000,
    currency: "CRC",
    bedrooms: 1,
    bathrooms: 1,
    parkingSpaces: 0,
    constructionArea: 18,
    lotArea: 18,
    furnished: true,
    petsAllowed: false,
    featured: false,
    amenities: ["Internet", "Cocina compartida", "Lavanderia"],
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
    status: "published",
    isApproved: true,
    publishedAt: new Date(),
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
    isApproved: true,
    publishedAt: new Date(),
    owner: owners.ownerId
  }
];

