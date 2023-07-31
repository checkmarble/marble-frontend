import { type AstOperator } from '@app-builder/models/ast-operators';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const EditorOperatorsContext =
  createSimpleContext<AstOperator[]>('EditorOperators');

export function EditorOperatorsProvider({
  children,
  operators,
}: {
  children: React.ReactNode;
  operators: AstOperator[];
}) {
  const value = operators;
  return (
    <EditorOperatorsContext.Provider value={value}>
      {children}
    </EditorOperatorsContext.Provider>
  );
}

export const useEditorOperators = EditorOperatorsContext.useValue;

/**
 * Need to stay as a hook, because it will require translation in the future (ex: IsInList)
 * cf useGetOperatorLabel() in packages/app-builder/src/components/Scenario/Formula/Operators/Math.tsx
 */
export function useGetOperatorName() {
  const { t } = useTranslation(['scenarios']);

  return useCallback((operatorName: string) => {
    if (['+', '-', '<', '=', '>'].includes(operatorName)) return operatorName;

    if (operatorName === '*') return '×';
    if (operatorName === '/') return '÷';

    if (operatorName === '/') return '÷';
    if (operatorName === 'IsInList') return t('scenarios:operator.is_in');

    // eslint-disable-next-line no-restricted-properties
    if (process.env.NODE_ENV === 'development') {
      console.warn('Unhandled operator', operatorName);
    }
    return operatorName;
  }, []);
}
