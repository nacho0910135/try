"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_STORAGE_KEY = "alquiventascr-language";

const translations = {
  es: {
    nav: {
      home: "Inicio",
      explore: "Explorar",
      analysis: "Analisis Interactivo",
      battle: "Batalla Comparativa",
      favorites: "Favoritos",
      dashboard: "Dashboard",
      admin: "Admin",
      logout: "Salir",
      search: "Buscar",
      login: "Entrar"
    },
    brand: {
      tagline: "Compra Venta Renta de Casas y Lotes"
    },
    common: {
      all: "Todos",
      allFeminine: "Todas",
      both: "Ambas",
      active: "Activas",
      loading: "Cargando...",
      yes: "Si",
      no: "No"
    },
    footer: {
      description:
        "Plataforma inmobiliaria para explorar, publicar y conectar propiedades en Costa Rica.",
      explore: "Explorar",
      analysis: "Analisis",
      battle: "Batalla",
      searchProperties: "Buscar propiedades",
      favorites: "Favoritos",
      publishProperty: "Publicar propiedad",
      coverage: "Cobertura",
      coverageText:
        "San Jose, Escazu, Santa Ana, Heredia, Alajuela, Cartago, Tamarindo, Jaco, Liberia y Nosara.",
      contact: "Contacto",
      contactHelp: "Si necesitas ayuda o soporte con la plataforma, puedes escribir a:"
    },
    authLayout: {
      eyebrow: "Costa Rica",
      title: "Publica, explora y conecta propiedades con una experiencia clara y moderna.",
      description:
        "AlquiVentasCR concentra compra, renta y lotes con enfoque geoespacial: mapa, GPS, favoritos, leads y panel de publicacion."
    },
    loginForm: {
      eyebrow: "Acceso",
      title: "Bienvenido de vuelta",
      description: "Administra publicaciones, favoritos y leads desde tu panel.",
      email: "Correo",
      emailPlaceholder: "correo@ejemplo.com",
      password: "Contrasena",
      passwordPlaceholder: "Tu contrasena",
      submit: "Entrar",
      submitting: "Entrando...",
      forgotPassword: "Preparar recuperacion",
      noAccount: "No tienes cuenta?",
      register: "Registrate",
      errorEmail: "Ingresa un correo valido",
      errorPassword: "Ingresa tu contrasena",
      resetMissingEmail: "Ingresa tu correo y luego vuelve a intentar.",
      resetReady: "Flujo preparado. Token temporal de desarrollo: {{token}}",
      resetFailed: "No fue posible iniciar la recuperacion en este momento.",
      submitFailed: "No se pudo iniciar sesion"
    },
    registerForm: {
      eyebrow: "Registro",
      title: "Crea tu cuenta",
      description:
        "Publica propiedades, guarda favoritas y gestiona leads en una sola plataforma.",
      name: "Nombre",
      namePlaceholder: "Tu nombre",
      phone: "Telefono",
      phonePlaceholder: "+506...",
      email: "Correo",
      emailPlaceholder: "correo@ejemplo.com",
      profile: "Perfil",
      password: "Contrasena",
      passwordPlaceholder: "Crea una contrasena segura",
      submit: "Crear cuenta",
      submitting: "Creando cuenta...",
      alreadyHaveAccount: "Ya tienes cuenta?",
      login: "Inicia sesion",
      roleUser: "Usuario",
      roleAgent: "Agente",
      roleOwner: "Propietario",
      errorName: "Ingresa tu nombre",
      errorEmail: "Ingresa un correo valido",
      errorPhone: "Ingresa un telefono valido",
      errorPassword: "Minimo 8 caracteres",
      connectionError:
        "No se pudo conectar con la API. Verifica que el backend este corriendo y que el origen del frontend este permitido.",
      submitFailed: "No se pudo crear la cuenta"
    },
    homePage: {
      eyebrow: "Mapa protagonista",
      title: "Descubre oportunidades desde la geografia, no desde un listado generico.",
      description:
        "Selecciona una provincia, entra al territorio y usa el mapa como la pieza central de exploracion para venta, renta y lotes en Costa Rica.",
      searchZoneLabel: "Busca por zona o estilo",
      searchZonePlaceholder: "Ejemplo: Escazu, playa, lote...",
      provinceLabel: "Provincia",
      exploreButton: "Explorar en el mapa",
      activeProvince: "Provincia activa",
      interactiveMap: "Mapa interactivo",
      interactiveMapDescription: "Bounds, dibujo de zonas y busqueda por coordenadas.",
      localSearch: "Busqueda local",
      localSearchDescription: "Provincia, canton, distrito, barrio y cerca de mi.",
      simplePublishing: "Publicacion simple",
      simplePublishingDescription: "Dashboard para agentes, propietarios y moderacion admin.",
      featuredEyebrow: "Destacadas",
      featuredTitle: "Propiedades para empezar",
      seeAll: "Ver todas las propiedades"
    },
    provinceExplorer: {
      enableMapbox: "Activa `NEXT_PUBLIC_MAPBOX_TOKEN` para ver las provincias interactivas con tus GeoJSON.",
      atlas: "Atlas interactivo",
      title: "Costa Rica por provincia",
      tapProvince: "Toca una provincia para explorarla",
      activeProvince: "Provincia activa",
      visualExploration: "Exploracion visual"
    },
    searchPage: {
      loadingMap: "Cargando mapa...",
      searchFailed: "No se pudo cargar la busqueda",
      geoError: "No fue posible acceder a tu ubicacion.",
      saveSearchSuccess: "Busqueda guardada correctamente.",
      saveSearchFailed: "No se pudo guardar la busqueda",
      loginToSaveSearch: "Inicia sesion para guardar esta busqueda",
      eyebrow: "Exploracion",
      title: "Busca propiedades en Costa Rica",
      description:
        "Usa filtros avanzados, mapa visible, dibujo de zona y busqueda por GPS para encontrar oportunidades reales.",
      publishPromptLoggedIn:
        "Tienes una propiedad? Publicala para vender o alquilar desde el mapa.",
      publishPromptLoggedOut:
        "Quieres vender o alquilar una propiedad? Inicia sesion para publicarla.",
      publishButtonLoggedIn: "Vender o alquilar mi propiedad",
      publishButtonLoggedOut: "Iniciar sesion para publicar",
      searching: "Buscando...",
      resultsFound: "{{count}} propiedades encontradas",
      publishLinkLoggedIn: "Publicar propiedad",
      publishLinkLoggedOut: "Inicia sesion para publicar",
      loadingProperties: "Buscando propiedades...",
      loadMore: "Cargar mas",
      noResultsTitle: "No encontramos propiedades",
      noResultsDescription:
        "Prueba ajustar tus filtros, mover el mapa o usar una busqueda mas amplia.",
      clearFilters: "Limpiar filtros"
    },
    favoritesPage: {
      eyebrow: "Favoritos",
      title: "Tus propiedades guardadas",
      loading: "Cargando favoritos...",
      emptyTitle: "Todavia no has guardado propiedades",
      emptyDescription:
        "Explora el mapa, abre detalles y usa el corazon para armar tu shortlist."
    },
    dashboardPage: {
      eyebrow: "Dashboard",
      loading: "Cargando dashboard...",
      greeting: "Hola, {{name}}.",
      fallbackName: "equipo",
      description:
        "Desde aqui puedes crear propiedades, responder leads y revisar el estado de tu operacion.",
      myProperties: "Mis propiedades",
      leadsReceived: "Leads recibidos",
      favorites: "Favoritos",
      savedSearches: "Busquedas guardadas",
      viewDetails: "Ver detalle",
      stayClose: "Mantente cerca del mercado",
      stayCloseDescription:
        "Guarda las zonas y filtros que mas te importan para volver rapido a los mismos resultados.",
      optimizeListings: "Optimiza tus publicaciones",
      optimizeListingsDescription:
        "Agrega coordenadas precisas, varias fotos y descripciones detalladas para destacar en el mapa y en el listado."
    },
    filters: {
      title: "Filtros de exploracion",
      description:
        "Combina zona, presupuesto y senales clave para que el mapa responda con resultados mas utiles.",
      searchText: "Buscar por texto",
      searchPlaceholder: "Escazu, Tamarindo, vista al mar, jardin...",
      business: "Negocio",
      propertyType: "Tipo",
      rentalArrangement: "Modalidad",
      location: "Ubicacion",
      priceAndFeatures: "Precio y atributos",
      smartToggles: "Senales rapidas",
      minPrice: "Precio min",
      maxPrice: "Precio max",
      currency: "Moneda",
      status: "Estado",
      bedrooms: "Habitaciones",
      bathrooms: "Baños",
      parkingSpaces: "Parqueos",
      province: "Provincia",
      canton: "Canton",
      district: "Distrito",
      radius: "Radio (km)",
      nearMe: "Cerca de mi",
      selectProvince: "Selecciona provincia",
      selectCanton: "Selecciona canton",
      furnished: "Amueblado",
      petsAllowed: "Acepta mascotas",
      depositRequired: "Con deposito",
      featured: "Destacadas",
      recent: "Recientes",
      privateRoom: "Cuarto privado",
      privateBathroom: "Baño privado",
      utilitiesIncluded: "Servicios incluidos",
      studentFriendly: "Estudiantil",
      saveSearch: "Guardar busqueda",
      clear: "Limpiar filtros"
    },
    map: {
      enableMapboxTitle: "Activa Mapbox para ver el mapa interactivo",
      enableMapboxDescription:
        "Configura `NEXT_PUBLIC_MAPBOX_TOKEN` en el frontend para usar bounds, pines y dibujo de zonas.",
      selectedAria: "Seleccionar {{title}} por {{price}}",
      districtsHint:
        "Distritos interactivos de {{province}}: toca un distrito en el mapa para filtrar propiedades de esa zona."
    },
    propertyCard: {
      featured: "Destacada",
      favoriteAria: "Guardar en favoritos",
      room: "cuarto",
      roomsShort: "hab",
      privateBath: "Baño privado",
      bathroomsShort: "baños",
      pets: "Mascotas",
      deposit: "Depos."
    },
    options: {
      sale: "Venta",
      rent: "Renta",
      house: "Casa",
      apartment: "Apartamento",
      condominium: "Condominio",
      lot: "Lote / Terreno",
      room: "Habitacion",
      commercial: "Comercial",
      fullProperty: "Propiedad completa",
      roommate: "Roomies / alquiler compartido",
      available: "Disponible",
      reserved: "Reservada",
      sold: "Vendida",
      rented: "Alquilada",
      inactive: "Inactiva"
    }
  },
  en: {
    nav: {
      home: "Home",
      explore: "Explore",
      analysis: "Interactive Analysis",
      battle: "Comparative Battle",
      favorites: "Favorites",
      dashboard: "Dashboard",
      admin: "Admin",
      logout: "Log out",
      search: "Search",
      login: "Sign in"
    },
    brand: {
      tagline: "Buy Sell Rent Homes and Lots"
    },
    common: {
      all: "All",
      allFeminine: "All",
      both: "Both",
      active: "Active",
      loading: "Loading...",
      yes: "Yes",
      no: "No"
    },
    footer: {
      description:
        "Real estate platform to explore, publish, and connect properties across Costa Rica.",
      explore: "Explore",
      analysis: "Analysis",
      battle: "Battle",
      searchProperties: "Search properties",
      favorites: "Favorites",
      publishProperty: "Publish property",
      coverage: "Coverage",
      coverageText:
        "San Jose, Escazu, Santa Ana, Heredia, Alajuela, Cartago, Tamarindo, Jaco, Liberia, and Nosara.",
      contact: "Contact",
      contactHelp: "If you need help or support with the platform, write to:"
    },
    authLayout: {
      eyebrow: "Costa Rica",
      title: "Publish, explore, and connect properties with a clear, modern experience.",
      description:
        "AlquiVentasCR brings together sales, rentals, and lots with a geospatial focus: map, GPS, favorites, leads, and publishing dashboard."
    },
    loginForm: {
      eyebrow: "Access",
      title: "Welcome back",
      description: "Manage listings, favorites, and leads from your dashboard.",
      email: "Email",
      emailPlaceholder: "email@example.com",
      password: "Password",
      passwordPlaceholder: "Your password",
      submit: "Sign in",
      submitting: "Signing in...",
      forgotPassword: "Prepare password reset",
      noAccount: "Don't have an account?",
      register: "Create one",
      errorEmail: "Enter a valid email",
      errorPassword: "Enter your password",
      resetMissingEmail: "Enter your email and try again.",
      resetReady: "Flow ready. Temporary development token: {{token}}",
      resetFailed: "We could not start password recovery right now.",
      submitFailed: "Could not sign in"
    },
    registerForm: {
      eyebrow: "Register",
      title: "Create your account",
      description:
        "Publish properties, save favorites, and manage leads from one platform.",
      name: "Name",
      namePlaceholder: "Your name",
      phone: "Phone",
      phonePlaceholder: "+506...",
      email: "Email",
      emailPlaceholder: "email@example.com",
      profile: "Profile",
      password: "Password",
      passwordPlaceholder: "Create a secure password",
      submit: "Create account",
      submitting: "Creating account...",
      alreadyHaveAccount: "Already have an account?",
      login: "Sign in",
      roleUser: "User",
      roleAgent: "Sales agent",
      roleOwner: "Owner",
      errorName: "Enter your name",
      errorEmail: "Enter a valid email",
      errorPhone: "Enter a valid phone number",
      errorPassword: "Minimum 8 characters",
      connectionError:
        "Could not connect to the API. Make sure the backend is running and the frontend origin is allowed.",
      submitFailed: "Could not create the account"
    },
    homePage: {
      eyebrow: "Map-first",
      title: "Discover opportunities through geography, not a generic listing.",
      description:
        "Pick a province, step into the territory, and use the map as the central piece for exploring homes, rentals, and land in Costa Rica.",
      searchZoneLabel: "Search by area or style",
      searchZonePlaceholder: "Example: Escazu, beach, lot...",
      provinceLabel: "Province",
      exploreButton: "Explore on the map",
      activeProvince: "Active province",
      interactiveMap: "Interactive map",
      interactiveMapDescription: "Bounds, drawn zones, and coordinate-based search.",
      localSearch: "Local search",
      localSearchDescription: "Province, canton, district, neighborhood, and near me.",
      simplePublishing: "Simple publishing",
      simplePublishingDescription: "Dashboard for agents, owners, and admin moderation.",
      featuredEyebrow: "Featured",
      featuredTitle: "Properties to get started",
      seeAll: "See all properties"
    },
    provinceExplorer: {
      enableMapbox: "Enable `NEXT_PUBLIC_MAPBOX_TOKEN` to view interactive provinces with your GeoJSON.",
      atlas: "Interactive atlas",
      title: "Costa Rica by province",
      tapProvince: "Tap a province to explore it",
      activeProvince: "Active province",
      visualExploration: "Visual exploration"
    },
    searchPage: {
      loadingMap: "Loading map...",
      searchFailed: "Could not load the search",
      geoError: "We could not access your location.",
      saveSearchSuccess: "Search saved successfully.",
      saveSearchFailed: "Could not save the search",
      loginToSaveSearch: "Sign in to save this search",
      eyebrow: "Explore",
      title: "Find properties in Costa Rica",
      description:
        "Use advanced filters, a live map, drawn areas, and GPS search to find real opportunities.",
      publishPromptLoggedIn:
        "Do you have a property? Publish it to sell or rent directly from the map.",
      publishPromptLoggedOut:
        "Want to sell or rent a property? Sign in to publish it.",
      publishButtonLoggedIn: "Sell or rent my property",
      publishButtonLoggedOut: "Sign in to publish",
      searching: "Searching...",
      resultsFound: "{{count}} properties found",
      publishLinkLoggedIn: "Publish property",
      publishLinkLoggedOut: "Sign in to publish",
      loadingProperties: "Searching properties...",
      loadMore: "Load more",
      noResultsTitle: "We couldn't find properties",
      noResultsDescription:
        "Try adjusting your filters, moving the map, or using a broader search.",
      clearFilters: "Clear filters"
    },
    favoritesPage: {
      eyebrow: "Favorites",
      title: "Your saved properties",
      loading: "Loading favorites...",
      emptyTitle: "You have not saved any properties yet",
      emptyDescription:
        "Explore the map, open listings, and use the heart to build your shortlist."
    },
    dashboardPage: {
      eyebrow: "Dashboard",
      loading: "Loading dashboard...",
      greeting: "Hi, {{name}}.",
      fallbackName: "team",
      description:
        "From here you can create properties, reply to leads, and review the status of your operation.",
      myProperties: "My properties",
      leadsReceived: "Leads received",
      favorites: "Favorites",
      savedSearches: "Saved searches",
      viewDetails: "View details",
      stayClose: "Stay close to the market",
      stayCloseDescription:
        "Save the areas and filters you care about most so you can jump back to the same results quickly.",
      optimizeListings: "Optimize your listings",
      optimizeListingsDescription:
        "Add precise coordinates, multiple photos, and detailed descriptions to stand out on both the map and the listing."
    },
    filters: {
      title: "Exploration filters",
      description:
        "Combine area, budget, and key signals so the map reacts with sharper results.",
      searchText: "Search by text",
      searchPlaceholder: "Escazu, Tamarindo, ocean view, garden...",
      business: "Business",
      propertyType: "Type",
      rentalArrangement: "Rental setup",
      location: "Location",
      priceAndFeatures: "Price and features",
      smartToggles: "Quick signals",
      minPrice: "Min price",
      maxPrice: "Max price",
      currency: "Currency",
      status: "Status",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      parkingSpaces: "Parking",
      province: "Province",
      canton: "Canton",
      district: "District",
      radius: "Radius (km)",
      nearMe: "Near me",
      selectProvince: "Select province",
      selectCanton: "Select canton",
      furnished: "Furnished",
      petsAllowed: "Pets allowed",
      depositRequired: "With deposit",
      featured: "Featured",
      recent: "Recent",
      privateRoom: "Private room",
      privateBathroom: "Private bathroom",
      utilitiesIncluded: "Utilities included",
      studentFriendly: "Student-friendly",
      saveSearch: "Save search",
      clear: "Clear filters"
    },
    map: {
      enableMapboxTitle: "Enable Mapbox to view the interactive map",
      enableMapboxDescription:
        "Set `NEXT_PUBLIC_MAPBOX_TOKEN` in the frontend to use bounds, markers, and drawn areas.",
      selectedAria: "Select {{title}} for {{price}}",
      districtsHint:
        "Interactive districts in {{province}}: tap a district on the map to filter properties in that area."
    },
    propertyCard: {
      featured: "Featured",
      favoriteAria: "Save to favorites",
      room: "room",
      roomsShort: "beds",
      privateBath: "Private bath",
      bathroomsShort: "baths",
      pets: "Pets",
      deposit: "Dep."
    },
    options: {
      sale: "Sale",
      rent: "Rent",
      house: "House",
      apartment: "Apartment",
      condominium: "Condominium",
      lot: "Lot / Land",
      room: "Room",
      commercial: "Commercial",
      fullProperty: "Full property",
      roommate: "Roommates / shared rental",
      available: "Available",
      reserved: "Reserved",
      sold: "Sold",
      rented: "Rented",
      inactive: "Inactive"
    }
  }
};

const resolveTranslation = (language, key) => {
  const walk = (source) =>
    key.split(".").reduce((current, part) => (current && current[part] !== undefined ? current[part] : undefined), source);

  return walk(translations[language]) ?? walk(translations.es);
};

const interpolate = (value, params = {}) => {
  if (typeof value !== "string") {
    return value;
  }

  return Object.entries(params).reduce(
    (current, [paramKey, paramValue]) => current.replaceAll(`{{${paramKey}}}`, String(paramValue)),
    value
  );
};

const LanguageContext = createContext({
  language: "es",
  setLanguage: () => {},
  t: (key, params) => interpolate(resolveTranslation("es", key) || key, params)
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (storedLanguage === "en" || storedLanguage === "es") {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key, params) => interpolate(resolveTranslation(language, key) || key, params)
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
