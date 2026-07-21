import Link from "next/link";
import "./home.css";
import { createPublicClient } from "@/lib/supabase/public";
import HomeFx from "@/components/HomeFx";
import WhaleRunner from "@/components/WhaleRunner";

export const revalidate = 120;

const ASCII = `███████╗██╗  ██╗██╗   ██╗██╗    ██╗██╗  ██╗ █████╗ ██╗     ███████╗
██╔════╝██║ ██╔╝╚██╗ ██╔╝██║    ██║██║  ██║██╔══██╗██║     ██╔════╝
███████╗█████╔╝  ╚████╔╝ ██║ █╗ ██║███████║███████║██║     █████╗
╚════██║██╔═██╗   ╚██╔╝  ██║███╗██║██╔══██║██╔══██║██║     ██╔══╝
███████║██║  ██╗   ██║   ╚███╔███╔╝██║  ██║██║  ██║███████╗███████╗
╚══════╝╚═╝  ╚═╝   ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝`;

export default async function Home() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select("id,category")
    .eq("status", "published");
  const posts = data ?? [];
  const writeups = posts.filter((p) => p.category === "writeup").length;
  const projects = posts.filter((p) => p.category === "project").length;
  const courses = posts.filter((p) => p.category === "course").length;
  const activeYears = new Date().getFullYear() - 2024;

  return (
    <div className="sw-home">
      <section className="sw-hero">
        <div className="sw-wrap">
          <pre className="sw-ascii" id="ascii-art">{ASCII}</pre>
          <div className="sw-subrole">
            // a security research crew —{" "}
            <span className="sw-role" id="typed-role"></span>
            <span className="sw-cursor"></span>
          </div>

          <div className="sw-hero-grid">
            <div className="sw-term">
              <div className="sw-termbar">
                <i className="sw-tb-r"></i>
                <i className="sw-tb-y"></i>
                <i className="sw-tb-g"></i>
                <span className="sw-termtitle">skywhale@swt: ~</span>
              </div>
              <div className="sw-termbody" id="terminal-body"></div>
            </div>

            <div className="sw-rcol">
              <div>
                <div className="sw-biolabel">// about</div>
                <p className="sw-bio">
                  <b>SkyWhale Team (SWT)</b> — a security research crew from
                  Vietnam. We reverse malware, break binaries, and document every
                  CTF we solve.
                </p>
              </div>
              <div className="sw-chips">
                <span className="sw-chip on">Reverse Engineering</span>
                <span className="sw-chip on">Malware Analysis</span>
                <span className="sw-chip">Binary Exploitation</span>
                <span className="sw-chip">CTF</span>
              </div>
              <div className="sw-cta">
                <Link className="sw-btn sw-btn-p" href="/writeups">
                  Explore work <span>→</span>
                </Link>
                <Link className="sw-btn sw-btn-o" href="/projects">
                  Projects
                </Link>
              </div>
              <div className="sw-stats">
                <div className="sw-stat">
                  <b>{String(writeups).padStart(2, "0")}</b>
                  <span>WRITEUPS</span>
                </div>
                <div className="sw-stat">
                  <b>{String(projects).padStart(2, "0")}</b>
                  <span>PROJECTS</span>
                </div>
                <div className="sw-stat">
                  <b>{String(courses).padStart(2, "0")}</b>
                  <span>COURSES</span>
                </div>
                <div className="sw-stat">
                  <b>{activeYears}yr</b>
                  <span>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <svg
          className="sw-wave"
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,34 C220,72 430,4 680,31 C920,56 1160,74 1440,29 L1440,72 L0,72 Z"
            fill="#e8ebef"
          />
          <path
            d="M0,34 C220,72 430,4 680,31 C920,56 1160,74 1440,29"
            fill="none"
            stroke="#6aa4c6"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>
      </section>

      <section className="sw-logs" id="logs">
        <div className="sw-wrap">
          <div className="sw-syshead">
            <div className="sw-systitle">
              <span className="hi">SYSTEM</span> LOGS
            </div>
            <span className="sw-sysarch">[ARCHIVE_VIEW]</span>
          </div>
          <div className="sw-sysprompt">
            <span className="hi">root@swt:~$</span>{" "}
            <span id="syslog-msg"></span>
            <span className="sw-cursor"></span>
          </div>
          <div className="sw-dirs">
            <Link className="sw-dir a1" href="/writeups">
              <div className="sw-cpath">~/writeups</div>
              <div className="sw-ctitle">Writeups</div>
              <div className="sw-cdesc">
                CTF solutions &amp; malware analysis logs — picoCTF, TryHackMe
                and beyond.
              </div>
              <div className="sw-cgo">
                explore <span className="a">→</span>
              </div>
              <div className="sw-idx">01</div>
            </Link>
            <Link className="sw-dir a2" href="/courses">
              <div className="sw-cpath">~/courses</div>
              <div className="sw-ctitle">Courses</div>
              <div className="sw-cdesc">
                Our learning path — notes, certs and the knowledge base we build
                from.
              </div>
              <div className="sw-cgo">
                explore <span className="a">→</span>
              </div>
              <div className="sw-idx">02</div>
            </Link>
            <Link className="sw-dir a3" href="/projects">
              <div className="sw-cpath">~/projects</div>
              <div className="sw-ctitle">Projects</div>
              <div className="sw-cdesc">
                GitHub repositories, tooling, and the research samples we tear
                apart.
              </div>
              <div className="sw-cgo">
                explore <span className="a">→</span>
              </div>
              <div className="sw-idx">03</div>
            </Link>
          </div>
        </div>
      </section>

      <HomeFx />
      <WhaleRunner />
    </div>
  );
}
