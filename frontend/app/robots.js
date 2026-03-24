const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/search", "/analysis", "/battle", "/zona/"],
      disallow: ["/dashboard/", "/admin/", "/api/"]
    },
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
    host: siteUrl.replace(/\/$/, "")
  };
}
