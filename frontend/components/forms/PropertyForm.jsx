"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPinned } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createProperty, updateProperty, uploadPropertyImages } from "@/lib/api";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import {
  amenitySuggestions,
  businessTypes,
  currencies,
  marketStatuses,
  propertyStatuses,
  propertyTypes,
  provinces,
  rentalArrangements,
  roommateGenderPreferences
} from "@/lib/constants";
import {
  ensureOptionInList,
  getCantonsByProvince,
  getDistrictsByProvinceAndCanton
} from "@/lib/costa-rica-locations";
import { reverseGeocodeCostaRica } from "@/lib/costa-rica-reverse-geo";
import { buildPropertyPayload } from "@/lib/utils";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

const sellerRoleChoices = {
  es: [
    { value: "owner", label: "Propietario" },
    { value: "sales-agent", label: "Agente de ventas" },
    { value: "advisor", label: "Asesor inmobiliario" },
    { value: "broker", label: "Broker" },
    { value: "developer", label: "Desarrollador" },
    { value: "property-manager", label: "Administrador de propiedades" }
  ],
  en: [
    { value: "owner", label: "Owner" },
    { value: "sales-agent", label: "Sales agent" },
    { value: "advisor", label: "Real estate advisor" },
    { value: "broker", label: "Broker" },
    { value: "developer", label: "Developer" },
    { value: "property-manager", label: "Property manager" }
  ]
};

const serviceDistanceOptions = Array.from({ length: 31 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1} km`
}));

const normalizeSellerRoleValue = (value = "") => {
  const normalized = String(value).trim().toLowerCase();
  const aliases = {
    owner: "owner",
    propietario: "owner",
    agent: "sales-agent",
    "agente de ventas": "sales-agent",
    advisor: "advisor",
    "asesor inmobiliario": "advisor",
    broker: "broker",
    developer: "developer",
    desarrollador: "developer",
    admin: "property-manager",
    "property manager": "property-manager",
    "administrador de propiedades": "property-manager"
  };

  return aliases[normalized] || value;
};

const numberField = (fallback = 0) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined || Number.isNaN(value)) {
        return fallback;
      }

      return value;
    },
    z.coerce.number().nonnegative()
  );

const optionalNumberField = () =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined || Number.isNaN(value)) {
        return undefined;
      }

      return value;
    },
    z.coerce.number().nonnegative().optional()
  );

const coordinateField = (copy) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      const parsedValue = Number(value);
      return Number.isFinite(parsedValue) ? parsedValue : value;
    },
    z.number({
      required_error: copy.validationCoordinates,
      invalid_type_error: copy.validationCoordinates
    })
  );

const createPropertyFormSchema = (copy) =>
  z.object({
    title: z.string().min(10, copy.validationTitleMin),
    description: z.string().min(10, copy.validationDescriptionMin),
    businessType: z.string().min(1, copy.validationRequired),
    rentalArrangement: z.string().optional(),
    propertyType: z.string().min(1, copy.validationRequired),
    price: numberField(),
    finalPrice: optionalNumberField(),
    currency: z.string().min(1, copy.validationRequired),
    bedrooms: numberField(),
    bathrooms: numberField(),
    parkingSpaces: numberField(),
    constructionArea: numberField(),
    landArea: numberField(),
    furnished: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),
    depositRequired: z.boolean().optional(),
    amenities: z.string(),
    status: z.string().min(1, copy.validationRequired),
    marketStatus: z.string().min(1, copy.validationRequired),
    province: z.string().min(2, copy.validationProvince),
    canton: z.string().min(2, copy.validationCanton),
    district: z.string().min(2, copy.validationDistrict),
    neighborhood: z.string(),
    exactAddress: z.string(),
    addressText: z.string(),
    sellerName: z.string(),
    sellerPhone: z.string(),
    sellerEmail: z.string(),
    sellerRole: z.string(),
    serviceHospitalKm: optionalNumberField(),
    serviceSchoolKm: optionalNumberField(),
    serviceHighSchoolKm: optionalNumberField(),
    videoUrls: z.string(),
    hideExactLocation: z.boolean().optional(),
    privateRoom: z.boolean().optional(),
    privateBathroom: z.boolean().optional(),
    utilitiesIncluded: z.boolean().optional(),
    studentFriendly: z.boolean().optional(),
    availableRooms: numberField(),
    currentRoommates: numberField(),
    maxRoommates: numberField(),
    genderPreference: z.string(),
    sharedAreas: z.string(),
    lat: coordinateField(copy),
    lng: coordinateField(copy)
  });

const findFirstMessage = (value) => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = findFirstMessage(item);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (typeof value === "object") {
    if (typeof value.message === "string" && value.message.trim()) {
      return value.message;
    }

    for (const item of Object.values(value)) {
      const message = findFirstMessage(item);

      if (message) {
        return message;
      }
    }

    return null;
  }

  return typeof value === "string" && value.trim() ? value : null;
};

const toDefaultValues = (property) => ({
  title: property?.title || "",
  description: property?.description || "",
  businessType: property?.businessType || "sale",
  rentalArrangement:
    property?.rentalArrangement || (property?.propertyType === "room" ? "roommate" : "full-property"),
  propertyType: property?.propertyType || "house",
  price: property?.price || 0,
  finalPrice: property?.finalPrice || "",
  currency: property?.currency || "USD",
  bedrooms: property?.bedrooms || 0,
  bathrooms: property?.bathrooms || 0,
  parkingSpaces: property?.parkingSpaces || 0,
  constructionArea: property?.constructionArea || 0,
  landArea: property?.landArea || property?.lotArea || 0,
  furnished: property?.furnished || false,
  petsAllowed: property?.petsAllowed || false,
  depositRequired: property?.depositRequired || false,
  status: property?.status || "published",
  marketStatus: property?.marketStatus || "available",
  amenities: property?.amenities?.join(", ") || "",
  province: property?.address?.province || "",
  canton: property?.address?.canton || "",
  district: property?.address?.district || "",
  neighborhood: property?.address?.neighborhood || "",
  exactAddress: property?.address?.exactAddress || "",
  addressText: property?.addressText || property?.address?.exactAddress || "",
  sellerName: property?.sellerInfo?.name || property?.owner?.name || "",
  sellerPhone: property?.sellerInfo?.phone || property?.owner?.phone || "",
  sellerEmail: property?.sellerInfo?.email || "",
  sellerRole: normalizeSellerRoleValue(property?.sellerInfo?.role || property?.owner?.role || ""),
  serviceHospitalKm:
    property?.serviceDistances?.hospitalKm ??
    property?.nearestHospital?.distanceKm ??
    "",
  serviceSchoolKm:
    property?.serviceDistances?.schoolKm ??
    property?.nearestSchool?.distanceKm ??
    "",
  serviceHighSchoolKm:
    property?.serviceDistances?.highSchoolKm ??
    property?.nearestHighSchool?.distanceKm ??
    "",
  videoUrls:
    property?.media
      ?.filter((item) => item.type === "video")
      .map((item) => item.url)
      .join("\n") || "",
  privateRoom: property?.roommateDetails?.privateRoom || property?.propertyType === "room",
  privateBathroom: property?.roommateDetails?.privateBathroom || false,
  utilitiesIncluded: property?.roommateDetails?.utilitiesIncluded || false,
  studentFriendly: property?.roommateDetails?.studentFriendly || false,
  availableRooms: property?.roommateDetails?.availableRooms || 1,
  currentRoommates: property?.roommateDetails?.currentRoommates || 0,
  maxRoommates: property?.roommateDetails?.maxRoommates || 0,
  genderPreference: property?.roommateDetails?.genderPreference || "any",
  sharedAreas: property?.roommateDetails?.sharedAreas?.join(", ") || "",
  hideExactLocation: property?.address?.hideExactLocation ?? false,
  lat: property?.location?.coordinates?.[1] ?? "",
  lng: property?.location?.coordinates?.[0] ?? ""
});

export function PropertyForm({ property, propertyId }) {
  const router = useRouter();
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const copy = useMemo(
    () =>
      isEnglish
        ? {
            newProperty: "New property",
            editProperty: "Edit",
            createProperty: "Create a listing",
            updateProperty: "Update your listing",
            saveProperty: "Save property",
            saveChanges: "Save changes",
            saving: "Saving...",
            title: "Title",
            price: "Price",
            finalPrice: "Final price",
            description: "Description",
            business: "Business",
            rentalArrangement: "Rental arrangement",
            propertyType: "Property type",
            currency: "Currency",
            status: "Status",
            marketStatus: "Market status",
            features: "Features",
            bedrooms: "Bedrooms",
            bathrooms: "Bathrooms",
            parkingSpaces: "Parking spaces",
            constructionArea: "Construction area",
            landArea: "Land area",
            furnished: "Furnished",
            petsAllowedRent: "Pets allowed",
            petsAllowedSale: "Pets allowed",
            depositRequired: "Deposit required",
            hideExactLocation: "Hide exact location",
            amenities: "Amenities",
            amenitiesHint: "Separate each amenity with a comma.",
            roommateTitle: "Roommates / shared rental",
            roommateDescription:
              "Use this section for rooms, shared rentals, or student/professional co-living spaces.",
            availableRooms: "Available rooms",
            currentRoommates: "Current roommates",
            maxRoommates: "Max roommates",
            genderPreference: "Preference",
            privateRoom: "Private room",
            privateBathroom: "Private bathroom",
            utilitiesIncluded: "Utilities included",
            studentFriendly: "Student friendly",
            sharedAreas: "Shared areas",
            location: "Location",
            locationDescription:
              "Use coordinates so the property appears on the map, nearby searches, and polygons.",
            locationHelp:
              "You can get latitude and longitude in Google Maps: open the map, right-click the point, and copy the coordinates shown below.",
            locationButtonHint:
              "Turn on your phone GPS first. If you prefer, paste latitude and longitude from Google Maps.",
            openGoogleMaps: "Open Google Maps",
            useMyLocation: "Use my location",
            province: "Province",
            canton: "Canton",
            district: "District",
            latitude: "Latitude",
            longitude: "Longitude",
            neighborhood: "Neighborhood or area",
            exactAddress: "Exact address",
            addressText: "Visible location text",
            sellerInfo: "Seller information",
            sellerName: "Name",
            sellerPhone: "Phone",
            sellerEmail: "Email",
            sellerRole: "Visible role",
            serviceDistances: "Nearby services",
            serviceDistancesHelp:
              "3 optional questions. If you choose any of these distances, they will appear on the property page.",
            hospitalDistance: "Distance to nearest hospital",
            schoolDistance: "Distance to nearest school",
            highSchoolDistance: "Distance to nearest high school",
            serviceDistancePlaceholder: "Do not show",
            photos: "Photos",
            photosHelp:
              "Upload multiple images and choose a primary one for cards and property detail.",
            photosSaveHint:
              "Uploading images does not save the property by itself. After uploading them, use Save property.",
            uploadImages: "Upload images",
            uploading: "Uploading...",
            noPhotos:
              "You can publish without photos, but the experience improves a lot when you add several.",
            primary: "Primary",
            makePrimary: "Set as primary",
            remove: "Remove",
            videos: "Videos",
            videosHint:
              "Paste one video URL per line to include multimedia in the listing.",
            finalSaveTitle: "Save changes",
            finalSaveDescription:
              "Use this final button to save the property after reviewing photos, location, and details.",
            feedbackUploadSuccess:
              "Photos uploaded successfully. Now click Save property to persist the changes.",
            feedbackLocationSuccess:
              "Location detected successfully. You can now save your property.",
            feedbackLocationError:
              "Your current location could not be obtained. Turn on GPS or enter latitude and longitude from Google Maps.",
            feedbackCreateSuccess: "Listing created successfully. Redirecting...",
            feedbackUpdateSuccess: "Listing updated successfully. Redirecting...",
            dashboardFlashCreate:
              "Your listing was saved successfully and already appears in your dashboard.",
            dashboardFlashUpdate: "Your listing was updated successfully.",
            feedbackPermission:
              "Your account needs publishing permissions. If you signed in with another profile, sign in again as owner, agent, or admin.",
            feedbackSaveError: "The property could not be saved.",
            feedbackUploadError: "The images could not be uploaded.",
            invalidNumber: "One of the numeric fields is invalid or empty.",
            validationRequired: "Please complete this field.",
            validationTitleMin: "Enter at least 10 characters for the title.",
            validationDescriptionMin: "Write at least 10 characters in the description.",
            validationProvince: "Select a province.",
            validationCanton: "Select a canton.",
            validationDistrict: "Select a district.",
            validationCoordinates: "Enter valid latitude and longitude coordinates.",
            selectProvince: "Select province",
            selectCanton: "Select canton",
            selectDistrict: "Select district",
            firstProvince: "Choose province first",
            firstCanton: "Choose canton first",
            feedbackLocationResolved: (label) =>
              `Location detected in ${label}. You can now save your property.`,
            feedbackLocationNeedsReview:
              "Coordinates were detected, but review province, canton, and district before saving."
          }
        : {
            newProperty: "Nueva propiedad",
            editProperty: "Editar",
            createProperty: "Crea una publicacion",
            updateProperty: "Actualiza tu publicacion",
            saveProperty: "Guardar propiedad",
            saveChanges: "Guardar cambios",
            saving: "Guardando...",
            title: "Titulo",
            price: "Precio",
            finalPrice: "Precio final",
            description: "Descripcion",
            business: "Negocio",
            rentalArrangement: "Modalidad de renta",
            propertyType: "Tipo de propiedad",
            currency: "Moneda",
            status: "Estado",
            marketStatus: "Estado de mercado",
            features: "Caracteristicas",
            bedrooms: "Habitaciones",
            bathrooms: "Baños",
            parkingSpaces: "Parqueos",
            constructionArea: "Area construccion",
            landArea: "Area terreno",
            furnished: "Amueblado",
            petsAllowedRent: "Acepta mascotas",
            petsAllowedSale: "Mascotas permitidas",
            depositRequired: "Requiere deposito",
            hideExactLocation: "Ocultar ubicacion exacta",
            amenities: "Amenidades",
            amenitiesHint: "Separa cada amenidad con coma.",
            roommateTitle: "Roomies / alquiler compartido",
            roommateDescription:
              "Usa esta seccion para publicar cuartos, alquileres compartidos o espacios comunes para estudiantes y profesionales.",
            availableRooms: "Cuartos disponibles",
            currentRoommates: "Roomies actuales",
            maxRoommates: "Maximo de roomies",
            genderPreference: "Preferencia",
            privateRoom: "Cuarto privado",
            privateBathroom: "Baño privado",
            utilitiesIncluded: "Servicios incluidos",
            studentFriendly: "Apto para estudiantes",
            sharedAreas: "Areas compartidas",
            location: "Ubicacion",
            locationDescription:
              "Usa coordenadas para que la propiedad aparezca en mapa, busquedas cercanas y poligonos.",
            locationHelp:
              "Puedes obtener latitud y longitud en Google Maps: abre el mapa, haz clic derecho sobre el punto y copia las coordenadas que aparecen abajo.",
            locationButtonHint:
              "Primero activa el GPS del telefono. Si prefieres, pega la latitud y longitud obtenidas en Google Maps.",
            openGoogleMaps: "Abrir Google Maps",
            useMyLocation: "Usar mi ubicacion",
            province: "Provincia",
            canton: "Canton",
            district: "Distrito",
            latitude: "Latitud",
            longitude: "Longitud",
            neighborhood: "Barrio o zona",
            exactAddress: "Direccion exacta",
            addressText: "Ubicacion textual para mostrar",
            sellerInfo: "Informacion del vendedor",
            sellerName: "Nombre",
            sellerPhone: "Telefono",
            sellerEmail: "Correo",
            sellerRole: "Rol visible",
            serviceDistances: "Servicios cercanos",
            serviceDistancesHelp:
              "3 preguntas opcionales. Si eliges alguna de estas distancias, se mostraran en la publicacion.",
            hospitalDistance: "Distancia al hospital mas cercano",
            schoolDistance: "Distancia a la escuela mas cercana",
            highSchoolDistance: "Distancia al colegio mas cercano",
            serviceDistancePlaceholder: "No mostrar",
            photos: "Fotos",
            photosHelp:
              "Sube multiples imagenes y define una principal para cards y detalle.",
            photosSaveHint:
              "Subir imagenes no guarda la propiedad por si solo. Despues de cargarlas, usa Guardar propiedad.",
            uploadImages: "Subir imagenes",
            uploading: "Subiendo...",
            noPhotos:
              "Puedes publicar sin fotos, pero la experiencia mejora mucho al agregar varias.",
            primary: "Principal",
            makePrimary: "Hacer principal",
            remove: "Quitar",
            videos: "Videos",
            videosHint:
              "Pega una URL de video por linea para incluir multimedia en la publicacion.",
            finalSaveTitle: "Guardar cambios",
            finalSaveDescription:
              "Usa este boton final para guardar la propiedad despues de revisar fotos, ubicacion y detalles.",
            feedbackUploadSuccess:
              "Fotos cargadas correctamente. Ahora pulsa Guardar propiedad para guardar los cambios.",
            feedbackLocationSuccess:
              "Ubicacion detectada correctamente. Ya puedes guardar tu propiedad.",
            feedbackLocationError:
              "No se pudo obtener tu ubicacion actual. Activa el GPS o ingresa la latitud y longitud desde Google Maps.",
            feedbackCreateSuccess: "Publicacion creada correctamente. Redirigiendo...",
            feedbackUpdateSuccess: "Publicacion actualizada correctamente. Redirigiendo...",
            dashboardFlashCreate:
              "Tu publicacion se guardo correctamente y ya aparece en tu panel.",
            dashboardFlashUpdate: "Tu publicacion se actualizo correctamente.",
            feedbackPermission:
              "Tu cuenta debe tener permiso para publicar. Si entraste con otro perfil, vuelve a iniciar sesion como propietario, agente o admin.",
            feedbackSaveError: "No se pudo guardar la propiedad",
            feedbackUploadError: "No fue posible subir las imagenes",
            invalidNumber: "Uno de los campos numericos es invalido o esta vacio.",
            validationRequired: "Completa este campo.",
            validationTitleMin: "Ingresa al menos 10 caracteres en el titulo.",
            validationDescriptionMin: "Ingresa al menos 10 caracteres en la descripcion.",
            validationProvince: "Selecciona una provincia.",
            validationCanton: "Selecciona un canton.",
            validationDistrict: "Selecciona un distrito.",
            validationCoordinates: "Ingresa coordenadas validas para latitud y longitud.",
            selectProvince: "Selecciona provincia",
            selectCanton: "Selecciona canton",
            selectDistrict: "Selecciona distrito",
            firstProvince: "Primero provincia",
            firstCanton: "Primero canton",
            feedbackLocationResolved: (label) =>
              `Ubicacion detectada en ${label}. Ya puedes guardar tu propiedad.`,
            feedbackLocationNeedsReview:
              "Se detectaron las coordenadas, pero revisa provincia, canton y distrito antes de guardar."
          },
    [isEnglish]
  );
  const optionLabelMap = useMemo(
    () =>
      isEnglish
        ? {
            sale: "Sale",
            rent: "Rent",
            house: "House",
            apartment: "Apartment",
            condominium: "Condominium",
            lot: "Lot / Land",
            room: "Room",
            commercial: "Commercial",
            draft: "Draft",
            published: "Published",
            paused: "Paused",
            sold: "Sold",
            rented: "Rented",
            available: "Available",
            reserved: "Reserved",
            inactive: "Inactive",
            "full-property": "Entire property",
            roommate: "Roommates / shared rental",
            any: "No preference",
            "female-only": "Women only",
            "male-only": "Men only"
          }
        : {},
    [isEnglish]
  );
  const getOptionLabel = (item) => optionLabelMap[item.value] || item.label;
  const propertyFormSchema = useMemo(() => createPropertyFormSchema(copy), [copy]);
  const [photos, setPhotos] = useState(property?.photos || []);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("info");
  const [isUploading, setIsUploading] = useState(false);
  const fallbackSrc = "/property-placeholder.svg";
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    getValues,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: toDefaultValues(property)
  });
  const provinceField = register("province");
  const cantonField = register("canton");
  const districtField = register("district");
  const latField = register("lat");
  const lngField = register("lng");
  const businessTypeValue = watch("businessType");
  const propertyTypeValue = watch("propertyType");
  const rentalArrangementValue = watch("rentalArrangement");
  const provinceValue = watch("province");
  const cantonValue = watch("canton");
  const districtValue = watch("district");
  const showRoommateSection =
    businessTypeValue === "rent" &&
    (rentalArrangementValue === "roommate" || propertyTypeValue === "room");
  const rawCantonOptions = getCantonsByProvince(provinceValue);
  const rawDistrictOptions = getDistrictsByProvinceAndCanton(provinceValue, cantonValue);
  const cantonOptions = ensureOptionInList(rawCantonOptions, cantonValue);
  const districtOptions = ensureOptionInList(
    rawDistrictOptions,
    districtValue
  );
  const sellerRoleOptions = sellerRoleChoices[isEnglish ? "en" : "es"];
  useEffect(() => {
    reset(toDefaultValues(property));
    setPhotos(property?.photos || []);
  }, [property, reset]);

  useEffect(() => {
    if (provinceValue && cantonValue && !rawCantonOptions.includes(cantonValue)) {
      setValue("canton", "");
      setValue("district", "");
    }
  }, [provinceValue, cantonValue, rawCantonOptions, setValue]);

  useEffect(() => {
    if (districtValue && !rawDistrictOptions.includes(districtValue)) {
      setValue("district", "");
      clearErrors("district");
    }
  }, [clearErrors, districtValue, rawDistrictOptions, setValue]);

  useEffect(() => {
    if (businessTypeValue !== "rent") {
      setValue("rentalArrangement", "full-property", {
        shouldValidate: true,
        shouldDirty: false
      });
      setValue("petsAllowed", false, {
        shouldValidate: false,
        shouldDirty: false
      });
      setValue("depositRequired", false, {
        shouldValidate: false,
        shouldDirty: false
      });
      return;
    }

    if (propertyTypeValue === "room" && rentalArrangementValue !== "roommate") {
      setValue("rentalArrangement", "roommate", {
        shouldValidate: true,
        shouldDirty: false
      });
    }
  }, [businessTypeValue, propertyTypeValue, rentalArrangementValue, setValue]);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      setIsUploading(true);
      const response = await uploadPropertyImages(files);
      const nextPhotos = [
        ...photos.map((photo) => ({ ...photo, isPrimary: false })),
        ...response.items.map((item, index) => ({
          ...item,
          isPrimary: photos.length === 0 && index === 0
        }))
      ];

      setPhotos(nextPhotos);
      setFeedbackTone("info");
      setFeedback(copy.feedbackUploadSuccess);
    } catch (error) {
      const firstDetail = findFirstMessage(error.response?.data?.details);
      setFeedbackTone("error");
      setFeedback(firstDetail || error.response?.data?.message || copy.feedbackUploadError);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const markAsPrimary = (selectedIndex) => {
    setPhotos((current) =>
      current.map((photo, index) => ({
        ...photo,
        isPrimary: index === selectedIndex
      }))
    );
  };

  const removePhoto = (selectedIndex) => {
    setPhotos((current) => {
      const nextPhotos = current.filter((_, index) => index !== selectedIndex);

      if (nextPhotos.length && !nextPhotos.some((item) => item.isPrimary)) {
        nextPhotos[0].isPrimary = true;
      }

      return [...nextPhotos];
    });
  };

  const syncAdministrativeLocation = async (lat, lng, options = {}) => {
    const { updateFeedback = false } = options;

    try {
      const resolvedLocation = await reverseGeocodeCostaRica({ lat, lng });

      if (!resolvedLocation?.province || !resolvedLocation?.canton || !resolvedLocation?.district) {
        if (updateFeedback) {
          setFeedbackTone("info");
          setFeedback(copy.feedbackLocationNeedsReview);
        }

        return null;
      }

      const previousZoneLabel = [
        getValues("district"),
        getValues("canton"),
        getValues("province")
      ]
        .filter(Boolean)
        .join(", ");
      const currentAddressText = String(getValues("addressText") || "").trim();

      setValue("province", resolvedLocation.province, {
        shouldValidate: true,
        shouldDirty: true
      });
      setValue("canton", resolvedLocation.canton, {
        shouldValidate: true,
        shouldDirty: true
      });
      setValue("district", resolvedLocation.district, {
        shouldValidate: true,
        shouldDirty: true
      });
      clearErrors(["province", "canton", "district"]);

      if (!currentAddressText || currentAddressText === previousZoneLabel) {
        setValue("addressText", resolvedLocation.label, {
          shouldValidate: false,
          shouldDirty: true
        });
      }

      if (updateFeedback) {
        setFeedbackTone("success");
        setFeedback(copy.feedbackLocationResolved(resolvedLocation.label));
      }

      return resolvedLocation;
    } catch {
      if (updateFeedback) {
        setFeedbackTone("info");
        setFeedback(copy.feedbackLocationNeedsReview);
      }

      return null;
    }
  };

  const syncLocationFromCurrentCoordinates = async (options = {}) => {
    const currentLat = getValues("lat");
    const currentLng = getValues("lng");

    if (currentLat === "" || currentLng === "" || currentLat === undefined || currentLng === undefined) {
      return null;
    }

    return syncAdministrativeLocation(currentLat, currentLng, options);
  };

  const useCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setFeedbackTone("error");
      setFeedback(copy.feedbackLocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLat = Number(position.coords.latitude.toFixed(6));
        const nextLng = Number(position.coords.longitude.toFixed(6));

        setValue("lat", nextLat, { shouldValidate: true, shouldDirty: true });
        setValue("lng", nextLng, { shouldValidate: true, shouldDirty: true });
        clearErrors(["lat", "lng"]);

        const resolvedLocation = await syncAdministrativeLocation(nextLat, nextLng, {
          updateFeedback: false
        });

        if (resolvedLocation?.label) {
          setFeedbackTone("success");
          setFeedback(copy.feedbackLocationResolved(resolvedLocation.label));
          return;
        }

        setFeedbackTone("info");
        setFeedback(copy.feedbackLocationNeedsReview);
      },
      () => {
        setFeedbackTone("error");
        setFeedback(copy.feedbackLocationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000
      }
    );
  };

  const onSubmit = async (values) => {
    try {
      setFeedback("");
      setFeedbackTone("info");
      const videoUrls = values.videoUrls
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
      const payload = buildPropertyPayload(values, photos, videoUrls);

      if (propertyId) {
        await updateProperty(propertyId, payload);
      } else {
        await createProperty(payload);
      }

      trackEvent(propertyId ? analyticsEvents.propertyUpdated : analyticsEvents.propertyCreated, {
        propertyId: propertyId || undefined,
        businessType: payload.businessType,
        propertyType: payload.propertyType,
        province: payload.address?.province,
        canton: payload.address?.canton,
        district: payload.address?.district,
        marketStatus: payload.marketStatus,
        photosCount: payload.photos?.length || 0,
        videosCount: payload.media?.filter((item) => item.type === "video").length || 0
      });

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "alquiventascr-property-flash",
          propertyId
            ? copy.dashboardFlashUpdate
            : copy.dashboardFlashCreate
        );
      }

      setFeedback(
        propertyId
          ? copy.feedbackUpdateSuccess
          : copy.feedbackCreateSuccess
      );
      setFeedbackTone("success");

      window.setTimeout(() => {
        router.push("/dashboard/properties?saved=1");
        router.refresh();
      }, 700);
    } catch (error) {
      const firstDetail = findFirstMessage(error.response?.data?.details);
      const normalizedDetail =
        firstDetail === "Expected number, received null" ? copy.invalidNumber : firstDetail;
      const permissionMessage =
        error.response?.status === 403
          ? copy.feedbackPermission
          : null;

      setFeedbackTone("error");
      setFeedback(
        normalizedDetail ||
          permissionMessage ||
          error.response?.data?.message ||
          copy.feedbackSaveError
      );
    }
  };

  const onInvalid = (formErrors) => {
    const firstMessage = findFirstMessage(formErrors);
    setFeedbackTone("error");
    setFeedback(
      firstMessage === "Expected number, received null"
        ? copy.invalidNumber
        : firstMessage || copy.validationRequired
    );
  };

  const feedbackClassName =
    feedbackTone === "success"
      ? "border border-pine/20 bg-pine/10 text-pine"
      : feedbackTone === "error"
        ? "border border-red-200 bg-red-50 text-red-600"
        : "border border-transparent bg-mist text-ink/70";

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <section className="surface space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="eyebrow">{propertyId ? copy.editProperty : copy.newProperty}</span>
            <h1 className="mt-4 font-serif text-4xl font-semibold">
              {propertyId ? copy.updateProperty : copy.createProperty}
            </h1>
          </div>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? copy.saving : copy.saveProperty}
          </Button>
        </div>

        {feedback ? (
          <p className={`rounded-2xl px-4 py-3 text-sm ${feedbackClassName}`}>{feedback}</p>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="field-label">{copy.title}</label>
            <Input {...register("title")} />
            {errors.title ? <p className="mt-2 text-sm text-red-600">{errors.title.message}</p> : null}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="field-label">{copy.price}</label>
              <Input type="number" {...register("price")} />
              {errors.price ? <p className="mt-2 text-sm text-red-600">{errors.price.message}</p> : null}
            </div>
            <div>
              <label className="field-label">{copy.finalPrice}</label>
              <Input type="number" {...register("finalPrice")} />
            </div>
          </div>
        </div>

        <div>
          <label className="field-label">{copy.description}</label>
          <Textarea {...register("description")} />
          {errors.description ? (
            <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="field-label">{copy.business}</label>
            <Select {...register("businessType")}>
              {businessTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {getOptionLabel(item)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">{copy.rentalArrangement}</label>
            <Select {...register("rentalArrangement")} disabled={businessTypeValue !== "rent"}>
              {rentalArrangements.map((item) => (
                <option key={item.value} value={item.value}>
                  {getOptionLabel(item)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">{copy.propertyType}</label>
            <Select {...register("propertyType")}>
              {propertyTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {getOptionLabel(item)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">{copy.currency}</label>
            <Select {...register("currency")}>
              {currencies.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">{copy.status}</label>
            <Select {...register("status")}>
              {propertyStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {getOptionLabel(item)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">{copy.marketStatus}</label>
            <Select {...register("marketStatus")}>
              {marketStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {getOptionLabel(item)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="surface space-y-5 p-6">
        <h2 className="text-2xl font-semibold">{copy.features}</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="field-label">{copy.bedrooms}</label>
            <Input type="number" {...register("bedrooms")} />
          </div>
          <div>
            <label className="field-label">{copy.bathrooms}</label>
            <Input type="number" {...register("bathrooms")} />
          </div>
          <div>
            <label className="field-label">{copy.parkingSpaces}</label>
            <Input type="number" {...register("parkingSpaces")} />
          </div>
          <div>
            <label className="field-label">{copy.constructionArea}</label>
            <Input type="number" {...register("constructionArea")} />
          </div>
          <div>
            <label className="field-label">{copy.landArea}</label>
            <Input type="number" {...register("landArea")} />
          </div>
        </div>
        <div className="flex flex-wrap gap-5">
          <Checkbox label={copy.furnished} {...register("furnished")} />
          {businessTypeValue === "rent" ? (
            <>
              <Checkbox label={copy.petsAllowedRent} {...register("petsAllowed")} />
              <Checkbox label={copy.depositRequired} {...register("depositRequired")} />
            </>
          ) : null}
          <Checkbox label={copy.hideExactLocation} {...register("hideExactLocation")} />
        </div>
        <div>
          <label className="field-label">{copy.amenities}</label>
          <Input
            placeholder={`${isEnglish ? "Example" : "Ejemplo"}: ${amenitySuggestions.slice(0, 4).join(", ")}`}
            {...register("amenities")}
          />
          <p className="mt-2 text-xs text-ink/45">{copy.amenitiesHint}</p>
        </div>
      </section>

      {showRoommateSection ? (
        <section className="surface space-y-5 p-6">
          <h2 className="text-2xl font-semibold">{copy.roommateTitle}</h2>
          <p className="text-sm text-ink/60">{copy.roommateDescription}</p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="field-label">{copy.availableRooms}</label>
              <Input type="number" {...register("availableRooms")} />
            </div>
            <div>
              <label className="field-label">{copy.currentRoommates}</label>
              <Input type="number" {...register("currentRoommates")} />
            </div>
            <div>
              <label className="field-label">{copy.maxRoommates}</label>
              <Input type="number" {...register("maxRoommates")} />
            </div>
            <div>
              <label className="field-label">{copy.genderPreference}</label>
              <Select {...register("genderPreference")}>
                {roommateGenderPreferences.map((item) => (
                  <option key={item.value} value={item.value}>
                    {getOptionLabel(item)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            <Checkbox label={copy.privateRoom} {...register("privateRoom")} />
            <Checkbox label={copy.privateBathroom} {...register("privateBathroom")} />
            <Checkbox label={copy.utilitiesIncluded} {...register("utilitiesIncluded")} />
            <Checkbox label={copy.studentFriendly} {...register("studentFriendly")} />
          </div>
          <div>
            <label className="field-label">{copy.sharedAreas}</label>
            <Input
              placeholder={
                isEnglish
                  ? "Example: Kitchen, living room, laundry, terrace"
                  : "Ejemplo: Cocina, sala, lavanderia, terraza"
              }
              {...register("sharedAreas")}
            />
          </div>
        </section>
      ) : null}

      <section className="surface space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{copy.location}</h2>
            <p className="mt-2 text-sm text-ink/60">{copy.locationDescription}</p>
            <p className="mt-2 text-sm text-ink/50">{copy.locationHelp}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
                className="text-lagoon transition hover:text-terracotta"
              >
                {copy.openGoogleMaps}
              </a>
            </div>
          </div>
          <div className="max-w-xs text-right">
            <Button
              variant="success"
              className="shadow-soft ring-4 ring-pine/15"
              onClick={useCurrentLocation}
            >
              <MapPinned className="mr-2 h-4 w-4" />
              {copy.useMyLocation}
            </Button>
            <p className="mt-2 text-xs leading-5 text-ink/55">{copy.locationButtonHint}</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="field-label">{copy.province}</label>
            <Select
              name={provinceField.name}
              ref={provinceField.ref}
              value={provinceValue || ""}
              onBlur={(event) => {
                provinceField.onBlur(event);
                clearErrors("province");
              }}
              onChange={(event) => {
                provinceField.onChange(event);
                setValue("province", event.target.value, { shouldValidate: true, shouldDirty: true });
                setValue("canton", "", { shouldValidate: true, shouldDirty: true });
                setValue("district", "", { shouldValidate: true, shouldDirty: true });
                clearErrors(["province", "canton", "district"]);
              }}
            >
              <option value="">{copy.selectProvince}</option>
              {provinces.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            {errors.province ? <p className="mt-2 text-sm text-red-600">{errors.province.message}</p> : null}
          </div>
          <div>
            <label className="field-label">{copy.canton}</label>
            <Select
              name={cantonField.name}
              ref={cantonField.ref}
              value={cantonValue || ""}
              disabled={!provinceValue}
              onBlur={(event) => {
                cantonField.onBlur(event);
                clearErrors("canton");
              }}
              onChange={(event) => {
                cantonField.onChange(event);
                setValue("canton", event.target.value, { shouldValidate: true, shouldDirty: true });
                setValue("district", "", { shouldValidate: true, shouldDirty: true });
                clearErrors(["canton", "district"]);
              }}
            >
              <option value="">{provinceValue ? copy.selectCanton : copy.firstProvince}</option>
              {cantonOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            {errors.canton ? <p className="mt-2 text-sm text-red-600">{errors.canton.message}</p> : null}
          </div>
          <div>
            <label className="field-label">{copy.district}</label>
            <Select
              name={districtField.name}
              ref={districtField.ref}
              value={districtValue || ""}
              disabled={!provinceValue || !cantonValue}
              onBlur={(event) => {
                districtField.onBlur(event);
                clearErrors("district");
              }}
              onChange={(event) => {
                districtField.onChange(event);
                setValue("district", event.target.value, { shouldValidate: true, shouldDirty: true });
                clearErrors("district");
              }}
            >
              <option value="">
                {provinceValue && cantonValue ? copy.selectDistrict : copy.firstCanton}
              </option>
              {districtOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            {errors.district ? <p className="mt-2 text-sm text-red-600">{errors.district.message}</p> : null}
          </div>
          <div>
            <label className="field-label">{copy.latitude}</label>
            <Input
              type="number"
              step="0.000001"
              name={latField.name}
              ref={latField.ref}
              onChange={latField.onChange}
              onBlur={(event) => {
                latField.onBlur(event);
                void syncLocationFromCurrentCoordinates();
              }}
            />
          </div>
          <div>
            <label className="field-label">{copy.longitude}</label>
            <Input
              type="number"
              step="0.000001"
              name={lngField.name}
              ref={lngField.ref}
              onChange={lngField.onChange}
              onBlur={(event) => {
                lngField.onBlur(event);
                void syncLocationFromCurrentCoordinates();
              }}
            />
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="field-label">{copy.neighborhood}</label>
            <Input {...register("neighborhood")} />
          </div>
          <div>
            <label className="field-label">{copy.exactAddress}</label>
            <Input {...register("exactAddress")} />
          </div>
        </div>
        <div>
          <label className="field-label">{copy.addressText}</label>
          <Input {...register("addressText")} />
        </div>

        <div className="rounded-[28px] border border-pine/15 bg-pine/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">{copy.serviceDistances}</h3>
              <p className="mt-2 text-sm text-ink/60">{copy.serviceDistancesHelp}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-pine">
              {isEnglish ? "Optional" : "Opcional"}
            </span>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div>
              <label className="field-label">{copy.hospitalDistance}</label>
              <Select {...register("serviceHospitalKm")}>
                <option value="">{copy.serviceDistancePlaceholder}</option>
                {serviceDistanceOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="field-label">{copy.schoolDistance}</label>
              <Select {...register("serviceSchoolKm")}>
                <option value="">{copy.serviceDistancePlaceholder}</option>
                {serviceDistanceOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="field-label">{copy.highSchoolDistance}</label>
              <Select {...register("serviceHighSchoolKm")}>
                <option value="">{copy.serviceDistancePlaceholder}</option>
                {serviceDistanceOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="surface space-y-5 p-6">
        <h2 className="text-2xl font-semibold">{copy.sellerInfo}</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="field-label">{copy.sellerName}</label>
            <Input {...register("sellerName")} />
          </div>
          <div>
            <label className="field-label">{copy.sellerPhone}</label>
            <Input {...register("sellerPhone")} />
          </div>
          <div>
            <label className="field-label">{copy.sellerEmail}</label>
            <Input {...register("sellerEmail")} />
          </div>
          <div>
            <label className="field-label">{copy.sellerRole}</label>
            <Select {...register("sellerRole")}>
              <option value="">{isEnglish ? "Select role" : "Selecciona rol"}</option>
              {sellerRoleOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="surface space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{copy.photos}</h2>
            <p className="mt-2 text-sm text-ink/60">{copy.photosHelp}</p>
            <p className="mt-2 text-xs text-ink/45">{copy.photosSaveHint}</p>
          </div>
          <label className="inline-flex cursor-pointer items-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">
            {isUploading ? copy.uploading : copy.uploadImages}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        {photos.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {photos.map((photo, index) => (
              <div key={`${photo.url}-${index}`} className="rounded-[24px] border border-ink/10 bg-white p-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={photo.url || fallbackSrc}
                    alt={photo.alt || watch("title")}
                    fill
                    unoptimized
                    sizes="(max-width: 1279px) 50vw, 25vw"
                    className="object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackSrc;
                    }}
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant={photo.isPrimary ? "accent" : "secondary"}
                    className="flex-1"
                    onClick={() => markAsPrimary(index)}
                  >
                    {photo.isPrimary ? copy.primary : copy.makePrimary}
                  </Button>
                  <Button variant="ghost" onClick={() => removePhoto(index)}>
                    {copy.remove}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/60">{copy.noPhotos}</p>
        )}

        <div className="border-t border-ink/10 pt-5">
          <label className="field-label">{copy.videos}</label>
          <Textarea
            placeholder={
              isEnglish
                ? "Paste one video URL per line. Example: https://..."
                : "Pega una URL de video por linea. Ejemplo: https://..."
            }
            {...register("videoUrls")}
          />
          <p className="mt-2 text-xs text-ink/45">{copy.videosHint}</p>
        </div>
      </section>

      <section className="surface flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-xl font-semibold">{copy.finalSaveTitle}</h2>
          <p className="mt-2 text-sm text-ink/60">{copy.finalSaveDescription}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            variant="accent"
            disabled={isSubmitting || isUploading}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isSubmitting ? copy.saving : propertyId ? copy.saveChanges : copy.saveProperty}
          </Button>
        </div>
      </section>
    </form>
  );
}
