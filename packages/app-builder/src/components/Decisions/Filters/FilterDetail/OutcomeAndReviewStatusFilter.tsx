import { type ReviewStatus } from '@app-builder/models/decision';
import { type KnownOutcome } from '@app-builder/models/outcome';
import { matchSorter } from '@app-builder/utils/search';
import * as React from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';

import {
  OutcomeAndReviewStatus,
  useOutcomeAndReviewStatus,
} from '../../OutcomeAndReviewStatus';
import { useOutcomeAndReviewStatusFilter } from '../DecisionFiltersContext';

export function OutcomeAndReviewStatusFilter() {
  const [value, setSearchValue] = React.useState('');
  const { selectedOutcomeAndReviewStatus, setOutcomeAndReviewStatus } =
    useOutcomeAndReviewStatusFilter();
  const deferredValue = React.useDeferredValue(value);
  const outcomeAndReviewStatus = useOutcomeAndReviewStatus();

  const matches = React.useMemo(
    () =>
      matchSorter(outcomeAndReviewStatus, deferredValue, {
        keys: ['outcomeLabel', 'reviewStatusLabel'],
      }),
    [deferredValue, outcomeAndReviewStatus],
  );

  const selectedValue = React.useMemo(
    () =>
      selectedOutcomeAndReviewStatus.map(({ outcome, reviewStatus }) =>
        getValue(outcome, reviewStatus),
      ),
    [selectedOutcomeAndReviewStatus],
  );

  const onSelectedValueChange = React.useCallback(
    (value: string[]) => {
      setOutcomeAndReviewStatus(value.map(parseValue));
    },
    [setOutcomeAndReviewStatus],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <SelectWithCombobox.Root
        open
        onSearchValueChange={setSearchValue}
        selectedValue={selectedValue}
        onSelectedValueChange={onSelectedValueChange}
      >
        <SelectWithCombobox.Combobox render={<Input />} autoSelect autoFocus />
        <SelectWithCombobox.ComboboxList>
          {matches.map(({ outcomeValue, reviewStatusValue }) => {
            const value = getValue(outcomeValue, reviewStatusValue);

            return (
              <SelectWithCombobox.ComboboxItem key={value} value={value}>
                <OutcomeAndReviewStatus
                  className="ml-2 w-full"
                  outcome={outcomeValue}
                  reviewStatus={reviewStatusValue}
                />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Root>
    </div>
  );
}

function getValue(outcome: KnownOutcome, reviewStatus?: ReviewStatus) {
  return `${outcome}-${reviewStatus ?? ''}`;
}

function parseValue(value: string) {
  const [outcome, reviewStatus] = value.split('-');
  return {
    outcome: outcome as KnownOutcome,
    reviewStatus: reviewStatus as ReviewStatus,
  };
}