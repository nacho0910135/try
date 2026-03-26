export const businessTypes = [
  { value: "sale", label: "Venta" },
  { value: "rent", label: "Alquiler" }
];

export const propertyTypes = [
  { value: "house", label: "Casa" },
  { value: "apartment", label: "Apartamento" },
  { value: "condominium", label: "Condominio" },
  { value: "lot", label: "Lote / Terreno" },
  { value: "room", label: "Habitacion" },
  { value: "commercial", label: "Comercial" }
];

export const propertyStatuses = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicado" },
  { value: "paused", label: "Pausado" },
  { value: "sold", label: "Vendido" },
  { value: "rented", label: "Rentado" }
];

export const marketStatuses = [
  { value: "available", label: "Disponible" },
  { value: "reserved", label: "Reservada" },
  { value: "sold", label: "Vendida" },
  { value: "rented", label: "Alquilada" },
  { value: "inactive", label: "Inactiva" }
];

export const rentalArrangements = [
  { value: "full-property", label: "Propiedad completa" },
  { value: "roommate", label: "Roomies / alquiler compartido" }
];

export const roommateGenderPreferences = [
  { value: "any", label: "Sin preferencia" },
  { value: "female-only", label: "Solo mujeres" },
  { value: "male-only", label: "Solo hombres" }
];

export const currencies = [
  { value: "USD", label: "USD" },
  { value: "CRC", label: "CRC" }
];

export const provinces = [
  "San Jose",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limon"
];

export const amenitySuggestions = [
  "Piscina",
  "Jardin",
  "Terraza",
  "Vista al mar",
  "Gimnasio",
  "Seguridad",
  "Cowork",
  "Bodega",
  "Aire acondicionado",
  "Pet friendly"
];

export const roleLabels = {
  user: "Usuario",
  agent: "Agente",
  owner: "Propietario",
  admin: "Admin"
};

export const leadStatusLabels = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  closed: "Cerrado"
};

export const leadPriorityLabels = {
  low: "Baja",
  medium: "Media",
  high: "Alta"
};

export const offerStatusLabels = {
  new: "Nueva",
  reviewing: "En revision",
  negotiating: "Negociando",
  accepted: "Aceptada",
  rejected: "Rechazada",
  closed: "Cerrada"
};

export const mapDefaultCenter = {
  latitude: 9.9281,
  longitude: -84.0907,
  zoom: 7
};
