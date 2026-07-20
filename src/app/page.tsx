import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import HomeFx from "@/components/HomeFx";

export const revalidate = 120;

interface Row {
  id: string;
  title: string;
  slug: string | null;
  category: string;
  excerpt: string | null;
  published_at: string | null;
}

export default async function Home() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select("id,title,slug,category,excerpt,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  const posts = (data ?? []) as Row[];
  const recent = posts.slice(0, 3);
  const writeups = posts.filter((p) => p.category === "writeup").length;
  const projects = posts.filter((p) => p.category === "project").length;
  const total = posts.length;
  const activeYears = new Date().getFullYear() - 2024;

  return (
    <>
      <div className="hero-banner">
        <canvas id="matrix-canvas"></canvas>
        <div className="ascii-wrap">
          <pre className="ascii-art" id="ascii-art">{`██╗  ██╗ █████╗ ██╗██╗   ██╗███████╗██████╗ ███████╗██╗   ██╗███████╗
██║ ██╔╝██╔══██╗██║██║   ██║██╔════╝██╔══██╗██╔════╝██║   ██║██╔════╝
█████╔╝ ███████║██║██║   ██║█████╗  ██████╔╝███████╗██║   ██║███████╗
██╔═██╗ ██╔══██║██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██║   ██║╚════██║
██║  ██╗██║  ██║██║ ╚████╔╝ ███████╗██║  ██║███████║╚██████╔╝███████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝`}</pre>
          <div className="ascii-sub">
            <span className="ascii-role" id="typed-role"></span>
            <span className="t-cursor"></span>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="terminal-window">
            <div className="terminal-chrome">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
              <span className="terminal-title">swt@skywhale: ~</span>
            </div>
            <div className="terminal-body" id="terminal-body"></div>
          </div>
          <div className="hero-right-col">
            <div className="hero-bio">
              <div className="hero-bio-label">// about</div>
              <p className="hero-bio-text">
                SkyWhale Team (SWT) — a security research crew from Vietnam. We
                reverse malware, break binaries, and write about what we find.
              </p>
            </div>
            <div className="hero-skills">
              <span className="skill-chip hi">Reverse Engineering</span>
              <span className="skill-chip hi">Binary Exploitation</span>
              <span className="skill-chip">Malware Analysis</span>
              <span className="skill-chip">CTF</span>
            </div>
            <div className="hero-cta">
              <a href="#recent" className="btn btn-green">
                Recent Posts
              </a>
              <a href="#projects" className="btn btn-ghost">
                Projects
              </a>
            </div>
            <div className="hero-stats-row">
              <div className="stat-inline">
                <span className="stat-num">{writeups}</span>
                <span className="stat-lbl">Writeups</span>
              </div>
              <div className="stat-inline">
                <span className="stat-num">{projects}</span>
                <span className="stat-lbl">Projects</span>
              </div>
              <div className="stat-inline">
                <span className="stat-num">{total}</span>
                <span className="stat-lbl">Posts</span>
              </div>
              <div className="stat-inline">
                <span className="stat-num">{activeYears}yr</span>
                <span className="stat-lbl">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section" id="recent">
        <div className="section-head">
          <div className="section-dir">
            <span className="section-path">
              <span className="arrow">~/</span>home/kai/writeups
            </span>
            <span className="section-title">Recent Posts</span>
          </div>
          <Link href="/writeups" className="section-link">
            all posts
          </Link>
        </div>
        <div className="writeup-list">
          {recent.map((post, i) => (
            <Link
              key={post.id}
              href={`/p/${post.slug ?? post.id}`}
              className="writeup-item"
            >
              <div className="wi-idx">0{i + 1}</div>
              <div className="wi-body">
                <div className="wi-meta">
                  <span
                    className={`tag ${post.category === "writeup" ? "tag-re" : "tag-crypto"}`}
                  >
                    {post.category}
                  </span>
                  <span className="wi-date">
                    {post.published_at
                      ? new Date(post.published_at).toISOString().slice(0, 7)
                      : ""}
                  </span>
                </div>
                <div className="wi-title">{post.title}</div>
                <div className="wi-desc">
                  {post.excerpt || "Truy cập để đọc chi tiết nhật ký hệ thống..."}
                </div>
              </div>
              <div className="wi-arrow">→</div>
            </Link>
          ))}
          {recent.length === 0 && (
            <div className="wi-body" style={{ padding: 24 }}>
              <div className="wi-desc">
                Chưa có bài nào. Vào{" "}
                <Link href="/dashboard" style={{ color: "var(--green)" }}>
                  dashboard
                </Link>{" "}
                để viết.
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="section-divider" />

      <div className="section" id="projects">
        <div className="syslog-head">
          <div className="syslog-title">
            <span className="hi">SYSTEM</span> LOGS
          </div>
          <span className="syslog-archive">[ARCHIVE_VIEW]</span>
        </div>
        <div className="syslog-prompt">
          <span className="t-prompt">root@repo:~$</span>
          <span className="t-msg" id="syslog-msg"></span>
          <span className="t-cursor"></span>
        </div>
        <div className="dir-grid">
          <Link href="/writeups" className="dir-card green">
            <div className="dir-header">
              <span>home/kai/writeups</span>
              <span className="dir-badge">[DIR]</span>
            </div>
            <div className="dir-body">
              <div className="dir-title">WRITEUPS</div>
              <ul className="dir-list">
                <li>CTF Solutions</li>
                <li>Malware Analysis Logs</li>
                <li>Access Denied to unauthorized users</li>
              </ul>
            </div>
            <div className="dir-footer">
              <span className="dir-cta">[ CD_INTO_DIR ]</span>
            </div>
          </Link>

          <Link href="/courses" className="dir-card yellow">
            <div className="dir-header">
              <span>home/kai/courses</span>
              <span className="dir-badge">[DIR]</span>
            </div>
            <div className="dir-body">
              <div className="dir-title">COURSES</div>
              <ul className="dir-list">
                <li>Learning Path</li>
                <li>Certifications &amp; Notes</li>
                <li>Knowledge Base</li>
              </ul>
            </div>
            <div className="dir-footer">
              <span className="dir-cta">[ CD_INTO_DIR ]</span>
            </div>
          </Link>

          <Link href="/projects" className="dir-card red">
            <div className="dir-header">
              <span>/home/kai/projects</span>
              <span className="dir-badge">[DIR]</span>
            </div>
            <div className="dir-body">
              <div className="dir-title">PROJECTS</div>
              <ul className="dir-list">
                <li>Github Repositories</li>
                <li>Coding Tools</li>
                <li>Personal Malware Samples</li>
              </ul>
            </div>
            <div className="dir-footer">
              <span className="dir-cta">[ CD_INTO_DIR ]</span>
            </div>
          </Link>
        </div>
      </div>
      <hr className="section-divider" />

      <HomeFx />
    </>
  );
}
