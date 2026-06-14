import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// The public, indexable routes. App surfaces (dashboard/projects/settings) are
// per-browser and intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/playground", priority: 0.8 },
    { path: "/guide", priority: 0.7 },
    { path: "/pricing", priority: 0.7 },
    { path: "/privacy", priority: 0.3 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  }));
}
