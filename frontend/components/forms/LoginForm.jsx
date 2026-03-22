"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginUser, requestPasswordReset } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo valido"),
  password: z.string().min(1, "Ingresa tu contrasena")
});

export function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values) => {
    try {
      setError("");
      const data = await loginUser(values);
      setAuth({ token: data.token, user: data.user });
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError.response?.data?.message || "No se pudo iniciar sesion");
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues("email");

    if (!email) {
      setResetMessage("Ingresa tu correo y luego vuelve a intentar.");
      return;
    }

    try {
      const data = await requestPasswordReset({ email });
      setResetMessage(
        data.resetTokenPreview
          ? `Flujo preparado. Token temporal de desarrollo: ${data.resetTokenPreview}`
          : data.message
      );
    } catch (_error) {
      setResetMessage("No fue posible iniciar la recuperacion en este momento.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface space-y-5 p-8">
      <div>
        <span className="eyebrow">Acceso</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold">Bienvenido de vuelta</h1>
        <p className="mt-3 text-sm text-ink/60">
          Administra publicaciones, favoritos y leads desde tu panel.
        </p>
      </div>

      <div>
        <label className="field-label">Correo</label>
        <Input type="email" placeholder="correo@ejemplo.com" {...register("email")} />
        {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
      </div>

      <div>
        <label className="field-label">Contrasena</label>
        <Input type="password" placeholder="Tu contrasena" {...register("password")} />
        {errors.password ? (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
      {resetMessage ? (
        <p className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/70">{resetMessage}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-ink/60">
        <button type="button" onClick={handleForgotPassword} className="font-medium text-lagoon">
          Preparar recuperacion
        </button>
        <p>
          No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-terracotta">
            Registrate
          </Link>
        </p>
      </div>
    </form>
  );
}

