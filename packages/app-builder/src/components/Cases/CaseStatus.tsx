import { type CaseOutcome, type CaseStatus } from '@app-builder/models/cases';
import { cva, type VariantProps } from 'class-variance-authority';
import { IconProps } from 'packages/ui-icons/src/Icon';
import { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { casesI18n } from './cases-i18n';

export const caseStatusBadgeVariants = cva('inline-flex items-center w-fit shrink-0 grow-0 border border-transparent', {
  variants: {
    size: {
      large: 'justify-center rounded-sm p-2 gap-2 text-r font-medium',
      small: 'gap-1 rounded-full px-2 py-1 text-xs font-normal',
    },
  },
  defaultVariants: {
    size: 'small',
  },
});

type CaseStatusBadgeProps = ComponentProps<'span'> &
  VariantProps<typeof caseStatusBadgeVariants> & {
    status: CaseStatus;
    outcome?: CaseOutcome;
    showText?: boolean;
    showBackground?: boolean;
  };

/**
 *
 * @deprecated Use `CaseStatusBadgeV2` instead.
 *
 */
export const CaseStatusBadge = ({
  status,
  outcome,
  showText = true,
  showBackground = true,
  size,
  className,
  ...rest
}: CaseStatusBadgeProps) => {
  const { t } = useTranslation(casesI18n);

  return (
    <span {...rest} className="inline-flex items-center gap-2">
      <span
        className={caseStatusBadgeVariants({
          size,
          className: cn(className, {
            'bg-purple-background dark:bg-transparent dark:border-purple-primary':
              (status === 'snoozed' || status === 'closed') && showBackground,
            'bg-red-background dark:bg-transparent dark:border-red-primary':
              status === 'waiting_for_action' && showBackground,
            'bg-grey-background dark:bg-transparent dark:border-grey-placeholder':
              status === 'pending' && showBackground,
            'bg-blue-96 dark:bg-transparent dark:border-blue-58': status === 'investigating' && showBackground,
          }),
        })}
      >
        {match(status)
          .with('snoozed', () => <Icon icon="status_snoozed" className="text-purple-primary size-4" />)
          .with('waiting_for_action', () => <Icon icon="waiting_for_action" className="text-red-primary size-4" />)
          .with('pending', () => <div className="border-grey-disabled size-3.5 rounded-full border-2" />)
          .with('investigating', () => <Icon icon="investigating" className="text-blue-58 size-4" />)
          .with('closed', () => <Icon icon="resolved" className="text-purple-primary size-4" />)
          .exhaustive()}
        {showText ? (
          <span
            className={cn('text-grey-primary', {
              'text-purple-primary': status === 'snoozed' || status === 'closed',
              'text-red-primary': status === 'waiting_for_action',
              'text-grey-secondary': status === 'pending',
              'text-blue-58': status === 'investigating',
            })}
          >
            {t(`cases:case.status.${status}`)}
          </span>
        ) : null}
      </span>
      {outcome && outcome !== 'unset' ? (
        <span
          className={cn('rounded-full border px-2 py-0.5 text-xs', {
            'border-red-primary text-red-primary': outcome === 'confirmed_risk',
            'border-green-primary text-green-primary': outcome === 'valuable_alert',
            'border-grey-placeholder text-grey-secondary': outcome === 'false_positive',
          })}
        >
          {t(`cases:case.outcome.${outcome}`)}
        </span>
      ) : null}
    </span>
  );
};

const statusIconMap: Record<CaseStatus, IconProps['icon']> = {
  pending: 'status-pending',
  investigating: 'search',
  closed: 'resolved',
  waiting_for_action: 'waiting_for_action',
  snoozed: 'status_snoozed',
};

export type CaseStatusBadgeV2Props = {
  status: CaseStatus;
  outcome: CaseOutcome;
  variant: 'full' | 'semi-full' | 'big' | 'icon-only';
};

const badgeTextVariants = cva('', {
  variants: {
    status: {
      pending: 'text-yellow-primary',
      investigating: 'text-purple-primary',
      closed: 'text-green-primary',
      waiting_for_action: 'text-orange-primary',
      snoozed: 'text-grey-secondary',
    },
  },
});

const badgeBorderVariants = cva('border', {
  variants: {
    status: {
      pending: 'border-yellow-primary',
      investigating: 'border-purple-primary',
      closed: 'border-green-primary',
      waiting_for_action: 'border-orange-primary',
      snoozed: 'border-grey-secondary',
    },
  },
});

const outcomeVariants = cva('border rounded-full px-v2-sm h-6 flex items-center', {
  variants: {
    outcome: {
      false_positive: 'text-green-secondary border-green-secondary',
      valuable_alert: 'text-orange-primary border-orange-primary',
      confirmed_risk: 'text-red-primary border-red-primary',
    },
  },
});

export const CaseStatusBadgeV2 = ({ status, outcome, variant }: CaseStatusBadgeV2Props) => {
  const { t } = useTranslation(['cases']);

  if (variant === 'full' || variant === 'icon-only') {
    return (
      <div className={cn(badgeTextVariants({ status }), 'flex items-center gap-v2-sm text-small whitespace-nowrap')}>
        <div className="flex items-center gap-v2-xs shrink-0">
          <Icon icon={statusIconMap[status]} className="size-5 shrink-0" />
          {variant === 'full' ? (
            <span className="text-grey-primary font-medium">{t(`cases:case.status.${status}`)}</span>
          ) : null}
        </div>
        {outcome !== 'unset' && variant !== 'icon-only' ? (
          <div className={cn(outcomeVariants({ outcome }), 'shrink-0 whitespace-nowrap')}>
            {t(`cases:case.outcome.${outcome}`)}
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === 'semi-full') {
    if (status !== 'closed') {
      return (
        <div
          className={cn(
            badgeTextVariants({ status }),
            badgeBorderVariants({ status }),
            'flex items-center gap-v2-xs h-6 rounded-full px-v2-sm text-small whitespace-nowrap',
          )}
        >
          <Icon icon={statusIconMap[status]} className="size-4 shrink-0" />
          <span className="shrink-0 whitespace-nowrap">{t(`cases:case.status.${status}`)}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-v2-xs text-small whitespace-nowrap">
        <Icon icon={statusIconMap[status]} className={cn(badgeTextVariants({ status }), 'size-5 shrink-0')} />
        {outcome !== 'unset' ? (
          <div className={cn(outcomeVariants({ outcome }), 'shrink-0 whitespace-nowrap')}>
            {t(`cases:case.outcome.${outcome}`)}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        badgeTextVariants({ status }),
        badgeBorderVariants({ status }),
        'flex items-center gap-v2-sm h-10 rounded-v2-s px-v2-sm text-default font-medium whitespace-nowrap',
      )}
    >
      <Icon icon={statusIconMap[status]} className="size-5" />
      <span>{t(`cases:case.status.${status}`)}</span>
    </div>
  );
};
