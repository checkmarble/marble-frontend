import { PanelContainer, PanelContent, PanelFooter, PanelOverlay, usePanel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useUpdateInboxEscalationMutation } from '@app-builder/queries/cases/update-inbox-escalation';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { type EscalationCondition, EscalationConditionRow } from './EscalationConditionRow';

interface EscalationConditionsPanelContentProps {
  readOnly?: boolean;
}

export const EscalationConditionsPanelContent = ({ readOnly }: EscalationConditionsPanelContentProps) => {
  const { t } = useTranslation(['cases']);
  const inboxesQuery = useGetInboxesQuery();
  const { closePanel } = usePanel();
  const queryClient = useQueryClient();
  const updateEscalationMutation = useUpdateInboxEscalationMutation();

  const [conditions, setConditions] = useState<EscalationCondition[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const inboxes = inboxesQuery.data?.inboxes ?? [];

  // Sync conditions when query data updates
  useEffect(() => {
    if (inboxesQuery.isSuccess) {
      const existingConditions = inboxesQuery.data.inboxes
        .filter((inbox) => inbox.escalationInboxId)
        .map((inbox) => ({
          sourceInboxId: inbox.id,
          targetInboxId: inbox.escalationInboxId ?? null,
        }));
      setConditions(existingConditions);
    }
  }, [inboxesQuery.dataUpdatedAt]);

  const handleAddCondition = useCallback(() => {
    setConditions((prev) => [...prev, { sourceInboxId: '', targetInboxId: null }]);
  }, []);

  const handleRemoveCondition = useCallback((index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdateCondition = useCallback(
    (index: number, field: 'sourceInboxId' | 'targetInboxId', value: string | null) => {
      setConditions((prev) => prev.map((cond, i) => (i === index ? { ...cond, [field]: value } : cond)));
    },
    [],
  );

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Get original conditions to detect changes
      const originalConditions = new Map(
        inboxes.filter((inbox) => inbox.escalationInboxId).map((inbox) => [inbox.id, inbox.escalationInboxId]),
      );

      // Current conditions map
      const currentConditions = new Map(
        conditions.filter((c) => c.sourceInboxId && c.targetInboxId).map((c) => [c.sourceInboxId, c.targetInboxId]),
      );

      const updates: Promise<unknown>[] = [];

      // Find removed escalations (were in original but not in current)
      for (const [sourceId] of originalConditions) {
        if (!currentConditions.has(sourceId)) {
          updates.push(
            updateEscalationMutation.mutateAsync({
              inboxId: sourceId,
              escalationInboxId: null,
            }),
          );
        }
      }

      // Find added or changed escalations
      for (const [sourceId, targetId] of currentConditions) {
        const originalTarget = originalConditions.get(sourceId);
        if (originalTarget !== targetId) {
          updates.push(
            updateEscalationMutation.mutateAsync({
              inboxId: sourceId,
              escalationInboxId: targetId,
            }),
          );
        }
      }

      await Promise.all(updates);
      await queryClient.invalidateQueries({ queryKey: ['cases', 'inboxes'] });

      toast.success(t('cases:overview.panel.escalation.saved'));
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
        <div className="flex items-center gap-v2-sm pb-4">
          <Icon icon="left-panel-open" className="size-4" />
          <h2 className="text-l font-semibold">{t('cases:overview.panel.escalation.title')}</h2>
        </div>
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
                <div className="border border-grey-border rounded-v2-lg p-v2-md bg-grey-background-light flex flex-col gap-v2-md">
                  <div className="text-s font-medium">{t('cases:overview.panel.escalation.conditions_title')}</div>

                  <div className="flex flex-col gap-v2-md">
                    {conditions.map((condition, index) => (
                      <EscalationConditionRow
                        key={index}
                        condition={condition}
                        inboxes={inboxes}
                        usedSourceIds={conditions.filter((_, i) => i !== index).map((c) => c.sourceInboxId)}
                        onUpdate={(field, value) => handleUpdateCondition(index, field, value)}
                        onRemove={() => handleRemoveCondition(index)}
                        disabled={readOnly}
                      />
                    ))}

                    {!readOnly && (
                      <div>
                        <ButtonV2 variant="primary" appearance="stroked" onClick={handleAddCondition}>
                          {t('cases:overview.panel.escalation.add_condition')}
                        </ButtonV2>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
            .exhaustive()}
        </PanelContent>
        {!readOnly && (
          <PanelFooter>
            <ButtonV2 size="default" className="w-full justify-center" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Spinner className="size-4" /> : t('cases:overview.validate_config')}
            </ButtonV2>
          </PanelFooter>
        )}
      </PanelContainer>
    </PanelOverlay>
  );
};
