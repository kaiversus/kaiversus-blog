import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import NavAuth from "./NavAuth";

// Nav tĩnh (không đọc cookie) để trang công khai cache được.
export default function Nav() {
  return (
    <nav>
      <Link href="/" className="nav-logo">
        <span className="nav-logo-user">swt</span>
        <span className="nav-logo-at">@</span>
        <span className="nav-logo-host">skywhale</span>
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
        <NavAuth />
        <ThemeToggle />
      </div>
    </nav>
  );
}
