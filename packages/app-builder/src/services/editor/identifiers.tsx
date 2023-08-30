import { scenarioI18n } from '@app-builder/components';
import {
  adaptLabelledAst,
  adaptLabelledAstFromIdentifier,
  NewAstNode,
} from '@app-builder/models';
import { type EditorIdentifiersByType } from '@app-builder/models/identifier';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
      ...identifiers.databaseAccessors.map(adaptLabelledAstFromIdentifier),
      ...identifiers.payloadAccessors.map(adaptLabelledAstFromIdentifier),
      ...identifiers.customListAccessors.map(adaptLabelledAstFromIdentifier),
      ...identifiers.aggregatorAccessors.map(adaptLabelledAstFromIdentifier),
    ],
    [identifiers]
  );

  return useCallback(
    (search: string) => {
      if (!search) return identifiersOptions;
      const constantNode = coerceToConstant(search);
      return [...identifiersOptions, adaptLabelledAst(constantNode)];
    },
    [identifiersOptions]
  );
}

/**
 * Need to stay as a hook, because it will require translation in the future
 */
export function useGetAggregatorName() {
  const { t } = useTranslation(scenarioI18n);

  return useCallback(
    (aggregatorName: string) => {
      switch (aggregatorName) {
        case 'AVG':
          return t('scenarios:aggregator.average');
        case 'COUNT':
          return t('scenarios:aggregator.count');
        case 'COUNT_DISTINCT':
          return t('scenarios:aggregator.count_distinct');
        case 'MAX':
          return t('scenarios:aggregator.max');
        case 'MIN':
          return t('scenarios:aggregator.min');
        case 'SUM':
          return t('scenarios:aggregator.sum');
      }

      // eslint-disable-next-line no-restricted-properties
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unhandled aggregator', aggregatorName);
      }
      return aggregatorName;
    },
    [t]
  );
}
