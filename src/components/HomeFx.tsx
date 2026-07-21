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
    };
  }, []);

  return null;
}
