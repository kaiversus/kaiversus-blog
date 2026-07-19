import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "./ThemeToggle";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav>
      <Link href="/" className="nav-logo">
        <span className="nav-logo-user">kaiversus</span>
        <span className="nav-logo-at">@</span>
        <span className="nav-logo-host">blog</span>
        <span className="nav-logo-sym">:~$</span>
      </Link>
      <div className="nav-sep"></div>
      <ul className="nav-links">
        <li>
          <Link href="/">
            <span className="slash">~/</span>home
          </Link>
        </li>
        <li>
          <Link href="/writeups">
            <span className="slash">~/</span>writeups
          </Link>
        </li>
        <li>
          <Link href="/courses">
            <span className="slash">~/</span>courses
          </Link>
        </li>
        <li>
          <Link href="/projects">
            <span className="slash">~/</span>projects
          </Link>
        </li>
      </ul>
      <div className="nav-right">
        <span className="status-dot"></span>
        {user ? (
          <Link href="/dashboard" style={{ color: "inherit" }}>
            dashboard
          </Link>
        ) : (
          <Link href="/login" style={{ color: "inherit" }}>
            online
          </Link>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
