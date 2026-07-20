import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import "./projects.css";

export const revalidate = 120;

interface Row {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  published_at: string | null;
  cover: string | null;
  github_url: string | null;
  demo_url: string | null;
}

export default async function ProjectsPage() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,published_at,cover,github_url,demo_url")
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
                {post.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="proj-thumb-img" src={post.cover} alt={post.title} />
                ) : (
                  <div className="proj-thumb-placeholder">[ NO PREVIEW ]</div>
                )}
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
                {post.demo_url && (
                  <a
                    href={post.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="proj-btn proj-btn-demo"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z" />
                    </svg>{" "}
                    DEMO
                  </a>
                )}
                {post.github_url && (
                  <a
                    href={post.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="proj-btn proj-btn-github"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 22 12 10 10 0 0 0 12 2z" />
                    </svg>{" "}
                    REPO
                  </a>
                )}
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
