import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { createClient } from "@/lib/supabase/server";
import type { PostCategory } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thư mục repo Jekyll cũ (chỉ chạy được ở local — migration một lần).
const SRC = "D:/Github/kaiversus.github.io";

interface Job {
  file: string;
  category: PostCategory;
}

// chapter_2d (PE Lab HTML/JS custom) cố tình bỏ — không phải bài markdown thường.
const JOBS: Job[] = [
  { file: "_courses/malware/chapter_1.md", category: "malware" },
  { file: "_courses/malware/chapter_2a.md", category: "malware" },
  { file: "_courses/malware/chapter_2b.md", category: "malware" },
  { file: "_courses/malware/chapter_2c.md", category: "malware" },
  { file: "_courses/TryHackMe/Wifi_Hacking_101/README.md", category: "thm" },
  { file: "_writeups/TapIntoHash_pico/picoCTF_TapIntoHash.md", category: "writeup" },
  { file: "_writeups/vault-door-7_pico/vault-door-7_pico.md", category: "writeup" },
  { file: "_writeups/vault-door-8_pico/vault-door-8.md", category: "writeup" },
];

function parseFrontMatter(raw: string) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {} as Record<string, string>, body: raw };
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (mm) data[mm[1]] = mm[2].trim().replace(/^["']|["']$/g, "");
  }
  return { data, body: m[2] };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function toISO(d?: string) {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

// Tìm ảnh /assets/... trong markdown, upload lên Storage, đổi sang URL công khai.
async function migrateImages(
  body: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
  uploaded: Map<string, string>,
) {
  const refs = new Set<string>();
  const re = /\/assets\/[A-Za-z0-9._/\-]+\.(?:png|jpe?g|gif|webp|svg)/gi;
  let mt: RegExpExecArray | null;
  while ((mt = re.exec(body))) refs.add(mt[0]);

  let out = body;
  for (const ref of refs) {
    let url = uploaded.get(ref);
    if (!url) {
      try {
        const buf = await fs.readFile(path.join(SRC, ref));
        const key = "migrated" + ref.replace(/^\/assets/, "");
        const ext = ref.split(".").pop()!.toLowerCase();
        const ct =
          ext === "svg"
            ? "image/svg+xml"
            : ext === "jpg"
              ? "image/jpeg"
              : `image/${ext}`;
        const up = await supabase.storage
          .from("post-assets")
          .upload(key, buf, { contentType: ct, upsert: true });
        if (up.error && !/exists/i.test(up.error.message)) continue;
        url = supabase.storage.from("post-assets").getPublicUrl(key).data
          .publicUrl;
        uploaded.set(ref, url);
      } catch {
        continue;
      }
    }
    out = out.split(ref).join(url);
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Nhánh test (chỉ dev): parse thử 1 file, không đụng DB, không cần auth.
  if (
    url.searchParams.get("probe") === "1" &&
    process.env.NODE_ENV !== "production"
  ) {
    try {
      const editor = ServerBlockNoteEditor.create();
      const raw = await fs.readFile(
        path.join(SRC, "_courses/malware/chapter_2a.md"),
        "utf8",
      );
      const { body } = parseFrontMatter(raw);
      const norm = body.replace(/\r\n/g, "\n");
      const blocks = await editor.tryParseMarkdownToBlocks(norm);
      const counts: Record<string, number> = {};
      for (const b of blocks) counts[b.type] = (counts[b.type] || 0) + 1;
      return NextResponse.json({ probe: true, total: blocks.length, counts });
    } catch (e) {
      return NextResponse.json({ probe: true, error: String(e) }, { status: 500 });
    }
  }

  if (url.searchParams.get("confirm") !== "1") {
    return NextResponse.json(
      { error: "Thêm ?confirm=1 vào URL để chạy migration." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Ghi vào DB cần auth (RLS chặn anon). Chạy từ dashboard đã đăng nhập.
  if (!user) {
    return NextResponse.json(
      { error: "Chưa đăng nhập. Hãy login rồi bấm nút trong dashboard." },
      { status: 401 },
    );
  }

  // force=1: nhập lại, ghi đè content của các bài đã migrate (sửa bản hỏng CRLF)
  const force = url.searchParams.get("force") === "1";
  const editor = ServerBlockNoteEditor.create();
  const uploaded = new Map<string, string>();
  const results: Record<string, unknown>[] = [];

  for (const job of JOBS) {
    try {
      // Chuẩn hóa CRLF -> LF, nếu không parser bỏ qua code fence
      const raw = (await fs.readFile(path.join(SRC, job.file), "utf8")).replace(
        /\r\n/g,
        "\n",
      );
      const { data, body } = parseFrontMatter(raw);
      const title = data.title || path.basename(job.file, ".md");
      const slug = slugify(title);

      const { data: exists } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (exists && !force) {
        results.push({ file: job.file, status: "skip (đã tồn tại)", slug });
        continue;
      }

      const bodyWithImgs = await migrateImages(body, supabase, uploaded);
      const blocks = await editor.tryParseMarkdownToBlocks(bodyWithImgs);

      let tags: string[] = [];
      if (job.category === "writeup" && data.category) {
        tags = data.category
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      const difficulty = data.difficulty ? data.difficulty.toLowerCase() : null;
      const excerpt = data.description || null;

      if (exists) {
        // ghi đè lại content (và vài field parse) — giữ status/slug/ngày
        const { error } = await supabase
          .from("posts")
          .update({ content: blocks, tags, difficulty, excerpt })
          .eq("id", exists.id);
        results.push(
          error
            ? { file: job.file, status: "error", error: error.message }
            : { file: job.file, status: "updated", slug, blocks: blocks.length },
        );
        continue;
      }

      const { error } = await supabase.from("posts").insert({
        title,
        slug,
        category: job.category,
        tags,
        status: "published",
        difficulty,
        content: blocks,
        excerpt,
        author: data.author || "Kaiversus",
        published_at: toISO(data.date) ?? new Date().toISOString(),
      });
      results.push(
        error
          ? { file: job.file, status: "error", error: error.message }
          : { file: job.file, status: "ok", slug, blocks: blocks.length },
      );
    } catch (e) {
      results.push({ file: job.file, status: "error", error: String(e) });
    }
  }

  for (const p of ["/", "/writeups", "/courses", "/projects", "/dashboard"])
    revalidatePath(p);
  for (const r of results) {
    if (typeof r.slug === "string") revalidatePath(`/p/${r.slug}`);
  }

  return NextResponse.json({
    done: true,
    images_uploaded: uploaded.size,
    results,
  });
}
