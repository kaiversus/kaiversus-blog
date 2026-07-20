// URL gốc của site — set NEXT_PUBLIC_SITE_URL trong Vercel cho đúng domain.
// (canonical, sitemap, Open Graph đều dựa vào biến này)
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://kaiversus-blog.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "SkyWhale Team";

export const SITE_DESCRIPTION =
  "SkyWhale Team (SWT) — nhóm nghiên cứu an toàn thông tin: malware analysis, reverse engineering, PE file, và CTF writeups (picoCTF, TryHackMe).";
