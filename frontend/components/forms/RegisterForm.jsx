"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerUser } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

const registerSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre"),
  email: z.string().email("Ingresa un correo valido"),
  phone: z.string().min(7, "Ingresa un telefono valido"),
  role: z.enum(["user", "agent", "owner"]),
  password: z.string().min(8, "Minimo 8 caracteres")
});

export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "user",
      password: ""
    }
  });

  const onSubmit = async (values) => {
    try {
      setError("");
      const data = await registerUser(values);
      setAuth({ token: data.token, user: data.user });
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      if (!submitError.response) {
        setError(
          "No se pudo conectar con la API. Verifica que el backend este corriendo y que el origen del frontend este permitido."
        );
        return;
      }

      const fieldDetails = submitError.response?.data?.details;
      const firstDetail = fieldDetails
        ? Object.values(fieldDetails).flat().find(Boolean)
        : null;

      setError(firstDetail || submitError.response?.data?.message || "No se pudo crear la cuenta");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface space-y-5 p-8">
      <div>
        <span className="eyebrow">Registro</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold">Crea tu cuenta</h1>
        <p className="mt-3 text-sm text-ink/60">
          Publica propiedades, guarda favoritas y gestiona leads en una sola plataforma.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="field-label">Nombre</label>
          <Input placeholder="Tu nombre" {...register("name")} />
          {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="field-label">Telefono</label>
          <Input placeholder="+506..." {...register("phone")} />
          {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p> : null}
        </div>
        <div>
          <label className="field-label">Correo</label>
          <Input type="email" placeholder="correo@ejemplo.com" {...register("email")} />
          {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="field-label">Perfil</label>
          <Select {...register("role")}>
            <option value="user">Usuario</option>
            <option value="agent">Agente</option>
            <option value="owner">Propietario</option>
          </Select>
          {errors.role ? <p className="mt-2 text-sm text-red-600">{errors.role.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="field-label">Contrasena</label>
        <Input type="password" placeholder="Crea una contrasena segura" {...register("password")} />
        {errors.password ? (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-sm text-ink/60">
        Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-terracotta">
          Inicia sesion
        </Link>
      </p>
    </form>
  );
}
