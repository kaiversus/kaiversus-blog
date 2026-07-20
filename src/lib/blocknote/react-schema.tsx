"use client";

import { useMemo, useState } from "react";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  filterSuggestionItems,
  type BlockNoteEditor,
} from "@blocknote/core";
import {
  createReactBlockSpec,
  createReactInlineContentSpec,
  getDefaultReactSlashMenuItems,
  type DefaultReactSuggestionItem,
} from "@blocknote/react";
import katex from "katex";
import { equationBlockConfig, inlineEquationConfig } from "./config";

function renderKatex(latex: string, displayMode: boolean) {
  return katex.renderToString(latex || "\\,", {
    displayMode,
    throwOnError: false,
  });
}

/* ── Block equation: hiện KaTeX, bấm vào để sửa bằng textarea ── */
function EquationBlockView({
  latex,
  onChange,
}: {
  latex: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(latex === "");
  const [draft, setDraft] = useState(latex);
  const html = useMemo(() => renderKatex(latex, true), [latex]);

  const commit = () => {
    onChange(draft.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bn-eq-edit" contentEditable={false}>
        <textarea
          className="bn-eq-input"
          value={draft}
          autoFocus
          spellCheck={false}
          placeholder="Nhập LaTeX, ví dụ: \int_0^1 x^2\,dx"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              setDraft(latex);
              setEditing(false);
            }
          }}
          onBlur={commit}
        />
        <div
          className="bn-eq-preview"
          dangerouslySetInnerHTML={{ __html: renderKatex(draft, true) }}
        />
      </div>
    );
  }

  return (
    <div
      className="bn-equation-block"
      contentEditable={false}
      title="Bấm để sửa công thức"
      onClick={() => {
        setDraft(latex);
        setEditing(true);
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const BlockEquation = createReactBlockSpec(equationBlockConfig(), {
  render: ({ block, editor }) => (
    <EquationBlockView
      latex={String(block.props.latex || "")}
      onChange={(latex) =>
        editor.updateBlock(block, { type: "equation", props: { latex } })
      }
    />
  ),
});

/* ── Inline equation: bấm vào để sửa qua prompt ── */
const InlineEquation = createReactInlineContentSpec(inlineEquationConfig(), {
  render: ({ inlineContent, updateInlineContent }) => {
    const latex = String(inlineContent.props.latex || "");
    return (
      <span
        className="bn-inline-equation"
        contentEditable={false}
        style={{ cursor: "pointer" }}
        title="Bấm để sửa"
        onClick={() => {
          const next = window.prompt("Sửa LaTeX (inline):", latex);
          if (next !== null)
            updateInlineContent({
              type: "inlineEquation",
              props: { latex: next.trim() },
            });
        }}
        dangerouslySetInnerHTML={{ __html: renderKatex(latex, false) }}
      />
    );
  },
});

export const editorSchema = BlockNoteSchema.create({
  blockSpecs: { ...defaultBlockSpecs, equation: BlockEquation() },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    inlineEquation: InlineEquation,
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = BlockNoteEditor<any, any, any>;

/* ── Slash menu: /equation (block) và /inline equation ── */
export function getSlashItems(
  editor: AnyEditor,
  query: string,
): DefaultReactSuggestionItem[] {
  const custom: DefaultReactSuggestionItem[] = [
    {
      title: "Equation (block)",
      subtext: "Công thức toán dạng khối (KaTeX)",
      aliases: ["equation", "math", "latex", "ct", "congthuc", "phuongtrinh"],
      group: "Math",
      icon: <span style={{ fontStyle: "italic" }}>∑</span>,
      onItemClick: () => {
        const pos = editor.getTextCursorPosition().block;
        editor.insertBlocks(
          [{ type: "equation", props: { latex: "" } }],
          pos,
          "after",
        );
      },
    },
    {
      title: "Inline equation",
      subtext: "Công thức toán trong dòng",
      aliases: ["inline equation", "inline math", "imath", "ctinline"],
      group: "Math",
      icon: <span style={{ fontStyle: "italic" }}>x²</span>,
      onItemClick: () => {
        const latex = window.prompt("Nhập LaTeX (inline):", "");
        editor.insertInlineContent([
          { type: "inlineEquation", props: { latex: (latex || "").trim() } },
          " ",
        ]);
      },
    },
  ];

  return filterSuggestionItems(
    [...getDefaultReactSlashMenuItems(editor), ...custom],
    query,
  );
}
