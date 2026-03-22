"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { resetPasswordUser } from "@/lib/api";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function ResetPasswordForm({ token = "" }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const resetSchema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(8, t("resetPasswordForm.minLength")),
          confirmPassword: z.string().min(8, t("resetPasswordForm.minLength"))
        })
        .refine((values) => values.password === values.confirmPassword, {
          path: ["confirmPassword"],
          message: t("resetPasswordForm.mismatch")
        }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values) => {
    try {
      setError("");
      setFeedback("");
      await resetPasswordUser({
        token,
        password: values.password
      });
      setFeedback(t("resetPasswordForm.success"));
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1200);
    } catch (submitError) {
      setError(submitError.response?.data?.message || t("loginForm.resetFailed"));
    }
  };

  if (!token) {
    return (
      <div className="surface space-y-5 p-8">
        <div>
          <span className="eyebrow">{t("resetPasswordForm.eyebrow")}</span>
          <h1 className="mt-4 font-serif text-4xl font-semibold">
            {t("resetPasswordForm.title")}
          </h1>
          <p className="mt-3 text-sm text-ink/60">{t("resetPasswordForm.invalidToken")}</p>
        </div>
        <Link href="/login">
          <Button variant="secondary">{t("loginForm.submit")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface space-y-5 p-8">
      <div>
        <span className="eyebrow">{t("resetPasswordForm.eyebrow")}</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold">
          {t("resetPasswordForm.title")}
        </h1>
        <p className="mt-3 text-sm text-ink/60">{t("resetPasswordForm.description")}</p>
      </div>

      <div>
        <label className="field-label">{t("resetPasswordForm.password")}</label>
        <Input
          type="password"
          placeholder={t("resetPasswordForm.passwordPlaceholder")}
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      <div>
        <label className="field-label">{t("resetPasswordForm.confirmPassword")}</label>
        <Input
          type="password"
          placeholder={t("resetPasswordForm.confirmPasswordPlaceholder")}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
      {feedback ? (
        <p className="rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{feedback}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("resetPasswordForm.submitting") : t("resetPasswordForm.submit")}
      </Button>
    </form>
  );
}
