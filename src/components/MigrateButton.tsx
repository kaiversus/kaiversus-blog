"use client";

import { useState } from "react";

type Res = { status: string; error?: string };

export default function MigrateButton() {
  const [state, setState] = useState<"idle" | "run" | "done" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function run(force: boolean) {
    setState("run");
    setMsg("");
    try {
      const r = await fetch(
        `/api/migrate?confirm=1${force ? "&force=1" : ""}`,
      );
      const j = await r.json();
      if (!r.ok) {
        setMsg(j.error || "lỗi");
        setState("err");
        return;
      }
      const list: Res[] = j.results || [];
      const ok = list.filter((x) => x.status === "ok").length;
      const up = list.filter((x) => x.status === "updated").length;
      const skip = list.filter((x) => x.status.startsWith("skip")).length;
      const err = list.filter((x) => x.status === "error").length;
      setMsg(
        `Mới ${ok} · ghi đè ${up} · bỏ qua ${skip} · lỗi ${err} · ảnh ${j.images_uploaded ?? 0}. Tải lại trang.`,
      );
      setState(err ? "err" : "done");
    } catch (e) {
      setMsg(String(e));
      setState("err");
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button className="btn btn-ghost" onClick={() => run(false)} disabled={state === "run"}>
        {state === "run" ? "đang chạy…" : "⚙ nhập bài cũ"}
      </button>
      <button
        className="btn btn-ghost"
        onClick={() => run(true)}
        disabled={state === "run"}
        title="Nhập lại và ghi đè content các bài đã migrate (sửa bản hỏng)"
      >
        ↻ nhập lại (ghi đè)
      </button>
      {msg && (
        <span
          style={{
            fontSize: "0.72rem",
            color: state === "err" ? "var(--red)" : "var(--green)",
          }}
        >
          {msg}
        </span>
      )}
    </span>
  );
}
