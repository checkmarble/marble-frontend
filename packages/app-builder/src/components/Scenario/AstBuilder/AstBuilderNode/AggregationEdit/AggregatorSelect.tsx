import {
  type EvaluationError,
  NewAggregatorAstNode,
} from '@app-builder/models';
import { AggregatorEditableAstNode } from '@app-builder/models/editable-ast-node';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'ui-design-system';

export const AggregatorSelect = ({
  value,
  onChange,
  errors,
}: {
  value: string;
  onChange: (value: string) => void;
  errors: EvaluationError[];
}) => {
  const { t } = useTranslation(['scenarios']);
  const availableAggregators = useMemo(
    () =>
      AggregatorEditableAstNode.allAggregators.map((aggregator) => {
        return {
          aggregatorName: aggregator,
          displayName: AggregatorEditableAstNode.getAggregatorDisplayName(
            t,
            NewAggregatorAstNode(aggregator),
          ),
        };
      }),
    [t],
  );

  return (
    <Select.Root
      value={value}
      onValueChange={(selectedValue) => {
        if (selectedValue === null) {
          return;
        }
        onChange(selectedValue);
      }}
    >
      <Select.Trigger borderColor={errors.length > 0 ? 'red-100' : 'grey-10'}>
        <Select.Value placeholder="..." />
        <Select.Arrow />
      </Select.Trigger>
      <Select.Content className="max-h-60">
        <Select.Viewport>
          {availableAggregators.map(({ aggregatorName, displayName }) => (
            <Select.Item
              className="min-w-[110px]"
              key={aggregatorName}
              value={aggregatorName}
            >
              <Select.ItemText>
                <span className="text-s text-grey-100">{displayName}</span>
              </Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
};
