import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Editor from "@/components/Editor";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  // Gợi ý danh mục + danh sách author = giá trị đã dùng trong DB
  const { data: rows } = await supabase.from("posts").select("category, author");
  const categories = [
    ...new Set((rows ?? []).map((r) => r.category as string).filter(Boolean)),
  ].sort();
  const authors = [
    ...new Set(
      [
        ...(rows ?? []).map((r) => r.author as string),
        user?.email ?? "",
      ].filter(Boolean),
    ),
  ].sort();

  return (
    <Editor post={data as Post} categories={categories} authors={authors} />
  );
}
