import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PartialBlock } from "@blocknote/core";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import PostView from "@/components/PostView";

export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fmt(d: string | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createClient();
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

  return (
    <main className="container" style={{ maxWidth: "100%", paddingTop: 32 }}>
      <div style={{ maxWidth: "var(--content-width)", margin: "0 auto 20px" }}>
        <Link href="/" className="btn btn-ghost">
          ← home
        </Link>
      </div>

      <header className="post-head">
        <div className="post-kicker">
          root@kaiversus:~/{post.category}$ cat {post.slug ?? post.id}.md
        </div>
        <h1 className="post-h1">{post.title}</h1>
        <div className="post-submeta">
          <span>[ {fmt(post.published_at)} ]</span>
          {post.difficulty && (
            <span className="badge badge-published">{post.difficulty}</span>
          )}
          {post.author && <span>· {post.author}</span>}
          {post.tags?.map((t) => (
            <span key={t} style={{ color: "var(--text-sub)" }}>
              #{t}
            </span>
          ))}
        </div>
      </header>

      <hr className="post-divider" />

      <PostView content={(post.content as PartialBlock[]) ?? []} />
    </main>
  );
}
