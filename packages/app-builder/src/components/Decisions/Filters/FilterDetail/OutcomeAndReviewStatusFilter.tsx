import { type ReviewStatus } from '@app-builder/models/decision';
import { type KnownOutcome } from '@app-builder/models/outcome';
import { matchSorter } from '@app-builder/utils/search';
import * as Ariakit from '@ariakit/react';
import * as React from 'react';
import { Input, SelectWithCombobox } from 'ui-design-system';
import { Icon } from 'ui-icons';

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

  const selectedValue = selectedOutcomeAndReviewStatus
    ? getValue(
        selectedOutcomeAndReviewStatus.outcome,
        selectedOutcomeAndReviewStatus.reviewStatus,
      )
    : undefined;

  const onSelectedValueChange = React.useCallback(
    (value: string) => {
      setOutcomeAndReviewStatus(parseValue(value));
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
                <Ariakit.SelectItemCheck className="text-purple-65 shrink-0">
                  <Icon icon="tick" className="size-5" />
                </Ariakit.SelectItemCheck>
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
    outcome: outcome,
    reviewStatus: reviewStatus || undefined,
  } as {
    outcome: KnownOutcome;
    reviewStatus?: ReviewStatus;
  };
}
