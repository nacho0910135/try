import { notFound } from "next/navigation";
import { ZoneSeoPage } from "@/components/seo/ZoneSeoPage";
import {
  buildZoneDescription,
  buildZonePath,
  buildZoneTitle,
  fetchZoneSeoData,
  findCantonBySlug,
  findProvinceBySlug,
  getSiteUrl,
  getZoneChildren
} from "@/lib/zone-seo";

const resolveZone = (params) => {
  const province = findProvinceBySlug(params.province);

  if (!province) {
    notFound();
  }

  const canton = findCantonBySlug(province, params.canton);

  if (!canton) {
    notFound();
  }

  return { province, canton };
};

export async function generateMetadata({ params }) {
  const { province, canton } = resolveZone(params);
  const data = await fetchZoneSeoData({ province, canton, limit: 9 });

  return {
    title: buildZoneTitle({ province, canton }),
    description: buildZoneDescription({ province, canton }, data.summary),
    alternates: {
      canonical: `${getSiteUrl()}${buildZonePath({ province, canton })}`
    }
  };
}

export default async function CantonZonePage({ params }) {
  const { province, canton } = resolveZone(params);
  const data = await fetchZoneSeoData({ province, canton, limit: 9 });

  return (
    <ZoneSeoPage
      zone={data.zone}
      summary={data.summary}
      items={data.items}
      childrenZones={getZoneChildren({ province, canton })}
    />
  );
}
