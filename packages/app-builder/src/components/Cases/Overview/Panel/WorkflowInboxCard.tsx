import { type InboxWithCasesCount } from '@app-builder/models/inbox';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, Switch, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export interface WorkflowSettings {
  caseReviewManual: boolean;
  caseReviewOnCaseCreated: boolean;
  caseReviewOnEscalate: boolean;
}

interface WorkflowInboxCardProps {
  inbox: InboxWithCasesCount;
  settings: WorkflowSettings;
  onToggle: (field: keyof WorkflowSettings, value: boolean) => void;
  disabled?: boolean;
  defaultOpen?: boolean;
}

export const WorkflowInboxCard = ({ inbox, settings, onToggle, disabled, defaultOpen }: WorkflowInboxCardProps) => {
  const { t } = useTranslation(['cases']);
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  const isConfigured = settings.caseReviewManual || settings.caseReviewOnCaseCreated || settings.caseReviewOnEscalate;

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-grey-border rounded-lg bg-grey-background-light flex flex-col">
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-sm p-md w-full text-left hover:bg-grey-background-light rounded-lg transition-colors"
          >
            <Icon
              icon="caret-down"
              className={cn('size-5 text-grey-secondary transition-transform', { '-rotate-90': !isOpen })}
            />
            <span className="flex-1 text-m font-semibold">{inbox.name}</span>
            <Tag color={isConfigured ? 'green' : 'grey'} size="small">
              {isConfigured ? t('cases:overview.config.configured') : t('cases:overview.config.inactive')}
            </Tag>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <div className="flex flex-col gap-sm px-md pb-md">
            <label htmlFor="caseReviewOnCaseCreated" className="flex items-center gap-sm">
              <Switch
                id="caseReviewOnCaseCreated"
                checked={settings.caseReviewOnCaseCreated}
                onCheckedChange={(checked) => onToggle('caseReviewOnCaseCreated', checked)}
                disabled={disabled}
              />
              <span className="text-s">{t('cases:overview.workflow.case_created')}</span>
            </label>
            <label htmlFor="caseReviewOnEscalate" className="flex items-center gap-sm">
              <Switch
                id="caseReviewOnEscalate"
                checked={settings.caseReviewOnEscalate}
                onCheckedChange={(checked) => onToggle('caseReviewOnEscalate', checked)}
                disabled={disabled}
              />
              <span className="text-s">{t('cases:overview.workflow.case_escalated')}</span>
            </label>
            <label htmlFor="caseReviewManual" className="flex items-center gap-sm">
              <Switch
                id="caseReviewManual"
                checked={settings.caseReviewManual}
                onCheckedChange={(checked) => onToggle('caseReviewManual', checked)}
                disabled={disabled}
              />
              <span className="text-s">{t('cases:overview.workflow.manual_request')}</span>
            </label>
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
};
