"use client";

import { useEffect } from "react";
import hljs from "highlight.js";

// Tô màu syntax + thêm nút Copy cho các code block trên trang bài
// (render từ HTML server, không cần tải BlockNote).
export default function CodeEnhance() {
  useEffect(() => {
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
