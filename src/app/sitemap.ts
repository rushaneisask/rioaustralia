import type { MetadataRoute } from "next";
import { site, divisions } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...divisions.map((d) => ({
      url: `${site.url}${d.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${site.url}/contact/`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
  ];
}
