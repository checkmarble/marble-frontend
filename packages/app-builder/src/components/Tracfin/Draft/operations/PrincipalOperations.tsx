import { TRACFIN_MAX_PRINCIPAL_OPERATIONS } from '@app-builder/models/tracfin';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { TracfinFieldRenderersContext } from '../fields/registry';
import { DecisionPicker } from './DecisionPicker';
import { OperationLineCard } from './OperationLineCard';
import { operationFieldRenderers } from './operation-renderers';
import { operationCapacity, principalOperations } from './operations-model';
import type { AddOperationsPlan } from './plan-add-operations';
import { useDecisionListing } from './useDecisionListing';

/**
 * The principal operations: one line per decision picked from the case, each editable, removable.
 * The 31st line is refused before any request. Existing lines are never truncated.
 */
export function PrincipalOperations() {
  const { t } = useTranslation(['tracfin']);
  const { draft, caseId } = useTracfinDraftEditorContext();
  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState<AddOperationsPlan['added'] | null>(null);

  const lines = principalOperations(draft.document.root);
  const capacity = operationCapacity(draft.document.root);
  const listing = useDecisionListing(
    caseId,
    lines.some((line) => line.selection?.decision_id),
  );
  const unlinkedTypes = [
    ...new Set((added ?? []).filter((entry) => !entry.linked).map((entry) => entry.historicalType)),
  ];

  return (
    <section
      aria-label={t('tracfin:draft.operations.principal.title')}
      className="border-grey-border flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <header className="flex flex-wrap items-center gap-xs">
        <h3 className="text-default font-semibold">{t('tracfin:draft.operations.principal.title')}</h3>
        <span className="text-grey-secondary text-xs">
          {t('tracfin:draft.occurrences', { count: lines.length, max: TRACFIN_MAX_PRINCIPAL_OPERATIONS })}
        </span>
      </header>
      <p className="text-grey-secondary text-xs">{t('tracfin:draft.operations.principal.help')}</p>

      {capacity.overMaximum ? (
        <p role="note" className="text-s text-orange-primary">
          {t('tracfin:draft.operations.principal.over_maximum', { count: capacity.count, max: capacity.max })}
        </p>
      ) : null}

      {lines.length === 0 ? (
        <p className="text-grey-secondary text-s">{t('tracfin:draft.operations.principal.empty')}</p>
      ) : (
        <TracfinFieldRenderersContext.Provider value={operationFieldRenderers}>
          <div className="flex flex-col gap-md">
            {lines.map((line, position) => (
              <OperationLineCard
                key={line.id}
                line={line}
                index={position + 1}
                lines={lines}
                decision={line.selection?.decision_id ? listing.byId.get(line.selection.decision_id) : undefined}
                listingLoaded={!listing.isLoading && !listing.hasMore && !listing.isError}
              />
            ))}
          </div>
        </TracfinFieldRenderersContext.Provider>
      )}

      {added && added.length > 0 ? (
        <div role="status" className="text-s flex flex-col gap-2xs">
          <p>{t('tracfin:draft.operations.principal.added', { count: added.length })}</p>
          {unlinkedTypes.length > 0 ? (
            <p className="text-orange-primary">
              {t('tracfin:draft.operations.principal.added_unlinked', { types: unlinkedTypes.join(', ') })}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-sm">
        <Button variant="secondary" appearance="stroked" size="small" onClick={() => setPicking(true)}>
          <Icon icon="plus" className="size-4" />
          {t('tracfin:draft.operations.principal.add_from_decisions')}
        </Button>
        {capacity.remaining === 0 ? (
          <p className="text-grey-secondary text-xs">
            {t('tracfin:draft.operations.principal.at_maximum', { max: capacity.max })}
          </p>
        ) : null}
      </div>

      {picking ? <DecisionPicker open onOpenChange={setPicking} onAdded={(plan) => setAdded(plan.added)} /> : null}
    </section>
  );
}
