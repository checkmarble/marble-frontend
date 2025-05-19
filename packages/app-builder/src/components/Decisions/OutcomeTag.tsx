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

export const outcomeBadgeVariants = cva('inline-flex items-center w-fit shrink-0 grow-0', {
  variants: {
    size: {
      sm: 'gap-1 rounded-full px-2 py-1 text-xs font-normal',
      md: 'gap-2 rounded px-2 py-1.5 text-r font-medium',
      lg: 'gap-2 rounded px-2 py-2.5 text-r font-medium',
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
              .with('approve', () => 'bg-green-94')
              .with('decline', () => 'bg-red-95')
              .with('review', () => 'bg-yellow-90')
              .with('unknown', () => 'bg-grey-95')
              .with('block_and_review', () =>
                match(reviewStatus)
                  .with('approve', () => 'bg-green-94')
                  .with('decline', () => 'bg-red-95')
                  .otherwise(() => 'bg-orange-95'),
              )
              .exhaustive(),
        ),
      })}
    >
      {match(outcome)
        .with('approve', () => <Icon icon="accepted" className="text-green-38 size-5" />)
        .with('decline', () => <Icon icon="denied" className="text-red-47 size-5" />)
        .with('review', () => (
          <div
            className={cn('size-4 rounded-full', {
              'bg-yellow-50': showBackground,
              'bg-yellow-75': !showBackground,
            })}
          />
        ))
        .with('unknown', () => <div className="bg-grey-50 size-4 rounded-full" />)
        .with('block_and_review', () =>
          match(reviewStatus)
            .with('approve', () => (
              <Icon icon="manually_accepted" className="text-green-38 size-5" />
            ))
            .with('decline', () => <Icon icon="manually_denied" className="text-red-47 size-5" />)
            .otherwise(() => <Icon icon="block_and_review" className="size-5 text-orange-50" />),
        )
        .exhaustive()}
      {showText ? (
        <span
          className={cn(
            'text-xs font-medium',
            showBackground &&
              match(outcome)
                .with('approve', () => 'text-green-38')
                .with('decline', () => 'text-red-47')
                .with('review', () => 'text-yellow-50')
                .with('unknown', () => 'text-grey-50')
                .with('block_and_review', () =>
                  match(reviewStatus)
                    .with('approve', () => 'text-green-38')
                    .with('decline', () => 'text-red-47')
                    .otherwise(() => 'text-orange-50'),
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
