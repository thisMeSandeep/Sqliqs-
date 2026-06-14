import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Crawl the public marketing + content pages; keep the app surfaces (which are
// per-browser and have no SEO value) and the API out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/projects", "/settings", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
