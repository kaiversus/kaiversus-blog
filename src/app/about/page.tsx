import "./about.css";

export const metadata = { title: "About // Dinh Thien Bao" };

const badge = { height: 28, margin: "4px" } as const;

export default function AboutPage() {
  return (
    <div className="about-page">
      <section
        className="container"
        style={{ marginTop: 50, textAlign: "center" }}
      >
        <h1 style={{ fontSize: "2.4rem", color: "var(--text)" }}>
          // USER <span style={{ color: "var(--green)" }}>PROFILE</span>
        </h1>
        <p style={{ color: "var(--text-sub)" }}>
          &gt; Loading data for subject: DINH THIEN BAO...
        </p>
        <hr
          style={{
            border: 0,
            borderTop: "1px solid var(--border)",
            margin: "30px 0",
          }}
        />
      </section>

      <section className="container">
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2 style={{ color: "var(--green)" }}>// INTEL DATABASE</h2>
        </div>
        <div className="card-grid">
          <article className="space-card">
            <h3 className="text-gold" style={{ fontSize: "1.2rem" }}>
              🎓 Education &amp; Focus
            </h3>
            <ul style={{ listStyle: "none", color: "var(--text-sub)", fontSize: "0.9rem", lineHeight: 1.9 }}>
              <li>🏛️ <b>HCMUTE</b> Student</li>
              <li>🎯 <b>Interests:</b> Cyber Security, Reverse Engineering, Pwn</li>
              <li>🔬 <b>Focus:</b> Low-level analysis, System security, Malware analysis</li>
            </ul>
          </article>
          <article className="space-card">
            <h3 className="text-gold" style={{ fontSize: "1.2rem" }}>
              🏆 Honors &amp; Awards
            </h3>
            <ul style={{ listStyle: "none", color: "var(--text-sub)", fontSize: "0.9rem", lineHeight: 1.9 }}>
              <li>🥉 <b>Bronze Medal</b> — National Algebra Olympiad (2025)</li>
              <li>🎖️ <b>TOP 4</b> — HCMUTE InfoSec Contest (2025)</li>
            </ul>
          </article>
          <article className="space-card">
            <h3 className="text-gold" style={{ fontSize: "1.2rem" }}>
              🌱 Loading Modules...
            </h3>
            <ul style={{ listStyle: "none", color: "var(--text-sub)", fontSize: "0.9rem", lineHeight: 1.9 }}>
              <li>⚙️ Advanced Reverse Engineering</li>
              <li>🛡️ Anti-debugging &amp; Anti-analysis</li>
              <li>🦠 Malware behavior &amp; Unpacking</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="container" style={{ marginTop: 80 }}>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>
          <span style={{ color: "var(--amber)" }}>TECHNICAL</span> ARSENAL
        </h2>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h4 style={{ color: "var(--text-muted)", marginBottom: 12 }}>LANGUAGES</h4>
          <img style={badge} src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
          <img style={badge} src="https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white" alt="C++" />
          <img style={badge} src="https://img.shields.io/badge/Assembly-525252?style=for-the-badge&logo=assemblyscript&logoColor=white" alt="Assembly" />
          <img style={badge} src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
          <img style={badge} src="https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white" alt="C#" />
        </div>
        <div style={{ textAlign: "center" }}>
          <h4 style={{ color: "var(--text-muted)", marginBottom: 12 }}>TOOLS &amp; ENV</h4>
          <img style={badge} src="https://img.shields.io/badge/IDA_Pro-232F3E?style=for-the-badge&logo=codio&logoColor=white" alt="IDA" />
          <img style={badge} src="https://img.shields.io/badge/Pwntools-DC3545?style=for-the-badge&logo=python&logoColor=white" alt="Pwntools" />
          <img style={badge} src="https://img.shields.io/badge/GDB-4EAA25?style=for-the-badge&logo=gnu-bash&logoColor=white" alt="GDB" />
          <img style={badge} src="https://img.shields.io/badge/x64dbg-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="x64dbg" />
          <img style={badge} src="https://img.shields.io/badge/Wireshark-1679A7?style=for-the-badge&logo=wireshark&logoColor=white" alt="Wireshark" />
          <img style={badge} src="https://img.shields.io/badge/Kali-557C94?style=for-the-badge&logo=kali-linux&logoColor=white" alt="Kali" />
        </div>
      </section>

      <section className="container" style={{ marginTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--green)" }}>GITHUB ACTIVITY</h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 20 }}>
          <img style={{ maxWidth: "100%" }} src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=kaiversus&theme=tokyonight" alt="Profile" />
          <img style={{ maxWidth: "100%" }} src="https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=kaiversus&theme=tokyonight" alt="Repos" />
        </div>
      </section>

      <div style={{ textAlign: "center", margin: "80px 0" }}>
        <a href="/" className="btn-space">
          &lt;&lt; RETURN TO BASE
        </a>
      </div>
    </div>
  );
}
