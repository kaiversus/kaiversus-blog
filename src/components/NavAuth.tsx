"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Check đăng nhập ở client để trang công khai không bị ép động (dynamic).
// Khi online: hiện username của admin (bảng public.profiles); chưa có
// profile thì fallback "dashboard".
export default function NavAuth() {
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setAuthed(true);
      const { data: profile } = await sb
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.username) setName(profile.username);
    });
  }, []);

  return (
    <Link href={authed ? "/dashboard" : "/login"} style={{ color: "inherit" }}>
      {authed ? (name ?? "dashboard") : "online"}
    </Link>
  );
}
