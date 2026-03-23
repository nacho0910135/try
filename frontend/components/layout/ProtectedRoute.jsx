"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { getCurrentUser } from "@/lib/api";
import { LoadingState } from "../ui/LoadingState";

export function ProtectedRoute({ children, roles }) {
  const router = useRouter();
  const { hydrated, token, user, setUser, logout } = useAuthStore();
  const [resolvingUser, setResolvingUser] = useState(false);

  useEffect(() => {
    if (!hydrated || !token || user || resolvingUser) {
      return;
    }

    let cancelled = false;

    const resolveCurrentUser = async () => {
      try {
        setResolvingUser(true);
        const data = await getCurrentUser();

        if (!cancelled) {
          setUser(data.user);
        }
      } catch (_error) {
        if (!cancelled) {
          logout();
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setResolvingUser(false);
        }
      }
    };

    resolveCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [hydrated, token, user, resolvingUser, setUser, logout, router]);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (roles?.length && user && !roles.includes(user?.role)) {
      router.replace("/");
    }
  }, [hydrated, token, user, roles, router]);

  if (!hydrated || (token && (!user || resolvingUser))) {
    return <LoadingState label="Validando sesion..." />;
  }

  if (!token || (roles?.length && user && !roles.includes(user?.role))) {
    return <LoadingState label="Redirigiendo..." />;
  }

  return children;
}
