"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import type { PartialBlock } from "@blocknote/core";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSiteTheme } from "@/lib/useSiteTheme";
import Toc from "@/components/Toc";
import { CATEGORIES, type Post, type PostCategory } from "@/lib/types";
import { savePost, deletePost, type SavePatch } from "@/app/edit/[id]/actions";

type SaveState = "idle" | "saving" | "saved" | "error";

function deriveExcerpt(blocks: PartialBlock[]): string | null {
  const parts: string[] = [];
  for (const b of blocks) {
    const content = (b as { content?: unknown }).content;
    if (Array.isArray(content)) {
      for (const inline of content) {
        if (inline && typeof inline === "object" && "text" in inline) {
          parts.push(String((inline as { text: unknown }).text));
        }
      }
    }
    if (parts.join(" ").length > 160) break;
  }
  const s = parts.join(" ").trim().slice(0, 200);
  return s || null;
}

export default function Editor({
  post,
  categories = [],
}: {
  post: Post;
  categories?: string[];
}) {
  const theme = useSiteTheme();
  const [title, setTitle] = useState(post.title);
  const [category, setCategory] = useState<PostCategory>(post.category);
  const [tags, setTags] = useState((post.tags ?? []).join(", "));
  const [difficulty, setDifficulty] = useState(post.difficulty ?? "");
  const [status, setStatus] = useState(post.status);
  const [save, setSave] = useState<SaveState>("idle");
  const [confirmDel, setConfirmDel] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const catOptions = useMemo(() => {
    const defaults = CATEGORIES.map((c) => c.value);
    return [...new Set([...defaults, ...categories])];
  }, [categories]);

  const initialContent = useMemo(() => {
    const c = post.content;
    return Array.isArray(c) && c.length > 0 ? (c as PartialBlock[]) : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("post-assets")
      .upload(path, file);
    if (error) throw error;
    return supabase.storage.from("post-assets").getPublicUrl(path).data
      .publicUrl;
  }, []);

  const editor = useCreateBlockNote({ initialContent, uploadFile });

  // Bật chế độ full-screen (ẩn footer) khi ở trang editor
  useEffect(() => {
    document.body.classList.add("editing");
    return () => document.body.classList.remove("editing");
  }, []);

  const runSave = useCallback(
    async (nextStatus?: typeof status) => {
      setSave("saving");
      const content = editor.document;
      const patch: SavePatch = {
        title,
        category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        difficulty: difficulty || null,
        status: nextStatus ?? status,
        excerpt: deriveExcerpt(content),
        content,
      };
      const res = await savePost(post.id, patch);
      setSave(res.ok ? "saved" : "error");
    },
    [editor, title, category, tags, difficulty, status, post.id],
  );

  const schedule = useCallback(() => {
    setSave("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSave(), 1200);
  }, [runSave]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function togglePublish() {
    const next = status === "published" ? "draft" : "published";
    setStatus(next);
    await runSave(next);
  }

  const saveLabel =
    save === "saving"
      ? "● đang lưu..."
      : save === "saved"
        ? "✓ đã lưu"
        : save === "error"
          ? "✕ lỗi lưu"
          : "";

  return (
    <div className="editor-shell">
      <div className="editor-bar">
        <Link href="/dashboard" className="btn btn-ghost">
          ← dashboard
        </Link>
        <span className={`save-pill ${save}`}>{saveLabel}</span>

        <div className="spacer" />

        {status === "published" && post.slug && (
          <Link href={`/p/${post.slug}`} className="btn btn-ghost" target="_blank">
            xem blog ↗
          </Link>
        )}

        {confirmDel ? (
          <button
            className="btn del-btn confirm"
            onClick={() => deletePost(post.id)}
          >
            chắc chưa? xoá luôn
          </button>
        ) : (
          <button
            className="btn btn-ghost btn-danger"
            onClick={() => setConfirmDel(true)}
          >
            xoá
          </button>
        )}
        {confirmDel && (
          <button className="btn btn-ghost" onClick={() => setConfirmDel(false)}>
            huỷ
          </button>
        )}

        <span
          className={`badge ${status === "published" ? "badge-published" : "badge-draft"}`}
        >
          {status}
        </span>
        <button
          className={status === "published" ? "btn btn-ghost" : "btn btn-green"}
          onClick={togglePublish}
        >
          {status === "published" ? "về draft" : "publish →"}
        </button>
      </div>

      <div className="editor-doc reading-layout">
        <div className="main">
          <input
            className="doc-title-input"
            placeholder="Tiêu đề..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              schedule();
            }}
          />

          <div className="doc-meta-row">
            <input
              className="txt"
              list="cat-suggestions"
              placeholder="danh mục / khóa học"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                schedule();
              }}
            />
            <datalist id="cat-suggestions">
              {catOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <select
              className="txt"
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                schedule();
              }}
            >
              <option value="">— độ khó —</option>
              <option value="basic">basic</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
            <input
              className="txt tags"
              placeholder="tags, cách nhau bởi dấu phẩy"
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                schedule();
              }}
            />
          </div>

          <div className="doc-surface" id="edit-content">
            <BlockNoteView editor={editor} theme={theme} onChange={schedule} />
          </div>
        </div>

        <Toc target="#edit-content" />
      </div>
    </div>
  );
}
