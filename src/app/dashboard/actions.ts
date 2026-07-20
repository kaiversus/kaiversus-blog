"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPost(formData?: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const category = String(formData?.get("category") ?? "").trim() || "note";

  const { data, error } = await supabase
    .from("posts")
    .insert({ title: "Untitled", author: user.email, category })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "insert failed");
  redirect(`/edit/${data.id}`);
}

function revalidateAll() {
  for (const p of ["/", "/writeups", "/courses", "/projects", "/dashboard"])
    revalidatePath(p);
}

// Soft delete: đưa vào thùng rác (không xóa khỏi DB) + ẩn khỏi công khai
export async function deletePost(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString(), status: "draft" })
    .eq("id", id);
  revalidateAll();
}

// Khôi phục từ thùng rác (về draft)
export async function restorePost(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("posts").update({ deleted_at: null }).eq("id", id);
  revalidateAll();
}

// Xóa VĨNH VIỄN khỏi DB (chỉ dùng trong thùng rác)
export async function hardDeletePost(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);
  revalidateAll();
}
