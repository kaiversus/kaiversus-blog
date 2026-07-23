"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCreateBlockNote, SuggestionMenuController } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "katex/dist/katex.min.css";
import { editorSchema, getSlashItems } from "@/lib/blocknote/react-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSiteTheme } from "@/lib/useSiteTheme";
import Toc from "@/components/Toc";
import { CATEGORIES, type Post, type PostCategory } from "@/lib/types";
import { savePost, deletePost, type SavePatch } from "@/app/edit/[id]/actions";

type SaveState = "idle" | "saving" | "saved" | "error";

function deriveExcerpt(blocks: readonly unknown[]): string | null {
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
  authors = [],
}: {
  post: Post;
  categories?: string[];
  authors?: string[];
}) {
  const theme = useSiteTheme();
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [category, setCategory] = useState<PostCategory>(post.category);
  const [tags, setTags] = useState((post.tags ?? []).join(", "));
  const [difficulty, setDifficulty] = useState(post.difficulty ?? "");
  const [author, setAuthor] = useState(post.author ?? "");
  const [cover, setCover] = useState(post.cover ?? "");
  const [github, setGithub] = useState(post.github_url ?? "");
  const [demo, setDemo] = useState(post.demo_url ?? "");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [status, setStatus] = useState(post.status);
  const [save, setSave] = useState<SaveState>("idle");
  const [dirty, setDirty] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const authorOptions = useMemo(
    () => [...new Set([...(author ? [author] : []), ...authors])],
    [author, authors],
  );

  const catOptions = useMemo(() => {
    const defaults = CATEGORIES.map((c) => c.value);
    return [...new Set([...defaults, ...categories])];
  }, [categories]);

  const initialContent = useMemo(() => {
    const c = post.content;
    return Array.isArray(c) && c.length > 0 ? (c as never[]) : undefined;
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

  const editor = useCreateBlockNote({
    schema: editorSchema,
    initialContent,
    uploadFile,
    // Bảng linh hoạt: menu kéo hàng/cột có nút bật/tắt header (hàng/cột được
    // tô xanh) cho TỪNG bảng — không còn cứng nhắc theo dữ liệu import nữa;
    // kèm gộp/tách ô + đổi màu nền/chữ từng ô.
    tables: {
      headers: true,
      splitCells: true,
      cellBackgroundColor: true,
      cellTextColor: true,
    },
  });

  async function onCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadFile(file);
      setCover(url);
      schedule();
    } catch {
      setSave("error");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  }

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
        author: author.trim() || null,
        cover: cover.trim() || null,
        github_url: github.trim() || null,
        demo_url: demo.trim() || null,
        content,
      };
      const res = await savePost(post.id, patch);
      setSave(res.ok ? "saved" : "error");
      if (res.ok) setDirty(false);
    },
    [editor, title, category, tags, difficulty, author, cover, github, demo, status, post.id],
  );

  const schedule = useCallback(() => {
    setDirty(true);
    setSave("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSave(), 1200);
  }, [runSave]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Cảnh báo khi rời trang mà còn thay đổi chưa lưu ("hỏi lại có muốn lưu")
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty || save === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, save]);

  async function togglePublish() {
    const next = status === "published" ? "draft" : "published";
    if (next === "published" && !author.trim()) {
      window.alert("Cần chọn Tác giả trước khi publish.");
      return;
    }
    setStatus(next);
    await runSave(next);
  }

  // Rời editor: nếu còn thay đổi chưa lưu thì HỎI có muốn lưu không
  async function goDashboard(e: React.MouseEvent) {
    e.preventDefault();
    if (dirty || save === "saving") {
      const ok = window.confirm(
        "Bạn có thay đổi chưa lưu.\n\nOK = Lưu rồi thoát   ·   Cancel = Thoát KHÔNG lưu",
      );
      if (ok) await runSave();
    }
    router.push("/dashboard");
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
        <Link href="/dashboard" className="btn btn-ghost" onClick={goDashboard}>
          ← dashboard
        </Link>
        <button
          className="btn btn-ghost"
          onClick={() => runSave()}
          disabled={!dirty && save !== "error"}
        >
          💾 lưu
        </button>
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
            chắc chưa? vào thùng rác
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

      <div className="editor-doc writeup-container">
        <article className="wc-main">
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
              className={`txt author-select ${author ? "" : "required-empty"}`}
              list="author-suggestions"
              placeholder="tác giả *"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);
                schedule();
              }}
              required
              title="Tác giả (bắt buộc) — nhập tay"
            />
            <datalist id="author-suggestions">
              {authorOptions.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
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

          {category === "project" && (
            <>
              <div className="doc-project-label">
                ⌘ Thông tin project (thumbnail + link) — chỉ hiện với project
              </div>
              <div className="doc-meta-row doc-extra-row">
                {cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="cover-preview" src={cover} alt="cover" />
                )}
                <input
                  className="txt cover-url"
                  placeholder="ảnh bìa / thumbnail (URL)"
                  value={cover}
                  onChange={(e) => {
                    setCover(e.target.value);
                    schedule();
                  }}
                />
                <label className="btn btn-ghost cover-upload">
                  {uploadingCover ? "đang tải…" : "⬆ ảnh"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onCoverFile}
                  />
                </label>
                <input
                  className="txt"
                  placeholder="github repo URL"
                  value={github}
                  onChange={(e) => {
                    setGithub(e.target.value);
                    schedule();
                  }}
                />
                <input
                  className="txt"
                  placeholder="demo URL"
                  value={demo}
                  onChange={(e) => {
                    setDemo(e.target.value);
                    schedule();
                  }}
                />
              </div>
            </>
          )}

          <div id="edit-content">
            <BlockNoteView
              editor={editor}
              theme={theme}
              onChange={schedule}
              slashMenu={false}
            >
              <SuggestionMenuController
                triggerCharacter="/"
                getItems={async (query) => getSlashItems(editor, query)}
              />
            </BlockNoteView>
          </div>
        </article>

        <aside className="writeup-sidebar">
          <div className="toc-wrapper">
            <div className="toc-title">ON THIS PAGE</div>
            <Toc target="#edit-content" bare />
          </div>
        </aside>
      </div>
    </div>
  );
}
