"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPost() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("posts")
    .insert({ title: "Untitled", author: user.email })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "insert failed");
  redirect(`/edit/${data.id}`);
}

export async function deletePost(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);
  for (const p of ["/", "/writeups", "/courses", "/projects", "/dashboard"])
    revalidatePath(p);
}
