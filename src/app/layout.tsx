import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import "./legacy.css";
import "@blocknote/core/style.css";
import "./blocknote-theme.css";
import Nav from "@/components/Nav";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kaiversus // Notebook — Malware Analysis, Reverse Engineering & CTF",
    template: "%s // Kaiversus",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Đinh Thiên Bảo (Kaiversus)" }],
  creator: "Đinh Thiên Bảo",
  keywords: [
    "malware analysis",
    "reverse engineering",
    "PE file",
    "PE format",
    "IAT",
    "EAT",
    "CTF writeup",
    "picoCTF",
    "TryHackMe",
    "cybersecurity",
    "phân tích mã độc",
    "dịch ngược",
    "Kaiversus",
    "Đinh Thiên Bảo",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "Kaiversus // Notebook — Malware Analysis, RE & CTF",
    description: SITE_DESCRIPTION,
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaiversus // Notebook",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Áp theme đã lưu TRƯỚC khi render để tránh nháy sáng/tối.
const themeInit = `
(function(){try{
  var t = localStorage.getItem('theme') || 'dark';
  if (t === 'light') document.documentElement.classList.add('light');
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${mono.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <Nav />
        {children}
        <footer>
          <div className="footer-brand">
            <strong>kaiversus</strong>
            <span style={{ color: "var(--text-faint)" }}>—</span>
            <span>Dinh Thien Bao · 52Hz</span>
          </div>
          <div className="footer-links">
            <a href="https://github.com/kaiversus" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="#">CTFtime</a>
            <a href="#">RSS</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
