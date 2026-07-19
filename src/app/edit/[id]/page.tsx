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
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  return <Editor post={data as Post} />;
}
