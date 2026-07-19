import { createClient as createSb } from "@supabase/supabase-js";

// Client KHÔNG dùng cookie — cho các trang công khai (chỉ đọc bài published).
// Không đụng cookie nên trang có thể được cache/ISR → điều hướng nhanh.
export function createPublicClient() {
  return createSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
