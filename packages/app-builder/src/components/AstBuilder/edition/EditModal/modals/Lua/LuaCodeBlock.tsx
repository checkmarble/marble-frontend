import Prism from 'prismjs';
import 'prismjs/components/prism-lua';
import { cn } from 'ui-design-system';

import './Lua.css';

/**
 * Read-only, syntax-highlighted Lua code block. Shares the `.lua-editor` token
 * colors (see Lua.css) used by the editable modal so highlighting is consistent.
 */
export function LuaCodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <pre className={cn('lua-editor overflow-auto whitespace-pre-wrap rounded-sm p-2 font-mono text-xs', className)}>
      {/* Prism escapes the input text and only emits token markup, so this is safe. */}
      <code dangerouslySetInnerHTML={{ __html: Prism.highlight(code, Prism.languages['lua'] ?? {}, 'lua') }} />
    </pre>
  );
}
