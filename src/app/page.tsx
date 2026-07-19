import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type Post } from "@/lib/types";

export const dynamic = "force-dynamic";

function fmt(d: string | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data } = await query;
  const posts = (data ?? []) as Post[];

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <div className="page-title">// NOTEBOOK</div>
          <div className="page-sub">
            &gt; các bản ghi đã publish{category ? ` · filter: ${category}` : ""}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
        <Link href="/" className="btn btn-ghost">
          all
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.value} href={`/?category=${c.value}`} className="btn btn-ghost">
            {c.label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="empty">
          Chưa có bài nào được publish. Vào <Link href="/dashboard" style={{ color: "var(--green)" }}>dashboard</Link> để viết.
        </div>
      ) : (
        <div className="post-grid">
          {posts.map((p) => (
            <Link key={p.id} href={`/p/${p.slug ?? p.id}`} className="post-card">
              <div className="post-card-meta">
                <span>{p.category}</span>
                {p.difficulty && <span className="badge badge-published">{p.difficulty}</span>}
                <span style={{ marginLeft: "auto" }}>{fmt(p.published_at)}</span>
              </div>
              <div className="post-card-title">{p.title}</div>
              <div className="post-card-desc">{p.excerpt ?? ""}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
