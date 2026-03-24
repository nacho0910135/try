import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

const propertyTypeLabels = {
  house: "Casas",
  apartment: "Apartamentos",
  condominium: "Condominios",
  lot: "Lotes",
  room: "Habitaciones",
  commercial: "Comerciales"
};

const buildBreadcrumbs = ({ province, canton, district }) => {
  const crumbs = [{ label: "Inicio", href: "/" }];

  if (province) {
    crumbs.push({
      label: province,
      href: `/zona/${province
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`
    });
  }

  if (canton) {
    crumbs.push({
      label: canton,
      href: crumbs[crumbs.length - 1].href + `/${canton
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`
    });
  }

  if (district) {
    crumbs.push({
      label: district,
      href: crumbs[crumbs.length - 1].href + `/${district
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`
    });
  }

  return crumbs;
};

const extractPriceSummary = (pricesByCurrency = [], currency = "USD") =>
  pricesByCurrency.find((item) => item.currency === currency);

export function ZoneSeoPage({ zone, summary, items, childrenZones = [] }) {
  const breadcrumbs = buildBreadcrumbs(zone);
  const usd = extractPriceSummary(summary.pricesByCurrency, "USD");
  const crc = extractPriceSummary(summary.pricesByCurrency, "CRC");

  return (
    <div className="app-shell section-pad space-y-8">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-ink/55">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-2">
            <Link href={crumb.href} className="transition hover:text-pine">
              {crumb.label}
            </Link>
            {index < breadcrumbs.length - 1 ? <span>/</span> : null}
          </span>
        ))}
      </nav>

      <section className="surface bg-hero-grid p-8">
        <span className="eyebrow">Radar local</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold text-ink">{zone.label}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-ink/65">
          Inventario visible, precios medios y acceso directo al mapa para leer {zone.label} mas rapido.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={zone.searchPath}
            className="rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-pine/90"
          >
            Explorar en el mapa
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-pine/25 hover:text-pine"
          >
            Ver todo Costa Rica
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Publicaciones activas</div>
          <div className="mt-3 text-4xl font-semibold text-ink">{summary.totalListings || 0}</div>
          <p className="mt-2 text-sm text-ink/60">Disponibles o reservadas visibles en el marketplace.</p>
        </div>
        <div className="surface p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Venta vs renta</div>
          <div className="mt-3 text-lg font-semibold text-ink">
              {summary.saleListings || 0} venta - {summary.rentListings || 0} renta
          </div>
          <p className="mt-2 text-sm text-ink/60">Balance rapido del inventario abierto.</p>
        </div>
        <div className="surface p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Precio medio USD</div>
          <div className="mt-3 text-2xl font-semibold text-ink">
            {usd ? formatCurrency(usd.averagePrice, "USD") : "Sin data"}
          </div>
          <p className="mt-2 text-sm text-ink/60">Referencia corta para comparar la zona.</p>
        </div>
        <div className="surface p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Precio medio CRC</div>
          <div className="mt-3 text-2xl font-semibold text-ink">
            {crc ? formatCurrency(crc.averagePrice, "CRC") : "Sin data"}
          </div>
          <p className="mt-2 text-sm text-ink/60">Lectura util si tu decision vive en colones.</p>
        </div>
      </section>

      {summary.propertyTypes?.length ? (
        <section className="surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow">Mix de inventario</span>
              <h2 className="mt-3 text-2xl font-semibold text-ink">Que se esta moviendo aqui</h2>
            </div>
            <div className="rounded-full bg-pine/10 px-4 py-2 text-sm font-semibold text-pine">
              {summary.featuredListings || 0} destacadas
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.propertyTypes.map((item) => (
              <div key={item.type} className="rounded-[22px] border border-ink/10 bg-white p-4">
                <div className="text-lg font-semibold text-ink">
                  {propertyTypeLabels[item.type] || item.type}
                </div>
                <div className="mt-2 text-sm text-ink/60">{item.count} publicaciones visibles</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {childrenZones.length ? (
        <section className="surface p-6">
          <span className="eyebrow">Subzonas</span>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Baja un nivel dentro de {zone.label}</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {childrenZones.slice(0, 36).map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-pine/25 hover:text-pine"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-5">
        <div>
          <span className="eyebrow">Publicaciones recientes</span>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Propiedades visibles en {zone.label}</h2>
        </div>
        {items?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((property) => (
              <Link
                key={property._id}
                href={`/properties/${property.slug}`}
                className="surface overflow-hidden transition hover:-translate-y-1"
              >
                <div className="aspect-[16/10] overflow-hidden bg-mist">
                  <Image
                    src={property.photos?.find((item) => item.isPrimary)?.url || property.photos?.[0]?.url || "/property-placeholder.svg"}
                    alt={property.title}
                    width={800}
                    height={500}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div className="text-xl font-semibold text-ink">
                    {formatCurrency(property.price, property.currency)}
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-ink">{property.title}</h3>
                  <p className="text-sm text-ink/60">
                    {property.address?.district}, {property.address?.canton}, {property.address?.province}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-ink/60">
                    <span className="data-pill">{property.businessType === "rent" ? "Renta" : "Venta"}</span>
                    <span className="data-pill">{property.propertyType}</span>
                    <span className="data-pill">{property.bedrooms || 0} hab.</span>
                    <span className="data-pill">{property.bathrooms || 0} baños</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="surface p-6 text-sm text-ink/60">
            Aun no hay suficiente muestra abierta aqui. Puedes saltar al mapa y ampliar el radio.
          </div>
        )}
      </section>
    </div>
  );
}
