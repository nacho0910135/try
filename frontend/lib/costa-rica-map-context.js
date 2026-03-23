const point = ({
  id,
  name,
  shortLabel,
  province,
  canton,
  district,
  lat,
  lng,
  summaryEs,
  summaryEn
}) => ({
  id,
  name,
  shortLabel,
  province,
  canton,
  district,
  lat,
  lng,
  summaryEs,
  summaryEn
});

const universities = [
  point({
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
  }),
  point({
    id: "ucr-occidente",
    name: "UCR Sede de Occidente",
    shortLabel: "UCR Occ.",
    province: "Alajuela",
    canton: "San Ramon",
    district: "San Ramon",
    lat: 10.0877,
    lng: -84.4709,
    summaryEs: "Empuja alquiler estudiantil y oferta de apartamentos compactos en San Ramon.",
    summaryEn: "Drives student rentals and compact apartment demand in San Ramon."
  }),
  point({
    id: "ucr-atlantico",
    name: "UCR Sede del Atlantico",
    shortLabel: "UCR Atl.",
    province: "Cartago",
    canton: "Turrialba",
    district: "Turrialba",
    lat: 9.9042,
    lng: -83.6853,
    summaryEs: "Punto fuerte para alquiler estudiantil y servicios en Turrialba.",
    summaryEn: "Strong anchor for student rentals and services in Turrialba."
  }),
  point({
    id: "ucr-caribe",
    name: "UCR Sede del Caribe",
    shortLabel: "UCR Caribe",
    province: "Limon",
    canton: "Limon",
    district: "Limon",
    lat: 9.9908,
    lng: -83.0324,
    summaryEs: "Referencia academica para renta en Limon centro y alrededores.",
    summaryEn: "Academic anchor for rentals in central Limon and nearby areas."
  }),
  point({
    id: "ucr-guanacaste",
    name: "UCR Sede de Guanacaste",
    shortLabel: "UCR GTE",
    province: "Guanacaste",
    canton: "Liberia",
    district: "Liberia",
    lat: 10.6337,
    lng: -85.4368,
    summaryEs: "Aporta demanda de estudiantes y profesionales jovenes en Liberia.",
    summaryEn: "Adds demand from students and young professionals in Liberia."
  }),
  point({
    id: "ucr-pacifico",
    name: "UCR Sede del Pacifico",
    shortLabel: "UCR Pac.",
    province: "Puntarenas",
    canton: "Puntarenas",
    district: "Puntarenas",
    lat: 9.9768,
    lng: -84.8396,
    summaryEs: "Apoya alquileres, cuartos y servicios cerca de Puntarenas centro.",
    summaryEn: "Supports rentals, rooms, and services near Puntarenas center."
  }),
  point({
    id: "ucr-golfito",
    name: "UCR Recinto Golfito",
    shortLabel: "UCR Golf.",
    province: "Puntarenas",
    canton: "Golfito",
    district: "Golfito",
    lat: 8.6428,
    lng: -83.1634,
    summaryEs: "Demanda academica puntual con impacto en renta y hospedaje local.",
    summaryEn: "Targeted academic demand with impact on local rentals and lodging."
  }),
  point({
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
  }),
  point({
    id: "tec-san-carlos",
    name: "TEC San Carlos",
    shortLabel: "TEC SC",
    province: "Alajuela",
    canton: "San Carlos",
    district: "Quesada",
    lat: 10.3668,
    lng: -84.5105,
    summaryEs: "Genera actividad residencial en el eje universitario de San Carlos.",
    summaryEn: "Generates residential activity around the San Carlos university axis."
  }),
  point({
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
  }),
  point({
    id: "una-perez-zeledon",
    name: "UNA Perez Zeledon",
    shortLabel: "UNA PZ",
    province: "San Jose",
    canton: "Perez Zeledon",
    district: "San Isidro de El General",
    lat: 9.3731,
    lng: -83.7029,
    summaryEs: "Punto educativo que mueve renta y servicios en San Isidro.",
    summaryEn: "Educational anchor that moves rentals and services in San Isidro."
  }),
  point({
    id: "una-liberia",
    name: "UNA Liberia",
    shortLabel: "UNA Lib.",
    province: "Guanacaste",
    canton: "Liberia",
    district: "Liberia",
    lat: 10.6339,
    lng: -85.4438,
    summaryEs: "Suma demanda estudiantil a los corredores de Liberia.",
    summaryEn: "Adds student demand to Liberia's urban corridors."
  }),
  point({
    id: "una-sarapiqui",
    name: "UNA Sarapiqui",
    shortLabel: "UNA Sar.",
    province: "Heredia",
    canton: "Sarapiqui",
    district: "Puerto Viejo",
    lat: 10.4517,
    lng: -84.0134,
    summaryEs: "Apoya alquileres y movimiento comercial en Puerto Viejo de Sarapiqui.",
    summaryEn: "Supports rentals and commercial activity in Puerto Viejo de Sarapiqui."
  }),
  point({
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
  }),
  point({
    id: "fidelitas-san-pedro",
    name: "Universidad Fidélitas",
    shortLabel: "Fidelitas",
    province: "San Jose",
    canton: "Montes de Oca",
    district: "San Pedro",
    lat: 9.9389,
    lng: -84.0376,
    summaryEs: "Refuerza la presion de alquiler en San Pedro y alrededores.",
    summaryEn: "Reinforces rental pressure in San Pedro and nearby areas."
  })
];

const hospitals = [
  point({
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
  }),
  point({
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
  }),
  point({
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
  }),
  point({
    id: "calderon-guardia",
    name: "Hospital Calderon Guardia",
    shortLabel: "Calderon",
    province: "San Jose",
    canton: "San Jose",
    district: "Catedral",
    lat: 9.9353,
    lng: -84.0674,
    summaryEs: "Aporta contexto medico y conectividad urbana en San Jose centro.",
    summaryEn: "Adds healthcare context and urban connectivity in downtown San Jose."
  }),
  point({
    id: "hospital-ninos",
    name: "Hospital Nacional de Ninos",
    shortLabel: "Ninos",
    province: "San Jose",
    canton: "San Jose",
    district: "Catedral",
    lat: 9.9328,
    lng: -84.0765,
    summaryEs: "Relevante para familias que priorizan cercania a servicios pediatricos.",
    summaryEn: "Relevant for families prioritizing pediatric services nearby."
  }),
  point({
    id: "san-vicente-paul",
    name: "Hospital San Vicente de Paul",
    shortLabel: "Heredia",
    province: "Heredia",
    canton: "Heredia",
    district: "Heredia",
    lat: 10.0019,
    lng: -84.1162,
    summaryEs: "Anchor medico para Heredia centro y barrios residenciales cercanos.",
    summaryEn: "Healthcare anchor for central Heredia and nearby residential neighborhoods."
  }),
  point({
    id: "max-peralta",
    name: "Hospital Max Peralta",
    shortLabel: "Cartago",
    province: "Cartago",
    canton: "Cartago",
    district: "Oriental",
    lat: 9.8635,
    lng: -83.9158,
    summaryEs: "Referencia principal de salud para Cartago y su periferia.",
    summaryEn: "Main healthcare reference for Cartago and its surrounding areas."
  }),
  point({
    id: "hospital-san-carlos",
    name: "Hospital San Carlos",
    shortLabel: "San Carlos",
    province: "Alajuela",
    canton: "San Carlos",
    district: "Quesada",
    lat: 10.3228,
    lng: -84.4297,
    summaryEs: "Importante para vivienda familiar y renta en Ciudad Quesada.",
    summaryEn: "Important for family housing and rentals in Ciudad Quesada."
  }),
  point({
    id: "hospital-guapiles",
    name: "Hospital de Guapiles",
    shortLabel: "Guapiles",
    province: "Limon",
    canton: "Pococi",
    district: "Guapiles",
    lat: 10.2141,
    lng: -83.7837,
    summaryEs: "Da contexto sanitario al corredor residencial de Pococi.",
    summaryEn: "Adds healthcare context to the Pococi residential corridor."
  }),
  point({
    id: "tony-facio",
    name: "Hospital Tony Facio",
    shortLabel: "Tony Facio",
    province: "Limon",
    canton: "Limon",
    district: "Limon",
    lat: 9.9914,
    lng: -83.0312,
    summaryEs: "Centro medico clave para Limon y la costa Caribe.",
    summaryEn: "Key medical center for Limon and the Caribbean coast."
  }),
  point({
    id: "monsenor-sanabria",
    name: "Hospital Monseñor Sanabria",
    shortLabel: "Puntarenas",
    province: "Puntarenas",
    canton: "Puntarenas",
    district: "Puntarenas",
    lat: 9.9762,
    lng: -84.8336,
    summaryEs: "Punto fuerte para familias y vivienda permanente en el Pacifico central.",
    summaryEn: "Strong point for families and long-term housing in the central Pacific."
  }),
  point({
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
  })
];

const beaches = [
  point({
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
  }),
  point({
    id: "playas-del-coco",
    name: "Playas del Coco",
    shortLabel: "Coco",
    province: "Guanacaste",
    canton: "Carrillo",
    district: "Sardinal",
    lat: 10.5477,
    lng: -85.6932,
    summaryEs: "Mercado costero liquido para turismo, retiro y renta temporal.",
    summaryEn: "Liquid coastal market for tourism, retirement, and short-term rentals."
  }),
  point({
    id: "flamingo",
    name: "Playa Flamingo",
    shortLabel: "Flamingo",
    province: "Guanacaste",
    canton: "Santa Cruz",
    district: "Tempate",
    lat: 10.4312,
    lng: -85.7916,
    summaryEs: "Zona premium para segundas residencias e inversion de alto ticket.",
    summaryEn: "Premium zone for second homes and high-ticket investment."
  }),
  point({
    id: "samara",
    name: "Samara",
    shortLabel: "Samara",
    province: "Guanacaste",
    canton: "Nicoya",
    district: "Samara",
    lat: 9.8818,
    lng: -85.5286,
    summaryEs: "Balance entre turismo relajado, comunidad internacional y renta flexible.",
    summaryEn: "Balanced market for relaxed tourism, international residents, and flexible rentals."
  }),
  point({
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
  }),
  point({
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
  }),
  point({
    id: "manual-antonio",
    name: "Manuel Antonio",
    shortLabel: "M. Antonio",
    province: "Puntarenas",
    canton: "Quepos",
    district: "Quepos",
    lat: 9.3924,
    lng: -84.1555,
    summaryEs: "Muy fuerte para turismo consolidado y alquiler de corta estancia.",
    summaryEn: "Very strong for established tourism and short-stay rentals."
  }),
  point({
    id: "dominical",
    name: "Dominical",
    shortLabel: "Dominical",
    province: "Puntarenas",
    canton: "Osa",
    district: "Bahia Ballena",
    lat: 9.2544,
    lng: -83.8644,
    summaryEs: "Mercado costero atractivo para estilo de vida y renta turistica.",
    summaryEn: "Attractive coastal market for lifestyle buyers and vacation rentals."
  }),
  point({
    id: "uvita",
    name: "Uvita",
    shortLabel: "Uvita",
    province: "Puntarenas",
    canton: "Osa",
    district: "Bahia Ballena",
    lat: 9.1565,
    lng: -83.7446,
    summaryEs: "Corredor de alto interes para naturaleza, retiro e inversion turistica.",
    summaryEn: "High-interest corridor for nature, retirement, and tourism investment."
  }),
  point({
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
  }),
  point({
    id: "puerto-viejo",
    name: "Puerto Viejo / Cocles",
    shortLabel: "P. Viejo",
    province: "Limon",
    canton: "Talamanca",
    district: "Cahuita",
    lat: 9.6548,
    lng: -82.7532,
    summaryEs: "Mercado caribeño con identidad fuerte, turismo y larga estadia.",
    summaryEn: "Caribbean market with strong identity, tourism, and long-stay demand."
  }),
  point({
    id: "cahuita",
    name: "Cahuita",
    shortLabel: "Cahuita",
    province: "Limon",
    canton: "Talamanca",
    district: "Cahuita",
    lat: 9.738,
    lng: -82.843,
    summaryEs: "Punto costero muy buscado por naturaleza, retiro y estilo de vida.",
    summaryEn: "Highly sought-after coastal point for nature, retirement, and lifestyle."
  })
];

const business = [
  point({
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
  }),
  point({
    id: "rohrmoser",
    name: "Rohrmoser / Nunciatura",
    shortLabel: "Rohrmoser",
    province: "San Jose",
    canton: "San Jose",
    district: "Pavas",
    lat: 9.9448,
    lng: -84.1125,
    summaryEs: "Corredor de ejecutivos, apartamentos y servicios premium.",
    summaryEn: "Executive corridor with apartments and premium services."
  }),
  point({
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
  }),
  point({
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
  }),
  point({
    id: "forum-santa-ana",
    name: "Forum Santa Ana",
    shortLabel: "Forum",
    province: "San Jose",
    canton: "Santa Ana",
    district: "Pozos",
    lat: 9.9478,
    lng: -84.1879,
    summaryEs: "Zona muy atractiva para perfiles corporativos y movilidad diaria.",
    summaryEn: "Very attractive area for corporate profiles and daily commuters."
  }),
  point({
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
  }),
  point({
    id: "america-free-zone",
    name: "America Free Zone",
    shortLabel: "AFZ",
    province: "Heredia",
    canton: "Heredia",
    district: "Ulloa",
    lat: 9.9909,
    lng: -84.2035,
    summaryEs: "Aumenta demanda de apartamentos y vivienda para profesionales del oeste.",
    summaryEn: "Boosts apartment and housing demand for west-side professionals."
  }),
  point({
    id: "el-coyol",
    name: "El Coyol",
    shortLabel: "Coyol",
    province: "Alajuela",
    canton: "Alajuela",
    district: "San Antonio",
    lat: 10.0107,
    lng: -84.2779,
    summaryEs: "Corredor logístico e industrial con impacto en renta ejecutiva y familiar.",
    summaryEn: "Logistics and industrial corridor affecting executive and family rentals."
  }),
  point({
    id: "cartago-industrial",
    name: "La Lima / Cartago industrial",
    shortLabel: "La Lima",
    province: "Cartago",
    canton: "Cartago",
    district: "Oriental",
    lat: 9.8653,
    lng: -83.9874,
    summaryEs: "Genera demanda mixta por trabajo, logística e industria.",
    summaryEn: "Generates mixed demand from work, logistics, and industry."
  }),
  point({
    id: "liberia-business",
    name: "Liberia centro y servicios",
    shortLabel: "Liberia Hub",
    province: "Guanacaste",
    canton: "Liberia",
    district: "Liberia",
    lat: 10.635,
    lng: -85.4377,
    summaryEs: "Punto urbano clave para empleo, servicios y operaciones del norte.",
    summaryEn: "Key urban point for employment, services, and northern operations."
  })
];

const family = [
  point({
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
  }),
  point({
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
  }),
  point({
    id: "coronado-family",
    name: "Coronado",
    shortLabel: "Coronado",
    province: "San Jose",
    canton: "Vazquez de Coronado",
    district: "San Isidro",
    lat: 10.0094,
    lng: -84.0088,
    summaryEs: "Familias buscan espacio, clima fresco y perfil residencial tradicional.",
    summaryEn: "Families seek more space, cool weather, and a traditional residential feel."
  }),
  point({
    id: "tres-rios-family",
    name: "Tres Rios / Concepcion",
    shortLabel: "Tres Rios",
    province: "Cartago",
    canton: "La Union",
    district: "Concepcion",
    lat: 9.9088,
    lng: -83.9979,
    summaryEs: "Muy buscada por familias que quieren conectar con el este del GAM.",
    summaryEn: "Highly sought-after by families who want easy access to east GAM."
  }),
  point({
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
  }),
  point({
    id: "escazu-family",
    name: "Escazu / San Antonio",
    shortLabel: "Escazu Fam.",
    province: "San Jose",
    canton: "Escazu",
    district: "San Antonio",
    lat: 9.9177,
    lng: -84.1414,
    summaryEs: "Perfil familiar con colegios, servicios y vivienda de ticket medio alto.",
    summaryEn: "Family profile with schools, services, and mid-to-high ticket housing."
  }),
  point({
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
  }),
  point({
    id: "belen-family",
    name: "Belen",
    shortLabel: "Belen",
    province: "Heredia",
    canton: "Belen",
    district: "San Antonio",
    lat: 9.9788,
    lng: -84.1863,
    summaryEs: "Zona ordenada y cotizada para familias y ejecutivos con hijos.",
    summaryEn: "Orderly, desirable area for families and executives with children."
  })
];

const investment = [
  point({
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
  }),
  point({
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
  }),
  point({
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
  }),
  point({
    id: "coco-investment",
    name: "Playas del Coco inversion",
    shortLabel: "Coco+",
    province: "Guanacaste",
    canton: "Carrillo",
    district: "Sardinal",
    lat: 10.5477,
    lng: -85.6932,
    summaryEs: "Muy interesante para renta vacacional, expats y liquidez de salida.",
    summaryEn: "Very attractive for vacation rentals, expats, and exit liquidity."
  }),
  point({
    id: "nosara-investment",
    name: "Nosara inversion",
    shortLabel: "Nosara+",
    province: "Guanacaste",
    canton: "Nicoya",
    district: "Nosara",
    lat: 9.9785,
    lng: -85.6533,
    summaryEs: "Punto de alto valor para wellness, retiro e inversion internacional.",
    summaryEn: "High-value node for wellness, retirement, and international investment."
  }),
  point({
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
  }),
  point({
    id: "uvita-investment",
    name: "Uvita inversion",
    shortLabel: "Uvita+",
    province: "Puntarenas",
    canton: "Osa",
    district: "Bahia Ballena",
    lat: 9.1565,
    lng: -83.7446,
    summaryEs: "Zona en crecimiento para turismo de naturaleza y propiedades de retiro.",
    summaryEn: "Growing area for nature tourism and retirement-oriented properties."
  }),
  point({
    id: "santa-teresa-investment",
    name: "Santa Teresa / Cobano inversion",
    shortLabel: "Sta. Teresa",
    province: "Puntarenas",
    canton: "Cobano",
    district: "Cobano",
    lat: 9.6438,
    lng: -85.1662,
    summaryEs: "Narrativa fuerte de plusvalia, turismo premium y lifestyle global.",
    summaryEn: "Strong upside narrative around premium tourism and global lifestyle buyers."
  }),
  point({
    id: "puerto-viejo-investment",
    name: "Puerto Viejo inversion",
    shortLabel: "PV+",
    province: "Limon",
    canton: "Talamanca",
    district: "Cahuita",
    lat: 9.6548,
    lng: -82.7532,
    summaryEs: "Atractiva para hospitalidad, larga estancia y producto diferente.",
    summaryEn: "Attractive for hospitality, long stays, and differentiated product."
  }),
  point({
    id: "golfito-investment",
    name: "Golfito corredor de oportunidad",
    shortLabel: "Golfito+",
    province: "Puntarenas",
    canton: "Golfito",
    district: "Golfito",
    lat: 8.6392,
    lng: -83.1666,
    summaryEs: "Zona con narrativa de oportunidad para tierra, turismo y largo plazo.",
    summaryEn: "Opportunity narrative for land, tourism, and long-term positioning."
  })
];

export const mapContextLayers = [
  {
    id: "universities",
    labelEs: "Universidades",
    labelEn: "Universities",
    descriptionEs: "Ideal para roomies, estudiantes y rentas cerca de campus y sedes.",
    descriptionEn: "Great for roommates, students, and rentals near campuses and branches.",
    color: "#0f4ea9",
    points: universities
  },
  {
    id: "hospitals",
    labelEs: "Hospitales",
    labelEn: "Hospitals",
    descriptionEs: "Contexto util para familias, adultos mayores y renta medica.",
    descriptionEn: "Useful context for families, seniors, and healthcare-driven demand.",
    color: "#d9485f",
    points: hospitals
  },
  {
    id: "beaches",
    labelEs: "Playas",
    labelEn: "Beaches",
    descriptionEs: "Perfecto para lifestyle, vacacional e inversion turistica.",
    descriptionEn: "Ideal for lifestyle, vacation, and tourism-focused investment.",
    color: "#0b8a6a",
    points: beaches
  },
  {
    id: "business",
    labelEs: "Hubs de trabajo",
    labelEn: "Work hubs",
    descriptionEs: "Bueno para renta ejecutiva, oficinas y demanda profesional.",
    descriptionEn: "Useful for executive rentals, offices, and professional demand.",
    color: "#f59e0b",
    points: business
  },
  {
    id: "family",
    labelEs: "Zonas familiares",
    labelEn: "Family zones",
    descriptionEs: "Sectores con oferta pensada para familias, colegios y vida residencial.",
    descriptionEn: "Areas with family-oriented supply, schools, and residential rhythm.",
    color: "#7c3aed",
    points: family
  },
  {
    id: "investment",
    labelEs: "Corredores de inversion",
    labelEn: "Investment corridors",
    descriptionEs: "Zonas con narrativa fuerte de plusvalia, turismo o renta flexible.",
    descriptionEn: "Areas with strong upside narratives around appreciation, tourism, or flexible rentals.",
    color: "#be123c",
    points: investment
  }
];

const mapContextLayerById = new Map(mapContextLayers.map((layer) => [layer.id, layer]));
const allMapContextPoints = mapContextLayers.flatMap((layer) =>
  layer.points.map((pt) => ({
    ...pt,
    layerId: layer.id,
    color: layer.color
  }))
);
const mapContextPointById = new Map(allMapContextPoints.map((point) => [point.id, point]));
const visiblePointsCache = new Map();

export const getMapContextLayer = (layerId) =>
  mapContextLayerById.get(layerId) || null;

export const getMapContextPoint = (pointId) =>
  mapContextPointById.get(pointId) || null;

export const getVisibleMapContextPoints = (activeLayerIds = []) => {
  if (!activeLayerIds.length) {
    return [];
  }

  const cacheKey = [...activeLayerIds].sort().join("|");

  if (visiblePointsCache.has(cacheKey)) {
    return visiblePointsCache.get(cacheKey);
  }

  const visiblePoints = mapContextLayers
    .filter((layer) => activeLayerIds.includes(layer.id))
    .flatMap((layer) =>
      layer.points.map((pt) => ({
        ...pt,
        layerId: layer.id,
        color: layer.color
      }))
    );

  visiblePointsCache.set(cacheKey, visiblePoints);
  return visiblePoints;
};
