"use client";

import { useEffect, useRef, useState } from "react";

type Item = { key: string; text: string; level: number; el: HTMLElement };

// Tự dựng mục lục từ các heading BlockNote trong `target`, cập nhật khi
// nội dung đổi (gõ trong editor) hoặc khi viewer render xong.
export default function Toc({
  target,
  bare = false,
}: {
  target: string;
  bare?: boolean;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string>("");
  const itemsRef = useRef<Item[]>([]);

  useEffect(() => {
    const container = document.querySelector(target);
    if (!container) return;

    let raf = 0;
    const build = () => {
      const heads = Array.from(
        container.querySelectorAll<HTMLElement>('[data-content-type="heading"]'),
      );
      const list: Item[] = heads
        .map((h, i) => {
          let level = Number(h.getAttribute("data-level") || 0);
          if (!level) {
            const inner = h.querySelector("h1,h2,h3,h4,h5,h6");
            level = inner ? Number(inner.tagName[1]) : 1;
          }
          const text = (h.textContent || "").trim();
          return { key: String(i), text, level, el: h };
        })
        .filter((it) => it.text);
      itemsRef.current = list;
      setItems(list);
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    };

    schedule();
    const obs = new MutationObserver(schedule);
    obs.observe(container, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  useEffect(() => {
    if (items.length === 0) return;
    const onScroll = () => {
      let cur = "";
      for (const it of itemsRef.current) {
        if (it.el.getBoundingClientRect().top < 130) cur = it.key;
        else break;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (items.length === 0) return null;

  const links = items.map((it) => (
    <a
      key={it.key}
      className={`${bare ? "" : "toc-link "}h${it.level}${active === it.key ? " active" : ""}`}
      onClick={() =>
        it.el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    >
      {it.text}
    </a>
  ));

  // Chế độ bare: render #custom-toc giống hệt sidebar của blog cũ
  // (khung toc-wrapper/toc-title do trang cha cung cấp).
  if (bare) {
    return (
      <nav id="custom-toc" style={{ display: "flex", flexDirection: "column" }}>
        {links}
      </nav>
    );
  }

  return (
    <nav className="reading-toc">
      <div className="toc-title">ON THIS PAGE</div>
      <div className="toc-list">{links}</div>
    </nav>
  );
}
