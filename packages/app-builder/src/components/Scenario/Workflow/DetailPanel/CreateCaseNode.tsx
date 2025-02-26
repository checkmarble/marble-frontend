import { Callout } from '@app-builder/components/Callout';
import { useTranslation } from 'react-i18next';

import { type CreateCaseAction } from '../models/nodes';
import { workflowI18n } from '../workflow-i18n';
import {
  useWorkflowActions,
  useWorkflowData,
  useWorkflowDataFeatureAccess,
} from '../WorkflowProvider';
import { CaseNameEditor } from './CaseNameEditor';
import { SelectInbox } from './SelectInbox';

export function CreateCaseNode({ id, data }: { id: string; data: CreateCaseAction }) {
  const { t } = useTranslation(workflowI18n);
  const { updateNode } = useWorkflowActions();
  const { inboxes } = useWorkflowData();
  const { isCreateInboxAvailable } = useWorkflowDataFeatureAccess();

  return (
    <>
      <Callout>{t('workflows:detail_panel.create_case.description')}</Callout>
      <SelectInbox
        selectedInboxId={data.inboxId ?? undefined}
        onSelectedInboxIdChange={(inboxId) => {
          updateNode(id, { ...data, inboxId });
        }}
        inboxes={inboxes}
        isCreateInboxAvailable={isCreateInboxAvailable}
      />
      <CaseNameEditor
        label={t('workflows:detail_panel.create_case.case_name.label')}
        value={data.caseName}
        onChange={(astNode) => {
          updateNode(id, { ...data, caseName: astNode });
        }}
      />
    </>
  );
}
