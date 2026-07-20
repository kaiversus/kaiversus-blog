import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type Post } from "@/lib/types";
import { createPost, deletePost } from "./actions";
import MigrateButton from "@/components/MigrateButton";

export const dynamic = "force-dynamic";

function fmt(d: string) {
  return new Date(d).toISOString().slice(0, 16).replace("T", " ");
}

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });
  const posts = (data ?? []) as Post[];

  const drafts = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");

  // Danh sách khóa học đã có = category khác writeup/project/note
  const courseCats = [
    ...new Set(
      posts
        .map((p) => p.category)
        .filter((c) => c && !["writeup", "project", "note"].includes(c)),
    ),
  ].sort();

  return (
    <main className="container admin">
      <div className="page-head">
        <div>
          <div className="page-title">// DASHBOARD</div>
          <div className="page-sub">
            &gt; {user?.email} · {drafts.length} draft · {published.length} published
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <MigrateButton />
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost">logout</button>
          </form>
        </div>
      </div>

      <div className="new-post-bar">
        <span className="new-post-label">Tạo mới:</span>
        <form action={createPost}>
          <input type="hidden" name="category" value="note" />
          <button className="btn btn-ghost">+ note</button>
        </form>
        <form action={createPost}>
          <input type="hidden" name="category" value="writeup" />
          <button className="btn btn-ghost">+ writeup</button>
        </form>
        <form action={createPost}>
          <input type="hidden" name="category" value="project" />
          <button className="btn btn-ghost">+ project</button>
        </form>
        <form action={createPost} className="new-course">
          <input
            className="txt"
            name="category"
            list="course-cats"
            placeholder="tên khóa học…"
            autoComplete="off"
            required
          />
          <datalist id="course-cats">
            {courseCats.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <button className="btn btn-green">+ bài khóa học</button>
        </form>
      </div>

      {posts.length === 0 ? (
        <div className="empty">Chưa có gì. Bấm “+ note mới” để bắt đầu ghi chép.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {posts.map((p) => (
            <div key={p.id} className="dash-row">
              <span
                className={`badge ${p.status === "published" ? "badge-published" : "badge-draft"}`}
              >
                {p.status}
              </span>
              <Link href={`/edit/${p.id}`} className="title">
                {p.title || "Untitled"}
              </Link>
              <span className="muted hide-sm">{p.category}</span>
              <span className="muted hide-sm">{fmt(p.updated_at)}</span>
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
              <form action={deletePost}>
                <input type="hidden" name="id" value={p.id} />
                <button className="btn btn-ghost btn-danger">del</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
