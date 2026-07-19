"use client";

import { useState } from "react";

type Res = { status: string; error?: string };

export default function MigrateButton() {
  const [state, setState] = useState<"idle" | "run" | "done" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function run() {
    setState("run");
    setMsg("");
    try {
      const r = await fetch("/api/migrate?confirm=1");
      const j = await r.json();
      if (!r.ok) {
        setMsg(j.error || "lỗi");
        setState("err");
        return;
      }
      const list: Res[] = j.results || [];
      const ok = list.filter((x) => x.status === "ok").length;
      const skip = list.filter((x) => x.status.startsWith("skip")).length;
      const err = list.filter((x) => x.status === "error").length;
      setMsg(
        `Nhập ${ok} bài · bỏ qua ${skip} · lỗi ${err} · ảnh ${j.images_uploaded ?? 0}. Tải lại trang để thấy.`,
      );
      setState(err ? "err" : "done");
    } catch (e) {
      setMsg(String(e));
      setState("err");
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <button className="btn btn-ghost" onClick={run} disabled={state === "run"}>
        {state === "run" ? "đang nhập…" : "⚙ nhập bài cũ"}
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
