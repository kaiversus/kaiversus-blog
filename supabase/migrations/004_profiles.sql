-- Hồ sơ admin: username hiển thị trên nav khi đăng nhập.
-- Chạy trong Supabase SQL Editor, sau đó INSERT username của bạn (xem cuối file).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (char_length(username) between 2 and 32),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Ai cũng đọc được username (hiện công khai trên nav khi admin online).
create policy "profiles select public"
  on public.profiles for select
  using (true);

-- Chỉ chính chủ được tạo/sửa hồ sơ của mình.
create policy "profiles insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id);

-- ➜ Sau khi chạy migration, thêm username của bạn (thay 'kaiversus' nếu muốn):
-- insert into public.profiles (id, username)
-- select id, 'kaiversus' from auth.users where email = 'louistr2706@gmail.com'
-- on conflict (id) do update set username = excluded.username;
