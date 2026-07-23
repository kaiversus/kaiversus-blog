"use client";

import { useEffect } from "react";

// Hiệu ứng gõ chữ ở hero: role xoay vòng, terminal, và dòng syslog.
export default function HomeFx() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let killed = false;
    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!killed) fn();
      }, ms);
      timers.push(id);
    };

    // ── Trời sao + sao băng trong hero ──
    let starRaf = 0;
    let cleanupStars: (() => void) | null = null;
    const cv = document.getElementById("hero-stars") as HTMLCanvasElement | null;
    if (cv) {
      const ctx = cv.getContext("2d")!;
      const dpr = window.devicePixelRatio || 1;
      let W = 0,
        H = 0;
      let stars: { x: number; y: number; r: number; p: number; s: number }[] = [];
      const resize = () => {
        const b = cv.parentElement!;
        W = b.offsetWidth;
        H = b.offsetHeight;
        cv.width = W * dpr;
        cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        stars = Array.from({ length: Math.floor((W * H) / 9000) }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.2 + 0.4,
          p: Math.random() * Math.PI * 2,
          s: 0.5 + Math.random() * 1.4,
        }));
      };
      resize();
      window.addEventListener("resize", resize);

      const drawStars = (now: number, twinkle: boolean) => {
        for (const st of stars) {
          ctx.globalAlpha = twinkle
            ? 0.35 + 0.65 * Math.abs(Math.sin((now / 1000) * st.s + st.p))
            : 0.7;
          ctx.fillStyle = "#cfe4f8";
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      };

      if (reduce) {
        drawStars(0, false); // tĩnh, không sao băng
        cleanupStars = () => window.removeEventListener("resize", resize);
      } else {
        // sao băng: xuất hiện chỗ ngẫu nhiên, ~5s một lần
        type Comet = {
          x: number; y: number; vx: number; vy: number; life: number; max: number;
        };
        let comet: Comet | null = null;
        let nextComet = performance.now() + 2200;
        let last = performance.now();

        const frame = (now: number) => {
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          ctx.clearRect(0, 0, W, H);
          drawStars(now, true);

          if (!comet && now >= nextComet) {
            const ang = ((18 + Math.random() * 28) * Math.PI) / 180;
            const dir = Math.random() < 0.5 ? 1 : -1;
            const speed = 500 + Math.random() * 280;
            comet = {
              x: W * 0.06 + Math.random() * W * 0.88,
              y: H * 0.06 + Math.random() * H * 0.55,
              vx: Math.cos(ang) * speed * dir,
              vy: Math.sin(ang) * speed,
              life: 0,
              max: 0.8 + Math.random() * 0.5,
            };
          }
          if (comet) {
            comet.life += dt;
            comet.x += comet.vx * dt;
            comet.y += comet.vy * dt;
            const t = comet.life / comet.max;
            const fade = t < 0.15 ? t / 0.15 : t > 0.65 ? Math.max(0, (1 - t) / 0.35) : 1;
            const sp = Math.hypot(comet.vx, comet.vy);
            const tail = 95 + 55 * fade;
            const tx = comet.x - (comet.vx / sp) * tail;
            const ty = comet.y - (comet.vy / sp) * tail;
            const g = ctx.createLinearGradient(comet.x, comet.y, tx, ty);
            g.addColorStop(0, `rgba(225,242,255,${0.95 * fade})`);
            g.addColorStop(1, "rgba(225,242,255,0)");
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.6;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(comet.x, comet.y);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            ctx.fillStyle = `rgba(240,250,255,${fade})`;
            ctx.beginPath();
            ctx.arc(comet.x, comet.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
            if (comet.life >= comet.max || comet.x < -120 || comet.x > W + 120 || comet.y > H + 120) {
              comet = null;
              nextComet = now + 3800 + Math.random() * 2600; // ~4–6.5s
            }
          }
          starRaf = requestAnimationFrame(frame);
        };
        starRaf = requestAnimationFrame(frame);
        cleanupStars = () => {
          cancelAnimationFrame(starRaf);
          window.removeEventListener("resize", resize);
        };
      }
    }

    // ── Role typer (xoay vòng) ──
    const roles = [
      "malware analysis",
      "reverse engineering",
      "binary exploitation",
      "ctf writeups",
    ];
    const roleEl = document.getElementById("typed-role");
    if (roleEl) {
      if (reduce) {
        roleEl.textContent = roles[0];
      } else {
        let rIdx = 0,
          rChar = 0,
          deleting = false;
        const typeRole = () => {
          const cur = roles[rIdx];
          if (!deleting) {
            roleEl.textContent = cur.slice(0, ++rChar);
            if (rChar === cur.length)
              later(() => {
                deleting = true;
                typeRole();
              }, 2200);
            else later(typeRole, 42);
          } else {
            roleEl.textContent = cur.slice(0, --rChar);
            if (rChar === 0) {
              deleting = false;
              rIdx = (rIdx + 1) % roles.length;
              later(typeRole, 420);
            } else later(typeRole, 20);
          }
        };
        later(typeRole, 700);
      }
    }

    // ── Syslog typer (một lần) ──
    const syslogEl = document.getElementById("syslog-msg");
    const syslog =
      "scanning ./projects — repositories indexed, 0 threats to us.";
    if (syslogEl) {
      if (reduce) {
        syslogEl.textContent = syslog;
      } else {
        let i = 0;
        const typeSys = () => {
          syslogEl.textContent = syslog.slice(0, ++i);
          if (i < syslog.length) later(typeSys, 32);
        };
        later(typeSys, 900);
      }
    }

    // ── Terminal body typer ──
    const tb = document.getElementById("terminal-body");
    type Line = { p?: string; c?: string; o?: string; blank?: boolean };
    const lines: Line[] = [
      { p: "$ ", c: "whoami", o: "SkyWhale Team // SWT" },
      { blank: true },
      {
        p: "$ ",
        c: "cat mission.txt",
        o: "reverse malware · break binaries · document everything",
      },
      { blank: true },
      { p: "$ ", c: "ls ~/writeups", o: "picoCTF/   tryhackme/   malware-notes/" },
    ];

    if (tb) {
      tb.innerHTML = "";
      const staticRender = () => {
        tb.innerHTML = lines
          .map((l) =>
            l.blank
              ? `<div class="sw-tblank"></div>`
              : `<div class="sw-tline"><span class="sw-tprompt">${l.p}</span><span class="sw-tcmd">${l.c}</span></div>` +
                (l.o ? `<div class="sw-tline sw-tout">${l.o}</div>` : ""),
          )
          .join("");
      };
      if (reduce) {
        staticRender();
      } else {
        let li = 0;
        const typeLine = () => {
          if (li >= lines.length) return;
          const l = lines[li];
          if (l.blank) {
            const d = document.createElement("div");
            d.className = "sw-tblank";
            tb.appendChild(d);
            li++;
            later(typeLine, 120);
            return;
          }
          const row = document.createElement("div");
          row.className = "sw-tline";
          row.innerHTML = `<span class="sw-tprompt">${l.p}</span><span class="sw-tcmd"></span>`;
          tb.appendChild(row);
          const cmdEl = row.querySelector(".sw-tcmd") as HTMLElement;
          let ci = 0;
          const typeChar = () => {
            if (ci < (l.c || "").length) {
              cmdEl.textContent += (l.c || "")[ci++];
              later(typeChar, 46);
            } else {
              if (l.o) {
                const out = document.createElement("div");
                out.className = "sw-tline sw-tout";
                out.textContent = l.o;
                tb.appendChild(out);
              }
              li++;
              later(typeLine, 420);
            }
          };
          typeChar();
        };
        later(typeLine, 1000);
      }
    }

    return () => {
      killed = true;
      timers.forEach(clearTimeout);
      if (cleanupStars) cleanupStars();
    };
  }, []);

  return null;
}
