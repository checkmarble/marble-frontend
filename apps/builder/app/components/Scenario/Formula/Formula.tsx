import { type PlainMessage } from '@bufbuild/protobuf';
import { type Formula as FormulaMessage } from '@marble-front/api/marble';
import { assertNever } from '@marble-front/builder/utils/assert-never';
import { Data } from './Data';
import { Condition } from './Condition';
import { NotImplemented } from './NotImplemented';
import { OperatorBinary } from './OperatorBinary';
import { FormulaAggregation } from './FormulaAggregation';

interface FormulaProps {
  formula: PlainMessage<FormulaMessage>;
  isRoot?: boolean;
}

export function Formula({ formula: { value }, isRoot = false }: FormulaProps) {
  switch (value.case) {
    case 'data': {
      if (isRoot) {
        return (
          <Condition.Container>
            <Condition.Item>
              <Data data={value.value} />
            </Condition.Item>
          </Condition.Container>
        );
      }

      return <Data data={value.value} />;
    }

    case 'formulaBinary': {
      const { left, operator, right } = value.value;
      const Left = left && <Formula formula={left} />;
      const Operator = <OperatorBinary operator={operator} />;
      const Right = right && <Formula formula={right} />;

      if (isRoot) {
        return (
          <Condition.Container>
            <Condition.Item>{Left}</Condition.Item>
            <Condition.Item className="px-4">{Operator}</Condition.Item>
            <Condition.Item>{Right}</Condition.Item>
          </Condition.Container>
        );
      }

      return (
        <>
          {Left}
          {Operator}
          {Right}
        </>
      );
    }

    case 'formulaAggregation': {
      if (isRoot) {
        return (
          <Condition.Container>
            <Condition.Item>
              <FormulaAggregation.Trigger formulaAggregation={value.value} />
            </Condition.Item>
          </Condition.Container>
        );
      }

      return <FormulaAggregation.Trigger formulaAggregation={value.value} />;
    }

    case 'formulaUnary':
    case 'formulaVariant': {
      if (isRoot) {
        return (
          <Condition.Container>
            <Condition.Item>
              <NotImplemented value={value.case} />
            </Condition.Item>
          </Condition.Container>
        );
      }

      return <NotImplemented value={value.case} />;
    }
    case undefined:
      return null;
    default:
      assertNever('unknwon Formula case:', value);
  }
}
