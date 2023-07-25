import {
  adaptAstNodeToViewModel,
  adaptEditorIdentifierToViewModel,
  NewAstNode,
} from '@app-builder/models';
import { type EditorIdentifier, type EditorIdentifiersByType } from '@app-builder/models/identifier';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallback, useMemo } from 'react';

const EditorIdentifiersContext =
  createSimpleContext<EditorIdentifier[]>('EditorIdentifiers');

export function EditorIdentifiersProvider({
  children,
  identifiers,
}: {
  children: React.ReactNode;
  identifiers: EditorIdentifiersByType;
}) {
  const value = [...identifiers.databaseAccessors, ...identifiers.payloadAccessors, ...identifiers.customListAccessors];
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
    () => identifiers.map(adaptEditorIdentifierToViewModel),
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
