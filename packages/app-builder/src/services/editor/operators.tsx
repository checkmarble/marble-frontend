import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallback } from 'react';

const EditorOperatorsContext = createSimpleContext<string[]>('EditorOperators');

export function EditorOperatorsProvider({
  children,
  operators,
}: {
  children: React.ReactNode;
  operators: string[];
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
  // const { t } = useTranslation('scenarios');

  return useCallback((operatorName: string) => {
    if (['+', '-', '<', '=', '>'].includes(operatorName)) return operatorName;

    if (operatorName === '*') return '×';
    if (operatorName === '/') return '÷';

    if (operatorName === '/') return '÷';

    // eslint-disable-next-line no-restricted-properties
    if (process.env.NODE_ENV === 'development') {
      console.warn('Unhandled operator', operatorName);
    }
    return operatorName;
  }, []);
}
