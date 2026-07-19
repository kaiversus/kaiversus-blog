import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import type { PartialBlock } from "@blocknote/core";
import "highlight.js/styles/atom-one-dark.css";
import { createPublicClient } from "@/lib/supabase/public";
import type { Post } from "@/lib/types";
import Toc from "@/components/Toc";
import CodeEnhance from "@/components/CodeEnhance";

export const revalidate = 120;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fmt(d: string | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

async function getPost(slug: string): Promise<Post | null> {
  const supabase = createPublicClient();
  let query = supabase.from("posts").select("*").eq("status", "published");
  query = UUID.test(slug) ? query.eq("id", slug) : query.eq("slug", slug);
  const { data } = await query.maybeSingle();
  return (data as Post) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} // Kaiversus`,
    description: post.excerpt ?? undefined,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const server = ServerBlockNoteEditor.create();
  const html = await server.blocksToFullHTML(
    (post.content as PartialBlock[]) ?? [],
  );

  const backHref =
    post.category === "writeup"
      ? "/writeups"
      : post.category === "project"
        ? "/projects"
        : "/courses";
  const backLabel =
    post.category === "writeup"
      ? "Back to Archive"
      : post.category === "project"
        ? "Back to Projects"
        : "Back to Courses";

  return (
    <div className="writeup-container">
      <article className="wc-main">
        <div className="writeup-header">
          <div className="terminal-prompt">
            <span style={{ color: "#4ade80" }}>
              root@kaiversus:~/{post.category}$
            </span>{" "}
            cat {post.slug ?? post.id}.md
          </div>
          <h1>{post.title}</h1>
          <div className="writeup-meta">
            [ DATE: {fmt(post.published_at)} ]
            {post.difficulty && (
              <>
                {" "}
                | LEVEL:{" "}
                <span style={{ color: "#ffaa00", fontWeight: 700 }}>
                  {post.difficulty}
                </span>
              </>
            )}
            {post.author && <> | AUTHOR: {post.author}</>}
          </div>
        </div>

        <div
          className="bn-container post-view"
          id="post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <CodeEnhance />

        <div
          style={{
            marginTop: 50,
            borderTop: "1px dashed var(--border)",
            paddingTop: 20,
          }}
        >
          <Link href={backHref} style={{ color: "var(--text-muted)" }}>
            [ cd .. ] {backLabel}
          </Link>
        </div>
      </article>

      <aside className="writeup-sidebar">
        <div className="toc-wrapper">
          <div className="toc-title">ON THIS PAGE</div>
          <Toc target="#post-content" bare />
        </div>
      </aside>
    </div>
  );
}
