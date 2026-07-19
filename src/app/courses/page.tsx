import { createClient } from "@/lib/supabase/server";
import CoursesBrowser, { type Group } from "@/components/CoursesBrowser";
import "./courses.css";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  title: string;
  slug: string | null;
  category: string;
  difficulty: string | null;
  excerpt: string | null;
  published_at: string | null;
}

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id,title,slug,category,difficulty,excerpt,published_at")
    .eq("status", "published")
    .not("category", "in", "(writeup,project,note)")
    .order("title");
  const rows = (data ?? []) as Row[];

  const map = new Map<string, Group>();
  for (const r of rows) {
    if (!map.has(r.category)) map.set(r.category, { name: r.category, modules: [] });
    map.get(r.category)!.modules.push({
      id: r.id,
      title: r.title,
      slug: r.slug,
      difficulty: r.difficulty,
      excerpt: r.excerpt,
      date: r.published_at,
    });
  }
  const groups = [...map.values()];

  return (
    <div className="ac-page">
      <div className="ac-header">
        <h1 className="ac-title">
          <span className="slash">// </span>ACADEMY_DATABASE
        </h1>
        <span className="ac-status">SYS_STATUS: ONLINE</span>
      </div>
      <a href="/" className="ac-back">
        ← BACK_TO_ROOT
      </a>
      <CoursesBrowser groups={groups} />
    </div>
  );
}
