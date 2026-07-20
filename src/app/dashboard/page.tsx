import { createClient } from "@/lib/supabase/server";
import { type Post } from "@/lib/types";
import { createPost } from "./actions";
import MigrateButton from "@/components/MigrateButton";
import DashboardList from "@/components/DashboardList";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });
  const posts = (data ?? []) as Post[];

  // Chỉ đếm bài chưa nằm trong thùng rác
  const active = posts.filter((p) => !p.deleted_at);
  const drafts = active.filter((p) => p.status === "draft");
  const published = active.filter((p) => p.status === "published");

  // Danh sách khóa học đã có = category khác writeup/project/note
  const courseCats = [
    ...new Set(
      active
        .map((p) => p.category)
        .filter((c) => c && !["writeup", "project", "note"].includes(c)),
    ),
  ].sort();

  return (
    <main className="container admin">
      <div className="page-head">
        <div>
          <div className="page-title">// DASHBOARD</div>
          <div className="page-sub">
            &gt; {user?.email} · {drafts.length} draft · {published.length} published
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <MigrateButton />
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost">logout</button>
          </form>
        </div>
      </div>

      <div className="new-post-bar">
        <span className="new-post-label">Tạo mới:</span>
        <form action={createPost}>
          <input type="hidden" name="category" value="note" />
          <button className="btn btn-ghost">+ note</button>
        </form>
        <form action={createPost}>
          <input type="hidden" name="category" value="writeup" />
          <button className="btn btn-ghost">+ writeup</button>
        </form>
        <form action={createPost}>
          <input type="hidden" name="category" value="project" />
          <button className="btn btn-ghost">+ project</button>
        </form>
        <form action={createPost} className="new-course">
          <input
            className="txt"
            name="category"
            list="course-cats"
            placeholder="tên khóa học…"
            autoComplete="off"
            required
          />
          <datalist id="course-cats">
            {courseCats.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <button className="btn btn-green">+ bài khóa học</button>
        </form>
      </div>

      {posts.length === 0 ? (
        <div className="empty">Chưa có gì. Bấm “+ note” để bắt đầu ghi chép.</div>
      ) : (
        <DashboardList posts={posts} />
      )}
    </main>
  );
}
