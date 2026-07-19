"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PostCategory, PostStatus } from "@/lib/types";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export interface SavePatch {
  title: string;
  category: PostCategory;
  tags: string[];
  difficulty: string | null;
  status: PostStatus;
  excerpt: string | null;
  content: unknown;
}

export async function savePost(id: string, patch: SavePatch) {
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("posts")
    .select("slug, published_at")
    .eq("id", id)
    .single();

  const update: Record<string, unknown> = {
    title: patch.title || "Untitled",
    category: patch.category,
    tags: patch.tags,
    difficulty: patch.difficulty,
    status: patch.status,
    excerpt: patch.excerpt,
    content: patch.content,
  };

  // Lần đầu publish: sinh slug + published_at
  if (patch.status === "published") {
    if (!current?.published_at) update.published_at = new Date().toISOString();
    if (!current?.slug) {
      const base = slugify(patch.title) || "post";
      update.slug = `${base}-${id.slice(0, 6)}`;
    }
  }

  const { error } = await supabase.from("posts").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };

  for (const p of ["/", "/writeups", "/courses", "/projects", "/dashboard"])
    revalidatePath(p);
  if (current?.slug) revalidatePath(`/p/${current.slug}`);
  return { ok: true };
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);
  for (const p of ["/", "/writeups", "/courses", "/projects", "/dashboard"])
    revalidatePath(p);
  redirect("/dashboard");
}
