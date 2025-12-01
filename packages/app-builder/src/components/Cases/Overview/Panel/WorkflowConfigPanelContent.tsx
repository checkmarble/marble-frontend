import {
  PanelContainer,
  PanelContent,
  PanelFooter,
  PanelHeader,
  PanelOverlay,
  usePanel,
} from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useUpdateInboxWorkflowMutation } from '@app-builder/queries/cases/update-inbox-workflow';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { WorkflowInboxCard, type WorkflowSettings } from './WorkflowInboxCard';

type InboxWorkflowState = Map<string, WorkflowSettings>;

interface WorkflowConfigPanelContentProps {
  readOnly?: boolean;
}

export const WorkflowConfigPanelContent = ({ readOnly }: WorkflowConfigPanelContentProps) => {
  const { t } = useTranslation(['cases']);
  const inboxesQuery = useGetInboxesQuery();
  const { closePanel } = usePanel();
  const queryClient = useQueryClient();
  const updateWorkflowMutation = useUpdateInboxWorkflowMutation();

  const [workflowState, setWorkflowState] = useState<InboxWorkflowState>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const inboxes = inboxesQuery.data?.inboxes ?? [];

  // Sync workflow state when query data updates
  useEffect(() => {
    if (inboxesQuery.isSuccess) {
      const initialState = new Map<string, WorkflowSettings>();
      for (const inbox of inboxesQuery.data.inboxes) {
        initialState.set(inbox.id, {
          caseReviewManual: inbox.caseReviewManual,
          caseReviewOnCaseCreated: inbox.caseReviewOnCaseCreated,
          caseReviewOnEscalate: inbox.caseReviewOnEscalate,
        });
      }
      setWorkflowState(initialState);
    }
  }, [inboxesQuery.dataUpdatedAt]);

  const handleToggle = (inboxId: string, field: keyof WorkflowSettings, value: boolean) => {
    setWorkflowState((prev) => {
      const newState = new Map(prev);
      const current = newState.get(inboxId);
      if (current) {
        newState.set(inboxId, { ...current, [field]: value });
      }
      return newState;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const updates: Promise<unknown>[] = [];

      for (const inbox of inboxes) {
        const currentSettings = workflowState.get(inbox.id);
        if (!currentSettings) continue;

        // Check if settings changed
        const hasChanged =
          currentSettings.caseReviewManual !== inbox.caseReviewManual ||
          currentSettings.caseReviewOnCaseCreated !== inbox.caseReviewOnCaseCreated ||
          currentSettings.caseReviewOnEscalate !== inbox.caseReviewOnEscalate;

        if (hasChanged) {
          updates.push(
            updateWorkflowMutation.mutateAsync({
              inboxId: inbox.id,
              caseReviewManual: currentSettings.caseReviewManual,
              caseReviewOnCaseCreated: currentSettings.caseReviewOnCaseCreated,
              caseReviewOnEscalate: currentSettings.caseReviewOnEscalate,
            }),
          );
        }
      }

      await Promise.all(updates);
      await queryClient.invalidateQueries({ queryKey: ['cases', 'inboxes'] });

      toast.success(t('cases:overview.panel.workflow.saved'));
      closePanel();
    } catch {
      toast.error(t('cases:overview.panel.workflow.save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PanelOverlay>
      <PanelContainer size="xxl">
        <PanelHeader>
          <div className="flex items-center gap-v2-sm">
            <Icon icon="left-panel-open" className="size-4" />
            <span>{t('cases:overview.panel.workflow.title')}</span>
          </div>
        </PanelHeader>
        <PanelContent>
          {match(inboxesQuery)
            .with({ isPending: true }, () => (
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-8" />
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="text-s text-grey-50 py-4">{t('cases:overview.config.error_loading')}</div>
            ))
            .with({ isSuccess: true }, () => (
              <div className="flex flex-col gap-v2-md">
                {inboxes.map((inbox) => {
                  const settings = workflowState.get(inbox.id);
                  if (!settings) return null;

                  return (
                    <WorkflowInboxCard
                      key={inbox.id}
                      inbox={inbox}
                      settings={settings}
                      onToggle={(field, value) => handleToggle(inbox.id, field, value)}
                      disabled={readOnly}
                    />
                  );
                })}
              </div>
            ))
            .exhaustive()}
        </PanelContent>
        {!readOnly && (
          <PanelFooter>
            <ButtonV2 size="default" className="w-full justify-center" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Icon icon="spinner" className="size-4 animate-spin" /> : t('cases:overview.validate_config')}
            </ButtonV2>
          </PanelFooter>
        )}
      </PanelContainer>
    </PanelOverlay>
  );
};
