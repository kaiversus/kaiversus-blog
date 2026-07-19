"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Check đăng nhập ở client để trang công khai không bị ép động (dynamic).
export default function NavAuth() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  return (
    <Link href={authed ? "/dashboard" : "/login"} style={{ color: "inherit" }}>
      {authed ? "dashboard" : "online"}
    </Link>
  );
}
