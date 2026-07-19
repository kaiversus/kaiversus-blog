import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  // Dùng ở route /api/migrate để parse markdown → block. Externalize để
  // require ở runtime Node, tránh lỗi react-server (createContext).
  serverExternalPackages: ["@blocknote/server-util"],
};

export default nextConfig;
