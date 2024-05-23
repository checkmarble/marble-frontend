import { Callout } from '@app-builder/components/Callout';
import { Outcome, useOutcomes } from '@app-builder/components/Decisions';
import { Highlight } from '@app-builder/components/Highlight';
import { type Scenario } from '@app-builder/models/scenario';
import { type Outcome as OutcomeT } from 'marble-api';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { type DecisionCreatedTrigger } from '../models/nodes';
import { workflowI18n } from '../workflow-i18n';
import { useWorkflowActions, useWorkflowData } from '../WorkflowProvider';

export function DecisionCreatedNode({
  id,
  data,
}: {
  id: string;
  data: DecisionCreatedTrigger;
}) {
  const { t } = useTranslation(workflowI18n);
  const { scenarios } = useWorkflowData();
  const { updateNode } = useWorkflowActions();

  return (
    <>
      <Callout>
        {t('workflows:detail_pannel.decision_created.description')}
      </Callout>
      <SelectScenario
        selectedScenarioId={data.scenarioId ?? undefined}
        onSelectedScenarioIdChange={(scenarioId) => {
          updateNode(id, { ...data, scenarioId });
        }}
        scenarios={scenarios}
      />
      <SelectOutcomes
        selectedOutcomes={data.outcomes}
        onSelectedOutcomesChange={(outcomes) => {
          updateNode(id, { ...data, outcomes });
        }}
      />
    </>
  );
}

function SelectScenario({
  selectedScenarioId,
  onSelectedScenarioIdChange,
  scenarios,
}: {
  selectedScenarioId?: string;
  onSelectedScenarioIdChange: (outcomes: string) => void;
  scenarios: Scenario[];
}) {
  const { t } = useTranslation(workflowI18n);
  const [value, setSearchValue] = React.useState('');
  const searchValue = React.useDeferredValue(value);

  const selectedScenario = React.useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenarioId),
    [selectedScenarioId, scenarios],
  );

  const matches = React.useMemo(
    () => matchSorter(scenarios, searchValue, { keys: ['name'] }),
    [searchValue, scenarios],
  );

  return (
    <SelectWithCombobox.Root
      onSearchValueChange={setSearchValue}
      selectedValue={selectedScenarioId}
      onSelectedValueChange={onSelectedScenarioIdChange}
    >
      <SelectWithCombobox.Label className="text-grey-100 capitalize">
        {t('workflows:detail_pannel.decision_created.scenario.label')}
      </SelectWithCombobox.Label>
      <SelectWithCombobox.Select>
        {selectedScenario ? (
          <span className="text-grey-100">{selectedScenario.name}</span>
        ) : (
          <span className="text-grey-25">
            {t('workflows:detail_pannel.decision_created.scenario.placeholder')}
          </span>
        )}
        <SelectWithCombobox.Arrow />
      </SelectWithCombobox.Select>
      <SelectWithCombobox.Popover
        className="flex flex-col gap-2 p-2"
        fitViewport
      >
        <SelectWithCombobox.Combobox render={<Input />} />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((scenario) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={scenario.id}
                value={scenario.id}
              >
                <Highlight text={scenario.name} query={searchValue} />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Popover>
    </SelectWithCombobox.Root>
  );
}

function SelectOutcomes({
  selectedOutcomes,
  onSelectedOutcomesChange,
}: {
  selectedOutcomes: OutcomeT[];
  onSelectedOutcomesChange: (outcomes: OutcomeT[]) => void;
}) {
  const { t } = useTranslation(workflowI18n);
  const [value, setSearchValue] = React.useState('');
  const deferredValue = React.useDeferredValue(value);
  const outcomes = useOutcomes();

  const matches = React.useMemo(
    () => matchSorter(outcomes, deferredValue, { keys: ['label'] }),
    [deferredValue, outcomes],
  );

  return (
    <SelectWithCombobox.Root
      onSearchValueChange={setSearchValue}
      selectedValue={selectedOutcomes}
      onSelectedValueChange={onSelectedOutcomesChange}
    >
      <SelectWithCombobox.Label className="text-grey-100 capitalize">
        {t('workflows:detail_pannel.decision_created.outcomes.label')}
      </SelectWithCombobox.Label>
      <SelectWithCombobox.Select>
        {selectedOutcomes.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedOutcomes.map((outcome) => (
              <Outcome
                key={outcome}
                outcome={outcome}
                border="square"
                size="big"
              />
            ))}
          </div>
        ) : (
          <span className="text-grey-25">
            {t('workflows:detail_pannel.decision_created.outcomes.placeholder')}
          </span>
        )}
        <SelectWithCombobox.Arrow />
      </SelectWithCombobox.Select>
      <SelectWithCombobox.Popover
        className="flex flex-col gap-2 p-2"
        fitViewport
      >
        <SelectWithCombobox.Combobox render={<Input />} />
        <SelectWithCombobox.ComboboxList className="max-h-40">
          {matches.map((outcome) => {
            return (
              <SelectWithCombobox.ComboboxItem
                key={outcome.value}
                value={outcome.value}
              >
                <Outcome
                  outcome={outcome.value}
                  border="square"
                  size="big"
                  className="w-full"
                />
              </SelectWithCombobox.ComboboxItem>
            );
          })}
        </SelectWithCombobox.ComboboxList>
      </SelectWithCombobox.Popover>
    </SelectWithCombobox.Root>
  );
}
