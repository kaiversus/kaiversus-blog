// Cấu hình dùng chung cho equation — được import bởi cả React schema (editor)
// lẫn vanilla schema (server render HTML). Dùng factory trả object mới để
// tránh vấn đề readonly khi truyền vào createBlockSpec / createReactBlockSpec.

export function equationBlockConfig() {
  return {
    type: "equation" as const,
    propSchema: { latex: { default: "" as string } },
    content: "none" as const,
  };
}

export function inlineEquationConfig() {
  return {
    type: "inlineEquation" as const,
    propSchema: { latex: { default: "" as string } },
    content: "none" as const,
  };
}
