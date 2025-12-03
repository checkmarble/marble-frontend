import { PanelContainer, PanelContent, PanelFooter, PanelOverlay, usePanel } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useUpdateInboxEscalationMutation } from '@app-builder/queries/cases/update-inbox-escalation';
import { useCallback, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { type EscalationCondition, EscalationConditionRow } from './EscalationConditionRow';

interface EscalationConditionsPanelContentProps {
  readOnly?: boolean;
}

interface ConditionWithId extends EscalationCondition {
  id: string;
}

export const EscalationConditionsPanelContent = ({ readOnly }: EscalationConditionsPanelContentProps) => {
  const { t } = useTranslation(['cases']);
  const inboxesQuery = useGetInboxesQuery();
  const { closePanel } = usePanel();
  const updateEscalationMutation = useUpdateInboxEscalationMutation();
  const revalidate = useLoaderRevalidator();
  const baseId = useId();

  const [conditions, setConditions] = useState<ConditionWithId[]>([]);
  const [conditionCounter, setConditionCounter] = useState(0);

  const inboxes = inboxesQuery.data?.inboxes ?? [];

  // Sync conditions when query data updates
  useEffect(() => {
    if (inboxesQuery.isSuccess) {
      const existingConditions = inboxesQuery.data.inboxes
        .filter((inbox) => inbox.escalationInboxId)
        .map((inbox, idx) => ({
          id: `existing-${inbox.id}-${idx}`,
          sourceInboxId: inbox.id,
          targetInboxId: inbox.escalationInboxId ?? null,
        }));
      setConditions(existingConditions);
    }
  }, [inboxesQuery.dataUpdatedAt]);

  const handleAddCondition = useCallback(() => {
    setConditionCounter((prev) => prev + 1);
    setConditions((prev) => [
      ...prev,
      { id: `${baseId}-new-${conditionCounter}`, sourceInboxId: '', targetInboxId: null },
    ]);
  }, [baseId, conditionCounter]);

  const handleRemoveCondition = useCallback((id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleUpdateCondition = useCallback(
    (id: string, field: 'sourceInboxId' | 'targetInboxId', value: string | null) => {
      setConditions((prev) => prev.map((cond) => (cond.id === id ? { ...cond, [field]: value } : cond)));
    },
    [],
  );

  const handleSave = () => {
    // Get original conditions to detect changes
    const originalConditions = new Map(
      inboxes.filter((inbox) => inbox.escalationInboxId).map((inbox) => [inbox.id, inbox.escalationInboxId]),
    );

    // Current conditions map
    const currentConditions = new Map(
      conditions.filter((c) => c.sourceInboxId && c.targetInboxId).map((c) => [c.sourceInboxId, c.targetInboxId]),
    );

    const updates: { inboxId: string; escalationInboxId: string | null }[] = [];

    // Find removed escalations (were in original but not in current)
    for (const [sourceId] of originalConditions) {
      if (!currentConditions.has(sourceId)) {
        updates.push({ inboxId: sourceId, escalationInboxId: null });
      }
    }

    // Find added or changed escalations
    for (const [sourceId, targetId] of currentConditions) {
      const originalTarget = originalConditions.get(sourceId);
      if (originalTarget !== targetId) {
        updates.push({ inboxId: sourceId, escalationInboxId: targetId });
      }
    }

    updateEscalationMutation.mutate(
      { updates },
      {
        onSuccess: () => {
          revalidate();
          closePanel();
        },
      },
    );
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
                    {conditions.map((condition) => (
                      <EscalationConditionRow
                        key={condition.id}
                        condition={condition}
                        inboxes={inboxes}
                        usedSourceIds={conditions.filter((c) => c.id !== condition.id).map((c) => c.sourceInboxId)}
                        onUpdate={(field, value) => handleUpdateCondition(condition.id, field, value)}
                        onRemove={() => handleRemoveCondition(condition.id)}
                        disabled={readOnly}
                      />
                    ))}

                    {readOnly ? null : (
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
        {readOnly ? null : (
          <PanelFooter>
            <ButtonV2
              size="default"
              className="w-full justify-center"
              onClick={handleSave}
              disabled={updateEscalationMutation.isPending}
            >
              {updateEscalationMutation.isPending ? (
                <Icon icon="spinner" className="size-4 animate-spin" />
              ) : (
                t('cases:overview.validate_config')
              )}
            </ButtonV2>
          </PanelFooter>
        )}
      </PanelContainer>
    </PanelOverlay>
  );
};
