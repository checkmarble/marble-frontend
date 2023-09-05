import type { AstBuilder } from '@app-builder/services/editor/ast-editor';

import { AstBuilderNode } from './AstBuilderNode';

export function AstBuilder({ builder }: { builder: AstBuilder }) {
  return (
    <AstBuilderNode
      builder={builder}
      editorNodeViewModel={builder.editorNodeViewModel}
    />
  );
}
