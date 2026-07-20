import {
  BlockNoteSchema,
  createBlockSpec,
  createInlineContentSpec,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from "@blocknote/core";
import katex from "katex";
import { equationBlockConfig, inlineEquationConfig } from "./config";

// Vanilla (không React) — an toàn cho ServerBlockNoteEditor.blocksToFullHTML,
// tránh react-dom/client vốn không chạy được trong Node/server runtime.

const BlockEquation = createBlockSpec(equationBlockConfig(), {
  render: (block) => {
    const dom = document.createElement("div");
    dom.className = "bn-equation-block";
    dom.innerHTML = katex.renderToString(String(block.props.latex || ""), {
      displayMode: true,
      throwOnError: false,
    });
    return { dom };
  },
});

const InlineEquation = createInlineContentSpec(inlineEquationConfig(), {
  render: (ic) => {
    const dom = document.createElement("span");
    dom.className = "bn-inline-equation";
    dom.innerHTML = katex.renderToString(String(ic.props.latex || ""), {
      displayMode: false,
      throwOnError: false,
    });
    return { dom };
  },
});

export const serverSchema = BlockNoteSchema.create({
  blockSpecs: { ...defaultBlockSpecs, equation: BlockEquation() },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    inlineEquation: InlineEquation,
  },
});
