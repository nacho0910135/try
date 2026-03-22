"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createProperty, updateProperty, uploadPropertyImages } from "@/lib/api";
import {
  amenitySuggestions,
  businessTypes,
  currencies,
  propertyStatuses,
  propertyTypes,
  provinces
} from "@/lib/constants";
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
  propertyType: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  currency: z.string().min(1),
  bedrooms: z.coerce.number().nonnegative(),
  bathrooms: z.coerce.number().nonnegative(),
  parkingSpaces: z.coerce.number().nonnegative(),
  constructionArea: z.coerce.number().nonnegative(),
  lotArea: z.coerce.number().nonnegative(),
  amenities: z.string(),
  status: z.string().min(1),
  province: z.string().min(2),
  canton: z.string().min(2),
  district: z.string().min(2),
  neighborhood: z.string(),
  exactAddress: z.string(),
  lat: z.coerce.number(),
  lng: z.coerce.number()
});

const toDefaultValues = (property) => ({
  title: property?.title || "",
  description: property?.description || "",
  businessType: property?.businessType || "sale",
  propertyType: property?.propertyType || "house",
  price: property?.price || 0,
  currency: property?.currency || "USD",
  bedrooms: property?.bedrooms || 0,
  bathrooms: property?.bathrooms || 0,
  parkingSpaces: property?.parkingSpaces || 0,
  constructionArea: property?.constructionArea || 0,
  lotArea: property?.lotArea || 0,
  furnished: property?.furnished || false,
  petsAllowed: property?.petsAllowed || false,
  status: property?.status || "draft",
  amenities: property?.amenities?.join(", ") || "",
  province: property?.address?.province || "San Jose",
  canton: property?.address?.canton || "",
  district: property?.address?.district || "",
  neighborhood: property?.address?.neighborhood || "",
  exactAddress: property?.address?.exactAddress || "",
  hideExactLocation: property?.address?.hideExactLocation ?? true,
  lat: property?.location?.coordinates?.[1] || 9.9281,
  lng: property?.location?.coordinates?.[0] || -84.0907
});

export function PropertyForm({ property, propertyId }) {
  const router = useRouter();
  const [photos, setPhotos] = useState(property?.photos || []);
  const [feedback, setFeedback] = useState("");
  const [isUploading, setIsUploading] = useState(false);
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

  useEffect(() => {
    reset(toDefaultValues(property));
    setPhotos(property?.photos || []);
  }, [property, reset]);

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
      setFeedback("Fotos cargadas correctamente.");
    } catch (error) {
      setFeedback(error.response?.data?.message || "No fue posible subir las imagenes");
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
      },
      () => {
        setFeedback("No se pudo obtener tu ubicacion actual.");
      }
    );
  };

  const onSubmit = async (values) => {
    try {
      setFeedback("");
      const payload = buildPropertyPayload(values, photos);

      if (propertyId) {
        await updateProperty(propertyId, payload);
      } else {
        await createProperty(payload);
      }

      router.push("/dashboard/properties");
      router.refresh();
    } catch (error) {
      setFeedback(error.response?.data?.message || "No se pudo guardar la propiedad");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        {feedback ? <p className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/70">{feedback}</p> : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="field-label">Titulo</label>
            <Input {...register("title")} />
            {errors.title ? <p className="mt-2 text-sm text-red-600">{errors.title.message}</p> : null}
          </div>
          <div>
            <label className="field-label">Precio</label>
            <Input type="number" {...register("price")} />
            {errors.price ? <p className="mt-2 text-sm text-red-600">{errors.price.message}</p> : null}
          </div>
        </div>

        <div>
          <label className="field-label">Descripcion</label>
          <Textarea {...register("description")} />
          {errors.description ? (
            <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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
            <label className="field-label">Area lote</label>
            <Input type="number" {...register("lotArea")} />
          </div>
        </div>
        <div className="flex flex-wrap gap-5">
          <Checkbox label="Amueblado" {...register("furnished")} />
          <Checkbox label="Mascotas permitidas" {...register("petsAllowed")} />
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

      <section className="surface space-y-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Ubicacion</h2>
            <p className="mt-2 text-sm text-ink/60">
              Usa coordenadas para que la propiedad aparezca en mapa, busquedas cercanas y poligonos.
            </p>
          </div>
          <Button variant="secondary" onClick={useCurrentLocation}>
            Usar mi ubicacion
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="field-label">Provincia</label>
            <Select {...register("province")}>
              {provinces.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">Canton</label>
            <Input {...register("canton")} />
            {errors.canton ? <p className="mt-2 text-sm text-red-600">{errors.canton.message}</p> : null}
          </div>
          <div>
            <label className="field-label">Distrito</label>
            <Input {...register("district")} />
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
      </section>

      <section className="surface space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Fotos</h2>
            <p className="mt-2 text-sm text-ink/60">
              Sube multiples imagenes y define una principal para cards y detalle.
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
                  <Image src={photo.url} alt={photo.alt || watch("title")} fill className="object-cover" />
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
      </section>
    </form>
  );
}
