import { type CaseOutcome, type CaseStatus } from '@app-builder/models/cases';
import { cva } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { cn, Tooltip } from 'ui-design-system';
import { Icon, type IconProps } from 'ui-icons';

const statusIconMap: Record<CaseStatus, IconProps['icon']> = {
  pending: 'status-pending',
  investigating: 'search',
  closed: 'resolved',
  waiting_for_action: 'waiting_for_action',
  snoozed: 'status_snoozed',
};

export type CaseStatusBadgeV2Props = {
  status: CaseStatus;
  outcome?: CaseOutcome;
  variant: 'full' | 'semi-full' | 'big' | 'icon-only' | 'text-only';
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

const badgeBackgroundVariants = cva('', {
  variants: {
    status: {
      pending: 'bg-yellow-background-light',
      investigating: 'bg-purple-background-light',
      closed: 'bg-green-background-light',
      waiting_for_action: 'bg-orange-background-light',
      snoozed: 'bg-grey-background-light',
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

const outcomeVariants = cva('border rounded-full px-sm h-6 flex items-center', {
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
  const resolvedOutcome = outcome ?? 'unset';

  if (variant === 'text-only') {
    return (
      <span className={cn(badgeTextVariants({ status }), 'text-small font-medium whitespace-nowrap')}>
        {t(`cases:case.status.${status}`)}
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={cn(badgeTextVariants({ status }), 'inline-flex items-center gap-sm text-small whitespace-nowrap')}
      >
        <div className="inline-flex items-center gap-xs shrink-0">
          <Icon icon={statusIconMap[status]} className="size-5 shrink-0" />
          <span className="font-medium">{t(`cases:case.status.${status}`)}</span>
        </div>
        {resolvedOutcome !== 'unset' ? (
          <div className={cn(outcomeVariants({ outcome: resolvedOutcome }), 'shrink-0 whitespace-nowrap')}>
            {t(`cases:case.outcome.${resolvedOutcome}`)}
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === 'icon-only') {
    return (
      <Tooltip.Default content={t(`cases:case.status.${status}`)}>
        <div
          role="img"
          aria-label={t(`cases:case.status.${status}`)}
          className={cn(
            badgeBackgroundVariants({ status }),
            badgeTextVariants({ status }),
            'flex items-center justify-center size-8 rounded-sm',
          )}
        >
          <Icon icon={statusIconMap[status]} className="size-5 shrink-0" />
        </div>
      </Tooltip.Default>
    );
  }

  if (variant === 'semi-full') {
    if (status !== 'closed') {
      return (
        <div
          className={cn(
            badgeTextVariants({ status }),
            badgeBorderVariants({ status }),
            'inline-flex items-center gap-xs h-6 rounded-full px-sm text-small whitespace-nowrap',
          )}
        >
          <Icon icon={statusIconMap[status]} className="size-4 shrink-0" />
          <span className="shrink-0 whitespace-nowrap">{t(`cases:case.status.${status}`)}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-xs text-small whitespace-nowrap">
        <Icon icon={statusIconMap[status]} className={cn(badgeTextVariants({ status }), 'size-5 shrink-0')} />
        {resolvedOutcome !== 'unset' ? (
          <div className={cn(outcomeVariants({ outcome: resolvedOutcome }), 'shrink-0 whitespace-nowrap')}>
            {t(`cases:case.outcome.${resolvedOutcome}`)}
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
        'flex items-center gap-sm h-10 rounded-sm px-sm text-default font-medium whitespace-nowrap',
      )}
    >
      <Icon icon={statusIconMap[status]} className="size-5" />
      <span>{t(`cases:case.status.${status}`)}</span>
    </div>
  );
};
