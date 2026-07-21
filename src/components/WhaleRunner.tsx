"use client";

import { useEffect, useRef } from "react";

// Cá voi pixel bay ở góc màn hình, né các đám mây (lên hoặc xuống) khi mây tới.
export default function WhaleRunner() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const CLOUDS = ["/whale/cloud1.png", "/whale/cloud2.png", "/whale/cloud3.png"];
    const W = 300;
    const whaleH = 44,
      whaleW = 54,
      whaleX = 20,
      baseBottom = 58;

    const whale = new Image();
    whale.src = "/whale/whale.png";
    whale.className = "wr-whale";
    whale.style.height = whaleH + "px";
    whale.style.left = whaleX + "px";
    whale.style.bottom = baseBottom + "px";
    whale.style.transform = "scaleX(-1)";
    box.appendChild(whale);

    let off = 0,
      target = 0,
      dir = 1,
      wasOver = false;
    let clouds: { el: HTMLImageElement; x: number; w: number }[] = [];
    let last = performance.now(),
      spawnT = 0,
      spawnGap = 3.4;
    let raf = 0;

    function spawn() {
      const img = new Image();
      img.src = CLOUDS[(Math.random() * CLOUDS.length) | 0];
      img.className = "wr-cloud";
      const h = 30 + Math.random() * 10;
      img.style.height = h + "px";
      img.style.left = W + "px";
      img.style.bottom = baseBottom - 4 + (Math.random() * 14 - 7) + "px";
      box!.appendChild(img);
      clouds.push({ el: img, x: W, w: h * 1.15 });
    }

    function frame(now: number) {
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05;
      const t = now / 1000,
        speed = 42;

      spawnT += dt;
      if (spawnT >= spawnGap) {
        spawnT = 0;
        spawnGap = 3.2 + Math.random() * 2.6;
        spawn();
      }

      clouds.forEach((c) => {
        c.x -= speed * dt;
        c.el.style.transform = "translateX(" + (c.x - W) + "px)";
      });
      clouds = clouds.filter((c) => {
        if (c.x < -90) {
          c.el.remove();
          return false;
        }
        return true;
      });

      const over = clouds.some(
        (c) => c.x < whaleX + whaleW - 6 && c.x + c.w > whaleX + 6,
      );
      if (over && !wasOver) {
        dir = -dir;
        target = dir * 34;
      }
      if (!over) target = 0;
      wasOver = over;

      const bob = over ? 0 : Math.sin(t * 1.5) * 4;
      off += (target + bob - off) * Math.min(1, dt * 6);
      whale.style.transform = "scaleX(-1) translateY(" + -off + "px)";

      raf = requestAnimationFrame(frame);
    }

    if (!reduce) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      box.querySelectorAll("img").forEach((n) => n.remove());
    };
  }, []);

  return (
    <div className="whale-widget" aria-hidden="true" ref={boxRef}>
      <span className="wr-cap">52hz</span>
    </div>
  );
}
