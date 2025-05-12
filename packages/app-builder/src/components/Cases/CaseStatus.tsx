import type { CaseOutcome, CaseStatus } from '@app-builder/models/cases';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { casesI18n } from './cases-i18n';

export const caseStatusBadgeVariants = cva('inline-flex items-center w-fit shrink-0 grow-0', {
  variants: {
    size: {
      large: 'justify-center rounded p-2 gap-2 text-r font-medium',
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
            'bg-purple-96': (status === 'snoozed' || status === 'closed') && showBackground,
            'bg-red-95': status === 'waiting_for_action' && showBackground,
            'bg-grey-95': status === 'pending' && showBackground,
            'bg-blue-96': status === 'investigating' && showBackground,
          }),
        })}
      >
        {match(status)
          .with('snoozed', () => <Icon icon="status_snoozed" className="text-purple-65 size-4" />)
          .with('waiting_for_action', () => (
            <Icon icon="waiting_for_action" className="text-red-47 size-4" />
          ))
          .with('pending', () => <div className="border-grey-80 size-3.5 rounded-full border-2" />)
          .with('investigating', () => (
            <Icon icon="investigating" className="text-blue-58 size-4" />
          ))
          .with('closed', () => <Icon icon="resolved" className="text-purple-65 size-4" />)
          .exhaustive()}
        {showText ? (
          <span
            className={cn('text-grey-00', {
              'text-purple-65': status === 'snoozed' || status === 'closed',
              'text-red-47': status === 'waiting_for_action',
              'text-grey-50': status === 'pending',
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
            'border-red-47 text-red-47': outcome === 'confirmed_risk',
            'border-green-38 text-green-38': outcome === 'valuable_alert',
            'border-grey-50 text-grey-50': outcome === 'false_positive',
          })}
        >
          {t(`cases:case.outcome.${outcome}`)}
        </span>
      ) : null}
    </span>
  );
};
