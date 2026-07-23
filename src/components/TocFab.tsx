"use client";

import { useEffect, useState } from "react";
import Toc from "./Toc";

// Nút mục lục NỔI cho màn hình hẹp (sidebar TOC bị ẩn): bấm mở bottom-sheet
// chứa mục lục, chọn mục là cuộn tới và tự đóng — khỏi phải lướt tay.
export default function TocFab({ target }: { target: string }) {
  const [open, setOpen] = useState(false);
  const [has, setHas] = useState(false);

  // Chỉ hiện nút khi bài có heading
  useEffect(() => {
    const c = document.querySelector(target);
    if (!c) return;
    const check = () =>
      setHas(!!c.querySelector('[data-content-type="heading"]'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(c, { subtree: true, childList: true });
    return () => obs.disconnect();
  }, [target]);

  // Khoá cuộn nền khi sheet mở
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!has) return null;

  return (
    <>
      <button
        type="button"
        className="toc-fab"
        aria-label="Mục lục"
        onClick={() => setOpen(true)}
      >
        ☰ TOC
      </button>
      {open && (
        <>
          <div className="toc-sheet-backdrop" onClick={() => setOpen(false)} />
          <div
            className="toc-sheet"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setOpen(false);
            }}
          >
            <div className="toc-sheet-head">
              <span className="toc-title">ON THIS PAGE</span>
              <button
                type="button"
                className="toc-sheet-close"
                aria-label="Đóng"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <Toc target={target} bare />
          </div>
        </>
      )}
    </>
  );
}
