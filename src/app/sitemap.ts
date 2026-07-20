import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600; // làm mới sitemap mỗi giờ

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select("slug, id, updated_at, published_at")
    .eq("status", "published");

  const posts: MetadataRoute.Sitemap = (data ?? []).map((p) => ({
    url: `${SITE_URL}/p/${p.slug ?? p.id}`,
    lastModified: new Date(p.updated_at ?? p.published_at ?? Date.now()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, priority: 1, changeFrequency: "daily" as const },
    { url: `${SITE_URL}/writeups`, priority: 0.7, changeFrequency: "daily" as const },
    { url: `${SITE_URL}/projects`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/courses`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/about`, priority: 0.5, changeFrequency: "monthly" as const },
  ].map((r) => ({ ...r, lastModified: new Date() }));

  return [...staticRoutes, ...posts];
}
