import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "./ThemeToggle";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="site-nav">
      <Link href="/" className="nav-logo">
        <span className="u">kaiversus</span>
        <span className="at">@</span>
        <span className="h">notebook</span>
        <span className="s">:~$</span>
      </Link>

      <ul className="nav-links">
        <li>
          <Link href="/">
            <span className="slash">~/</span>home
          </Link>
        </li>
        <li>
          <Link href="/?category=writeup">
            <span className="slash">~/</span>writeups
          </Link>
        </li>
        <li>
          <Link href="/?category=malware">
            <span className="slash">~/</span>courses
          </Link>
        </li>
      </ul>

      <div className="nav-right">
        {user ? (
          <Link href="/dashboard" className="nav-links">
            <span style={{ color: "var(--green)" }}>● </span>dashboard
          </Link>
        ) : (
          <Link href="/login">login</Link>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
