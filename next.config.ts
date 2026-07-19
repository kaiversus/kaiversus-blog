import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép hiển thị ảnh upload lên Supabase Storage qua next/image nếu cần.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
