"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Compass, MapPinned, Search } from "lucide-react";
import { getFeaturedProperties } from "@/lib/api";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { CostaRicaProvinceExplorer } from "@/components/map/CostaRicaProvinceExplorer";
import { PropertyCard } from "@/components/property/PropertyCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { costaRicaProvinces } from "@/lib/costa-rica-provinces";
import { formatCurrency, getMainPhoto } from "@/lib/utils";

export default function HomePage() {
  const { language, t } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState("");
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("San Jose");

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await getFeaturedProperties();
        setFeatured(data.items || []);
        setFeaturedError("");
      } catch (_error) {
        setFeatured([]);
        setFeaturedError(
          language === "en"
            ? "Featured properties could not be loaded right now."
            : "No se pudieron cargar las propiedades destacadas en este momento."
        );
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, [language]);

  const selectedProvinceMeta = costaRicaProvinces.find((item) => item.name === province);
  const featuredForProvince = featured.filter(
    (property) => property.address?.province === province
  );
  const fallbackSrc = "/property-placeholder.svg";

  return (
    <div className="section-pad">
      <section className="app-shell">
        <div className="surface-elevated overflow-hidden bg-hero-grid p-4 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(320px,0.52fr)_minmax(0,1.48fr)] lg:items-start">
            <div className="max-w-xl lg:pt-4">
              <BrandLogo className="mb-4" compact showTagline={false} />
              <span className="eyebrow">{t("homePage.eyebrow")}</span>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="stat-chip">
                  <MapPinned className="h-3.5 w-3.5 text-terracotta" />
                  7 provincias
                </span>
                <span className="stat-chip">
                  <Compass className="h-3.5 w-3.5 text-lagoon" />
                  GPS + mapa
                </span>
                <span className="stat-chip">
                  <ArrowRight className="h-3.5 w-3.5 text-pine" />
                  Leads + favoritos
                </span>
              </div>
              <h1 className="mt-5 max-w-3xl font-serif text-[2.2rem] font-semibold leading-[1.02] sm:text-[3.15rem] lg:text-[3.4rem]">
                {t("homePage.title")}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-ink/68 sm:text-[15px] sm:leading-7">
                {t("homePage.description")}
              </p>

              <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="surface-soft space-y-3 p-4 sm:p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="field-label">{t("homePage.searchZoneLabel")}</label>
                      <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t("homePage.searchZonePlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="field-label">{t("homePage.provinceLabel")}</label>
                      <Select
                        value={province}
                        onChange={(event) => setProvince(event.target.value)}
                      >
                        {costaRicaProvinces.map((item) => (
                          <option key={item.name} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&province=${encodeURIComponent(province)}`}
                  >
                    <Button className="w-full gap-2">
                      <Search className="mr-2 h-4 w-4" />
                      {t("homePage.exploreButton")}
                    </Button>
                  </Link>
                </div>
                <div className="surface-soft p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ink/40">
                    {t("homePage.activeProvince")}
                  </div>
                  <div className="mt-2 text-xl font-semibold sm:text-2xl">{selectedProvinceMeta?.name}</div>
                  <p className="mt-2 text-sm leading-6 text-ink/65">
                    {language === "en"
                      ? selectedProvinceMeta?.blurbEn || selectedProvinceMeta?.blurb
                      : selectedProvinceMeta?.blurb}
                  </p>
                  <div className="mt-4 rounded-[22px] bg-white/75 px-3 py-2 text-xs font-medium text-ink/60">
                    {language === "en"
                      ? selectedProvinceMeta?.spotlightEn || selectedProvinceMeta?.spotlight
                      : selectedProvinceMeta?.spotlight}
                  </div>
                </div>
              </div>
            </div>

            <CostaRicaProvinceExplorer
              selectedProvince={province}
              onSelectProvince={setProvince}
              mapMinHeight={760}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="surface-soft p-5">
              <MapPinned className="h-5 w-5 text-terracotta" />
              <h3 className="mt-3 text-base font-semibold">{t("homePage.interactiveMap")}</h3>
              <p className="mt-1 text-sm leading-6 text-ink/60">
                {t("homePage.interactiveMapDescription")}
              </p>
            </div>
            <div className="surface-soft p-5">
              <Compass className="h-5 w-5 text-lagoon" />
              <h3 className="mt-3 text-base font-semibold">{t("homePage.localSearch")}</h3>
              <p className="mt-1 text-sm leading-6 text-ink/60">
                {t("homePage.localSearchDescription")}
              </p>
            </div>
            <div className="surface-soft p-5">
              <ArrowRight className="h-5 w-5 text-pine" />
              <h3 className="mt-3 text-base font-semibold">{t("homePage.simplePublishing")}</h3>
              <p className="mt-1 text-sm leading-6 text-ink/60">
                {t("homePage.simplePublishingDescription")}
              </p>
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
        ) : featuredError ? (
          <div className="surface-soft p-5 text-sm leading-6 text-ink/65">
            {featuredError}
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
