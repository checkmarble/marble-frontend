import { scenarioI18n } from '@app-builder/components';
import { type EditorIdentifiersByType } from '@app-builder/models/identifier';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallback } from 'react';
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

export const allAggregators: string[] = [
  'AVG',
  'COUNT',
  'COUNT_DISTINCT',
  'MAX',
  'MIN',
  'SUM',
];

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
    [t],
  );
}
