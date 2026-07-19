"use client";

import { useEffect } from "react";

// Port của cyber-bg.js cũ: matrix rain đỏ + các hiệu ứng gõ chữ ở hero.
export default function HomeFx() {
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | null = null;
    let killed = false;
    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!killed) fn();
      }, ms);
      timers.push(id);
    };

    // ── Matrix rain ──
    const canvas = document.getElementById(
      "matrix-canvas",
    ) as HTMLCanvasElement | null;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      const CHARS =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()_+-=[]{}|;:,./<>?\\~`";
      const FONT_SZ = 14;
      let drops: number[] = [];
      const resize = () => {
        const banner = canvas.parentElement!;
        canvas.width = banner.offsetWidth;
        canvas.height = banner.offsetHeight;
        const cols = Math.floor(canvas.width / FONT_SZ);
        drops = Array.from({ length: cols }, () => (Math.random() * -60) | 0);
      };
      const draw = () => {
        const isLight = document.documentElement.classList.contains("light");
        ctx.fillStyle = isLight ? "rgba(240,232,216,0.2)" : "rgba(8,0,13,0.18)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${FONT_SZ}px "Courier New", monospace`;
        for (let i = 0; i < drops.length; i++) {
          const char = CHARS[(Math.random() * CHARS.length) | 0];
          const y = drops[i] * FONT_SZ;
          const x = i * FONT_SZ;
          if (y > 0 && y < canvas.height) {
            if (isLight) {
              ctx.fillStyle = `rgba(160,100,30,${0.35 + Math.random() * 0.25})`;
              ctx.fillText(char, x, y);
              for (let t = 1; t < 4; t++) {
                const by = y - t * FONT_SZ;
                if (by > 0) {
                  ctx.fillStyle = `rgba(${130 - t * 20},${80 - t * 15},20,${0.25 - t * 0.06})`;
                  ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], x, by);
                }
              }
            } else {
              ctx.fillStyle = `rgba(255,160,160,${0.7 + Math.random() * 0.3})`;
              ctx.fillText(char, x, y);
              const depth = Math.random();
              if (depth > 0.7) ctx.fillStyle = "rgba(200,10,40,0.85)";
              else if (depth > 0.4) ctx.fillStyle = "rgba(160,0,30,0.65)";
              else ctx.fillStyle = "rgba(90,0,20,0.45)";
              for (let t = 1; t < 4; t++) {
                const by = y - t * FONT_SZ;
                if (by > 0) {
                  ctx.fillStyle = `rgba(${180 - t * 30},0,${20 + t * 5},${0.6 - t * 0.15})`;
                  ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], x, by);
                }
              }
            }
          }
          if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      };
      resize();
      window.addEventListener("resize", resize);
      interval = setInterval(draw, 45);

      const asciiEl = document.getElementById("ascii-art");
      if (asciiEl) asciiEl.setAttribute("data-text", asciiEl.textContent || "");

      // cleanup listener sau
      timers.push(
        setTimeout(() => {}, 0), // placeholder giữ mảng không rỗng
      );
      // gỡ resize khi unmount
      const cleanupResize = () => window.removeEventListener("resize", resize);
      (window as unknown as { __homefxCleanup?: () => void }).__homefxCleanup =
        cleanupResize;
    }

    // ── Syslog typer ──
    const syslogMsgs = [
      "Malware is just misunderstood software...",
      "If it runs, it can be reversed.",
      "There is no patch for human stupidity.",
      "Access granted. Proceed with caution.",
    ];
    const syslogEl = document.getElementById("syslog-msg");
    let sIdx = 0,
      sChar = 0,
      sDel = false;
    const typeSyslog = () => {
      if (!syslogEl) return;
      const cur = syslogMsgs[sIdx];
      if (!sDel) {
        syslogEl.textContent = cur.slice(0, ++sChar);
        if (sChar === cur.length)
          later(() => {
            sDel = true;
            typeSyslog();
          }, 2800);
        else later(typeSyslog, 42);
      } else {
        syslogEl.textContent = cur.slice(0, --sChar);
        if (sChar === 0) {
          sDel = false;
          sIdx = (sIdx + 1) % syslogMsgs.length;
          later(typeSyslog, 500);
        } else later(typeSyslog, 20);
      }
    };
    later(typeSyslog, 800);

    // ── Role typer ──
    const roles = [
      "Reverse Engineering · Binary Exploitation · Malware Analysis",
      "Dissecting bits. Constructing exploits.",
      "Breaking things to understand how they work.",
    ];
    const roleEl = document.getElementById("typed-role");
    let rIdx = 0,
      rChar = 0,
      deleting = false;
    const typeRole = () => {
      if (!roleEl) return;
      const cur = roles[rIdx];
      if (!deleting) {
        roleEl.textContent = cur.slice(0, ++rChar);
        if (rChar === cur.length)
          later(() => {
            deleting = true;
            typeRole();
          }, 2200);
        else later(typeRole, 38);
      } else {
        roleEl.textContent = cur.slice(0, --rChar);
        if (rChar === 0) {
          deleting = false;
          rIdx = (rIdx + 1) % roles.length;
          later(typeRole, 400);
        } else later(typeRole, 18);
      }
    };
    later(typeRole, 700);

    // ── Terminal body typer ──
    const tb = document.getElementById("terminal-body");
    if (tb) tb.innerHTML = "";
    const lines: {
      type: "cmd" | "out" | "comment" | "blank" | "cursor";
      prompt?: string;
      text?: string;
    }[] = [
      { type: "cmd", prompt: "kaiversus@blog:~$ ", text: "whoami" },
      { type: "out", text: "Dinh Thien Bao  //  kaiversus" },
      { type: "blank" },
      { type: "cmd", prompt: "kaiversus@blog:~$ ", text: "cat focus.txt" },
      {
        type: "out",
        text: "Reverse Engineering · Binary Exploitation · Malware Analysis",
      },
      { type: "blank" },
      { type: "cmd", prompt: "kaiversus@blog:~$ ", text: "uptime" },
      {
        type: "comment",
        text: "# 3 years active  |  40+ writeups  |  [ SYSTEM: ONLINE ]",
      },
      { type: "blank" },
      { type: "cursor" },
    ];
    let lineIdx = 0,
      charIdx = 0,
      currentEl: HTMLElement | null = null;
    const nextLine = () => {
      if (!tb || lineIdx >= lines.length) return;
      const l = lines[lineIdx];
      if (l.type === "blank") {
        const d = document.createElement("div");
        d.className = "t-blank";
        tb.appendChild(d);
        lineIdx++;
        charIdx = 0;
        later(nextLine, 60);
        return;
      }
      if (l.type === "cursor") {
        const row = document.createElement("div");
        row.className = "t-line";
        const p = document.createElement("span");
        p.className = "t-prompt";
        p.textContent = "kaiversus@blog:~$ ";
        const c = document.createElement("span");
        c.className = "t-cursor";
        row.appendChild(p);
        row.appendChild(c);
        tb.appendChild(row);
        return;
      }
      if (charIdx === 0) {
        const row = document.createElement("div");
        row.className = "t-line";
        if (l.type === "cmd") {
          const p = document.createElement("span");
          p.className = "t-prompt";
          p.textContent = l.prompt || "";
          row.appendChild(p);
        }
        const span = document.createElement("span");
        span.className =
          l.type === "cmd"
            ? "t-cmd"
            : l.type === "comment"
              ? "t-out t-comment"
              : "t-out";
        row.appendChild(span);
        tb.appendChild(row);
        currentEl = span;
      }
      const text = l.text || "";
      if (charIdx < text.length) {
        if (currentEl) currentEl.textContent += text[charIdx];
        charIdx++;
        later(nextLine, l.type === "cmd" ? 48 : 10);
      } else {
        lineIdx++;
        charIdx = 0;
        later(nextLine, l.type === "cmd" ? 280 : 28);
      }
    };
    later(nextLine, 1000);

    return () => {
      killed = true;
      timers.forEach(clearTimeout);
      if (interval) clearInterval(interval);
      const w = window as unknown as { __homefxCleanup?: () => void };
      if (w.__homefxCleanup) {
        w.__homefxCleanup();
        delete w.__homefxCleanup;
      }
    };
  }, []);

  return null;
}
