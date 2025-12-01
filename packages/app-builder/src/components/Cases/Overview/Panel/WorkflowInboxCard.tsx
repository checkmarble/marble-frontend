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
}

export const WorkflowInboxCard = ({ inbox, settings, onToggle, disabled }: WorkflowInboxCardProps) => {
  const { t } = useTranslation(['cases']);
  const [isOpen, setIsOpen] = useState(false);

  const isConfigured = settings.caseReviewManual || settings.caseReviewOnCaseCreated || settings.caseReviewOnEscalate;

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-grey-border rounded-v2-lg bg-grey-background-light flex flex-col">
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-v2-sm p-v2-md w-full text-left hover:bg-grey-98 rounded-v2-lg transition-colors"
          >
            <Icon
              icon="caret-down"
              className={cn('size-5 text-grey-50 transition-transform', { '-rotate-90': !isOpen })}
            />
            <span className="flex-1 text-m font-semibold">{inbox.name}</span>
            <Tag color={isConfigured ? 'green' : 'grey'} size="small" border="rounded-sm">
              {isConfigured ? t('cases:overview.config.configured') : t('cases:overview.config.inactive')}
            </Tag>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <div className="flex flex-col gap-v2-sm px-v2-md pb-v2-md">
            <div className="flex items-center gap-v2-sm">
              <Switch
                checked={settings.caseReviewOnCaseCreated}
                onCheckedChange={(checked) => onToggle('caseReviewOnCaseCreated', checked)}
                disabled={disabled}
              />
              <span className="text-s">{t('cases:overview.workflow.case_created')}</span>
            </div>

            <div className="flex items-center gap-v2-sm">
              <Switch
                checked={settings.caseReviewOnEscalate}
                onCheckedChange={(checked) => onToggle('caseReviewOnEscalate', checked)}
                disabled={disabled}
              />
              <span className="text-s">{t('cases:overview.workflow.case_escalated')}</span>
            </div>

            <div className="flex items-center gap-v2-sm">
              <Switch
                checked={settings.caseReviewManual}
                onCheckedChange={(checked) => onToggle('caseReviewManual', checked)}
                disabled={disabled}
              />
              <span className="text-s">{t('cases:overview.workflow.manual_request')}</span>
            </div>
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
};
