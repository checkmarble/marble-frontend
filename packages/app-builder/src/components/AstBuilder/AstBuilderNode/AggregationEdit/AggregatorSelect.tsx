import { type Validation } from '@app-builder/models';
import {
  allAggregators,
  useGetAggregatorName,
} from '@app-builder/services/editor';
import { Select } from '@ui-design-system';
import { useMemo } from 'react';

import { getBorderColor } from '../../utils';

export const AggregatorSelect = ({
  value,
  onChange,
  validation,
}: {
  value: string;
  onChange: (value: string) => void;
  validation: Validation;
}) => {
  const getAggregatorName = useGetAggregatorName();

  const availableAggregators = useMemo(
    () =>
      allAggregators.map((aggregator) => {
        return {
          aggregatorName: aggregator,
          displayName: getAggregatorName(aggregator),
        };
      }),
    [getAggregatorName]
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
      <Select.Trigger borderColor={getBorderColor(validation)}>
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
