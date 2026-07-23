import Link from "next/link";
import "./home.css";
import { createPublicClient } from "@/lib/supabase/public";
import HomeFx from "@/components/HomeFx";
import WhaleRunner from "@/components/WhaleRunner";

export const revalidate = 120;

const ASCII = `███████╗██╗  ██╗██╗   ██╗██╗    ██╗██╗  ██╗ █████╗ ██╗     ███████╗    ████████╗███████╗ █████╗ ███╗   ███╗
██╔════╝██║ ██╔╝╚██╗ ██╔╝██║    ██║██║  ██║██╔══██╗██║     ██╔════╝    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
███████╗█████╔╝  ╚████╔╝ ██║ █╗ ██║███████║███████║██║     █████╗         ██║   █████╗  ███████║██╔████╔██║
╚════██║██╔═██╗   ╚██╔╝  ██║███╗██║██╔══██║██╔══██║██║     ██╔══╝         ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║
███████║██║  ██╗   ██║   ╚███╔███╔╝██║  ██║██║  ██║███████╗███████╗       ██║   ███████╗██║  ██║██║ ╚═╝ ██║
╚══════╝╚═╝  ╚═╝   ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝       ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝`;

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
        <canvas className="sw-stars" id="hero-stars" aria-hidden="true"></canvas>
        <img className="sw-hero-deco" src="/whale/constellation.png" alt="" aria-hidden="true"
             style={{ top: "10%", right: "4%", width: 120 }} />
        <img className="sw-hero-deco" src="/whale/astronomy.png" alt="" aria-hidden="true"
             style={{ top: "26%", left: "3.5%", width: 110 }} />
        <img className="sw-hero-deco" src="/whale/rocket.png" alt="" aria-hidden="true"
             style={{ bottom: "16%", right: "5%", width: 92 }} />
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
            fill="var(--bg)"
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
              {/* galaxy: sao chổi + chấm sao */}
              <svg
                className="sw-deco"
                style={{ top: 16, right: 16 }}
                width="150"
                height="120"
                viewBox="0 0 150 120"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="cmt1" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#cfe4f8" />
                    <stop offset="1" stopColor="#cfe4f8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="128" y1="18" x2="60" y2="60" stroke="url(#cmt1)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="130" cy="17" r="2.4" fill="#e6f2fc" />
                <circle cx="22" cy="20" r="1.6" fill="currentColor" />
                <circle cx="58" cy="8" r="1.1" fill="currentColor" />
                <circle cx="98" cy="86" r="1.4" fill="currentColor" />
                <circle cx="30" cy="96" r="1" fill="currentColor" />
                <path d="M70 82 L72 90 L80 92 L72 94 L70 102 L68 94 L60 92 L68 90 Z" fill="currentColor" opacity=".8" />
              </svg>
              <img className="sw-deco-img" src="/whale/saturn.png" alt="" aria-hidden="true"
                   style={{ top: 132, left: 22, width: 88 }} />
              <img
                className="sw-whalecut"
                src="/whale/whale-line.png"
                alt=""
                aria-hidden="true"
              />
              <div className="sw-cgo">
                explore <span className="a">→</span>
              </div>
              <div className="sw-idx">01</div>
            </Link>
            <Link className="sw-dir a2" href="/courses">
              <div className="sw-cpath">~/courses</div>
              <div className="sw-ctitle">Courses</div>
              {/* vài ngôi sao + sao chổi nhỏ */}
              <svg className="sw-deco" style={{ top: 12, right: 14 }} width="120" height="80"
                   viewBox="0 0 120 80" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="cmt2" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#cfe4f8" />
                    <stop offset="1" stopColor="#cfe4f8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="102" y1="16" x2="58" y2="44" stroke="url(#cmt2)" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="104" cy="15" r="1.8" fill="#e6f2fc" />
                <circle cx="22" cy="14" r="1.3" fill="currentColor" />
                <circle cx="44" cy="64" r="1" fill="currentColor" />
                <path d="M20 48 L21.6 53.4 L27 55 L21.6 56.6 L20 62 L18.4 56.6 L13 55 L18.4 53.4 Z" fill="currentColor" opacity=".7" />
              </svg>
              <img
                className="sw-whalecut"
                src="/whale/whale-line.png"
                alt=""
                aria-hidden="true"
              />
              <div className="sw-cgo">
                explore <span className="a">→</span>
              </div>
              <div className="sw-idx">02</div>
            </Link>
            <Link className="sw-dir a3" href="/projects">
              <div className="sw-cpath">~/projects</div>
              <div className="sw-ctitle">Projects</div>
              {/* icon thiên hà + sao/sao chổi nhỏ */}
              <img className="sw-deco-img" src="/whale/galaxy.png" alt="" aria-hidden="true"
                   style={{ top: 14, right: 18, width: 104 }} />
              <svg className="sw-deco" style={{ top: 128, right: 20 }} width="110" height="90"
                   viewBox="0 0 110 90" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="cmt3" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#cfe4f8" />
                    <stop offset="1" stopColor="#cfe4f8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="92" y1="26" x2="42" y2="58" stroke="url(#cmt3)" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="94" cy="25" r="2" fill="#e6f2fc" />
                <circle cx="20" cy="16" r="1.3" fill="currentColor" />
                <circle cx="60" cy="80" r="1.1" fill="currentColor" />
              </svg>
              <img
                className="sw-whalecut"
                src="/whale/whale-line.png"
                alt=""
                aria-hidden="true"
              />
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
