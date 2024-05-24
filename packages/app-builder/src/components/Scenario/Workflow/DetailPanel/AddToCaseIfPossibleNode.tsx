import { Callout } from '@app-builder/components/Callout';
import { PivotDocLink } from '@app-builder/components/Data/SelectedPivot';
import { Trans, useTranslation } from 'react-i18next';

import { type AddToCaseIfPossibleAction } from '../models/nodes';
import { workflowI18n } from '../workflow-i18n';
import { useWorkflowActions, useWorkflowData } from '../WorkflowProvider';
import { SelectInbox } from './SelectInbox';
import { defaultCaseName } from './shared';

export function AddToCaseIfPossibleNode({
  id,
  data,
}: {
  id: string;
  data: AddToCaseIfPossibleAction;
}) {
  const { t } = useTranslation(workflowI18n);
  const { inboxes, hasPivotValue } = useWorkflowData();
  const { updateNode } = useWorkflowActions();

  if (!hasPivotValue) {
    return (
      <>
        <Callout>
          {t('workflows:detail_panel.add_to_case_if_possible.description')}
        </Callout>

        <Callout color="red">
          <span className="whitespace-pre-wrap">
            <Trans
              t={t}
              i18nKey="workflows:detail_panel.add_to_case_if_possible.no_pivot"
              components={{
                DocLink: PivotDocLink,
              }}
            />
          </span>
        </Callout>
      </>
    );
  }

  return (
    <>
      <Callout>
        {t('workflows:detail_panel.add_to_case_if_possible.description')}
      </Callout>
      <SelectInbox
        selectedInboxId={data.inboxId ?? undefined}
        onSelectedInboxIdChange={(inboxId) => {
          updateNode(id, { ...data, inboxId });
        }}
        inboxes={inboxes}
      />
      <p className="flex flex-col gap-2">
        <span className="whitespace-pre-wrap">
          {t(
            'workflows:detail_panel.add_to_case_if_possible.default_name.helper',
          )}
        </span>
        <span className="text-s border-grey-10 text-grey-50 bg-grey-02 rounded border p-2">
          {defaultCaseName}
        </span>
      </p>
    </>
  );
}
