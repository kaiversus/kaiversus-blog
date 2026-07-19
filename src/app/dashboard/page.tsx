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

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <div className="page-title">// DASHBOARD</div>
          <div className="page-sub">
            &gt; {user?.email} · {drafts.length} draft · {published.length} published
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <MigrateButton />
          <form action={createPost}>
            <button className="btn btn-green">+ note mới</button>
          </form>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost">logout</button>
          </form>
        </div>
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
