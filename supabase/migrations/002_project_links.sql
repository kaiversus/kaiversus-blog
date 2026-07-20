-- ============================================================
--  Migration 002 — thêm link cho project
--  Chạy trong Supabase → SQL Editor → New query → Run
--  (cover đã có sẵn, dùng làm ảnh bìa/thumbnail — không cần thêm)
-- ============================================================
alter table public.posts
  add column if not exists github_url text,
  add column if not exists demo_url   text;
