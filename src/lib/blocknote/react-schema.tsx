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

/* Ô nhập LaTeX dùng chung (block + inline popover) */
function LatexInput({
  value,
  multiline,
  onChange,
  onCommit,
  onCancel,
}: {
  value: string;
  multiline?: boolean;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const common = {
    className: "bn-eq-input",
    value,
    autoFocus: true,
    spellCheck: false,
    placeholder: "LaTeX, ví dụ: \\frac{a}{b}",
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      onChange(e.target.value),
    onBlur: onCommit,
    onKeyDown: (
      e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
      if (e.key === "Enter" && !(multiline && e.shiftKey)) {
        e.preventDefault();
        onCommit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    },
  };
  return multiline ? (
    <textarea rows={2} {...common} />
  ) : (
    <input type="text" {...common} />
  );
}

/* ── Block equation: hiện KaTeX, bấm vào để sửa ── */
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
  const cancel = () => {
    setDraft(latex);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bn-eq-edit" contentEditable={false}>
        <div className="bn-eq-edit-head">
          <span className="bn-eq-badge">∑ LaTeX</span>
          <span className="bn-eq-hint">Enter lưu · Shift+Enter xuống dòng · Esc huỷ</span>
        </div>
        <LatexInput
          value={draft}
          multiline
          onChange={setDraft}
          onCommit={commit}
          onCancel={cancel}
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

/* ── Inline equation: bấm để sửa bằng popover ngay tại chỗ ── */
function InlineEquationView({
  latex,
  onChange,
}: {
  latex: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(latex === "");
  const [draft, setDraft] = useState(latex);

  const commit = () => {
    onChange(draft.trim());
    setEditing(false);
  };
  const cancel = () => {
    setDraft(latex);
    setEditing(false);
  };

  return (
    <span className="bn-inline-eq-wrap" contentEditable={false}>
      {latex ? (
        <span
          className="bn-inline-equation"
          title="Bấm để sửa"
          onClick={() => {
            setDraft(latex);
            setEditing(true);
          }}
          dangerouslySetInnerHTML={{ __html: renderKatex(latex, false) }}
        />
      ) : (
        <span
          className="bn-inline-eq-empty"
          onClick={() => setEditing(true)}
        >
          ∑ công thức
        </span>
      )}

      {editing && (
        <span className="bn-eq-popover" contentEditable={false}>
          <LatexInput
            value={draft}
            onChange={setDraft}
            onCommit={commit}
            onCancel={cancel}
          />
          <span
            className="bn-eq-pop-preview"
            dangerouslySetInnerHTML={{ __html: renderKatex(draft, false) }}
          />
        </span>
      )}
    </span>
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

const InlineEquation = createReactInlineContentSpec(inlineEquationConfig(), {
  render: ({ inlineContent, updateInlineContent }) => (
    <InlineEquationView
      latex={String(inlineContent.props.latex || "")}
      onChange={(latex) =>
        updateInlineContent({ type: "inlineEquation", props: { latex } })
      }
    />
  ),
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
        editor.insertInlineContent([
          { type: "inlineEquation", props: { latex: "" } },
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
