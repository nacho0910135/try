"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { capturePayPalOrder } from "@/lib/api";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";

function PayPalReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const cancelled = searchParams.get("cancelled") === "1";
    const orderId = searchParams.get("token");
    const kind = searchParams.get("kind") || "donation";

    if (cancelled) {
      router.replace(
        kind === "boost"
          ? "/dashboard/properties?paypal=boost-cancelled"
          : "/dashboard/business?paypal=donation-cancelled"
      );
      return;
    }

    if (!orderId) {
      setErrorMessage("PayPal no devolvio un token de checkout valido.");
      return;
    }

    const confirmOrder = async () => {
      try {
        const data = await capturePayPalOrder(orderId);
        router.replace(data.capture.redirectPath || "/dashboard/business");
      } catch (error) {
        const redirectPath = error.response?.data?.details?.redirectPath;

        if (redirectPath) {
          router.replace(redirectPath);
          return;
        }

        setErrorMessage(
          error.response?.data?.message || "No pudimos confirmar tu pago de PayPal."
        );
      }
    };

    confirmOrder();
  }, [router, searchParams]);

  if (!errorMessage) {
    return <LoadingState label="Confirmando tu pago con PayPal..." />;
  }

  return (
    <section className="surface mx-auto max-w-2xl p-8">
      <span className="eyebrow">PayPal</span>
      <h1 className="mt-4 font-serif text-4xl font-semibold">No pudimos confirmar el checkout</h1>
      <p className="mt-3 text-sm leading-7 text-ink/65">{errorMessage}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard/business">
          <Button>Volver al panel comercial</Button>
        </Link>
        <Link href="/dashboard/properties">
          <Button variant="secondary">Volver a mis propiedades</Button>
        </Link>
      </div>
    </section>
  );
}

export default function PayPalReturnPage() {
  return (
    <Suspense fallback={<LoadingState label="Abriendo checkout..." />}>
      <PayPalReturnContent />
    </Suspense>
  );
}
