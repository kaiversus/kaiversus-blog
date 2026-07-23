import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sửa bài cũ: các đoạn code bị migration nhét vào paragraph dưới dạng
 * ``` fence (kể cả fence mở ở paragraph này, đóng ở paragraph sau)
 * → tách thành codeBlock thật.
 *
 * Cách dùng (đăng nhập admin trước):
 *   /api/fix-fences?dry=1  → xem trước bài nào sẽ đổi
 *   /api/fix-fences        → sửa thật
 */

type Style = Record<string, unknown>;
interface InlineText {
  type: string;
  text?: string;
  styles?: Style;
  [k: string]: unknown;
}
interface Block {
  id?: string;
  type: string;
  props?: Record<string, unknown>;
  content?: InlineText[] | unknown;
  children?: Block[];
  [k: string]: unknown;
}

const plain = (b: Block): string =>
  Array.isArray(b.content)
    ? (b.content as InlineText[]).map((c) => c.text ?? "").join("")
    : "";

const para = (text: string): Block => ({
  type: "paragraph",
  content: text ? [{ type: "text", text, styles: {} }] : [],
});

const codeBlock = (code: string, lang: string): Block => ({
  type: "codeBlock",
  props: { language: lang || "text" },
  content: [{ type: "text", text: code.replace(/\s+$/, ""), styles: {} }],
});

// Tách 1 danh sách block: gom vùng giữa ``` ... ``` thành codeBlock.
function transform(blocks: Block[]): { out: Block[]; changed: boolean } {
  const out: Block[] = [];
  let changed = false;

  let inFence = false;
  let lang = "";
  let codeLines: string[] = [];

  const flushCode = () => {
    out.push(codeBlock(codeLines.join("\n"), lang));
    codeLines = [];
    lang = "";
    inFence = false;
  };

  for (const b of blocks) {
    // đệ quy vào children trước (list item chứa paragraph con)
    if (b.children && b.children.length) {
      const r = transform(b.children);
      if (r.changed) {
        b.children = r.out;
        changed = true;
      }
    }

    const isTextual = b.type === "paragraph" || b.type === "heading";
    const text = isTextual ? plain(b) : "";

    if (!inFence) {
      if (isTextual && text.includes("```")) {
        changed = true;
        const idx = text.indexOf("```");
        const before = text.slice(0, idx).replace(/\s+$/, "");
        const after = text.slice(idx + 3);
        // giữ block gốc (giữ style đậm/nghiêng) nếu phần trước fence là toàn bộ text
        if (before) out.push(para(before));
        // dòng đầu sau ``` có thể là tên ngôn ngữ
        const nl = after.indexOf("\n");
        if (nl === -1) {
          lang = after.trim();
          inFence = true;
        } else {
          lang = after.slice(0, nl).trim();
          const rest = after.slice(nl + 1);
          inFence = true;
          // fence có thể đóng ngay trong cùng paragraph
          const close = rest.indexOf("```");
          if (close !== -1) {
            codeLines.push(rest.slice(0, close));
            flushCode();
            const tail = rest.slice(close + 3).trim();
            if (tail) out.push(para(tail));
          } else {
            if (rest) codeLines.push(rest);
          }
        }
      } else {
        out.push(b);
      }
    } else {
      // đang trong fence: block này là code (hoặc chứa dấu đóng)
      changed = true;
      const close = text.indexOf("```");
      if (isTextual && close !== -1) {
        const chunk = text.slice(0, close).replace(/\s+$/, "");
        if (chunk) codeLines.push(chunk);
        flushCode();
        const tail = text.slice(close + 3).trim();
        if (tail) out.push(para(tail));
      } else if (isTextual) {
        codeLines.push(text);
      } else {
        // block không phải text (ảnh/bảng) mà đang trong fence → đóng fence cho an toàn
        flushCode();
        out.push(b);
      }
    }
  }
  if (inFence) flushCode(); // fence không đóng — vẫn chốt lại
  return { out, changed };
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const dry = new URL(req.url).searchParams.get("dry") === "1";

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id,title,slug,content")
    .is("deleted_at", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const fixed: string[] = [];
  for (const post of posts ?? []) {
    const blocks = post.content as Block[] | null;
    if (!Array.isArray(blocks)) continue;
    const r = transform(structuredClone(blocks));
    if (!r.changed) continue;
    fixed.push(post.title);
    if (!dry) {
      const { error: upErr } = await supabase
        .from("posts")
        .update({ content: r.out })
        .eq("id", post.id);
      if (upErr)
        return NextResponse.json(
          { error: `${post.title}: ${upErr.message}`, fixedSoFar: fixed },
          { status: 500 },
        );
      revalidatePath(`/p/${post.slug ?? post.id}`);
    }
  }

  return NextResponse.json({ dry, fixedCount: fixed.length, fixed });
}
