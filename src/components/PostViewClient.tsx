"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import type { PartialBlock } from "@blocknote/core";
import { useSiteTheme } from "@/lib/useSiteTheme";

// Render nội dung bài bằng CHÍNH BlockNote ở chế độ chỉ-đọc → hiển thị
// y hệt lúc soạn thảo.
export default function PostView({ content }: { content: PartialBlock[] }) {
  const theme = useSiteTheme();
  const editor = useCreateBlockNote({
    initialContent: content.length > 0 ? content : undefined,
  });

  return (
    <div className="post-view" id="post-content">
      <BlockNoteView editor={editor} editable={false} theme={theme} />
    </div>
  );
}
