"use client";

import dynamic from "next/dynamic";
import type { Post } from "@/lib/types";

// BlockNote chạm `window` khi khởi tạo → chỉ render ở client (ssr:false).
const EditorClient = dynamic(() => import("./EditorClient"), {
  ssr: false,
  loading: () => (
    <div className="container" style={{ color: "var(--text-muted)" }}>
      đang tải editor…
    </div>
  ),
});

export default function Editor({
  post,
  categories,
}: {
  post: Post;
  categories: string[];
}) {
  return <EditorClient post={post} categories={categories} />;
}
