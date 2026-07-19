"use client";

import dynamic from "next/dynamic";
import type { PartialBlock } from "@blocknote/core";

// BlockNote chạm `window` khi khởi tạo → chỉ render ở client (ssr:false).
const PostViewClient = dynamic(() => import("./PostViewClient"), {
  ssr: false,
  loading: () => (
    <div
      className="doc-surface"
      style={{ color: "var(--text-muted)", padding: "20px 54px" }}
    >
      đang tải nội dung…
    </div>
  ),
});

export default function PostView({ content }: { content: PartialBlock[] }) {
  return <PostViewClient content={content} />;
}
