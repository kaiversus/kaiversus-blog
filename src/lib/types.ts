export type PostStatus = "draft" | "published";

// Danh mục là chuỗi tự do (có thể thêm "khóa học" mới); danh sách dưới chỉ là gợi ý.
export type PostCategory = string;

export interface Post {
  id: string;
  title: string;
  slug: string | null;
  category: PostCategory;
  tags: string[];
  status: PostStatus;
  difficulty: string | null;
  cover: string | null;
  github_url: string | null;
  demo_url: string | null;
  content: unknown; // BlockNote PartialBlock[]
  excerpt: string | null;
  author: string | null;
  views: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "malware", label: "Malware" },
  { value: "writeup", label: "Writeup" },
  { value: "thm", label: "TryHackMe" },
  { value: "project", label: "Project" },
];
