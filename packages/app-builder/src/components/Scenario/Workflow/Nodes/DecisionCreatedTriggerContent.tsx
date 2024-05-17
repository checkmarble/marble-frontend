import { Outcome } from '@app-builder/components/Decisions';
import { type Scenario } from '@app-builder/models/scenario';
import { Await } from '@remix-run/react';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { type DecisionCreatedTrigger } from '../models/node-data';
import { workflowI18n } from '../workflow-i18n';
import { useWorkflowData } from '../WorkflowData';

export function DecisionCreatedTriggerContent({
  data,
}: {
  data: DecisionCreatedTrigger;
}) {
  const { t } = useTranslation(workflowI18n);
  const { scenarios } = useWorkflowData();

  return (
    <div className="flex flex-col gap-1">
      <React.Suspense fallback={t('common:loading')}>
        <Await resolve={scenarios}>
          {(scenarios) => (
            <DecisionCreatedTriggerContentImpl
              data={data}
              scenarios={scenarios}
            />
          )}
        </Await>
      </React.Suspense>
    </div>
  );
}

function DecisionCreatedTriggerContentImpl({
  data,
  scenarios,
}: {
  scenarios: Scenario[];
  data: DecisionCreatedTrigger;
}) {
  const { t } = useTranslation(workflowI18n);
  const selectedScenario = React.useMemo(() => {
    if (!data.scenarioId || !scenarios) return undefined;
    return scenarios.find((scenario) => scenario.id === data.scenarioId);
  }, [data.scenarioId, scenarios]);

  if (!selectedScenario || data.outcomes.length === 0) {
    return (
      <p className="max-w-64 whitespace-pre-wrap">
        {t('workflows:trigger_node.decision_created.empty_content')}
      </p>
    );
  }

  return (
    <>
      <p className="max-w-64 whitespace-pre-wrap">
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
          <Outcome key={outcome} outcome={outcome} border="square" size="big" />
        ))}
      </p>
    </>
  );
}
