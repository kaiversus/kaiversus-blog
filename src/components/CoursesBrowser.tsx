"use client";

import { useState } from "react";
import Link from "next/link";

export interface Module {
  id: string;
  title: string;
  slug: string | null;
  difficulty: string | null;
  excerpt: string | null;
  date: string | null;
}
export interface Group {
  name: string;
  modules: Module[];
}

export default function CoursesBrowser({ groups }: { groups: Group[] }) {
  const [active, setActive] = useState<string | null>(null);
  const current = groups.find((g) => g.name === active);

  return (
    <>
      {!active && (
        <div className="cat-list">
          {groups.map((g, i) => (
            <div
              key={g.name}
              className="cat-row"
              onClick={() => {
                setActive(g.name);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span className="cat-hex">[ 0x0{i + 1} ]</span>
              <span className="cat-name">{g.name.toUpperCase()}</span>
              <span className="cat-count">{g.modules.length} modules</span>
              <span className="cat-arrow">›</span>
            </div>
          ))}
          {groups.length === 0 && (
            <p style={{ color: "var(--ac-muted)" }}>Chưa có khóa học nào.</p>
          )}
        </div>
      )}

      {current && (
        <div className="detail-view active">
          <div className="detail-header">
            <button className="back-btn" onClick={() => setActive(null)}>
              ← cd .. (RETURN)
            </button>
            <h2 className="detail-title">
              // DIRECTORY: {current.name.toUpperCase()}
            </h2>
            <p className="detail-sub">
              &gt; List of available modules in this directory:
            </p>
          </div>
          <div className="module-grid">
            {current.modules.map((m) => {
              const diff = (m.difficulty || "basic").toLowerCase();
              return (
                <Link
                  key={m.id}
                  className="module-card"
                  href={`/p/${m.slug ?? m.id}`}
                >
                  <div className="module-meta">
                    <span>{m.date ? m.date.slice(0, 10) : ""}</span>
                    <span className={`diff-badge ${diff}`}>
                      {diff.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="module-title">{m.title}</h4>
                  <p className="module-desc">{m.excerpt || ""}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
