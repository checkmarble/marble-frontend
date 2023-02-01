import { OperatorBinary as OperatorBinaryEnum } from '@marble-front/api/marble';
import { assertNever } from '@marble-front/builder/utils/assert-never';
import { useCallback } from 'react';

function useGetUnicodeOperator() {
  return useCallback((operator: OperatorBinaryEnum) => {
    switch (operator) {
      case OperatorBinaryEnum.EQUAL:
        return '=';
      case OperatorBinaryEnum.NOT_EQUAL:
        return '≠';
      case OperatorBinaryEnum.GREATER:
        return '>';
      case OperatorBinaryEnum.GREATER_EQUAL:
        return '≥';
      case OperatorBinaryEnum.LOWER:
        return '<';
      case OperatorBinaryEnum.LOWER_EQUAL:
        return '≤';
      case OperatorBinaryEnum.ADD:
        return '+';
      case OperatorBinaryEnum.SUBTRACT:
        return '−';
      case OperatorBinaryEnum.MULTIPLY:
        return '×';
      case OperatorBinaryEnum.DIVIDE:
        return '÷';
      default:
        assertNever('unknwon OperatorBinary :', operator);
    }
  }, []);
}

export function OperatorBinary({ operator }: { operator: OperatorBinaryEnum }) {
  const getUnicodeOperator = useGetUnicodeOperator();

  return (
    <span className="text-grey-100 font-semibold">
      {getUnicodeOperator(operator)}
    </span>
  );
}
