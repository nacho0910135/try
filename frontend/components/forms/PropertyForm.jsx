"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPinned } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createProperty, updateProperty, uploadPropertyImages } from "@/lib/api";
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
import { buildPropertyPayload } from "@/lib/utils";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

const propertyFormSchema = z.object({
  title: z.string().min(10, "Minimo 10 caracteres"),
  description: z.string().min(40, "Describe mejor la propiedad"),
  businessType: z.string().min(1),
  rentalArrangement: z.string().optional(),
  propertyType: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  finalPrice: z.union([z.coerce.number().nonnegative(), z.literal("")]).optional(),
  currency: z.string().min(1),
  bedrooms: z.coerce.number().nonnegative(),
  bathrooms: z.coerce.number().nonnegative(),
  parkingSpaces: z.coerce.number().nonnegative(),
  constructionArea: z.coerce.number().nonnegative(),
  landArea: z.coerce.number().nonnegative(),
  furnished: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  depositRequired: z.boolean().optional(),
  amenities: z.string(),
  status: z.string().min(1),
  marketStatus: z.string().min(1),
  province: z.string().min(2),
  canton: z.string().min(2),
  district: z.string().min(2),
  neighborhood: z.string(),
  exactAddress: z.string(),
  addressText: z.string(),
  sellerName: z.string(),
  sellerPhone: z.string(),
  sellerEmail: z.string(),
  sellerRole: z.string(),
  videoUrls: z.string(),
  hideExactLocation: z.boolean().optional(),
  privateRoom: z.boolean().optional(),
  privateBathroom: z.boolean().optional(),
  utilitiesIncluded: z.boolean().optional(),
  studentFriendly: z.boolean().optional(),
  availableRooms: z.coerce.number().nonnegative(),
  currentRoommates: z.coerce.number().nonnegative(),
  maxRoommates: z.coerce.number().nonnegative(),
  genderPreference: z.string(),
  sharedAreas: z.string(),
  lat: z.coerce.number(),
  lng: z.coerce.number()
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
  province: property?.address?.province || "San Jose",
  canton: property?.address?.canton || "",
  district: property?.address?.district || "",
  neighborhood: property?.address?.neighborhood || "",
  exactAddress: property?.address?.exactAddress || "",
  addressText: property?.addressText || property?.address?.exactAddress || "",
  sellerName: property?.sellerInfo?.name || property?.owner?.name || "",
  sellerPhone: property?.sellerInfo?.phone || property?.owner?.phone || "",
  sellerEmail: property?.sellerInfo?.email || "",
  sellerRole: property?.sellerInfo?.role || property?.owner?.role || "",
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
  lat: property?.location?.coordinates?.[1] || 9.9281,
  lng: property?.location?.coordinates?.[0] || -84.0907
});

export function PropertyForm({ property, propertyId }) {
  const router = useRouter();
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
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: toDefaultValues(property)
  });
  const businessTypeValue = watch("businessType");
  const propertyTypeValue = watch("propertyType");
  const rentalArrangementValue = watch("rentalArrangement");
  const provinceValue = watch("province");
  const cantonValue = watch("canton");
  const districtValue = watch("district");
  const latValue = watch("lat");
  const lngValue = watch("lng");
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
  const googleMapsCoordinatesUrl = `https://www.google.com/maps/search/?api=1&query=${latValue},${lngValue}`;

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
    }
  }, [districtValue, rawDistrictOptions, setValue]);

  useEffect(() => {
    if (businessTypeValue !== "rent") {
      setValue("rentalArrangement", "full-property", {
        shouldValidate: true,
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
      setFeedback("Fotos cargadas correctamente. Ahora pulsa Guardar propiedad para guardar los cambios.");
    } catch (error) {
      const firstDetail = findFirstMessage(error.response?.data?.details);
      setFeedbackTone("error");
      setFeedback(firstDetail || error.response?.data?.message || "No fue posible subir las imagenes");
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

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("lat", Number(position.coords.latitude.toFixed(6)));
        setValue("lng", Number(position.coords.longitude.toFixed(6)));
        setFeedbackTone("success");
        setFeedback("Ubicacion detectada correctamente. Ya puedes guardar tu propiedad.");
      },
      () => {
        setFeedbackTone("error");
        setFeedback("No se pudo obtener tu ubicacion actual.");
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

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "alquiventascr-property-flash",
          propertyId
            ? "Tu publicacion se actualizo correctamente."
            : "Tu publicacion se guardo correctamente y ya aparece en tu panel."
        );
      }

      setFeedback(
        propertyId
          ? "Publicacion actualizada correctamente. Redirigiendo..."
          : "Publicacion creada correctamente. Redirigiendo..."
      );
      setFeedbackTone("success");

      window.setTimeout(() => {
        router.push("/dashboard/properties?saved=1");
        router.refresh();
      }, 700);
    } catch (error) {
      const firstDetail = findFirstMessage(error.response?.data?.details);
      const permissionMessage =
        error.response?.status === 403
          ? "Tu cuenta debe tener permiso para publicar. Si entraste con otro perfil, vuelve a iniciar sesion como propietario, agente o admin."
          : null;

      setFeedbackTone("error");
      setFeedback(
        firstDetail ||
          permissionMessage ||
          error.response?.data?.message ||
          "No se pudo guardar la propiedad"
      );
    }
  };

  const onInvalid = (formErrors) => {
    const firstMessage = findFirstMessage(formErrors);
    setFeedbackTone("error");
    setFeedback(firstMessage || "Revisa los campos obligatorios antes de guardar.");
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
            <span className="eyebrow">{propertyId ? "Editar" : "Nueva propiedad"}</span>
            <h1 className="mt-4 font-serif text-4xl font-semibold">
              {propertyId ? "Actualiza tu publicacion" : "Crea una publicacion"}
            </h1>
          </div>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? "Guardando..." : "Guardar propiedad"}
          </Button>
        </div>

        {feedback ? (
          <p className={`rounded-2xl px-4 py-3 text-sm ${feedbackClassName}`}>{feedback}</p>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="field-label">Titulo</label>
            <Input {...register("title")} />
            {errors.title ? <p className="mt-2 text-sm text-red-600">{errors.title.message}</p> : null}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="field-label">Precio</label>
              <Input type="number" {...register("price")} />
              {errors.price ? <p className="mt-2 text-sm text-red-600">{errors.price.message}</p> : null}
            </div>
            <div>
              <label className="field-label">Precio final</label>
              <Input type="number" {...register("finalPrice")} />
            </div>
          </div>
        </div>

        <div>
          <label className="field-label">Descripcion</label>
          <Textarea {...register("description")} />
          {errors.description ? (
            <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="field-label">Negocio</label>
            <Select {...register("businessType")}>
              {businessTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">Modalidad de renta</label>
            <Select {...register("rentalArrangement")} disabled={businessTypeValue !== "rent"}>
              {rentalArrangements.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">Tipo de propiedad</label>
            <Select {...register("propertyType")}>
              {propertyTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">Moneda</label>
            <Select {...register("currency")}>
              {currencies.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">Estado</label>
            <Select {...register("status")}>
              {propertyStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">Estado de mercado</label>
            <Select {...register("marketStatus")}>
              {marketStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="surface space-y-5 p-6">
        <h2 className="text-2xl font-semibold">Caracteristicas</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="field-label">Habitaciones</label>
            <Input type="number" {...register("bedrooms")} />
          </div>
          <div>
            <label className="field-label">Banos</label>
            <Input type="number" {...register("bathrooms")} />
          </div>
          <div>
            <label className="field-label">Parqueos</label>
            <Input type="number" {...register("parkingSpaces")} />
          </div>
          <div>
            <label className="field-label">Area construccion</label>
            <Input type="number" {...register("constructionArea")} />
          </div>
          <div>
            <label className="field-label">Area terreno</label>
            <Input type="number" {...register("landArea")} />
          </div>
        </div>
        <div className="flex flex-wrap gap-5">
          <Checkbox label="Amueblado" {...register("furnished")} />
          <Checkbox
            label={businessTypeValue === "rent" ? "Acepta mascotas" : "Mascotas permitidas"}
            {...register("petsAllowed")}
          />
          {businessTypeValue === "rent" ? (
            <Checkbox label="Requiere deposito" {...register("depositRequired")} />
          ) : null}
          <Checkbox label="Ocultar ubicacion exacta" {...register("hideExactLocation")} />
        </div>
        <div>
          <label className="field-label">Amenidades</label>
          <Input
            placeholder={`Ejemplo: ${amenitySuggestions.slice(0, 4).join(", ")}`}
            {...register("amenities")}
          />
          <p className="mt-2 text-xs text-ink/45">Separa cada amenidad con coma.</p>
        </div>
      </section>

      {showRoommateSection ? (
        <section className="surface space-y-5 p-6">
          <h2 className="text-2xl font-semibold">Roomies / alquiler compartido</h2>
          <p className="text-sm text-ink/60">
            Usa esta seccion para publicar cuartos, alquileres compartidos o espacios comunes para estudiantes y profesionales.
          </p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="field-label">Cuartos disponibles</label>
              <Input type="number" {...register("availableRooms")} />
            </div>
            <div>
              <label className="field-label">Roomies actuales</label>
              <Input type="number" {...register("currentRoommates")} />
            </div>
            <div>
              <label className="field-label">Maximo de roomies</label>
              <Input type="number" {...register("maxRoommates")} />
            </div>
            <div>
              <label className="field-label">Preferencia</label>
              <Select {...register("genderPreference")}>
                {roommateGenderPreferences.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            <Checkbox label="Cuarto privado" {...register("privateRoom")} />
            <Checkbox label="Bano privado" {...register("privateBathroom")} />
            <Checkbox label="Servicios incluidos" {...register("utilitiesIncluded")} />
            <Checkbox label="Apto para estudiantes" {...register("studentFriendly")} />
          </div>
          <div>
            <label className="field-label">Areas compartidas</label>
            <Input
              placeholder="Ejemplo: Cocina, sala, lavanderia, terraza"
              {...register("sharedAreas")}
            />
          </div>
        </section>
      ) : null}

      <section className="surface space-y-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Ubicacion</h2>
            <p className="mt-2 text-sm text-ink/60">
              Usa coordenadas para que la propiedad aparezca en mapa, busquedas cercanas y poligonos.
            </p>
            <p className="mt-2 text-sm text-ink/50">
              Puedes obtener latitud y longitud en Google Maps: abre el mapa, haz clic derecho sobre el punto y copia las coordenadas que aparecen abajo.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
                className="text-lagoon transition hover:text-terracotta"
              >
                Abrir Google Maps
              </a>
              <a
                href={googleMapsCoordinatesUrl}
                target="_blank"
                rel="noreferrer"
                className="text-lagoon transition hover:text-terracotta"
              >
                Ver coordenadas actuales
              </a>
            </div>
          </div>
          <Button
            variant="success"
            className="shadow-soft ring-4 ring-pine/15"
            onClick={useCurrentLocation}
          >
            <MapPinned className="mr-2 h-4 w-4" />
            Usar mi ubicacion
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="field-label">Provincia</label>
            <Select
              {...register("province")}
              onChange={(event) => {
                setValue("province", event.target.value, { shouldValidate: true, shouldDirty: true });
                setValue("canton", "", { shouldValidate: true, shouldDirty: true });
                setValue("district", "", { shouldValidate: true, shouldDirty: true });
              }}
            >
              {provinces.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">Canton</label>
            <Select
              {...register("canton")}
              disabled={!provinceValue}
              onChange={(event) => {
                setValue("canton", event.target.value, { shouldValidate: true, shouldDirty: true });
                setValue("district", "", { shouldValidate: true, shouldDirty: true });
              }}
            >
              <option value="">{provinceValue ? "Selecciona canton" : "Primero provincia"}</option>
              {cantonOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            {errors.canton ? <p className="mt-2 text-sm text-red-600">{errors.canton.message}</p> : null}
          </div>
          <div>
            <label className="field-label">Distrito</label>
            <Select {...register("district")} disabled={!provinceValue || !cantonValue}>
              <option value="">
                {provinceValue && cantonValue ? "Selecciona distrito" : "Primero canton"}
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
            <label className="field-label">Latitud</label>
            <Input type="number" step="0.000001" {...register("lat")} />
          </div>
          <div>
            <label className="field-label">Longitud</label>
            <Input type="number" step="0.000001" {...register("lng")} />
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="field-label">Barrio o zona</label>
            <Input {...register("neighborhood")} />
          </div>
          <div>
            <label className="field-label">Direccion exacta</label>
            <Input {...register("exactAddress")} />
          </div>
        </div>
        <div>
          <label className="field-label">Ubicacion textual para mostrar</label>
          <Input {...register("addressText")} />
        </div>
      </section>

      <section className="surface space-y-5 p-6">
        <h2 className="text-2xl font-semibold">Seller info</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="field-label">Nombre</label>
            <Input {...register("sellerName")} />
          </div>
          <div>
            <label className="field-label">Telefono</label>
            <Input {...register("sellerPhone")} />
          </div>
          <div>
            <label className="field-label">Correo</label>
            <Input {...register("sellerEmail")} />
          </div>
          <div>
            <label className="field-label">Rol visible</label>
            <Input {...register("sellerRole")} />
          </div>
        </div>
      </section>

      <section className="surface space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Fotos</h2>
            <p className="mt-2 text-sm text-ink/60">
              Sube multiples imagenes y define una principal para cards y detalle.
            </p>
            <p className="mt-2 text-xs text-ink/45">
              Subir imagenes no guarda la propiedad por si solo. Despues de cargarlas, usa Guardar propiedad.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">
            {isUploading ? "Subiendo..." : "Subir imagenes"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        {photos.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {photos.map((photo, index) => (
              <div key={`${photo.url}-${index}`} className="rounded-[24px] border border-ink/10 bg-white p-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <img
                    src={photo.url || fallbackSrc}
                    alt={photo.alt || watch("title")}
                    className="absolute inset-0 h-full w-full object-cover"
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
                    {photo.isPrimary ? "Principal" : "Hacer principal"}
                  </Button>
                  <Button variant="ghost" onClick={() => removePhoto(index)}>
                    Quitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/60">
            Puedes publicar sin fotos, pero la experiencia mejora mucho al agregar varias.
          </p>
        )}

        <div className="border-t border-ink/10 pt-5">
          <label className="field-label">Videos</label>
          <Textarea
            placeholder="Pega una URL de video por linea. Ejemplo: https://..."
            {...register("videoUrls")}
          />
          <p className="mt-2 text-xs text-ink/45">
            El schema ya soporta multimedia. Para upload real de video solo faltaria conectar almacenamiento externo.
          </p>
        </div>
      </section>

      <section className="surface flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-xl font-semibold">Guardar cambios</h2>
          <p className="mt-2 text-sm text-ink/60">
            Usa este boton final para guardar la propiedad despues de revisar fotos, ubicacion y detalles.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            variant="accent"
            disabled={isSubmitting || isUploading}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isSubmitting ? "Guardando..." : propertyId ? "Guardar cambios" : "Guardar propiedad"}
          </Button>
        </div>
      </section>
    </form>
  );
}
