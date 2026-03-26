import { createPlaceholderImageDataUri } from "../utils/placeholderImage.js";
import { createSlug } from "../utils/slug.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const REFERENCE_DATE = new Date("2026-03-20T14:00:00.000Z");
const PROPERTIES_PER_ZONE = 25;

export const REALISTIC_SEED_TOTAL = 500;

export const realisticSeedUserDefaults = [
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
    name: "Andres Solano",
    email: "andres.solano@casacr.com",
    password: "Andres12345",
    phone: "+50670000005",
    role: "agent",
    avatar: "https://placehold.co/200x200/png?text=Andres"
  },
  {
    name: "Melissa Vega",
    email: "melissa.vega@casacr.com",
    password: "Melissa12345",
    phone: "+50670000006",
    role: "agent",
    avatar: "https://placehold.co/200x200/png?text=Melissa"
  },
  {
    name: "Carlos Barrantes",
    email: "carlos.barrantes@casacr.com",
    password: "Carlos12345",
    phone: "+50670000007",
    role: "agent",
    avatar: "https://placehold.co/200x200/png?text=Carlos"
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
    role: "owner",
    avatar: "https://placehold.co/200x200/png?text=Sofia"
  },
  {
    name: "Mariana Quesada",
    email: "mariana.quesada@casacr.com",
    password: "Mariana12345",
    phone: "+50670000008",
    role: "owner",
    avatar: "https://placehold.co/200x200/png?text=Mariana"
  },
  {
    name: "Esteban Araya",
    email: "esteban.araya@casacr.com",
    password: "Esteban12345",
    phone: "+50670000009",
    role: "owner",
    avatar: "https://placehold.co/200x200/png?text=Esteban"
  },
  {
    name: "Fernanda Coto",
    email: "fernanda.coto@casacr.com",
    password: "Fernanda12345",
    phone: "+50670000010",
    role: "owner",
    avatar: "https://placehold.co/200x200/png?text=Fernanda"
  },
  {
    name: "Jose Pablo Chaves",
    email: "josepablo.chaves@casacr.com",
    password: "JosePablo12345",
    phone: "+50670000011",
    role: "owner",
    avatar: "https://placehold.co/200x200/png?text=JosePablo"
  }
];

const housePhotoLibrary = [
  {
    url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
    alt: "fachada de casa moderna"
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    alt: "casa contemporanea con jardin"
  },
  {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
    alt: "sala amplia con luz natural"
  },
  {
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    alt: "interior de casa con acabados modernos"
  },
  {
    url: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1600&q=80",
    alt: "terraza con vista residencial"
  },
  {
    url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
    alt: "residencia con piscina y jardin"
  },
  {
    url: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
    alt: "cocina integrada en casa familiar"
  },
  {
    url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
    alt: "espacio interior luminoso"
  }
];

const lotPhotoLibrary = [
  {
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
    alt: "terreno amplio con vegetacion"
  },
  {
    url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80",
    alt: "lote plano con acceso vehicular"
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
    alt: "terreno con entorno natural"
  },
  {
    url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1600&q=80",
    alt: "propiedad con vista abierta"
  },
  {
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    alt: "frente de lote sobre calle publica"
  },
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    alt: "terreno para desarrollo residencial"
  }
];

const segmentProfiles = {
  premium: {
    saleBedrooms: [3, 5],
    rentBedrooms: [3, 4],
    saleBathrooms: [2, 4],
    rentBathrooms: [2, 3],
    parking: [2, 4],
    furnishedRentChance: 0.32,
    petsRentChance: 0.7
  },
  urban: {
    saleBedrooms: [2, 4],
    rentBedrooms: [2, 3],
    saleBathrooms: [2, 3],
    rentBathrooms: [1, 2],
    parking: [1, 2],
    furnishedRentChance: 0.18,
    petsRentChance: 0.42
  },
  family: {
    saleBedrooms: [3, 4],
    rentBedrooms: [2, 3],
    saleBathrooms: [2, 3],
    rentBathrooms: [2, 2],
    parking: [2, 3],
    furnishedRentChance: 0.12,
    petsRentChance: 0.58
  },
  beach: {
    saleBedrooms: [2, 4],
    rentBedrooms: [2, 4],
    saleBathrooms: [2, 4],
    rentBathrooms: [2, 3],
    parking: [1, 3],
    furnishedRentChance: 0.78,
    petsRentChance: 0.3
  },
  regional: {
    saleBedrooms: [2, 4],
    rentBedrooms: [2, 3],
    saleBathrooms: [1, 3],
    rentBathrooms: [1, 2],
    parking: [1, 2],
    furnishedRentChance: 0.14,
    petsRentChance: 0.46
  }
};

const extraHouseAmenities = [
  "cuarto de pilas",
  "oficina",
  "terraza",
  "bodega",
  "jardin",
  "sala de TV",
  "desayunador",
  "patio trasero",
  "seguridad 24/7",
  "porton electrico",
  "area BBQ",
  "iluminacion natural",
  "espacio para home office",
  "habitacion de servicio"
];

const extraLotAmenities = [
  "topografia plana",
  "frente amplio",
  "uso residencial",
  "uso mixto",
  "servicios publicos disponibles",
  "calle asfaltada",
  "listo para construir",
  "tapia parcial",
  "zona de alta plusvalia",
  "vista abierta",
  "cerca de ruta principal",
  "cobertura de internet"
];

const houseSaleLeads = [
  "Casa familiar",
  "Casa contemporanea",
  "Casa lista para mudarse",
  "Casa de una planta",
  "Casa con excelente distribucion",
  "Casa amplia"
];

const houseRentLeads = [
  "Casa en alquiler",
  "Casa para familia en alquiler",
  "Casa con patio en alquiler",
  "Casa ejecutiva en alquiler",
  "Casa amueblada en alquiler",
  "Casa de dos niveles en alquiler"
];

const houseHighlights = [
  "con patio",
  "con terraza",
  "con oficina",
  "con jardin",
  "en condominio",
  "con sala amplia",
  "con cuarto de pilas",
  "con buena luz natural"
];

const lotSaleLeads = [
  "Lote residencial",
  "Terreno plano",
  "Lote esquinero",
  "Terreno listo para construir",
  "Lote con frente amplio",
  "Terreno para desarrollar"
];

const lotRentLeads = [
  "Lote en alquiler",
  "Terreno para patio",
  "Lote para flotilla",
  "Terreno para bodegaje abierto",
  "Lote con frente comercial",
  "Terreno para operacion ligera"
];

const lotHighlights = [
  "con topografia aprovechable",
  "con buen frente",
  "con acceso asfaltado",
  "de facil ingreso",
  "con vocacion comercial",
  "cerca de ruta principal"
];

const zoneCatalog = [
  {
    code: "escazu-guachipelin",
    province: "San Jose",
    canton: "Escazu",
    district: "San Rafael",
    neighborhood: "Guachipelin",
    coordinates: [-84.1452, 9.9431],
    segment: "premium",
    demand: 1.35,
    houseSaleRange: [185000000, 425000000],
    houseRentRange: [950000, 2400000],
    lotSaleRange: [95000000, 240000000],
    lotRentRange: [350000, 900000],
    houseConstructionRange: [180, 420],
    houseLandRange: [240, 700],
    lotAreaRange: [320, 1200],
    serviceRange: { hospital: [1.2, 4.2], school: [0.5, 1.8], highSchool: [0.8, 2.3] },
    microAreas: ["Guachipelin Sur", "Lomas de Guachipelin", "Bello Horizonte", "sector Multiplaza"],
    references: ["Multiplaza Escazu", "Hospital CIMA", "Ruta 27"],
    houseAmenities: ["seguridad", "terraza", "jardin", "bodega"],
    lotAmenities: ["uso residencial premium", "alta plusvalia", "acceso controlado"],
    marketLine: "un corredor residencial premium con absorcion sostenida",
    buyerProfile: "familias y ejecutivos que priorizan ubicacion, seguridad y conectividad",
    rentProfile: "ejecutivos, expatriados y familias con presupuesto alto",
    lotUse: "casa propia de alto valor o proyecto boutique"
  },
  {
    code: "santa-ana-lindora",
    province: "San Jose",
    canton: "Santa Ana",
    district: "Pozos",
    neighborhood: "Lindora",
    coordinates: [-84.1872, 9.9364],
    segment: "premium",
    demand: 1.3,
    houseSaleRange: [175000000, 390000000],
    houseRentRange: [900000, 2200000],
    lotSaleRange: [90000000, 220000000],
    lotRentRange: [325000, 850000],
    houseConstructionRange: [170, 390],
    houseLandRange: [210, 620],
    lotAreaRange: [300, 1100],
    serviceRange: { hospital: [1.4, 4.8], school: [0.6, 1.9], highSchool: [0.9, 2.6] },
    microAreas: ["Lindora oeste", "Pozos norte", "Rio Oro cercano", "corredor corporativo"],
    references: ["Forum", "Ruta 27", "Automercado Lindora"],
    houseAmenities: ["gimnasio", "casa club", "seguridad", "terraza"],
    lotAmenities: ["uso residencial", "frente a calle secundaria", "servicios listos"],
    marketLine: "un mercado de casas en condominio con fuerte salida para venta y renta",
    buyerProfile: "familias y compradores que buscan condominios bien ubicados",
    rentProfile: "ejecutivos y familias cercanas al corredor de oficinas",
    lotUse: "desarrollo residencial o vivienda de inversion"
  },
  {
    code: "curridabat-pinares",
    province: "San Jose",
    canton: "Curridabat",
    district: "Sanchez",
    neighborhood: "Pinares",
    coordinates: [-84.0267, 9.9145],
    segment: "urban",
    demand: 1.2,
    houseSaleRange: [145000000, 320000000],
    houseRentRange: [750000, 1750000],
    lotSaleRange: [75000000, 180000000],
    lotRentRange: [300000, 700000],
    houseConstructionRange: [150, 320],
    houseLandRange: [180, 420],
    lotAreaRange: [250, 780],
    serviceRange: { hospital: [1.8, 5.5], school: [0.4, 1.5], highSchool: [0.8, 2.2] },
    microAreas: ["Pinares norte", "Pinares este", "Ayarco cercano", "Lomas del Sol"],
    references: ["Momentum Pinares", "Plaza Cronos", "Florencio del Castillo"],
    houseAmenities: ["balcon", "oficina", "jardin", "seguridad"],
    lotAmenities: ["uso residencial", "frente regular", "servicios al frente"],
    marketLine: "una zona urbana consolidada con demanda constante por ubicacion",
    buyerProfile: "familias y profesionales que valoran cercania a comercios y colegios",
    rentProfile: "hogares de perfil ejecutivo y familias pequenas",
    lotUse: "casa urbana, remodelacion o proyecto compacto"
  },
  {
    code: "san-pedro-los-yoses",
    province: "San Jose",
    canton: "Montes de Oca",
    district: "San Pedro",
    neighborhood: "Los Yoses",
    coordinates: [-84.0346, 9.9362],
    segment: "urban",
    demand: 1.16,
    houseSaleRange: [105000000, 235000000],
    houseRentRange: [550000, 1200000],
    lotSaleRange: [68000000, 145000000],
    lotRentRange: [240000, 450000],
    houseConstructionRange: [125, 280],
    houseLandRange: [160, 340],
    lotAreaRange: [220, 560],
    serviceRange: { hospital: [1.8, 5.6], school: [0.3, 1.2], highSchool: [0.5, 1.6] },
    microAreas: ["Los Yoses sur", "Barrio Dent cercano", "sector UCR", "rotonda de la Hispanidad"],
    references: ["UCR", "Mall San Pedro", "Circunvalacion"],
    houseAmenities: ["espacio para home office", "patio pequeno", "bodega", "cerca de universidad"],
    lotAmenities: ["uso mixto", "ideal para renta", "cerca de buses"],
    marketLine: "un submercado urbano y universitario de alta rotacion",
    buyerProfile: "inversionistas y familias que necesitan ubicacion central",
    rentProfile: "profesionales, familias pequenas y perfiles universitarios",
    lotUse: "desarrollo de vivienda urbana o local de servicios"
  },
  {
    code: "moravia-la-guaria",
    province: "San Jose",
    canton: "Moravia",
    district: "San Vicente",
    neighborhood: "La Guaria",
    coordinates: [-84.0018, 9.9613],
    segment: "family",
    demand: 1.08,
    houseSaleRange: [118000000, 260000000],
    houseRentRange: [600000, 1350000],
    lotSaleRange: [72000000, 158000000],
    lotRentRange: [260000, 520000],
    houseConstructionRange: [145, 310],
    houseLandRange: [190, 460],
    lotAreaRange: [240, 720],
    serviceRange: { hospital: [2.2, 5.8], school: [0.5, 1.8], highSchool: [0.7, 2.1] },
    microAreas: ["La Guaria alta", "residencial Lincoln", "sector Saint Clare", "urbanizacion Los Colegios"],
    references: ["Lincoln Plaza", "Saint Clare", "Ruta 32"],
    houseAmenities: ["jardin", "terraza", "porton electrico", "cuarto de pilas"],
    lotAmenities: ["uso residencial", "frente mediano", "entorno de casas"],
    marketLine: "una zona residencial familiar de ticket medio alto y buena permanencia",
    buyerProfile: "familias que buscan barrios tranquilos y colegios cercanos",
    rentProfile: "familias y parejas con necesidad de buen acceso a San Jose",
    lotUse: "vivienda propia o proyecto de una o dos unidades"
  },
  {
    code: "tibas-llorente",
    province: "San Jose",
    canton: "Tibas",
    district: "Anselmo Llorente",
    neighborhood: "Llorente",
    coordinates: [-84.0788, 9.9595],
    segment: "urban",
    demand: 0.98,
    houseSaleRange: [92000000, 185000000],
    houseRentRange: [450000, 900000],
    lotSaleRange: [48000000, 105000000],
    lotRentRange: [210000, 380000],
    houseConstructionRange: [110, 240],
    houseLandRange: [140, 300],
    lotAreaRange: [180, 480],
    serviceRange: { hospital: [2.4, 5.2], school: [0.4, 1.4], highSchool: [0.5, 1.8] },
    microAreas: ["Llorente norte", "residencial Monserrat", "cuadrante central", "sector estadio"],
    references: ["centro de Tibas", "Ruta 32", "estadio Ricardo Saprissa"],
    houseAmenities: ["patio", "bodega", "porton electrico", "ventilacion natural"],
    lotAmenities: ["uso residencial", "cerca de comercio", "frente regular"],
    marketLine: "una zona urbana funcional con fuerte mercado de reposicion familiar",
    buyerProfile: "compradores que buscan cercania a San Jose a precio competitivo",
    rentProfile: "familias y parejas que priorizan movilidad",
    lotUse: "casa propia, taller liviano o vivienda urbana"
  },
  {
    code: "guacima",
    province: "Alajuela",
    canton: "Alajuela",
    district: "Guacima",
    neighborhood: "La Guacima",
    coordinates: [-84.2743, 10.0256],
    segment: "family",
    demand: 1.05,
    houseSaleRange: [88000000, 210000000],
    houseRentRange: [480000, 1150000],
    lotSaleRange: [42000000, 118000000],
    lotRentRange: [225000, 420000],
    houseConstructionRange: [135, 290],
    houseLandRange: [220, 620],
    lotAreaRange: [260, 950],
    serviceRange: { hospital: [3.4, 7.5], school: [0.8, 2.4], highSchool: [1.2, 3.2] },
    microAreas: ["La Guacima centro", "sector Los Reyes", "condominio oeste", "San Miguel cercano"],
    references: ["Los Reyes", "Automercado", "radial Belen"],
    houseAmenities: ["patio", "rancho BBQ", "seguridad", "jardin"],
    lotAmenities: ["uso residencial", "topografia plana", "clima fresco"],
    marketLine: "un corredor residencial con demanda familiar y espacio exterior",
    buyerProfile: "familias que quieren patio, amenidades y acceso a la GAM",
    rentProfile: "hogares que valoran condominios y mejor relacion area precio",
    lotUse: "casa con patio o desarrollo de lote residencial"
  },
  {
    code: "ciudad-quesada",
    province: "Alajuela",
    canton: "San Carlos",
    district: "Quesada",
    neighborhood: "Ciudad Quesada",
    coordinates: [-84.4281, 10.3238],
    segment: "regional",
    demand: 0.96,
    houseSaleRange: [65000000, 160000000],
    houseRentRange: [350000, 780000],
    lotSaleRange: [26000000, 96000000],
    lotRentRange: [180000, 320000],
    houseConstructionRange: [100, 250],
    houseLandRange: [180, 520],
    lotAreaRange: [240, 1600],
    serviceRange: { hospital: [1.2, 4.6], school: [0.6, 2.0], highSchool: [0.8, 2.8] },
    microAreas: ["barrio San Martin", "sector colegio Maria Inmaculada", "urbanizacion norte", "camino a Florencia"],
    references: ["hospital San Carlos", "centro de Quesada", "ruta a La Fortuna"],
    houseAmenities: ["patio", "bodega", "cuarto de pilas", "ventilacion cruzada"],
    lotAmenities: ["uso residencial", "apto para inversion", "frente amplio"],
    marketLine: "un mercado regional con buena salida para vivienda familiar y lotes amplios",
    buyerProfile: "familias e inversionistas locales que valoran area de lote",
    rentProfile: "familias pequenas, personal medico y comercio local",
    lotUse: "vivienda, cabinas o proyecto de renta"
  },
  {
    code: "grecia-centro",
    province: "Alajuela",
    canton: "Grecia",
    district: "Grecia",
    neighborhood: "Centro",
    coordinates: [-84.3127, 10.0728],
    segment: "regional",
    demand: 0.97,
    houseSaleRange: [76000000, 165000000],
    houseRentRange: [380000, 850000],
    lotSaleRange: [30000000, 84000000],
    lotRentRange: [180000, 340000],
    houseConstructionRange: [110, 250],
    houseLandRange: [170, 420],
    lotAreaRange: [220, 1100],
    serviceRange: { hospital: [1.8, 5.6], school: [0.5, 1.9], highSchool: [0.7, 2.7] },
    microAreas: ["Grecia centro", "residencial El Ingenio", "sector San Roque", "camino a Puente de Piedra"],
    references: ["parque de Grecia", "hospital San Francisco", "ruta Bernardo Soto"],
    houseAmenities: ["patio", "terraza", "bodega", "cochera techada"],
    lotAmenities: ["uso residencial", "frente medio", "servicios listos"],
    marketLine: "una plaza regional estable con buena absorcion en ticket medio",
    buyerProfile: "familias de la zona oeste que buscan casa propia",
    rentProfile: "parejas y familias con movilidad hacia Alajuela y San Jose",
    lotUse: "vivienda o proyecto pequeno de condominios"
  },
  {
    code: "lagunilla",
    province: "Heredia",
    canton: "Heredia",
    district: "Ulloa",
    neighborhood: "Lagunilla",
    coordinates: [-84.1168, 9.9978],
    segment: "family",
    demand: 1.12,
    houseSaleRange: [115000000, 248000000],
    houseRentRange: [580000, 1250000],
    lotSaleRange: [68000000, 155000000],
    lotRentRange: [240000, 520000],
    houseConstructionRange: [135, 300],
    houseLandRange: [180, 460],
    lotAreaRange: [230, 680],
    serviceRange: { hospital: [1.6, 4.4], school: [0.5, 1.6], highSchool: [0.6, 1.9] },
    microAreas: ["Lagunilla norte", "ulloa residencial", "cerca de zonas francas", "sector Oxigeno"],
    references: ["Ultrapark", "Oxigeno", "Ruta 1"],
    houseAmenities: ["seguridad", "casa club", "parque infantil", "jardin"],
    lotAmenities: ["uso residencial", "plusvalia estable", "cerca de empleo"],
    marketLine: "una zona de vivienda familiar con fuerte demanda asociada a zonas francas",
    buyerProfile: "familias y perfiles ejecutivos que buscan heredia central",
    rentProfile: "colaboradores de zonas francas y familias pequenas",
    lotUse: "vivienda o desarrollo compacto para renta"
  },
  {
    code: "belen-la-ribera",
    province: "Heredia",
    canton: "Belen",
    district: "La Ribera",
    neighborhood: "La Ribera",
    coordinates: [-84.1897, 9.9792],
    segment: "premium",
    demand: 1.22,
    houseSaleRange: [148000000, 315000000],
    houseRentRange: [780000, 1700000],
    lotSaleRange: [82000000, 195000000],
    lotRentRange: [320000, 680000],
    houseConstructionRange: [150, 340],
    houseLandRange: [190, 520],
    lotAreaRange: [240, 760],
    serviceRange: { hospital: [1.8, 4.6], school: [0.5, 1.5], highSchool: [0.7, 2.1] },
    microAreas: ["La Ribera oeste", "residencial cerca del aeropuerto", "sector Intel", "barrio San Vicente"],
    references: ["Aeropuerto", "Intel", "Forum 2"],
    houseAmenities: ["seguridad", "oficina", "terraza", "porton electrico"],
    lotAmenities: ["uso residencial", "alta salida", "cerca de vias principales"],
    marketLine: "una zona de alta liquidez residencial por cercania a empleo y servicios",
    buyerProfile: "familias y compradores de perfil corporativo",
    rentProfile: "ejecutivos con necesidad de cercania a Belen y Santa Ana",
    lotUse: "vivienda de ticket medio alto o proyecto de renta premium"
  },
  {
    code: "cartago-el-molino",
    province: "Cartago",
    canton: "Cartago",
    district: "Guadalupe",
    neighborhood: "El Molino",
    coordinates: [-83.9048, 9.8519],
    segment: "regional",
    demand: 0.94,
    houseSaleRange: [82000000, 170000000],
    houseRentRange: [380000, 760000],
    lotSaleRange: [32000000, 78000000],
    lotRentRange: [170000, 300000],
    houseConstructionRange: [110, 245],
    houseLandRange: [170, 420],
    lotAreaRange: [220, 900],
    serviceRange: { hospital: [2.1, 6.0], school: [0.6, 1.9], highSchool: [0.7, 2.5] },
    microAreas: ["El Molino norte", "sector Maria Auxiliadora", "camino a Oreamuno", "barrio residencial"],
    references: ["TEC", "centro de Cartago", "basilica"],
    houseAmenities: ["jardin", "bodega", "cuarto de pilas", "terraza"],
    lotAmenities: ["uso residencial", "vista al valle", "clima fresco"],
    marketLine: "un mercado tradicional con buena absorcion en vivienda familiar",
    buyerProfile: "familias locales y compradores de primera vivienda",
    rentProfile: "parejas, familias y profesionales de Cartago",
    lotUse: "casa propia o vivienda para renta tradicional"
  },
  {
    code: "san-diego",
    province: "Cartago",
    canton: "La Union",
    district: "San Diego",
    neighborhood: "San Diego",
    coordinates: [-83.9965, 9.8995],
    segment: "family",
    demand: 1.03,
    houseSaleRange: [112000000, 220000000],
    houseRentRange: [520000, 1050000],
    lotSaleRange: [55000000, 128000000],
    lotRentRange: [230000, 420000],
    houseConstructionRange: [125, 270],
    houseLandRange: [180, 420],
    lotAreaRange: [230, 720],
    serviceRange: { hospital: [2.0, 5.8], school: [0.5, 1.7], highSchool: [0.8, 2.0] },
    microAreas: ["San Diego centro", "Lomas de Ayarco cercano", "residencial Omega", "sector Terramall"],
    references: ["Terramall", "Florencio del Castillo", "parque de Tres Rios"],
    houseAmenities: ["seguridad", "patio", "terraza", "cochera techada"],
    lotAmenities: ["uso residencial", "plusvalia media alta", "servicios completos"],
    marketLine: "una zona familiar en expansion con demanda sostenida por conectividad",
    buyerProfile: "familias que buscan buena conexion hacia Curridabat y Cartago",
    rentProfile: "familias medianas y perfiles de ingreso medio",
    lotUse: "vivienda o desarrollo horizontal pequeno"
  },
  {
    code: "liberia-centro",
    province: "Guanacaste",
    canton: "Liberia",
    district: "Liberia",
    neighborhood: "Centro",
    coordinates: [-85.4389, 10.6348],
    segment: "regional",
    demand: 0.99,
    houseSaleRange: [84000000, 178000000],
    houseRentRange: [420000, 900000],
    lotSaleRange: [38000000, 105000000],
    lotRentRange: [180000, 360000],
    houseConstructionRange: [110, 260],
    houseLandRange: [190, 480],
    lotAreaRange: [260, 1100],
    serviceRange: { hospital: [1.4, 4.8], school: [0.6, 2.0], highSchool: [0.8, 2.9] },
    microAreas: ["Liberia centro", "barrio Los Angeles", "camino al aeropuerto", "sector colegio"],
    references: ["hospital Enrique Baltodano", "aeropuerto de Liberia", "centro de Liberia"],
    houseAmenities: ["patio", "ventilacion natural", "bodega", "cochera"],
    lotAmenities: ["uso mixto", "frente amplio", "cerca de comercio"],
    marketLine: "una plaza regional con rotacion estable y demanda por suelo util",
    buyerProfile: "familias, profesionales y pequenos inversionistas",
    rentProfile: "empleados del sector servicios, turismo y comercio",
    lotUse: "casa, patio de trabajo o uso mixto liviano"
  },
  {
    code: "tamarindo",
    province: "Guanacaste",
    canton: "Santa Cruz",
    district: "Tamarindo",
    neighborhood: "Tamarindo Centro",
    coordinates: [-85.8381, 10.3006],
    segment: "beach",
    demand: 1.34,
    houseSaleRange: [220000000, 520000000],
    houseRentRange: [1200000, 3200000],
    lotSaleRange: [120000000, 320000000],
    lotRentRange: [420000, 950000],
    houseConstructionRange: [170, 420],
    houseLandRange: [240, 900],
    lotAreaRange: [350, 1800],
    serviceRange: { hospital: [5.0, 18.0], school: [1.0, 4.0], highSchool: [1.5, 5.2] },
    microAreas: ["Tamarindo centro", "sector Langosta", "camino a Villareal", "residencial playa"],
    references: ["playa Tamarindo", "centro gastronomico", "ruta a Huacas"],
    houseAmenities: ["piscina", "aire acondicionado", "terraza", "cerca de playa"],
    lotAmenities: ["uso residencial o vacacional", "alta plusvalia", "potencial turistico"],
    marketLine: "un submercado turistico premium con ticket alto y demanda internacional",
    buyerProfile: "inversionistas, compradores vacacionales y perfiles de renta corta",
    rentProfile: "estadias ejecutivas, expats y perfiles vacacionales de larga estancia",
    lotUse: "villa vacacional, casa premium o desarrollo turistico pequeno"
  },
  {
    code: "playas-del-coco",
    province: "Guanacaste",
    canton: "Carrillo",
    district: "Sardinal",
    neighborhood: "Playas del Coco",
    coordinates: [-85.6896, 10.5508],
    segment: "beach",
    demand: 1.26,
    houseSaleRange: [185000000, 440000000],
    houseRentRange: [980000, 2700000],
    lotSaleRange: [95000000, 265000000],
    lotRentRange: [380000, 900000],
    houseConstructionRange: [155, 360],
    houseLandRange: [220, 780],
    lotAreaRange: [320, 1550],
    serviceRange: { hospital: [4.8, 16.0], school: [0.9, 3.8], highSchool: [1.3, 4.8] },
    microAreas: ["Coco centro", "Las Palmas", "sector Ocotal", "camino a Sardinal"],
    references: ["playa del Coco", "marina cercana", "ruta a Liberia"],
    houseAmenities: ["piscina", "terraza", "aire acondicionado", "parqueo"],
    lotAmenities: ["potencial turistico", "uso residencial", "cerca de playa"],
    marketLine: "una zona costera con buen ritmo de venta y renta residencial",
    buyerProfile: "inversionistas y familias que buscan segunda vivienda",
    rentProfile: "residentes temporales, turismo largo y personal del sector servicios",
    lotUse: "villa, casa vacacional o patio para operacion turistica"
  },
  {
    code: "jaco",
    province: "Puntarenas",
    canton: "Garabito",
    district: "Jaco",
    neighborhood: "Centro",
    coordinates: [-84.6282, 9.6164],
    segment: "beach",
    demand: 1.18,
    houseSaleRange: [155000000, 360000000],
    houseRentRange: [850000, 2100000],
    lotSaleRange: [88000000, 210000000],
    lotRentRange: [320000, 760000],
    houseConstructionRange: [145, 320],
    houseLandRange: [180, 620],
    lotAreaRange: [260, 1200],
    serviceRange: { hospital: [1.8, 9.0], school: [0.7, 2.5], highSchool: [1.2, 3.4] },
    microAreas: ["Jaco centro", "residencial Herradura cercano", "barrio Las Monas", "camino a Quebrada Seca"],
    references: ["playa Jaco", "centro comercial", "Costanera"],
    houseAmenities: ["terraza", "aire acondicionado", "piscina", "seguridad"],
    lotAmenities: ["uso mixto", "potencial turistico", "frente aprovechable"],
    marketLine: "un mercado costero con mezcla de vivienda, inversion y renta",
    buyerProfile: "inversionistas y familias que buscan acceso a playa y servicios",
    rentProfile: "residentes de playa, turismo de larga estancia y profesionales remotos",
    lotUse: "casa vacacional, local de apoyo o proyecto mixto pequeno"
  },
  {
    code: "quepos",
    province: "Puntarenas",
    canton: "Quepos",
    district: "Quepos",
    neighborhood: "Centro",
    coordinates: [-84.1619, 9.4319],
    segment: "beach",
    demand: 1.08,
    houseSaleRange: [132000000, 295000000],
    houseRentRange: [720000, 1650000],
    lotSaleRange: [60000000, 165000000],
    lotRentRange: [280000, 620000],
    houseConstructionRange: [130, 290],
    houseLandRange: [190, 700],
    lotAreaRange: [260, 1500],
    serviceRange: { hospital: [1.5, 7.2], school: [0.8, 2.6], highSchool: [1.2, 3.5] },
    microAreas: ["Quepos centro", "sector Marina Pez Vela", "camino a Manuel Antonio", "barrio Boca Vieja"],
    references: ["Manuel Antonio", "marina Pez Vela", "centro de Quepos"],
    houseAmenities: ["terraza", "ventilacion natural", "jardin", "parqueo"],
    lotAmenities: ["uso residencial o turistico", "vista verde", "buen acceso"],
    marketLine: "una zona con flujo mixto entre vivienda local e inversion turistica",
    buyerProfile: "inversionistas medios y familias de la costa central",
    rentProfile: "personal turistico, familias y renta ejecutiva local",
    lotUse: "vivienda, cabinas o proyecto vacacional pequeno"
  },
  {
    code: "barranca",
    province: "Puntarenas",
    canton: "Puntarenas",
    district: "Barranca",
    neighborhood: "Barranca",
    coordinates: [-84.7395, 9.9772],
    segment: "regional",
    demand: 0.93,
    houseSaleRange: [78000000, 182000000],
    houseRentRange: [420000, 860000],
    lotSaleRange: [36000000, 92000000],
    lotRentRange: [190000, 350000],
    houseConstructionRange: [110, 255],
    houseLandRange: [180, 520],
    lotAreaRange: [240, 1100],
    serviceRange: { hospital: [2.2, 6.8], school: [0.7, 2.1], highSchool: [0.9, 2.9] },
    microAreas: ["Barranca centro", "sector radial", "camino a El Roble", "barrio residencial"],
    references: ["Puntarenas centro", "radial", "zona industrial"],
    houseAmenities: ["patio", "bodega", "cochera", "porton"],
    lotAmenities: ["uso mixto", "frente comercial", "acceso para camiones"],
    marketLine: "una zona funcional de vivienda y actividad comercial ligera",
    buyerProfile: "familias, comerciantes y propietarios de pequenos negocios",
    rentProfile: "hogares locales y operaciones pequenas que requieren patio",
    lotUse: "patio, estacionamiento, taller liviano o vivienda"
  },
  {
    code: "guapiles",
    province: "Limon",
    canton: "Pococi",
    district: "Guapiles",
    neighborhood: "Centro",
    coordinates: [-83.7849, 10.2148],
    segment: "regional",
    demand: 0.95,
    houseSaleRange: [72000000, 168000000],
    houseRentRange: [380000, 820000],
    lotSaleRange: [28000000, 98000000],
    lotRentRange: [175000, 340000],
    houseConstructionRange: [105, 250],
    houseLandRange: [200, 640],
    lotAreaRange: [260, 1800],
    serviceRange: { hospital: [1.8, 5.0], school: [0.6, 2.2], highSchool: [0.8, 2.8] },
    microAreas: ["Guapiles centro", "barrio Toro Amarillo", "camino a Roxana", "residencial Santa Clara"],
    references: ["hospital de Guapiles", "centro comercial", "ruta 32"],
    houseAmenities: ["patio", "terraza", "bodega", "jardin"],
    lotAmenities: ["uso residencial", "frente amplio", "potencial de inversion"],
    marketLine: "un mercado regional donde el tamano de lote sigue pesando mucho en la decision",
    buyerProfile: "familias locales y compradores de segunda vivienda regional",
    rentProfile: "familias, profesionales y comercios de apoyo",
    lotUse: "vivienda, bodega ligera o proyecto familiar"
  }
];

const unique = (items) => [...new Set(items.filter(Boolean))];

const createRng = (seed) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = (rng, items) => items[Math.floor(rng() * items.length)];
const randomInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const randomNumber = (rng, min, max, digits = 2) =>
  Number((min + rng() * (max - min)).toFixed(digits));
const chance = (rng, probability) => rng() <= probability;
const roundTo = (value, step) => Math.round(value / step) * step;
const crcValue = (rng, [min, max], step = 25000) => roundTo(min + rng() * (max - min), step);
const subtractDays = (date, days) => new Date(date.getTime() - days * DAY_MS);
const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);
const capAtReferenceDate = (date) => (date > REFERENCE_DATE ? new Date(REFERENCE_DATE) : date);

const buildPhotos = (propertyType, title, globalIndex) => {
  const library = propertyType === "lot" ? lotPhotoLibrary : housePhotoLibrary;

  if (!library.length) {
    return [
      {
        url: createPlaceholderImageDataUri(title),
        isPrimary: true,
        alt: title,
        width: 1600,
        height: 900
      }
    ];
  }

  return Array.from({ length: 3 }, (_item, offset) => {
    const image = library[(globalIndex * 2 + offset) % library.length];

    return {
      url: image.url,
      isPrimary: offset === 0,
      alt: `${title} - ${image.alt}`,
      width: 1600,
      height: 900
    };
  });
};

const buildMedia = (photos) =>
  photos.map((photo, index) => ({
    type: "image",
    url: photo.url,
    thumbnailUrl: photo.url,
    provider: "seed",
    alt: photo.alt,
    isPrimary: photo.isPrimary,
    order: index,
    width: photo.width,
    height: photo.height
  }));

const buildCoordinates = (baseCoordinates, slot, rng) => {
  const row = Math.floor(slot / 5) - 2;
  const col = (slot % 5) - 2;
  const lng = baseCoordinates[0] + col * 0.0033 + (rng() - 0.5) * 0.0009;
  const lat = baseCoordinates[1] + row * 0.0028 + (rng() - 0.5) * 0.0009;

  return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
};

const buildServiceDistances = (zone, rng) => ({
  hospitalKm: randomNumber(rng, zone.serviceRange.hospital[0], zone.serviceRange.hospital[1]),
  schoolKm: randomNumber(rng, zone.serviceRange.school[0], zone.serviceRange.school[1]),
  highSchoolKm: randomNumber(rng, zone.serviceRange.highSchool[0], zone.serviceRange.highSchool[1])
});

const buildSellerInfo = (seller) => ({
  name: seller.name,
  phone: seller.phone,
  email: seller.email,
  role: seller.role
});

const buildMarketStatus = ({ businessType, propertyType, zoneIndex, groupIndex }) => {
  if (propertyType === "house" && businessType === "sale") {
    if (groupIndex === 8 && zoneIndex % 2 === 0) return "reserved";
    if (groupIndex === 9 && zoneIndex % 5 === 0) return "sold";
    if (groupIndex === 7 && zoneIndex % 9 === 0) return "inactive";
    return "available";
  }

  if (propertyType === "house" && businessType === "rent") {
    if (groupIndex === 5 && zoneIndex % 3 === 1) return "reserved";
    if (groupIndex === 6 && zoneIndex % 4 === 0) return "rented";
    if (groupIndex === 4 && zoneIndex % 11 === 0) return "inactive";
    return "available";
  }

  if (propertyType === "lot" && businessType === "sale") {
    if (groupIndex === 4 && zoneIndex % 3 === 0) return "reserved";
    if (groupIndex === 5 && zoneIndex % 4 === 0) return "sold";
    return "available";
  }

  if (propertyType === "lot" && businessType === "rent") {
    if (groupIndex === 1 && zoneIndex % 3 === 2) return "reserved";
    if (groupIndex === 0 && zoneIndex % 6 === 0) return "rented";
    return "available";
  }

  return "available";
};

const buildLifecycle = ({ marketStatus, businessType, publishedAt, price, rng }) => {
  const lifecycle = {
    status: "published",
    marketStatus
  };

  if (marketStatus === "reserved") {
    lifecycle.reservedAt = capAtReferenceDate(addDays(publishedAt, randomInt(rng, 8, 35)));
  }

  if (marketStatus === "sold") {
    lifecycle.soldAt = capAtReferenceDate(addDays(publishedAt, randomInt(rng, 18, 95)));
    lifecycle.finalPrice = roundTo(price * randomNumber(rng, 0.93, 0.98), 25000);
  }

  if (marketStatus === "rented") {
    lifecycle.rentedAt = capAtReferenceDate(addDays(publishedAt, randomInt(rng, 6, 45)));
    lifecycle.finalPrice = roundTo(price * randomNumber(rng, 0.95, 1), 25000);
  }

  if (marketStatus === "inactive") {
    lifecycle.inactivatedAt = capAtReferenceDate(addDays(publishedAt, randomInt(rng, 20, 70)));
  }

  if (businessType === "sale" && marketStatus === "reserved") {
    lifecycle.finalPrice = undefined;
  }

  return lifecycle;
};

const buildPriceHistory = ({
  listedPrice,
  finalPrice,
  marketStatus,
  publishedAt,
  sellerId,
  adminId,
  rng
}) => {
  const originalPrice = chance(rng, 0.44)
    ? roundTo(listedPrice * randomNumber(rng, 1.03, 1.1), 25000)
    : listedPrice;

  const history = [
    {
      price: originalPrice,
      marketStatus: "available",
      changedAt: subtractDays(publishedAt, randomInt(rng, 3, 9)),
      note:
        originalPrice === listedPrice
          ? "Publicado inicialmente"
          : "Precio de salida al publicar",
      changedBy: sellerId
    }
  ];

  if (originalPrice !== listedPrice) {
    history.push({
      price: listedPrice,
      marketStatus: "available",
      changedAt: capAtReferenceDate(addDays(publishedAt, randomInt(rng, 9, 36))),
      note: "Ajuste segun respuesta del mercado",
      changedBy: sellerId
    });
  }

  if (marketStatus === "reserved") {
    history.push({
      price: listedPrice,
      marketStatus: "reserved",
      changedAt: capAtReferenceDate(addDays(publishedAt, randomInt(rng, 10, 30))),
      note: "Reservada con senal",
      changedBy: adminId
    });
  }

  if (marketStatus === "sold" || marketStatus === "rented") {
    history.push({
      price: listedPrice,
      finalPrice,
      marketStatus,
      changedAt: capAtReferenceDate(addDays(publishedAt, randomInt(rng, 18, 90))),
      note:
        marketStatus === "sold"
          ? "Operacion cerrada ante notario"
          : "Contrato de alquiler firmado",
      changedBy: adminId
    });
  }

  if (marketStatus === "inactive") {
    history.push({
      price: listedPrice,
      marketStatus: "inactive",
      changedAt: capAtReferenceDate(addDays(publishedAt, randomInt(rng, 20, 65))),
      note: "Pausada temporalmente por decision del anunciante",
      changedBy: sellerId
    });
  }

  return history;
};

const buildAnalyticsSnapshot = ({ propertyType, businessType, price, constructionArea, lotArea, rng }) => {
  const areaBase = propertyType === "lot" ? lotArea : constructionArea;
  const pricePerSquareMeter = Math.round(price / Math.max(areaBase, 1));
  const comparableAveragePpsm = Math.round(
    pricePerSquareMeter * randomNumber(rng, 0.94, 1.06)
  );
  let marketScore = "in-range";

  if (pricePerSquareMeter < comparableAveragePpsm * 0.97) {
    marketScore = "below-market";
  }

  if (pricePerSquareMeter > comparableAveragePpsm * 1.03) {
    marketScore = "above-market";
  }

  const multiplier = businessType === "rent" ? randomNumber(rng, 0.96, 1.04) : 1;

  return {
    pricePerSquareMeter,
    comparableAveragePpsm,
    marketScore,
    suggestedPriceMin: roundTo(
      comparableAveragePpsm * Math.max(areaBase, 1) * 0.95 * multiplier,
      25000
    ),
    suggestedPriceMax: roundTo(
      comparableAveragePpsm * Math.max(areaBase, 1) * 1.04 * multiplier,
      25000
    ),
    lastComputedAt: subtractDays(REFERENCE_DATE, randomInt(rng, 1, 12))
  };
};

const buildEngagement = ({ zone, featured, propertyType, businessType, marketStatus, rng }) => {
  const baseViews = randomInt(rng, 90, 280);
  const demandViews = Math.round(baseViews * zone.demand * (featured ? 1.28 : 1));
  const favorites = Math.max(
    2,
    Math.round(randomInt(rng, 3, 18) * zone.demand * (featured ? 1.15 : 1))
  );
  const leads = Math.max(
    propertyType === "lot" ? 1 : 2,
    Math.round(randomInt(rng, 1, propertyType === "lot" ? 6 : 10) * zone.demand)
  );
  const offersBase = businessType === "sale" ? randomInt(rng, 0, 4) : randomInt(rng, 0, 2);
  const offers =
    marketStatus === "sold" || marketStatus === "rented" ? Math.max(offersBase, 1) : offersBase;

  return {
    views: demandViews,
    favorites,
    leads,
    offers
  };
};

const buildBoostMetrics = ({ featured, engagement, rng }) => {
  if (!featured) {
    return {
      homeImpressions: 0,
      searchRailImpressions: 0,
      mapImpressions: 0,
      cardOpens: 0,
      leads: 0
    };
  }

  return {
    homeImpressions: randomInt(rng, 1400, 5200),
    searchRailImpressions: randomInt(rng, 900, 3200),
    mapImpressions: randomInt(rng, 1100, 4100),
    cardOpens: Math.max(engagement.favorites, randomInt(rng, 18, 90)),
    leads: Math.max(engagement.leads, randomInt(rng, 3, 14)),
    lastTrackedAt: subtractDays(REFERENCE_DATE, randomInt(rng, 1, 6))
  };
};

const buildHouseTitle = ({ businessType, zone, rng }) => {
  const lead = pick(rng, businessType === "sale" ? houseSaleLeads : houseRentLeads);
  const highlight = pick(rng, houseHighlights);
  const area = pick(rng, zone.microAreas);

  return `${lead} ${highlight} en ${area}`;
};

const buildLotTitle = ({ businessType, zone, rng }) => {
  const lead = pick(rng, businessType === "sale" ? lotSaleLeads : lotRentLeads);
  const highlight = pick(rng, lotHighlights);
  const area = pick(rng, zone.microAreas);

  return `${lead} ${highlight} en ${area}`;
};

const buildHouseDescription = ({
  businessType,
  zone,
  bedrooms,
  bathrooms,
  parkingSpaces,
  constructionArea,
  landArea,
  exactAddress
}) => {
  const refs = zone.references.slice(0, 3).join(", ");
  const focus =
    businessType === "sale"
      ? `La zona mantiene ${zone.marketLine} y suele atraer a ${zone.buyerProfile}.`
      : `El sector tiene ${zone.marketLine} y buena salida para ${zone.rentProfile}.`;
  const closing =
    businessType === "sale"
      ? "Es una opcion coherente para vivir o resguardar capital en una zona con demanda estable."
      : "Funciona muy bien para quien necesita mudanza rapida en una ubicacion util y bien conectada.";

  return `Propiedad ubicada en ${exactAddress}. Cuenta con ${bedrooms} habitaciones, ${bathrooms} banos, ${parkingSpaces} espacios de parqueo, ${constructionArea} m2 de construccion y ${landArea} m2 de lote. ${focus} Se encuentra cerca de ${refs}. ${closing}`;
};

const buildLotDescription = ({ businessType, zone, lotArea, exactAddress }) => {
  const refs = zone.references.slice(0, 3).join(", ");
  const useLine =
    businessType === "sale"
      ? `Tiene potencial para ${zone.lotUse}.`
      : `Es util para ${zone.lotUse} con esquema de alquiler mensual.`;
  const closing =
    businessType === "sale"
      ? "La relacion metraje-ubicacion se mantiene en una banda competitiva para la zona."
      : "Su ubicacion permite operacion rapida para patio, flotilla o apoyo logistico ligero.";

  return `Terreno ubicado en ${exactAddress}, con ${lotArea} m2 y acceso por calle publica. La zona presenta ${zone.marketLine}. ${useLine} Cerca de ${refs}. ${closing}`;
};

const buildModerationSignals = (rng) => ({
  duplicateScore: 0,
  duplicateCandidateCount: 0,
  duplicateCandidates: [],
  suspiciousFlags: [],
  contentQualityScore: randomInt(rng, 90, 99),
  reviewStatus: "clean",
  lastAnalyzedAt: subtractDays(REFERENCE_DATE, randomInt(rng, 1, 8))
});

const buildAmenityList = (rng, baseAmenities, pool, targetSize) =>
  unique([...baseAmenities, pick(rng, pool), pick(rng, pool), pick(rng, pool)]).slice(0, targetSize);

const buildPropertyRecord = ({ zone, zoneIndex, slot, groupIndex, adminId, seller }) => {
  const globalIndex = zoneIndex * PROPERTIES_PER_ZONE + slot;
  const rng = createRng(globalIndex + 1007);
  const propertyType = slot < 17 ? "house" : "lot";
  const businessType = slot < 10 ? "sale" : slot < 17 ? "rent" : slot < 23 ? "sale" : "rent";
  const profile = segmentProfiles[zone.segment];
  const coordinates = buildCoordinates(zone.coordinates, slot, rng);
  const area = pick(rng, zone.microAreas);
  const reference = pick(rng, zone.references);
  const exactAddress = `${area}, a menos de 1 km de ${reference}, ${zone.district}`;
  const address = {
    province: zone.province,
    canton: zone.canton,
    district: zone.district,
    neighborhood: area,
    exactAddress,
    hideExactLocation: true
  };
  const publishedAt = subtractDays(
    REFERENCE_DATE,
    12 + zoneIndex * 8 + slot * 3 + randomInt(rng, 0, 22)
  );
  const createdAt = subtractDays(publishedAt, randomInt(rng, 3, 12));
  const approvedAt = addDays(createdAt, randomInt(rng, 1, 3));
  const marketStatus = buildMarketStatus({
    businessType,
    propertyType,
    zoneIndex,
    groupIndex
  });

  if (propertyType === "house") {
    const bedrooms = randomInt(
      rng,
      ...(businessType === "sale" ? profile.saleBedrooms : profile.rentBedrooms)
    );
    const bathrooms = randomInt(
      rng,
      ...(businessType === "sale" ? profile.saleBathrooms : profile.rentBathrooms)
    );
    const parkingSpaces = randomInt(rng, ...profile.parking);
    const constructionArea = randomInt(
      rng,
      zone.houseConstructionRange[0],
      zone.houseConstructionRange[1]
    );
    const landArea = Math.max(
      constructionArea + randomInt(rng, 35, 180),
      randomInt(rng, zone.houseLandRange[0], zone.houseLandRange[1])
    );
    const price = crcValue(
      rng,
      businessType === "sale" ? zone.houseSaleRange : zone.houseRentRange,
      25000
    );
    const title = buildHouseTitle({ businessType, zone, rng });
    const featuredChance =
      businessType === "sale" ? Math.min(0.28, 0.16 * zone.demand) : Math.min(0.22, 0.12 * zone.demand);
    const featured = chance(rng, featuredChance);
    const lifecycle = buildLifecycle({ marketStatus, businessType, publishedAt, price, rng });
    const amenities = buildAmenityList(
      rng,
      zone.houseAmenities,
      extraHouseAmenities,
      randomInt(rng, 4, 6)
    );
    const photos = buildPhotos("house", title, globalIndex);
    const engagement = buildEngagement({
      zone,
      featured,
      propertyType,
      businessType,
      marketStatus,
      rng
    });

    return {
      title,
      slug: createSlug(`${zone.code}-${businessType}-house-r500-${String(slot + 1).padStart(2, "0")}`),
      description: buildHouseDescription({
        businessType,
        zone,
        bedrooms,
        bathrooms,
        parkingSpaces,
        constructionArea,
        landArea,
        exactAddress
      }),
      businessType,
      operationType: businessType,
      propertyType,
      price,
      currency: "CRC",
      bedrooms,
      bathrooms,
      parkingSpaces,
      constructionArea,
      landArea,
      lotArea: landArea,
      furnished:
        businessType === "rent"
          ? chance(rng, profile.furnishedRentChance)
          : chance(rng, zone.segment === "beach" ? 0.18 : 0.06),
      petsAllowed:
        businessType === "rent" ? chance(rng, profile.petsRentChance) : chance(rng, 0.86),
      depositRequired: businessType === "rent" ? chance(rng, 0.92) : false,
      featured,
      featuredAt: featured
        ? capAtReferenceDate(addDays(publishedAt, randomInt(rng, 2, 14)))
        : undefined,
      amenities,
      photos,
      media: buildMedia(photos),
      location: {
        type: "Point",
        coordinates
      },
      address,
      addressText: exactAddress,
      status: "published",
      marketStatus: lifecycle.marketStatus,
      finalPrice: lifecycle.finalPrice,
      isApproved: true,
      moderationNote: "",
      publishedAt,
      reservedAt: lifecycle.reservedAt,
      soldAt: lifecycle.soldAt,
      rentedAt: lifecycle.rentedAt,
      inactivatedAt: lifecycle.inactivatedAt,
      owner: seller._id,
      sellerInfo: buildSellerInfo(seller),
      serviceDistances: buildServiceDistances(zone, rng),
      moderationSignals: buildModerationSignals(rng),
      analyticsSnapshot: buildAnalyticsSnapshot({
        propertyType,
        businessType,
        price,
        constructionArea,
        lotArea: landArea,
        rng
      }),
      priceHistory: buildPriceHistory({
        listedPrice: price,
        finalPrice: lifecycle.finalPrice,
        marketStatus: lifecycle.marketStatus,
        publishedAt,
        sellerId: seller._id,
        adminId,
        rng
      }),
      engagement,
      boostMetrics: buildBoostMetrics({ featured, engagement, rng }),
      approvedBy: adminId,
      approvedAt,
      views: engagement.views,
      createdAt
    };
  }

  const lotArea = randomInt(rng, zone.lotAreaRange[0], zone.lotAreaRange[1]);
  const price = crcValue(
    rng,
    businessType === "sale" ? zone.lotSaleRange : zone.lotRentRange,
    25000
  );
  const title = buildLotTitle({ businessType, zone, rng });
  const featuredChance =
    businessType === "sale" ? Math.min(0.17, 0.11 * zone.demand) : Math.min(0.12, 0.08 * zone.demand);
  const featured = chance(rng, featuredChance);
  const lifecycle = buildLifecycle({ marketStatus, businessType, publishedAt, price, rng });
  const amenities = buildAmenityList(
    rng,
    zone.lotAmenities,
    extraLotAmenities,
    randomInt(rng, 4, 6)
  );
  const photos = buildPhotos("lot", title, globalIndex);
  const engagement = buildEngagement({
    zone,
    featured,
    propertyType,
    businessType,
    marketStatus,
    rng
  });

  return {
    title,
    slug: createSlug(`${zone.code}-${businessType}-lot-r500-${String(slot + 1).padStart(2, "0")}`),
    description: buildLotDescription({ businessType, zone, lotArea, exactAddress }),
    businessType,
    operationType: businessType,
    propertyType,
    price,
    currency: "CRC",
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    constructionArea: 0,
    landArea: lotArea,
    lotArea,
    furnished: false,
    petsAllowed: false,
    depositRequired: businessType === "rent" ? chance(rng, 0.74) : false,
    featured,
    featuredAt: featured
      ? capAtReferenceDate(addDays(publishedAt, randomInt(rng, 3, 18)))
      : undefined,
    amenities,
    photos,
    media: buildMedia(photos),
    location: {
      type: "Point",
      coordinates
    },
    address,
    addressText: exactAddress,
    status: "published",
    marketStatus: lifecycle.marketStatus,
    finalPrice: lifecycle.finalPrice,
    isApproved: true,
    moderationNote: "",
    publishedAt,
    reservedAt: lifecycle.reservedAt,
    soldAt: lifecycle.soldAt,
    rentedAt: lifecycle.rentedAt,
    inactivatedAt: lifecycle.inactivatedAt,
    owner: seller._id,
    sellerInfo: buildSellerInfo(seller),
    serviceDistances: buildServiceDistances(zone, rng),
    moderationSignals: buildModerationSignals(rng),
    analyticsSnapshot: buildAnalyticsSnapshot({
      propertyType,
      businessType,
      price,
      constructionArea: 0,
      lotArea,
      rng
    }),
    priceHistory: buildPriceHistory({
      listedPrice: price,
      finalPrice: lifecycle.finalPrice,
      marketStatus: lifecycle.marketStatus,
      publishedAt,
      sellerId: seller._id,
      adminId,
      rng
    }),
    engagement,
    boostMetrics: buildBoostMetrics({ featured, engagement, rng }),
    approvedBy: adminId,
    approvedAt,
    views: engagement.views,
    createdAt
  };
};

export const generateRealisticSeedProperties = ({ adminId, sellers }) => {
  if (!adminId) {
    throw new Error("generateRealisticSeedProperties requires an adminId.");
  }

  if (!Array.isArray(sellers) || sellers.length === 0) {
    throw new Error("generateRealisticSeedProperties requires at least one seller.");
  }

  const properties = zoneCatalog.flatMap((zone, zoneIndex) =>
    Array.from({ length: PROPERTIES_PER_ZONE }, (_item, slot) => {
      const seller = sellers[(zoneIndex * PROPERTIES_PER_ZONE + slot) % sellers.length];
      const groupIndex =
        slot < 10 ? slot : slot < 17 ? slot - 10 : slot < 23 ? slot - 17 : slot - 23;

      return buildPropertyRecord({
        zone,
        zoneIndex,
        slot,
        groupIndex,
        adminId,
        seller
      });
    })
  );

  if (properties.length !== REALISTIC_SEED_TOTAL) {
    throw new Error(
      `Realistic seed expected ${REALISTIC_SEED_TOTAL} properties but generated ${properties.length}.`
    );
  }

  return properties;
};
