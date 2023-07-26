import {
  adaptAstNodeToViewModel,
  adaptEditorIdentifierToViewModel,
  NewAstNode,
} from '@app-builder/models';
import { type EditorIdentifiersByType } from '@app-builder/models/identifier';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallback, useMemo } from 'react';

const EditorIdentifiersContext =
  createSimpleContext<EditorIdentifiersByType>('EditorIdentifiers');

export function EditorIdentifiersProvider({
  children,
  identifiers,
}: {
  children: React.ReactNode;
  identifiers: EditorIdentifiersByType;
}) {
  return (
    <EditorIdentifiersContext.Provider value={identifiers}>
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
    () => [
      ...identifiers.databaseAccessors.map(adaptEditorIdentifierToViewModel),
      ...identifiers.payloadAccessors.map(adaptEditorIdentifierToViewModel),
      ...identifiers.customListAccessors.map(adaptEditorIdentifierToViewModel),
    ],
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
