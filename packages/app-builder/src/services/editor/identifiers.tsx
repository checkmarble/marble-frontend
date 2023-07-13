import { type AstNode } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';

function getIdentifierDisplayName(identifiers: AstNode) {
  switch (identifiers.name) {
    case 'DatabaseAccess': {
      const { path, fieldName } = identifiers.namedChildren;
      return [...(path.constant as string[]), fieldName.constant].join('.');
    }
    default:
      return undefined;
  }
}

const EditorIdentifiersContext =
  createSimpleContext<{ label: string; node: AstNode }[]>('EditorIdentifiers');

export function EditorIdentifiersProvider({
  children,
  identifiers,
}: {
  children: React.ReactNode;
  identifiers: {
    dataAccessors: AstNode[];
  };
}) {
  const value = identifiers.dataAccessors
    .map((dataAccessor) => ({
      label: getIdentifierDisplayName(dataAccessor),
      node: dataAccessor,
    }))
    .filter(
      (identifier): identifier is { label: string; node: AstNode } =>
        identifier.label !== undefined
    );
  return (
    <EditorIdentifiersContext.Provider value={value}>
      {children}
    </EditorIdentifiersContext.Provider>
  );
}

export const useEditorIdentifiers = EditorIdentifiersContext.useValue;
