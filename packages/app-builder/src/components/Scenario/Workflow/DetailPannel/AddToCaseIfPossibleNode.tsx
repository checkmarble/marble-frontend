import { Callout } from '@app-builder/components/Callout';
import { Highlight } from '@app-builder/components/Highlight';
import { type Inbox } from '@app-builder/models/inbox';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectWithCombobox } from 'ui-design-system';

import { type AddToCaseIfPossibleAction } from '../models/nodes';
import { workflowI18n } from '../workflow-i18n';
import { useWorkflowActions, useWorkflowData } from '../WorkflowProvider';
import { defaultCaseName } from './shared';

export function AddToCaseIfPossibleNode({
  id,
  data,
}: {
  id: string;
  data: AddToCaseIfPossibleAction;
}) {
  const { t } = useTranslation(workflowI18n);
  const { inboxes } = useWorkflowData();
  const { updateNode } = useWorkflowActions();

  return (
    <>
      <Callout>
        {t('workflows:detail_pannel.add_to_case_if_possible.description')}
      </Callout>
      <SelectScenario
        selectedInboxId={data.inboxId ?? undefined}
        onSelectedInboxIdChange={(inboxId) => {
          updateNode(id, { ...data, inboxId });
        }}
        inboxes={inboxes}
      />
      <p className="flex flex-col gap-2">
        <span className="whitespace-pre-wrap">
          {t(
            'workflows:detail_pannel.add_to_case_if_possible.default_name.helper',
          )}
        </span>
        <span className="text-s border-grey-10 text-grey-50 bg-grey-02 rounded border p-2">
          {defaultCaseName}
        </span>
      </p>
    </>
  );
}

function SelectScenario({
  selectedInboxId,
  onSelectedInboxIdChange,
  inboxes,
}: {
  selectedInboxId?: string;
  onSelectedInboxIdChange: (outcomes: string) => void;
  inboxes: Inbox[];
}) {
  const { t } = useTranslation(workflowI18n);
  const [value, setSearchValue] = React.useState('');
  const searchValue = React.useDeferredValue(value);

  const selectedInbox = React.useMemo(
    () => inboxes.find((inbox) => inbox.id === selectedInboxId),
    [selectedInboxId, inboxes],
  );

  const matches = React.useMemo(
    () => matchSorter(inboxes, searchValue, { keys: ['name'] }),
    [searchValue, inboxes],
  );

  return (
    <SelectWithCombobox.Root
      onSearchValueChange={setSearchValue}
      selectedValue={selectedInboxId}
      onSelectedValueChange={onSelectedInboxIdChange}
    >
      <SelectWithCombobox.Label className="text-grey-100 capitalize">
        {t('workflows:detail_pannel.add_to_case_if_possible.inbox.label')}
      </SelectWithCombobox.Label>
      <SelectWithCombobox.Select>
        {selectedInbox ? (
          <span className="text-grey-100">{selectedInbox.name}</span>
        ) : (
          <span className="text-grey-25">
            {t(
              'workflows:detail_pannel.add_to_case_if_possible.inbox.placeholder',
            )}
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
