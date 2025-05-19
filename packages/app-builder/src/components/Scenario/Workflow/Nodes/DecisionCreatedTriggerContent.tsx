import { OutcomeBadge } from '@app-builder/components/Decisions';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { type DecisionCreatedTrigger } from '../models/nodes';
import { workflowI18n } from '../workflow-i18n';
import { useWorkflowData } from '../WorkflowProvider';

export function DecisionCreatedTriggerContent({ data }: { data: DecisionCreatedTrigger }) {
  const { t } = useTranslation(workflowI18n);
  const { scenarios } = useWorkflowData();
  const selectedScenario = React.useMemo(() => {
    if (!data.scenarioId || !scenarios) return undefined;
    return scenarios.find((scenario) => scenario.id === data.scenarioId);
  }, [data.scenarioId, scenarios]);

  if (!selectedScenario || data.outcomes.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <p className="whitespace-pre-wrap">
          {t('workflows:trigger_node.decision_created.empty_content')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="whitespace-pre-wrap">
        <Trans
          t={t}
          i18nKey="workflows:trigger_node.decision_created.content"
          components={{
            Scenario: <span className="font-bold" />,
          }}
          values={{ scenarioName: selectedScenario.name }}
        />
      </p>
      <p className="inline-flex flex-row gap-1">
        {data.outcomes.map((outcome) => (
          <OutcomeBadge key={outcome} outcome={outcome} size="md" />
        ))}
      </p>
    </div>
  );
}
