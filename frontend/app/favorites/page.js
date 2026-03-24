"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BellRing, Scale, Sparkles, Swords } from "lucide-react";
import { getFavorites } from "@/lib/api";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { PropertyCard } from "@/components/property/PropertyCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export default function FavoritesPage() {
  const { token } = useAuthStore();
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMessage, setSelectionMessage] = useState("");

  const copy = useMemo(
    () =>
      language === "en"
        ? {
            eyebrow: "Favorites",
            title: "Your saved properties",
            loading: "Loading favorites...",
            emptyTitle: "You have not saved any properties yet",
            emptyDescription:
              "Explore the map, open listings, and use the heart to build your shortlist.",
            battleTitle: "Comparative battle",
            battleDescription:
              "Pick exactly two favorites and we will send them to the Comparative Battle tab for a DeepSeek-backed decision workspace.",
            alertsTitle: "Alerts and notifications",
            alertsDescription:
              "Program alerts from search for rentals or purchase opportunities below a target price in the exact district you care about.",
            openAlerts: "Open alerts",
            createAlert: "Create from search",
            priceDrops: "Price drops",
            noPriceDrops: "No favorite has dropped in price yet.",
            droppedFromTo: "Dropped from",
            pickTwo: "Pick two properties",
            selected: "Selected",
            selectForBattle: "Select for battle",
            goToBattle: "Start battle",
            limitMessage: "You can compare only two favorites at a time."
          }
        : {
            eyebrow: "Favoritos",
            title: "Tus propiedades guardadas",
            loading: "Cargando favoritos...",
            emptyTitle: "Todavia no has guardado propiedades",
            emptyDescription:
              "Explora el mapa, abre detalles y usa el corazon para armar tu shortlist.",
            battleTitle: "Batalla comparativa",
            battleDescription:
              "Elige exactamente dos favoritas y las enviaremos a la pestaña Batalla Comparativa para un espacio de decision con DeepSeek.",
            alertsTitle: "Alertas y notificaciones",
            alertsDescription:
              "Programa alertas desde el buscador para alquileres o compras por debajo de un precio objetivo en el distrito exacto que te interesa.",
            openAlerts: "Abrir alertas",
            createAlert: "Programar desde buscar",
            priceDrops: "Bajadas de precio",
            noPriceDrops: "Todavia ninguna favorita ha bajado de precio.",
            droppedFromTo: "Bajo de",
            pickTwo: "Elige dos propiedades",
            selected: "Seleccionada",
            selectForBattle: "Seleccionar para batalla",
            goToBattle: "Iniciar batalla",
            limitMessage: "Solo puedes comparar dos favoritas al mismo tiempo."
          },
    [language]
  );
  const favoritesWithPriceDrops = items.filter((item) => item.priceDrop);

  useEffect(() => {
    if (!token) return;

    const loadFavorites = async () => {
      try {
        const data = await getFavorites();
        setItems(data.items || []);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [token]);

  const toggleSelection = (propertyId) => {
    setSelectionMessage("");
    setSelectedIds((current) => {
      if (current.includes(propertyId)) {
        return current.filter((item) => item !== propertyId);
      }

      if (current.length >= 2) {
        setSelectionMessage(copy.limitMessage);
        return current;
      }

      return [...current, propertyId];
    });
  };

  return (
    <ProtectedRoute>
      <div className="app-shell section-pad space-y-6">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="mt-4 font-serif text-5xl font-semibold">{copy.title}</h1>
        </div>

        <section className="surface border border-pine/15 bg-pine/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Swords className="h-5 w-5 text-pine" />
                <h2 className="text-2xl font-semibold">{copy.battleTitle}</h2>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/68">
                {copy.battleDescription}
              </p>
            </div>
            <div className="rounded-[24px] bg-white px-5 py-4 shadow-soft">
              <div className="flex items-center gap-2 text-sm text-ink/55">
                <Scale className="h-4 w-4 text-terracotta" />
                {copy.pickTwo}
              </div>
              <div className="mt-2 text-3xl font-semibold">{selectedIds.length}/2</div>
            </div>
          </div>
          {selectionMessage ? (
            <p className="mt-4 text-sm text-terracotta">{selectionMessage}</p>
          ) : null}
          <div className="mt-5">
            <Link href={selectedIds.length === 2 ? `/battle?compare=${selectedIds.join(",")}` : "#"}>
              <Button
                variant="success"
                className="shadow-soft"
                disabled={selectedIds.length !== 2}
              >
                {copy.goToBattle}
              </Button>
            </Link>
          </div>
        </section>

        <section className="surface border border-lagoon/15 bg-lagoon/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-lagoon" />
                <h2 className="text-2xl font-semibold">{copy.alertsTitle}</h2>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/68">
                {copy.alertsDescription}
              </p>
            </div>
            <div className="rounded-[24px] bg-white px-5 py-4 shadow-soft">
              <div className="flex items-center gap-2 text-sm text-ink/55">
                <Sparkles className="h-4 w-4 text-terracotta" />
                {copy.priceDrops}
              </div>
              <div className="mt-2 text-3xl font-semibold">{favoritesWithPriceDrops.length}</div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard/saved-searches">
              <Button variant="secondary">{copy.openAlerts}</Button>
            </Link>
            <Link href="/search">
              <Button variant="success">{copy.createAlert}</Button>
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {favoritesWithPriceDrops.length ? (
              favoritesWithPriceDrops.slice(0, 3).map((item) => (
                <div
                  key={`${item._id}-drop`}
                  className="rounded-[22px] border border-terracotta/12 bg-white p-4"
                >
                  <div className="font-semibold text-ink">{item.property?.title}</div>
                  <div className="mt-1 text-sm text-ink/55">
                    {item.property?.address?.district}, {item.property?.address?.canton},{" "}
                    {item.property?.address?.province}
                  </div>
                  <div className="mt-2 text-sm font-medium text-terracotta">
                    {copy.droppedFromTo}{" "}
                    {formatCurrency(item.priceDrop?.previousPrice, item.priceDrop?.currency)} a{" "}
                    {formatCurrency(item.priceDrop?.currentPrice, item.priceDrop?.currency)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink/60">{copy.noPriceDrops}</p>
            )}
          </div>
        </section>

        {loading ? (
          <LoadingState label={copy.loading} />
        ) : items.length ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const propertyId = item.property?._id;
              const selected = selectedIds.includes(propertyId);

              return (
                <div
                  key={item._id}
                  className={`space-y-3 rounded-[30px] p-2 transition ${
                    selected ? "bg-pine/8 ring-2 ring-pine/30" : ""
                  }`}
                >
                  <PropertyCard property={item.property} isFavorite />
                  <Button
                    variant={selected ? "success" : "secondary"}
                    className="w-full"
                    onClick={() => toggleSelection(propertyId)}
                  >
                    {selected ? copy.selected : copy.selectForBattle}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
