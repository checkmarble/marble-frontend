import { type AstNode } from '@app-builder/models';
import { createContext, useContext, useState } from 'react';

interface CopyPasteAST {
  ast: AstNode | null;
  setAst: (ast: AstNode | null) => void;
}

const CopyPasteASTContext = createContext<CopyPasteAST | null>(null);
CopyPasteASTContext.displayName = 'CopyPasteASTContext';

/**
 * The purpose of this context is to enable the copy/paste AST feature.
 *
 * You can safely use the useOptionalCopyPasteAST function in the following way:
 * - By default, the context is null, which means the copy/paste AST feature is disabled.
 * - When a Provider is added, the context is set to a non-null value, which means the copy/paste AST feature is enabled.
 *
 * To enable the copy/paste AST feature, place this context provider at the root of the component/page tree where you want to enable it.
 * All children components will share the same copy/paste context.
 *
 * We do not use a global context to separate the copy/paste context between different pages.
 *
 * If needed, you can nest multiple CopyPasteASTContextProvider instances to create multiple copy/paste contexts (e.g., inside a specific edit modal).
 */
export function CopyPasteASTContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ast, setAst] = useState<CopyPasteAST['ast']>(null);
  return (
    <CopyPasteASTContext.Provider value={{ ast, setAst }}>
      {children}
    </CopyPasteASTContext.Provider>
  );
}

export const useOptionalCopyPasteAST = () => useContext(CopyPasteASTContext);
