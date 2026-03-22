"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { LoadingState } from "../ui/LoadingState";

export function ProtectedRoute({ children, roles }) {
  const router = useRouter();
  const { hydrated, token, user } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (roles?.length && !roles.includes(user?.role)) {
      router.replace("/");
    }
  }, [hydrated, token, user, roles, router]);

  if (!hydrated) {
    return <LoadingState label="Validando sesion..." />;
  }

  if (!token || (roles?.length && !roles.includes(user?.role))) {
    return <LoadingState label="Redirigiendo..." />;
  }

  return children;
}

