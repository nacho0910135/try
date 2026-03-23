"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createOffer } from "@/lib/api";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

const offerSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre"),
  email: z.string().email("Ingresa un correo valido"),
  phone: z.string().min(7, "Ingresa un telefono valido"),
  amount: z.coerce.number().positive("Ingresa un monto valido"),
  message: z.string().min(4, "Agrega un mensaje corto")
});

export function OfferForm({
  propertyId,
  propertyTitle,
  propertySlug,
  propertyType,
  businessType = "sale",
  currency = "USD",
  askingPrice = 0,
  embedded = false
}) {
  const { user } = useAuthStore();
  const [feedback, setFeedback] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      amount: askingPrice || "",
      message:
        businessType === "rent"
          ? "Quiero proponer una renta para esta propiedad."
          : "Quiero presentar una oferta por esta propiedad."
    }
  });

  useEffect(() => {
    if (!user) return;
    setValue("name", user.name || "");
    setValue("email", user.email || "");
    setValue("phone", user.phone || "");
  }, [user, setValue]);

  const onSubmit = async (values) => {
    try {
      setFeedback("");
      await createOffer({
        propertyId,
        ...values,
        currency,
        source: "property-page"
      });
      trackEvent(analyticsEvents.offerSubmitted, {
        propertyId,
        propertyTitle,
        propertySlug,
        propertyType,
        businessType,
        currency
      });
      setFeedback("Tu oferta fue enviada correctamente al anunciante.");
      reset({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        amount: askingPrice || "",
        message:
          businessType === "rent"
            ? "Quiero proponer una renta para esta propiedad."
            : "Quiero presentar una oferta por esta propiedad."
      });
    } catch (error) {
      setFeedback(error.response?.data?.message || "No fue posible enviar la oferta.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={embedded ? "space-y-4" : "surface space-y-4 p-6"}
    >
      {!embedded ? (
        <div>
          <h3 className="text-xl font-semibold">
            {businessType === "rent" ? "Proponer renta" : "Enviar oferta"}
          </h3>
          <p className="mt-2 text-sm text-ink/60">
            El anunciante recibira tu propuesta con monto y mensaje. Precio publicado:{" "}
            <strong>{formatCurrency(askingPrice, currency)}</strong>
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label">Nombre</label>
          <Input {...register("name")} />
          {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="field-label">Correo</label>
          <Input type="email" {...register("email")} />
          {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <label className="field-label">Telefono</label>
          <Input {...register("phone")} />
          {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p> : null}
        </div>
        <div>
          <label className="field-label">
            {businessType === "rent" ? "Monto mensual propuesto" : "Monto de la oferta"} ({currency})
          </label>
          <Input type="number" min="1" step="1" {...register("amount")} />
          {errors.amount ? (
            <p className="mt-2 text-sm text-red-600">{errors.amount.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="field-label">Mensaje</label>
        <Textarea {...register("message")} />
        {errors.message ? (
          <p className="mt-2 text-sm text-red-600">{errors.message.message}</p>
        ) : null}
      </div>

      {feedback ? (
        <p className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/70">{feedback}</p>
      ) : null}

      <Button type="submit" variant="success" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? businessType === "rent"
            ? "Enviando propuesta..."
            : "Enviando oferta..."
          : businessType === "rent"
            ? "Enviar propuesta"
            : "Enviar oferta"}
      </Button>
    </form>
  );
}
