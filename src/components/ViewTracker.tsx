"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Tăng lượt xem 1 lần / phiên trình duyệt cho mỗi bài (tránh đếm trùng khi reload).
export default function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    const key = `viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    createClient()
      .rpc("increment_views", { p_id: id })
      .then(() => {});
  }, [id]);
  return null;
}
