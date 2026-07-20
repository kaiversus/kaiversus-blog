"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { deletePost, restorePost, hardDeletePost } from "@/app/dashboard/actions";

function fmt(d: string) {
  return new Date(d).toISOString().slice(0, 16).replace("T", " ");
}

export default function DashboardList({ posts }: { posts: Post[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [st, setSt] = useState("");
  const [trash, setTrash] = useState(false);

  const active = useMemo(() => posts.filter((p) => !p.deleted_at), [posts]);
  const deleted = useMemo(() => posts.filter((p) => p.deleted_at), [posts]);

  const categories = useMemo(
    () => [...new Set(active.map((p) => p.category).filter(Boolean))].sort(),
    [active],
  );

  const list = trash ? deleted : active;
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return list.filter((p) => {
      if (kw && !(p.title || "").toLowerCase().includes(kw)) return false;
      if (cat && p.category !== cat) return false;
      if (!trash && st && p.status !== st) return false;
      return true;
    });
  }, [list, q, cat, st, trash]);

  return (
    <>
      <div className="dash-filters">
        <input
          className="txt"
          placeholder="🔍 tìm theo tiêu đề…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="txt" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">— tất cả danh mục —</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {!trash && (
          <select className="txt" value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="">— mọi trạng thái —</option>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        )}
        <button
          className={`btn ${trash ? "btn-green" : "btn-ghost"}`}
          onClick={() => setTrash((v) => !v)}
        >
          🗑 thùng rác ({deleted.length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          {trash ? "Thùng rác trống." : "Không có bài nào khớp bộ lọc."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((p) => (
            <div key={p.id} className="dash-row">
              <span
                className={`badge ${p.status === "published" ? "badge-published" : "badge-draft"}`}
              >
                {p.status}
              </span>

              {trash ? (
                <span className="title">{p.title || "Untitled"}</span>
              ) : (
                <Link href={`/edit/${p.id}`} className="title">
                  {p.title || "Untitled"}
                </Link>
              )}

              <span className="muted hide-sm">{p.category}</span>
              <span className="muted hide-sm" title="lượt xem">
                👁 {p.views ?? 0}
              </span>
              <span className="muted hide-sm">
                {fmt(p.deleted_at ?? p.updated_at)}
              </span>

              {trash ? (
                <>
                  <form action={restorePost}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="btn btn-ghost">↩ khôi phục</button>
                  </form>
                  <form
                    action={hardDeletePost}
                    onSubmit={(e) => {
                      if (
                        !confirm(
                          `XÓA VĨNH VIỄN “${p.title || "Untitled"}”?\nKhông thể khôi phục lại.`,
                        )
                      )
                        e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <button className="btn btn-ghost btn-danger">xoá hẳn</button>
                  </form>
                </>
              ) : (
                <>
                  {p.status === "published" && (
                    <Link
                      href={`/p/${p.slug ?? p.id}`}
                      className="btn btn-ghost"
                      target="_blank"
                    >
                      view ↗
                    </Link>
                  )}
                  <Link href={`/edit/${p.id}`} className="btn btn-ghost">
                    edit
                  </Link>
                  <form
                    action={deletePost}
                    onSubmit={(e) => {
                      if (
                        !confirm(
                          `Đưa “${p.title || "Untitled"}” vào thùng rác?\n(Có thể khôi phục lại sau.)`,
                        )
                      )
                        e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <button className="btn btn-ghost btn-danger">del</button>
                  </form>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
