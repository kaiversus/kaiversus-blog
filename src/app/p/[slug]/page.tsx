import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import type { PartialBlock } from "@blocknote/core";
import "highlight.js/styles/atom-one-dark.css";
import "katex/dist/katex.min.css";
import { serverSchema } from "@/lib/blocknote/server-schema";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL, SITE_NAME } from "@/lib/site";
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

// Rút tiêu đề các mục (heading) trong bài làm keywords SEO — để Google
// bắt được cả từ khóa trong nội dung (PE header, DOS stub, IAT...).
function headingTerms(blocks: unknown): string[] {
  const out: string[] = [];
  const walk = (bs: unknown[]) => {
    for (const b of bs ?? []) {
      const blk = b as {
        type?: string;
        content?: { text?: string }[];
        children?: unknown[];
      };
      if (blk?.type === "heading" && Array.isArray(blk.content)) {
        const t = blk.content.map((c) => c.text ?? "").join("").trim();
        if (t && t.length <= 60) out.push(t);
      }
      if (Array.isArray(blk?.children) && blk.children.length)
        walk(blk.children);
    }
  };
  if (Array.isArray(blocks)) walk(blocks);
  return out.slice(0, 12);
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

  const url = `${SITE_URL}/p/${post.slug ?? post.id}`;
  const description =
    post.excerpt ?? `${post.title} — bài viết trên ${SITE_NAME}.`;
  const keywords = [
    ...new Set(
      [
        ...(post.tags ?? []),
        ...headingTerms(post.content),
        post.category,
        "malware analysis",
        "reverse engineering",
        "PE file",
        "CTF writeup",
        "cybersecurity",
        "SkyWhale Team",
        "SWT",
      ].filter(Boolean) as string[],
    ),
  ].slice(0, 25);
  const images = post.cover ? [{ url: post.cover, alt: post.title }] : undefined;

  return {
    title: post.title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      title: post.title,
      description,
      images,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags ?? undefined,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.cover ? [post.cover] : undefined,
    },
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

  // Bài liên quan (ưu tiên cùng danh mục) — internal link tốt cho SEO + giữ chân người đọc.
  const pub = createPublicClient();
  const { data: relRaw } = await pub
    .from("posts")
    .select("id,title,slug,category,published_at")
    .eq("status", "published")
    .neq("id", post.id)
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(12);
  const rel = relRaw ?? [];
  const related = [
    ...rel.filter((r) => r.category === post.category),
    ...rel.filter((r) => r.category !== post.category),
  ].slice(0, 3);

  const server = ServerBlockNoteEditor.create({ schema: serverSchema });
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

  const canonical = `${SITE_URL}/p/${post.slug ?? post.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover ? [post.cover] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    author: {
      "@type": "Person",
      name: post.author ?? "Đinh Thiên Bảo",
    },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: canonical,
    articleSection: post.category,
    keywords:
      [...(post.tags ?? []), ...headingTerms(post.content)].join(", ") ||
      undefined,
  };

  return (
    <div className="writeup-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="wc-main">
        <div className="writeup-header">
          <div className="terminal-prompt">
            <span style={{ color: "var(--green)" }}>
              root@skywhale:~/{post.category}$
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
                <span style={{ color: "var(--amber)", fontWeight: 700 }}>
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

        {related.length > 0 && (
          <div className="post-related">
            <div className="pr-title">// read next</div>
            <ul>
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/p/${r.slug ?? r.id}`}>
                    <span className="pr-cat">[{r.category}]</span> {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

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
