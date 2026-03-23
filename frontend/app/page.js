"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getFeaturedProperties } from "@/lib/api";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { MapLoadingShell } from "@/components/map/MapLoadingShell";
import { PropertyCard } from "@/components/property/PropertyCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency, getMainPhoto } from "@/lib/utils";

const CostaRicaProvinceExplorer = dynamic(
  () =>
    import("@/components/map/CostaRicaProvinceExplorer").then((module) => ({
      default: module.CostaRicaProvinceExplorer
    })),
  {
    ssr: false,
    loading: () => <MapLoadingShell minHeight={560} label="Cargando atlas de Costa Rica..." />
  }
);

export default function HomePage() {
  const { language, t } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoadFailed, setFeaturedLoadFailed] = useState(false);
  const [province, setProvince] = useState("San Jose");

  useEffect(() => {
    let cancelled = false;

    const loadFeatured = async () => {
      try {
        const data = await getFeaturedProperties();
        if (cancelled) return;
        setFeatured(data.items || []);
        setFeaturedLoadFailed(false);
      } catch (_error) {
        if (cancelled) return;
        setFeatured([]);
        setFeaturedLoadFailed(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFeatured();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredForProvince = featured.filter(
    (property) => property.address?.province === province
  );
  const fallbackSrc = "/property-placeholder.svg";

  return (
    <div className="section-pad">
      <section className="app-shell">
        <div className="surface-elevated overflow-hidden bg-hero-grid px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-lg lg:max-w-[34rem]">
              <h1
                className="max-w-xl font-semibold leading-[1.2] text-[18px]"
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                {t("homePage.title")}
              </h1>
              {t("homePage.description") ? (
                <p className="mt-2.5 max-w-md text-sm leading-6 text-ink/68 sm:text-[15px] sm:leading-7">
                  {t("homePage.description")}
                </p>
              ) : null}
            </div>

            <div className="mt-3 lg:mt-4">
              <CostaRicaProvinceExplorer
                selectedProvince={province}
                onSelectProvince={setProvince}
                mapMinHeight={920}
                hero
              />
            </div>
          </div>

          {featuredForProvince.length ? (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {featuredForProvince.slice(0, 2).map((property) => {
                const mainPhoto = getMainPhoto(property);

                return (
                  <Link
                    key={property._id}
                    href={`/properties/${property.slug}`}
                    className="surface-soft grid gap-4 p-4 sm:grid-cols-[180px_1fr]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                      <img
                        src={mainPhoto?.url || fallbackSrc}
                        alt={mainPhoto?.alt || property.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = fallbackSrc;
                        }}
                      />
                    </div>
                    <div className="flex flex-col justify-between gap-3">
                      <div>
                        <div className="text-sm uppercase tracking-[0.18em] text-terracotta">
                          {province}
                        </div>
                        <h3 className="mt-2 text-xl font-semibold">{property.title}</h3>
                      </div>
                      <div className="text-2xl font-semibold">
                        {formatCurrency(property.price, property.currency)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="app-shell mt-10 space-y-5 sm:mt-14 sm:space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{t("homePage.featuredEyebrow")}</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
              {t("homePage.featuredTitle")}
            </h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-lagoon">
            {t("homePage.seeAll")}
          </Link>
        </div>

        {loading ? (
          <LoadingState
            label={
              language === "en"
                ? "Loading featured properties..."
                : "Cargando propiedades destacadas..."
            }
          />
        ) : featuredLoadFailed ? (
          <div className="surface-soft p-5 text-sm leading-6 text-ink/65">
            {language === "en"
              ? "Featured properties could not be loaded right now."
              : "No se pudieron cargar las propiedades destacadas en este momento."}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {featured.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
