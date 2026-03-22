import { getCantons, getDistricts, getProvinces, buildZonePath, getSiteUrl } from "@/lib/zone-seo";

export default function sitemap() {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const routes = [
    "",
    "/search",
    "/analysis",
    "/battle"
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

  return [...routes, ...zoneRoutes];
}
