"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Tăng lượt xem 1 lần / phiên trình duyệt cho mỗi bài (tránh đếm trùng khi
// reload). Admin đang đăng nhập xem bài của mình thì KHÔNG tính.
export default function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    const key = `viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      /* ignore */
    }
    const sb = createClient();
    // getSession đọc từ localStorage — không tốn request mạng.
    sb.auth.getSession().then(({ data }) => {
      if (data.session) return; // admin online → bỏ qua
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
      sb.rpc("increment_views", { p_id: id }).then(() => {});
    });
  }, [id]);
  return null;
}
