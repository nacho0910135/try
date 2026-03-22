"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginUser, requestPasswordReset } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("loginForm.errorEmail")),
        password: z.string().min(1, t("loginForm.errorPassword"))
      }),
    [t]
  );

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
      setError(submitError.response?.data?.message || t("loginForm.submitFailed"));
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues("email");

    if (!email) {
      setResetMessage(t("loginForm.resetMissingEmail"));
      return;
    }

    try {
      const data = await requestPasswordReset({ email });
      setResetMessage(
        data.resetTokenPreview
          ? t("loginForm.resetReady", { token: data.resetTokenPreview })
          : data.message
      );
    } catch (_error) {
      setResetMessage(t("loginForm.resetFailed"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface space-y-5 p-8">
      <div>
        <span className="eyebrow">{t("loginForm.eyebrow")}</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold">{t("loginForm.title")}</h1>
        <p className="mt-3 text-sm text-ink/60">{t("loginForm.description")}</p>
      </div>

      <div>
        <label className="field-label">{t("loginForm.email")}</label>
        <Input type="email" placeholder={t("loginForm.emailPlaceholder")} {...register("email")} />
        {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
      </div>

      <div>
        <label className="field-label">{t("loginForm.password")}</label>
        <Input type="password" placeholder={t("loginForm.passwordPlaceholder")} {...register("password")} />
        {errors.password ? (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
      {resetMessage ? (
        <p className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/70">{resetMessage}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("loginForm.submitting") : t("loginForm.submit")}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-ink/60">
        <button type="button" onClick={handleForgotPassword} className="font-medium text-lagoon">
          {t("loginForm.forgotPassword")}
        </button>
        <p>
          {t("loginForm.noAccount")}{" "}
          <Link href="/register" className="font-semibold text-terracotta">
            {t("loginForm.register")}
          </Link>
        </p>
      </div>
    </form>
  );
}
