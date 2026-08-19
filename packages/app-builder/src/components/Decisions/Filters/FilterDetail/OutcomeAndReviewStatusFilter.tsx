import { type ReviewStatus, reviewStatuses } from '@app-builder/models/decision';
import { type KnownOutcome, knownOutcomes } from '@app-builder/models/outcome';
import { matchSorter } from '@app-builder/utils/search';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { flat, map, pipe } from 'remeda';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { decisionsI18n } from '../../decisions-i18n';
import { OutcomeBadge } from '../../OutcomeTag';
import { useOutcomeAndReviewStatusFilter } from '../DecisionFiltersContext';

export function OutcomeAndReviewStatusFilter() {
  const { t } = useTranslation(decisionsI18n);
  const [value, setSearchValue] = React.useState('');
  const { selectedOutcomeAndReviewStatus, setOutcomeAndReviewStatus } = useOutcomeAndReviewStatusFilter();
  const deferredValue = React.useDeferredValue(value);
  const outcomeAndReviewStatus = React.useMemo(
    () =>
      pipe(
        knownOutcomes,
        map((outcome) => {
          if (outcome === 'block_and_review') {
            return reviewStatuses.map((reviewStatus) => ({
              outcomeValue: 'block_and_review' as const,
              outcomeLabel: t(`decisions:outcome.${outcome}`),
              reviewStatusValue: reviewStatus,
              reviewStatusLabel: t(`decisions:review_status.${reviewStatus}`),
            }));
          }
          return {
            outcomeValue: outcome,
            outcomeLabel: t(`decisions:outcome.${outcome}`),
            reviewStatusValue: undefined,
            reviewStatusLabel: undefined,
          };
        }),
        flat(),
      ),
    [],
  );

  const matches = React.useMemo(
    () =>
      matchSorter(outcomeAndReviewStatus, deferredValue, {
        keys: ['outcomeLabel', 'reviewStatusLabel'],
      }),
    [deferredValue, outcomeAndReviewStatus],
  );

  const selectedValue = selectedOutcomeAndReviewStatus
    ? getValue(selectedOutcomeAndReviewStatus.outcome, selectedOutcomeAndReviewStatus.reviewStatus)
    : undefined;

  const onSelectedValueChange = React.useCallback(
    (value: string) => {
      setOutcomeAndReviewStatus(parseValue(value));
    },
    [setOutcomeAndReviewStatus],
  );

  return (
    <div className="flex flex-col gap-sm p-sm">
      <MenuCommand.Inline>
        <MenuCommand.Combobox className="m-0" onValueChange={setSearchValue} />
        <MenuCommand.List>
          {matches.map(({ outcomeValue, reviewStatusValue, outcomeLabel, reviewStatusLabel }) => {
            const itemValue = getValue(outcomeValue, reviewStatusValue);

            return (
              <MenuCommand.Item
                key={itemValue}
                value={`${outcomeLabel} ${reviewStatusLabel ?? ''} ${itemValue}`}
                onSelect={() => onSelectedValueChange(itemValue)}
              >
                <OutcomeBadge outcome={outcomeValue} reviewStatus={reviewStatusValue} size="md" />
                {selectedValue === itemValue ? (
                  <Icon icon="tick" className="text-purple-primary size-6 shrink-0" />
                ) : null}
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Inline>
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
