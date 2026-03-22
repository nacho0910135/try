import { notFound } from "next/navigation";
import { ZoneSeoPage } from "@/components/seo/ZoneSeoPage";
import {
  buildZoneDescription,
  buildZonePath,
  buildZoneTitle,
  fetchZoneSeoData,
  findCantonBySlug,
  findDistrictBySlug,
  findProvinceBySlug,
  getSiteUrl
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

  const district = findDistrictBySlug(province, canton, params.district);

  if (!district) {
    notFound();
  }

  return { province, canton, district };
};

export async function generateMetadata({ params }) {
  const { province, canton, district } = resolveZone(params);
  const data = await fetchZoneSeoData({ province, canton, district, limit: 9 });

  return {
    title: buildZoneTitle({ province, canton, district }),
    description: buildZoneDescription({ province, canton, district }, data.summary),
    alternates: {
      canonical: `${getSiteUrl()}${buildZonePath({ province, canton, district })}`
    }
  };
}

export default async function DistrictZonePage({ params }) {
  const { province, canton, district } = resolveZone(params);
  const data = await fetchZoneSeoData({ province, canton, district, limit: 9 });

  return <ZoneSeoPage zone={data.zone} summary={data.summary} items={data.items} childrenZones={[]} />;
}
