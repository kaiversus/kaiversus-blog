-- ============================================================
--  kaiversus-notebook — database schema
--  Chạy file này trong Supabase → SQL Editor → New query → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Bảng chính: mỗi bản ghi vừa là note (draft) vừa có thể là bài blog (published)
create table if not exists public.posts (
  id           uuid primary key default uuid_generate_v4(),
  title        text        not null default 'Untitled',
  slug         text        unique,
  category     text        not null default 'note',   -- malware | thm | writeup | project | note
  tags         text[]      not null default '{}',
  status       text        not null default 'draft'   check (status in ('draft','published')),
  difficulty   text,                                    -- basic | intermediate | advanced
  cover        text,
  content      jsonb       not null default '[]'::jsonb, -- nội dung block của BlockNote
  excerpt      text,
  author       text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists posts_status_idx     on public.posts (status);
create index if not exists posts_category_idx   on public.posts (category);
create index if not exists posts_updated_idx    on public.posts (updated_at desc);
create index if not exists posts_tags_idx       on public.posts using gin (tags);

-- ── Tự cập nhật updated_at mỗi khi sửa
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ============================================================
--  Row Level Security
--  - Khách (anon): chỉ ĐỌC bài đã published
--  - Người đăng nhập (chính bạn): toàn quyền
--  QUAN TRỌNG: trong Supabase → Authentication → Providers/Settings,
--  hãy TẮT "Allow new users to sign up" và chỉ để email của bạn,
--  vì mọi authenticated user đều có toàn quyền theo policy dưới đây.
-- ============================================================
alter table public.posts enable row level security;

drop policy if exists "public read published" on public.posts;
create policy "public read published"
  on public.posts for select
  to anon
  using (status = 'published');

drop policy if exists "owner read all" on public.posts;
create policy "owner read all"
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists "owner insert" on public.posts;
create policy "owner insert"
  on public.posts for insert
  to authenticated
  with check (true);

drop policy if exists "owner update" on public.posts;
create policy "owner update"
  on public.posts for update
  to authenticated
  using (true) with check (true);

drop policy if exists "owner delete" on public.posts;
create policy "owner delete"
  on public.posts for delete
  to authenticated
  using (true);

-- ============================================================
--  Storage bucket cho ảnh (dán/upload trong editor)
--  Đọc công khai, ghi chỉ khi đăng nhập.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('post-assets', 'post-assets', true)
on conflict (id) do nothing;

drop policy if exists "assets public read" on storage.objects;
create policy "assets public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'post-assets');

drop policy if exists "assets owner write" on storage.objects;
create policy "assets owner write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-assets');

drop policy if exists "assets owner update" on storage.objects;
create policy "assets owner update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'post-assets');

drop policy if exists "assets owner delete" on storage.objects;
create policy "assets owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-assets');
