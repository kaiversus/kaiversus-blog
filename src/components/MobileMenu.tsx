"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "home" },
  { href: "/writeups", label: "writeups" },
  { href: "/courses", label: "courses" },
  { href: "/projects", label: "projects" },
];

// Menu điều hướng MOBILE: nút ☰ mở drawer thả xuống ngay dưới nav.
// Chỉ hiện ở màn hình hẹp (CSS ẩn/hiện trong legacy.css).
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Chuyển trang là tự đóng menu
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className={`nav-burger${open ? " is-open" : ""}`}
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className="nav-drawer">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              <span className="slash">~/</span>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
