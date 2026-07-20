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
import ViewTracker from "@/components/ViewTracker";

export const revalidate = 120;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fmt(d: string | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

// Bảng nhập từ markdown lưu mỗi ô riêng lẻ (không gộp được). Với cột ĐẦU TIÊN,
// gộp các ô trống liên tiếp vào ô có nội dung phía trên bằng rowspan — để "số
// thứ tự" hiện thành 1 ô kéo dài như bảng thường.
function mergeFirstColRowspans(html: string): string {
  const rowRe = /<tr\b[^>]*>[\s\S]*?<\/tr>/g;
  const cellRe = /<(td|th)\b[^>]*>[\s\S]*?<\/\1>/g;
  const isEmpty = (cell: string) =>
    cell
      .replace(/^<t[dh]\b[^>]*>/, "")
      .replace(/<\/t[dh]>$/, "")
      .replace(/<[^>]+>/g, "")
      .trim() === "";

  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/g, (table) => {
    const rows = table.match(rowRe);
    if (!rows) return table;

    const parsed = rows.map((row) => ({
      row,
      open: row.match(/<tr\b[^>]*>/)![0],
      cells: row.match(cellRe) ?? [],
      isHeader: /<th\b/.test(row),
    }));

    let ownerIdx = -1;
    for (let i = 0; i < parsed.length; i++) {
      const p = parsed[i];
      if (p.isHeader || p.cells.length === 0) {
        ownerIdx = -1;
        continue;
      }
      const first = p.cells[0] ?? "";
      const owner = ownerIdx >= 0 ? parsed[ownerIdx] : undefined;
      if (owner && owner.cells[0] && isEmpty(first)) {
        p.cells[0] = ""; // bỏ ô trống ở cột đầu của hàng này
        owner.cells[0] = /rowspan="\d+"/.test(owner.cells[0])
          ? owner.cells[0].replace(
              /rowspan="(\d+)"/,
              (_m, n) => `rowspan="${parseInt(n, 10) + 1}"`,
            )
          : owner.cells[0].replace(/^<td\b/, '<td rowspan="2"');
      } else {
        ownerIdx = i;
      }
    }

    let idx = 0;
    return table.replace(rowRe, () => {
      const p = parsed[idx++];
      return p.cells.length ? `${p.open}${p.cells.join("")}</tr>` : p.row;
    });
  });
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
          {(post.demo_url || post.github_url) && (
            <div className="post-links">
              {post.demo_url && (
                <a href={post.demo_url} target="_blank" rel="noreferrer">
                  ▶ DEMO
                </a>
              )}
              {post.github_url && (
                <a href={post.github_url} target="_blank" rel="noreferrer">
                  ⌥ REPO
                </a>
              )}
            </div>
          )}
        </div>

        {post.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="post-cover" src={post.cover} alt={post.title} />
        )}

        <div
          className="bn-container post-view"
          id="post-content"
          dangerouslySetInnerHTML={{ __html: mergeFirstColRowspans(html) }}
        />
        <CodeEnhance />
        <ViewTracker id={post.id} />

        <div className="post-back">
          <Link href={backHref}>[ cd .. ] {backLabel}</Link>
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
