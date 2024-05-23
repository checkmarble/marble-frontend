import { Callout } from '@app-builder/components/Callout';
import { useTranslation } from 'react-i18next';

import { type CreateCaseAction } from '../models/nodes';
import { workflowI18n } from '../workflow-i18n';
import { useWorkflowActions, useWorkflowData } from '../WorkflowProvider';
import { SelectInbox } from './SelectInbox';
import { defaultCaseName } from './shared';

export function CreateCaseNode({
  id,
  data,
}: {
  id: string;
  data: CreateCaseAction;
}) {
  const { t } = useTranslation(workflowI18n);
  const { updateNode } = useWorkflowActions();
  const { inboxes } = useWorkflowData();

  return (
    <>
      <Callout>{t('workflows:detail_panel.create_case.description')}</Callout>
      <SelectInbox
        selectedInboxId={data.inboxId ?? undefined}
        onSelectedInboxIdChange={(inboxId) => {
          updateNode(id, { ...data, inboxId });
        }}
        inboxes={inboxes}
      />
      <p className="flex flex-col gap-2">
        <span className="whitespace-pre-wrap">
          {t('workflows:detail_panel.create_case.default_name.helper')}
        </span>
        <span className="text-s border-grey-10 text-grey-50 bg-grey-02 rounded border p-2">
          {defaultCaseName}
        </span>
      </p>
    </>
  );
}
