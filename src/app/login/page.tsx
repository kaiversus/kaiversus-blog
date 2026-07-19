"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <main className="container" style={{ maxWidth: 440 }}>
      <div className="page-head">
        <div className="page-title">// LOGIN</div>
      </div>

      {sent ? (
        <div className="empty">
          Đã gửi magic link tới <b style={{ color: "var(--text)" }}>{email}</b>.
          <br />
          Mở email và bấm vào link để đăng nhập.
        </div>
      ) : (
        <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="field-label">Email</label>
            <input
              className="txt"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {err && <div style={{ color: "var(--red)", fontSize: "0.8rem" }}>{err}</div>}
          <button className="btn btn-green" disabled={loading}>
            {loading ? "đang gửi..." : "gửi magic link →"}
          </button>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Không có mật khẩu — bạn nhận một link đăng nhập qua email.
          </p>
        </form>
      )}
    </main>
  );
}
