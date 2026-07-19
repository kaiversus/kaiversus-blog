"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const isLight = document.documentElement.classList.toggle("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    setLight(isLight);
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      title="Toggle light/dark"
      aria-label="Toggle theme"
    >
      {light ? "☾" : "☀"}
    </button>
  );
}
