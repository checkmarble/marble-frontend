import { Panel, PanelSharpFactory } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useUpdateInboxWorkflowMutation } from '@app-builder/queries/cases/update-inbox-workflow';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { WorkflowInboxCard, type WorkflowSettings } from './WorkflowInboxCard';

type InboxWorkflowState = Map<string, WorkflowSettings>;

interface WorkflowConfigPanelContentProps {
  readOnly?: boolean;
}

export const WorkflowConfigPanelContent = ({ readOnly }: WorkflowConfigPanelContentProps) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(['cases', 'common']);
  const inboxesQuery = useGetInboxesQuery();
  const updateWorkflowMutation = useUpdateInboxWorkflowMutation();
  const revalidate = useLoaderRevalidator();

  const [workflowState, setWorkflowState] = useState<InboxWorkflowState>(new Map());

  const inboxes = inboxesQuery.data?.inboxes ?? [];

  // Sync workflow state when query data updates
  useEffect(() => {
    if (inboxesQuery.isSuccess) {
      const initialState = new Map<string, WorkflowSettings>();
      for (const inbox of inboxesQuery.data?.inboxes ?? []) {
        initialState.set(inbox.id, {
          caseReviewManual: inbox.caseReviewManual,
          caseReviewOnCaseCreated: inbox.caseReviewOnCaseCreated,
          caseReviewOnEscalate: inbox.caseReviewOnEscalate,
        });
      }
      setWorkflowState(initialState);
    }
  }, [inboxesQuery.data]);

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

  const handleSave = () => {
    const updates: {
      inboxId: string;
      caseReviewManual: boolean;
      caseReviewOnCaseCreated: boolean;
      caseReviewOnEscalate: boolean;
    }[] = [];

    for (const inbox of inboxes) {
      const currentSettings = workflowState.get(inbox.id);
      if (!currentSettings) continue;

      // Check if settings changed
      const hasChanged =
        currentSettings.caseReviewManual !== inbox.caseReviewManual ||
        currentSettings.caseReviewOnCaseCreated !== inbox.caseReviewOnCaseCreated ||
        currentSettings.caseReviewOnEscalate !== inbox.caseReviewOnEscalate;

      if (hasChanged) {
        updates.push({
          inboxId: inbox.id,
          caseReviewManual: currentSettings.caseReviewManual,
          caseReviewOnCaseCreated: currentSettings.caseReviewOnCaseCreated,
          caseReviewOnEscalate: currentSettings.caseReviewOnEscalate,
        });
      }
    }

    if (updates.length > 0) {
      updateWorkflowMutation.mutate(
        { updates },
        {
          onSuccess: () => {
            toast.success(t('cases:overview.panel.workflow.saved'));
            revalidate();
            panelSharp.actions.close();
          },
          onError: () => {
            toast.error(t('common:errors.unknown'));
          },
        },
      );
    } else {
      panelSharp.actions.close();
    }
  };

  return (
    <Panel.Container size="small">
      <Panel.Content>
        <Panel.Header>{t('cases:overview.panel.workflow.title')}</Panel.Header>
        {match(inboxesQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center py-xl">
              <Spinner className="size-8" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="text-s text-grey-secondary py-sm">{t('cases:overview.config.error_loading')}</div>
          ))
          .with({ isSuccess: true }, () => (
            <div className="flex flex-col gap-md">
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
                    defaultOpen={inboxes.length < 6}
                  />
                );
              })}
            </div>
          ))
          .exhaustive()}
        {readOnly ? null : (
          <Panel.Footer>
            <Panel.FooterButton
              onClick={handleSave}
              isLoading={updateWorkflowMutation.isPending}
              label={t('cases:overview.validate_config')}
            />
          </Panel.Footer>
        )}
      </Panel.Content>
    </Panel.Container>
  );
};
