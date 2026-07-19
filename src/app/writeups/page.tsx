import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import "./writeups.css";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  title: string;
  slug: string | null;
  tags: string[];
  excerpt: string | null;
  published_at: string | null;
}

function tagClass(t: string) {
  const s = t.toLowerCase();
  if (s === "reverse") return "wu-tag-reverse";
  if (s === "crypto") return "wu-tag-crypto";
  if (s === "web") return "wu-tag-web";
  if (s === "forensic" || s === "forensics") return "wu-tag-forensic";
  return "wu-tag-default";
}

export default async function WriteupsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id,title,slug,tags,excerpt,published_at")
    .eq("status", "published")
    .eq("category", "writeup")
    .order("published_at", { ascending: false });
  const posts = (data ?? []) as Row[];

  return (
    <section className="wu-page">
      <div className="wu-page-header">
        <span className="path">~/home/kai/writeups</span>
        <Link href="/">[ cd ~ ]</Link>
      </div>
      <h1 className="wu-title">Writeups Archive</h1>

      <div className="wu-grid">
        {posts.map((post) => (
          <Link key={post.id} href={`/p/${post.slug ?? post.id}`} className="wu-card">
            <div className="wu-card-top">
              <div className="wu-tags">
                {(post.tags ?? []).map((t) => (
                  <span key={t} className={`wu-tag ${tagClass(t)}`}>
                    {t}
                  </span>
                ))}
              </div>
              <span className="wu-date">
                {post.published_at
                  ? new Date(post.published_at).toISOString().slice(0, 10)
                  : ""}
              </span>
            </div>
            <h3 className="wu-card-title">{post.title}</h3>
            <p className="wu-card-desc">
              {post.excerpt ||
                "Reading log data... Extracting strings... Ready for analysis."}
            </p>
            <div className="wu-card-cta">[ READ_LOG ]</div>
          </Link>
        ))}
        {posts.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>Chưa có writeup nào.</p>
        )}
      </div>
    </section>
  );
}
