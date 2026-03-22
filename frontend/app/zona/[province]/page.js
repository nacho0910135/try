import { notFound } from "next/navigation";
import { ZoneSeoPage } from "@/components/seo/ZoneSeoPage";
import {
  buildZoneDescription,
  buildZonePath,
  buildZoneTitle,
  fetchZoneSeoData,
  findProvinceBySlug,
  getSiteUrl,
  getZoneChildren
} from "@/lib/zone-seo";

const resolveProvince = (slug) => {
  const province = findProvinceBySlug(slug);

  if (!province) {
    notFound();
  }

  return province;
};

export async function generateMetadata({ params }) {
  const province = resolveProvince(params.province);
  const data = await fetchZoneSeoData({ province, limit: 9 });

  return {
    title: buildZoneTitle({ province }),
    description: buildZoneDescription({ province }, data.summary),
    alternates: {
      canonical: `${getSiteUrl()}${buildZonePath({ province })}`
    }
  };
}

export default async function ProvinceZonePage({ params }) {
  const province = resolveProvince(params.province);
  const data = await fetchZoneSeoData({ province, limit: 9 });

  return (
    <ZoneSeoPage
      zone={data.zone}
      summary={data.summary}
      items={data.items}
      childrenZones={getZoneChildren({ province })}
    />
  );
}
