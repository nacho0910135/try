"use client";

import { useEffect, useState } from "react";
import { HandCoins, HeartHandshake } from "lucide-react";
import { createPayPalDonationOrder } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const suggestedAmounts = [5, 10, 25];

export default function DonatePage() {
  const [flashMessage, setFlashMessage] = useState("");
  const [amount, setAmount] = useState(10);
  const [donorName, setDonorName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const status = params.get("paypal");

    if (status === "donation-success") {
      setFlashMessage("Gracias por apoyar BienesRaicesCR. Tu donacion ya fue confirmada.");
    } else if (status === "donation-cancelled") {
      setFlashMessage("La donacion fue cancelada antes de completar el checkout.");
    } else if (status === "donation-error") {
      setFlashMessage("No pudimos confirmar la donacion con PayPal. Intenta de nuevo.");
    }

    if (status) {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("paypal");
      window.history.replaceState({}, "", nextUrl.toString());
    }
  }, []);

  const handleDonate = async (value) => {
    try {
      setLoading(true);
      const data = await createPayPalDonationOrder({
        amount: value ?? amount,
        donorName
      });
      window.location.href = data.order.approvalUrl;
    } catch (error) {
      setFlashMessage(error.response?.data?.message || "No se pudo iniciar la donacion con PayPal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell section-pad">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="surface bg-hero-grid p-8">
          <span className="eyebrow">Donaciones</span>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-ink">
            Apoya el crecimiento de BienesRaicesCR
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/65">
            Tus donaciones nos ayudan a mejorar mapas, rendimiento, alertas y la experiencia general
            para compradores, vendedores y agentes en Costa Rica.
          </p>
        </section>

        {flashMessage ? (
          <div className="rounded-2xl border border-pine/20 bg-pine/10 px-4 py-3 text-sm font-medium text-pine">
            {flashMessage}
          </div>
        ) : null}

        <section className="grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
          <div className="surface p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-pine">
              <HeartHandshake className="h-4 w-4" />
              Aporte voluntario
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Donar con PayPal</h2>
            <p className="mt-2 text-sm leading-7 text-ink/65">
              Puedes enviar un apoyo rapido y seguro con PayPal. No necesitas crear una cuenta dentro de
              la plataforma para hacerlo.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {suggestedAmounts.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleDonate(suggestion)}
                  disabled={loading}
                >
                  Donar ${suggestion}
                </Button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="field-label">Nombre o alias</label>
                <Input
                  value={donorName}
                  onChange={(event) => setDonorName(event.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="field-label">Monto personalizado</label>
                <Input
                  type="number"
                  min="5"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={() => handleDonate()} disabled={loading}>
                <HandCoins className="mr-2 h-4 w-4" />
                {loading ? "Abriendo PayPal..." : "Continuar con PayPal"}
              </Button>
            </div>
          </div>

          <div className="surface p-6">
            <h2 className="text-2xl font-semibold text-ink">En que ayuda tu apoyo</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-7 text-ink/70">
              <li>Mejorar rendimiento y experiencia movil</li>
              <li>Agregar nuevas capas de contexto y datos del mapa</li>
              <li>Fortalecer alertas, notificaciones y calidad del inventario</li>
              <li>Seguir creciendo la plataforma de forma sostenible</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
