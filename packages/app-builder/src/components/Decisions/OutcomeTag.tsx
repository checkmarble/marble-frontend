import { knownOutcomes, type Outcome } from '@app-builder/models/outcome';
import clsx from 'clsx';
import { type ParseKeys } from 'i18next';
import { type ComponentProps, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn, Tag, type TagProps } from 'ui-design-system';

import { decisionsI18n } from './decisions-i18n';

export interface OutcomeTagProps extends Omit<TagProps, 'color'> {
  outcome: Outcome;
}

const outcomeMapping: Record<
  Outcome,
  { color: TagProps['color']; tKey: ParseKeys<['decisions']> }
> = {
  approve: { color: 'green', tKey: 'decisions:outcome.approve' },
  review: { color: 'yellow', tKey: 'decisions:outcome.review' },
  block_and_review: {
    color: 'orange',
    tKey: 'decisions:outcome.block_and_review',
  },
  decline: { color: 'red', tKey: 'decisions:outcome.decline' },
  unknown: { color: 'grey', tKey: 'decisions:outcome.unknown' },
};

export function useOutcomes() {
  const { t } = useTranslation(decisionsI18n);

  return useMemo(
    () =>
      knownOutcomes.map((outcome) => ({
        value: outcome,
        label: t(outcomeMapping[outcome].tKey),
      })),
    [t],
  );
}

export function OutcomeTag({ outcome, className, ...tagProps }: OutcomeTagProps) {
  const { t } = useTranslation(decisionsI18n);

  const { color, tKey } = outcomeMapping[outcome] ?? outcomeMapping.unknown;

  return (
    <Tag {...tagProps} color={color} className={clsx('text-center', className)}>
      {t(tKey)}
    </Tag>
  );
}

export function OutcomePanel({ outcome }: { outcome: Outcome }) {
  const { t } = useTranslation(decisionsI18n);
  const { color, tKey } = outcomeMapping[outcome] ?? outcomeMapping.unknown;

  return (
    <div
      className={clsx('flex flex-1 flex-col items-center justify-center gap-2 rounded-lg p-2', {
        'bg-green-94': color === 'green',
        'bg-yellow-90': color === 'yellow',
        'bg-orange-95': color === 'orange',
        'bg-red-95': color === 'red',
      })}
    >
      <div
        className={clsx('text-s', {
          'text-green-68': color === 'green',
          'text-yellow-75': color === 'yellow',
          'text-orange-50': color === 'orange',
          'text-red-74': color === 'red',
        })}
      >
        {t('decisions:outcome')}
      </div>
      <div
        className={clsx('text-l text-center font-semibold first-letter:capitalize', {
          'text-green-38': color === 'green',
          'text-yellow-50': color === 'yellow',
          'text-orange-50': color === 'orange',
          'text-red-47': color === 'red',
        })}
      >
        {t(tKey)}
      </div>
    </div>
  );
}

export function OutcomeBadge({
  outcome,
  reviewStatus = null,
  className,
  ...rest
}: ComponentProps<'div'> & { outcome: Outcome; reviewStatus?: string | null }) {
  const { t } = useTranslation(decisionsI18n);
  return (
    <div {...rest} className={cn('flex items-center gap-1', className)}>
      <div
        className={cn('size-4 rounded-full', {
          'bg-green-38': outcome === 'approve',
          'bg-red-47': outcome === 'decline',
          'border-red-47 border-2': outcome === 'review',
          'border-2 border-yellow-50': outcome === 'block_and_review',
          'bg-grey-50': outcome === 'unknown',
        })}
      />
      <span className="text-xs font-medium">
        {match(outcome)
          .with('approve', () => t('decisions:outcome.tag.approved.label'))
          .with('decline', () => t('decisions:outcome.tag.declined.label'))
          .with('block_and_review', () =>
            reviewStatus
              ? t('decisions:outcome.tag.manually_approved.label')
              : t('decisions:outcome.tag.blocked.label'),
          )
          .with('review', () => t('decisions:outcome.tag.review.label'))
          .with('unknown', () => t('decisions:outcome.tag.unknown.label'))
          .exhaustive()}
      </span>
    </div>
  );
}
