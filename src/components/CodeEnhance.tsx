"use client";

import { useEffect } from "react";
import hljs from "highlight.js";
import katex from "katex";

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Tô màu syntax + thêm nút Copy cho các code block trên trang bài
// (render từ HTML server, không cần tải BlockNote).
// Kèm: render LaTeX $...$ trong chú thích ảnh (caption là text thuần
// trong editor nên gõ $x^2$, ra trang bài sẽ thành công thức).
export default function CodeEnhance() {
  useEffect(() => {
    // ── LaTeX trong caption ảnh ──
    const captions = document.querySelectorAll<HTMLElement>(
      ".post-view figcaption, .post-view .bn-file-caption",
    );
    captions.forEach((cap) => {
      if (cap.dataset.tex) return;
      const raw = cap.textContent || "";
      if (!raw.includes("$")) return;
      cap.dataset.tex = "1";
      cap.innerHTML = raw
        .split(/(\$[^$]+\$)/g)
        .map((part) => {
          if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
            try {
              return katex.renderToString(part.slice(1, -1), {
                throwOnError: false,
              });
            } catch {
              return esc(part);
            }
          }
          return esc(part);
        })
        .join("");
    });

    const blocks = document.querySelectorAll<HTMLElement>(
      ".post-view [data-content-type='codeBlock']",
    );
    blocks.forEach((blk) => {
      const code = blk.querySelector("code");
      if (!code || code.dataset.hl) return;
      code.dataset.hl = "1";

      const raw = code.textContent || "";
      const lang = blk.getAttribute("data-language") || "";
      try {
        const res =
          lang && hljs.getLanguage(lang)
            ? hljs.highlight(raw, { language: lang })
            : hljs.highlightAuto(raw);
        code.innerHTML = res.value;
      } catch {
        /* giữ nguyên nếu lỗi */
      }
      code.classList.add("hljs");

      if (!blk.querySelector(".copy-btn")) {
        blk.style.position = "relative";
        const btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.textContent = "Copy";
        btn.addEventListener("click", () => {
          navigator.clipboard.writeText(raw).then(() => {
            btn.textContent = "Copied!";
            setTimeout(() => (btn.textContent = "Copy"), 1500);
          });
        });
        blk.appendChild(btn);
      }
    });
  }, []);

  return null;
}
