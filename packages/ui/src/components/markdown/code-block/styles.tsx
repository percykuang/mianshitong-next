'use client'

// 代码块和 Shiki 高亮相关的样式字符串。

const codeBlockStyleText = `
.mst-ui-code-block-fallback {
  margin: 0;
  overflow-x: auto;
  padding: 1rem;
  background: rgb(248 250 252);
  color: rgb(30 41 59);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.3334;
}

.mst-ui-code-block-fallback code {
  display: block;
  tab-size: 2;
  font-size: inherit;
  line-height: inherit;
}

html[data-theme='dark'] .mst-ui-code-block-fallback {
  background: #24292e;
  color: #e1e4e8;
}

.mst-ui-code-block .shiki {
  margin: 0;
  padding: 1rem !important;
  overflow-x: auto;
  white-space: pre !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.3334;
}

.mst-ui-code-block .shiki code {
  display: block;
  min-width: max-content;
  tab-size: 2;
  white-space: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
}

.mst-ui-code-block .shiki code span {
  white-space: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
}

.mst-ui-code-block[data-wrap='true'] .shiki {
  white-space: pre-wrap !important;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.mst-ui-code-block[data-wrap='true'] .shiki code {
  min-width: 0;
  white-space: inherit !important;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.mst-ui-code-block[data-wrap='true'] .shiki code span {
  white-space: inherit !important;
}

.mst-ui-code-block[data-wrap='true'] .mst-ui-code-block-fallback {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.mst-ui-code-block[data-wrap='true'] .mst-ui-code-block-fallback code {
  min-width: 0;
  white-space: inherit;
}
`

export function CodeBlockStyles() {
  return <style>{codeBlockStyleText}</style>
}
