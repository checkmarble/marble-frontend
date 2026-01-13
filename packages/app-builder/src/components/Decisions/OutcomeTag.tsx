import { type ReviewStatus } from '@app-builder/models/decision';
import { type Outcome } from '@app-builder/models/outcome';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { type ParseKeys } from 'i18next';
import { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn, type TagProps } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { decisionsI18n } from './decisions-i18n';

const outcomeMapping: Record<Outcome, { color: TagProps['color']; tKey: ParseKeys<['decisions']> }> = {
  approve: { color: 'green', tKey: 'decisions:outcome.approve' },
  review: { color: 'yellow', tKey: 'decisions:outcome.review' },
  block_and_review: {
    color: 'orange',
    tKey: 'decisions:outcome.block_and_review',
  },
  decline: { color: 'red', tKey: 'decisions:outcome.decline' },
  unknown: { color: 'grey', tKey: 'decisions:outcome.unknown' },
};

export function OutcomePanel({ outcome }: { outcome: Outcome }) {
  const { t } = useTranslation(decisionsI18n);
  const { color, tKey } = outcomeMapping[outcome] ?? outcomeMapping.unknown;

  return (
    <div
      className={clsx(
        'flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-transparent p-2',
        {
          'bg-green-background-light dark:bg-transparent dark:border-green-primary': color === 'green',
          'bg-yellow-background dark:bg-transparent dark:border-yellow-primary': color === 'yellow',
          'bg-orange-background-light dark:bg-transparent dark:border-orange-primary': color === 'orange',
          'bg-red-background dark:bg-transparent dark:border-red-primary': color === 'red',
        },
      )}
    >
      <div
        className={clsx('text-s', {
          'text-green-secondary': color === 'green',
          'text-yellow-secondary': color === 'yellow',
          'text-orange-secondary': color === 'orange',
          'text-red-secondary': color === 'red',
        })}
      >
        {t('decisions:outcome')}
      </div>
      <div
        className={clsx('text-l text-center font-semibold first-letter:capitalize', {
          'text-green-primary': color === 'green',
          'text-yellow-primary': color === 'yellow',
          'text-orange-primary': color === 'orange',
          'text-red-primary': color === 'red',
        })}
      >
        {t(tKey)}
      </div>
    </div>
  );
}

export const outcomeBadgeVariants = cva('inline-flex items-center w-fit shrink-0 grow-0 border border-transparent', {
  variants: {
    size: {
      sm: 'gap-1 rounded-full px-2 py-1 text-xs font-normal',
      md: 'gap-1.5 rounded-sm px-2 py-1.5 text-r font-medium',
      lg: 'gap-2 rounded-sm px-2 py-2.5 text-r font-medium',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

type OutcomeBadgeProps = ComponentProps<'span'> &
  VariantProps<typeof outcomeBadgeVariants> & {
    outcome: Outcome;
    reviewStatus?: ReviewStatus | null;
    showText?: boolean;
    showBackground?: boolean;
  };

export const OutcomeBadge = ({
  outcome,
  reviewStatus,
  showText = true,
  showBackground = true,
  size,
  className,
  ...rest
}: OutcomeBadgeProps) => {
  const { t } = useTranslation(decisionsI18n);

  return (
    <span
      {...rest}
      className={outcomeBadgeVariants({
        size,
        className: cn(
          className,
          showBackground &&
            match(outcome)
              .with('approve', () => 'bg-green-background-light dark:bg-transparent dark:border-green-primary')
              .with('decline', () => 'bg-red-background dark:bg-transparent dark:border-red-primary')
              .with('review', () => 'bg-yellow-background dark:bg-transparent dark:border-yellow-primary')
              .with('unknown', () => 'bg-grey-background dark:bg-transparent dark:border-grey-placeholder')
              .with('block_and_review', () =>
                match(reviewStatus)
                  .with('approve', () => 'bg-green-background-light dark:bg-transparent dark:border-green-primary')
                  .with('decline', () => 'bg-red-95 dark:bg-transparent dark:border-red-primary')
                  .otherwise(() => 'bg-orange-background-light dark:bg-transparent dark:border-orange-border'),
              )
              .exhaustive(),
        ),
      })}
    >
      {match(outcome)
        .with('approve', () => <Icon icon="accepted" className="text-green-primary size-4" />)
        .with('decline', () => <Icon icon="denied" className="text-red-primary size-4" />)
        .with('review', () => <div className={cn('size-3.5 rounded-full border-2 border-yellow-primary')} />)
        .with('unknown', () => <div className="border-grey-placeholder size-4 rounded-full border-2" />)
        .with('block_and_review', () =>
          match(reviewStatus)
            .with('approve', () => <Icon icon="manually_accepted" className="text-green-primary size-4" />)
            .with('decline', () => <Icon icon="manually_denied" className="text-red-primary size-4" />)
            .otherwise(() => <Icon icon="block_and_review" className="size-4 text-orange-primary" />),
        )
        .exhaustive()}
      {showText ? (
        <span
          className={cn(
            'text-xs font-medium',
            showBackground &&
              match(outcome)
                .with('approve', () => 'text-green-primary')
                .with('decline', () => 'text-red-primary')
                .with('review', () => 'text-yellow-primary')
                .with('unknown', () => 'text-grey-secondary')
                .with('block_and_review', () =>
                  match(reviewStatus)
                    .with('approve', () => 'text-green-primary')
                    .with('decline', () => 'text-red-primary')
                    .otherwise(() => 'text-orange-primary'),
                )
                .exhaustive(),
          )}
        >
          {match(outcome)
            .with('approve', () => t('decisions:outcome.tag.approved.label'))
            .with('decline', () => t('decisions:outcome.tag.declined.label'))
            .with('block_and_review', () =>
              match(reviewStatus)
                .with('approve', () => t('decisions:outcome.tag.manually_approved.label'))
                .with('decline', () => t('decisions:outcome.tag.manually_declined.label'))
                .otherwise(() => t('decisions:outcome.block_and_review')),
            )
            .with('review', () => t('decisions:outcome.tag.review.label'))
            .with('unknown', () => t('decisions:outcome.tag.unknown.label'))
            .exhaustive()}
        </span>
      ) : null}
    </span>
  );
};
