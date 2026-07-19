import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import "./projects.css";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  published_at: string | null;
}

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,published_at")
    .eq("status", "published")
    .eq("category", "project")
    .order("published_at", { ascending: false });
  const posts = (data ?? []) as Row[];

  return (
    <div className="proj-page">
      <div className="proj-page-header">
        <h1 className="proj-page-title">
          <span className="slash">// </span>PROJECTS_DIRECTORY
        </h1>
        <Link href="/" className="proj-back">
          ← cd ~
        </Link>
      </div>

      <div className="proj-section">
        <div className="proj-section-label">
          <span className="proj-section-tag green">MAIN</span>
          <span className="proj-section-name">PROJECTS</span>
          <span className="proj-section-desc">Tools, research &amp; experiments</span>
        </div>
        <div className="proj-grid">
          {posts.map((post) => (
            <article key={post.id} className="proj-card green">
              <div className="proj-thumb">
                <div className="proj-thumb-placeholder">[ NO PREVIEW ]</div>
              </div>
              <div className="proj-card-body">
                <div className="proj-card-meta">
                  <span className="proj-card-type green">[PRO]</span>
                  <span>
                    {post.published_at
                      ? new Date(post.published_at).toISOString().slice(0, 10)
                      : ""}
                  </span>
                </div>
                <h3 className="proj-card-title">{post.title}</h3>
                <p className="proj-card-desc">
                  {post.excerpt || "No description provided."}
                </p>
              </div>
              <div className="proj-card-footer">
                <Link
                  href={`/p/${post.slug ?? post.id}`}
                  className="proj-btn proj-btn-primary green"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>{" "}
                  LOGS
                </Link>
              </div>
            </article>
          ))}
          {posts.length === 0 && (
            <p style={{ color: "var(--proj-muted)" }}>Chưa có project nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
