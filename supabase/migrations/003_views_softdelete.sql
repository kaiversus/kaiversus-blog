-- ============================================================
--  Migration 003 — lượt xem + soft delete (thùng rác)
--  Chạy trong Supabase → SQL Editor → New query → Run
-- ============================================================

alter table public.posts
  add column if not exists views      int         not null default 0,
  add column if not exists deleted_at  timestamptz;

-- Tăng lượt xem: anon gọi được, bỏ qua RLS (chỉ +1 cho bài đã published)
create or replace function public.increment_views(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts
     set views = views + 1
   where id = p_id and status = 'published' and deleted_at is null;
$$;

grant execute on function public.increment_views(uuid) to anon, authenticated;
