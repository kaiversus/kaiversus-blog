# kaiversus-notebook — hướng dẫn chạy

Sổ tay + blog kiểu Notion: gõ block trên web, autosave vào Postgres, bật
`published` là thành bài blog công khai.

Stack: **Next.js 16** · **Supabase** (Postgres + Auth + Storage) · **BlockNote** (editor).

---

## Phần bạn phải tự làm (cần tài khoản)

### 1. Tạo project Supabase
1. Vào https://supabase.com → đăng nhập (GitHub cũng được) → **New project**.
2. Đặt tên, chọn region gần (Singapore), đặt database password (lưu lại).
3. Đợi ~2 phút cho project khởi tạo xong.

### 2. Chạy schema
1. Trong project → **SQL Editor** → **New query**.
2. Mở file `supabase/schema.sql` trong repo này, copy toàn bộ, dán vào, bấm **Run**.
3. Sẽ tạo bảng `posts`, RLS, trigger, và bucket `post-assets`.

### 3. Khoá đăng nhập chỉ cho email của bạn (QUAN TRỌNG)
Theo RLS, *bất kỳ ai đăng nhập được* đều có toàn quyền sửa. Nên chặn người lạ tạo tài khoản:
1. **Authentication → Sign In / Providers → Email**: bật **Email** provider.
2. **Authentication → Settings**: TẮT **Allow new users to sign up**.
3. Vào **Authentication → Users → Add user** → tạo user bằng đúng email của bạn
   (louistr2706@gmail.com). Từ đó chỉ email này nhận được magic link hợp lệ.

### 4. Lấy API keys
Project Settings → **API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Chạy local

```bash
cp .env.local.example .env.local      # rồi điền URL + anon key vào
npm install                            # (đã cài sẵn nếu Claude scaffold)
npm run dev
```

Mở http://localhost:3000

Luồng: `/login` → nhập email → mở magic link trong mail → vào `/dashboard`
→ **+ note mới** → viết (gõ `/` ra menu block) → autosave → **publish →** →
bài hiện ở trang chủ `/`.

---

## Deploy lên Vercel (khi nào sẵn sàng)

1. Push repo này lên GitHub (repo mới, tách khỏi `kaiversus.github.io`).
2. https://vercel.com → **Add New Project** → import repo.
3. Ở phần **Environment Variables**, thêm 3 biến giống `.env.local`,
   riêng `NEXT_PUBLIC_SITE_URL` đổi thành domain Vercel (vd `https://kaiversus-notebook.vercel.app`).
4. Trong Supabase → **Authentication → URL Configuration**: thêm domain Vercel
   vào **Site URL** và **Redirect URLs** (`https://.../auth/callback`).
5. Deploy.

> Lưu ý: `kaiversus.github.io` KHÔNG trỏ sang Vercel được (do GitHub kiểm soát).
> App mới chạy ở `*.vercel.app` hoặc domain riêng bạn mua.

---

## Cấu trúc code

```
src/
  app/
    page.tsx              # trang chủ — list bài đã publish (+ lọc category)
    login/page.tsx        # đăng nhập magic link
    auth/callback         # đổi code → session
    auth/signout          # đăng xuất
    dashboard/            # danh sách note của bạn (draft + published)
    edit/[id]/            # trang soạn thảo (server) + savePost action
    p/[slug]/             # trang bài công khai (render HTML từ block, SSR)
  components/
    Nav.tsx  ThemeToggle.tsx  Editor.tsx   # editor BlockNote + autosave
  lib/
    supabase/client.ts server.ts           # kết nối Supabase
    types.ts                                # kiểu Post, danh mục
  middleware.ts                             # refresh session + chặn /dashboard,/edit
supabase/schema.sql                          # DB schema
```

## Chưa làm (lộ trình tiếp)
- Nhập nội dung markdown cũ từ `kaiversus.github.io` vào DB (script chuyển đổi).
- Trang PE Lab tương tác (`chapter_2d`) — giữ dạng HTML nhúng.
- Tìm kiếm / lọc theo tag nâng cao, prev-next giữa bài.
