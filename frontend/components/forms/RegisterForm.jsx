"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerUser } from "@/lib/api";
import { getAuthenticatedHomePath } from "@/lib/user-access";
import { useAuthStore } from "@/store/auth-store";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const registerSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("registerForm.errorName")),
        email: z.string().email(t("registerForm.errorEmail")),
        phone: z.string().min(7, t("registerForm.errorPhone")),
        role: z.enum(["agent", "owner"]),
        password: z.string().min(8, t("registerForm.errorPassword"))
      }),
    [t]
  );

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
      role: "owner",
      password: ""
    }
  });

  const onSubmit = async (values) => {
    try {
      setError("");
      const data = await registerUser(values);
      setAuth({ token: data.token, user: data.user });
      router.push(getAuthenticatedHomePath(data.user));
      router.refresh();
    } catch (submitError) {
      if (!submitError.response) {
        setError(t("registerForm.connectionError"));
        return;
      }

      const fieldDetails = submitError.response?.data?.details;
      const firstDetail = fieldDetails
        ? Object.values(fieldDetails).flat().find(Boolean)
        : null;

      setError(firstDetail || submitError.response?.data?.message || t("registerForm.submitFailed"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface space-y-5 p-8">
      <div>
        <span className="eyebrow">{t("registerForm.eyebrow")}</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold">{t("registerForm.title")}</h1>
        <p className="mt-3 text-sm text-ink/60">{t("registerForm.description")}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="field-label">{t("registerForm.name")}</label>
          <Input placeholder={t("registerForm.namePlaceholder")} {...register("name")} />
          {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="field-label">{t("registerForm.phone")}</label>
          <Input placeholder={t("registerForm.phonePlaceholder")} {...register("phone")} />
          {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p> : null}
        </div>
        <div>
          <label className="field-label">{t("registerForm.email")}</label>
          <Input type="email" placeholder={t("registerForm.emailPlaceholder")} {...register("email")} />
          {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="field-label">{t("registerForm.profile")}</label>
          <Select {...register("role")}>
            <option value="agent">{t("registerForm.roleAgent")}</option>
            <option value="owner">{t("registerForm.roleOwner")}</option>
          </Select>
          {errors.role ? <p className="mt-2 text-sm text-red-600">{errors.role.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="field-label">{t("registerForm.password")}</label>
        <Input type="password" placeholder={t("registerForm.passwordPlaceholder")} {...register("password")} />
        {errors.password ? (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("registerForm.submitting") : t("registerForm.submit")}
      </Button>

      <p className="text-sm text-ink/60">
        {t("registerForm.alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-semibold text-terracotta">
          {t("registerForm.login")}
        </Link>
      </p>
    </form>
  );
}
