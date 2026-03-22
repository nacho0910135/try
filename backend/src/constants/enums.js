export const USER_ROLES = ["user", "agent", "owner", "admin"];
export const SUBSCRIPTION_PLAN_NAMES = ["free", "owner-plus", "agent-pro", "broker-max"];
export const SUBSCRIPTION_STATUSES = ["trial", "active", "inactive"];
export const VERIFICATION_STATUSES = ["not-requested", "pending", "verified", "rejected"];
export const VERIFICATION_TYPES = ["identity", "owner", "agent-license", "broker"];
export const BUSINESS_TYPES = ["sale", "rent"];
export const PROPERTY_TYPES = ["house", "apartment", "condominium", "lot", "room", "commercial"];
export const CURRENCIES = ["CRC", "USD"];
export const PROPERTY_STATUSES = ["draft", "published", "paused", "sold", "rented"];
export const MARKET_STATUSES = ["available", "reserved", "sold", "rented", "inactive"];
export const MEDIA_TYPES = ["image", "video"];
export const RENTAL_ARRANGEMENTS = ["full-property", "roommate"];
export const ROOMMATE_GENDER_PREFERENCES = ["any", "female-only", "male-only"];
export const LEAD_SOURCES = ["property-page", "search", "whatsapp", "direct"];
export const LEAD_STATUSES = ["new", "contacted", "qualified", "closed"];
export const OFFER_SOURCES = ["property-page", "dashboard", "analysis", "direct"];
export const OFFER_STATUSES = [
  "new",
  "reviewing",
  "negotiating",
  "accepted",
  "rejected",
  "closed"
];
export const COSTA_RICA_PROVINCES = [
  "San Jose",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limon"
];

export const DEFAULT_PROPERTY_SORT = "-featured -publishedAt -createdAt";
