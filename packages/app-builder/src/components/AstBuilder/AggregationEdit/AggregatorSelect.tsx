import {
  allAggregators,
  useGetAggregatorName,
} from '@app-builder/services/editor';
import { Select } from '@ui-design-system';
import { useMemo } from 'react';

export const AggregatorSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
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
      <Select.Trigger>
        <Select.Value placeholder="..." />
      </Select.Trigger>
      <Select.Content className="max-h-60">
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
      </Select.Content>
    </Select.Root>
  );
};
