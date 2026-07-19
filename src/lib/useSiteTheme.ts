"use client";

import { useEffect, useState } from "react";

// Trả về theme hiện tại của site ("light" | "dark") và tự cập nhật
// khi người dùng bấm nút đổi theme (class .light trên <html>).
export function useSiteTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const el = document.documentElement;
    const read = () =>
      setTheme(el.classList.contains("light") ? "light" : "dark");
    read();
    const obs = new MutationObserver(read);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return theme;
}
