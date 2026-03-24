import { getCantons, getDistricts, getProvinces, buildZonePath, getSiteUrl } from "@/lib/zone-seo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const fetchPropertyRoutes = async () => {
  try {
    const response = await fetch(`${API_URL}/properties/seo/sitemap`, {
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.items || [])
      .filter((item) => item?.slug)
      .map((item) => ({
        url: `${getSiteUrl()}/properties/${item.slug}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        changeFrequency: "daily",
        priority: 0.7
      }));
  } catch (_error) {
    return [];
  }
};

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const routes = [
    "",
    "/search",
    "/analysis",
    "/battle",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies"
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8
  }));

  const zoneRoutes = [];

  getProvinces().forEach((province) => {
    zoneRoutes.push({
      url: `${siteUrl}${buildZonePath({ province })}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    });

    getCantons(province).forEach((canton) => {
      zoneRoutes.push({
        url: `${siteUrl}${buildZonePath({ province, canton })}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75
      });

      getDistricts(province, canton).forEach((district) => {
        zoneRoutes.push({
          url: `${siteUrl}${buildZonePath({ province, canton, district })}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.65
        });
      });
    });
  });

  const propertyRoutes = await fetchPropertyRoutes();

  return [...routes, ...zoneRoutes, ...propertyRoutes];
}
