"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createLead } from "@/lib/api";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

const leadSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre"),
  email: z.string().email("Ingresa un correo valido"),
  phone: z.string().min(7, "Ingresa un telefono valido"),
  message: z.string().min(10, "Escribe un mensaje con un poco mas de detalle")
});

export function ContactLeadForm({
  propertyId,
  propertyTitle,
  propertySlug,
  businessType,
  propertyType,
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
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "Hola, me interesa recibir mas informacion sobre esta propiedad."
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
      await createLead({
        propertyId,
        ...values
      });
      trackEvent(analyticsEvents.leadSubmitted, {
        propertyId,
        propertyTitle,
        propertySlug,
        businessType,
        propertyType
      });
      setFeedback("Tu mensaje fue enviado correctamente.");
      reset({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        message: "Hola, me interesa recibir mas informacion sobre esta propiedad."
      });
    } catch (error) {
      setFeedback(error.response?.data?.message || "No fue posible enviar el mensaje");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={embedded ? "space-y-4" : "surface space-y-4 p-6"}
    >
      {!embedded ? (
        <div>
          <h3 className="text-xl font-semibold">Contactar anunciante</h3>
          <p className="mt-2 text-sm text-ink/60">
            El lead quedara asociado a la propiedad y al propietario o agente correspondiente.
          </p>
        </div>
      ) : null}

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
      <div>
        <label className="field-label">Telefono</label>
        <Input {...register("phone")} />
        {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p> : null}
      </div>
      <div>
        <label className="field-label">Mensaje</label>
        <Textarea {...register("message")} />
        {errors.message ? (
          <p className="mt-2 text-sm text-red-600">{errors.message.message}</p>
        ) : null}
      </div>

      {feedback ? <p className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/70">{feedback}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar consulta"}
      </Button>
    </form>
  );
}
