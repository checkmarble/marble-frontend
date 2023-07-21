import {
  adaptAstNodeToViewModel,
  type AstNode,
  NewAstNode,
} from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallback, useMemo } from 'react';

const EditorIdentifiersContext =
  createSimpleContext<AstNode[]>('EditorIdentifiers');

export function EditorIdentifiersProvider({
  children,
  identifiers,
}: {
  children: React.ReactNode;
  identifiers: {
    dataAccessors: AstNode[];
  };
}) {
  const value = [...identifiers.dataAccessors];
  return (
    <EditorIdentifiersContext.Provider value={value}>
      {children}
    </EditorIdentifiersContext.Provider>
  );
}

export const useEditorIdentifiers = EditorIdentifiersContext.useValue;

function coerceToConstant(search: string) {
  const parsedNumber = Number(search);
  const isNumber = !isNaN(parsedNumber);

  if (isNumber) {
    return NewAstNode({
      constant: parsedNumber,
    });
  }

  return NewAstNode({
    constant: search,
  });
}

export function useGetIdentifierOptions() {
  const identifiers = useEditorIdentifiers();
  const identifiersOptions = useMemo(
    () => identifiers.map(adaptAstNodeToViewModel),
    [identifiers]
  );

  return useCallback(
    (search: string) => {
      if (!search) return identifiersOptions;
      const constantNode = coerceToConstant(search);
      return [...identifiersOptions, adaptAstNodeToViewModel(constantNode)];
    },
    [identifiersOptions]
  );
}
