import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { pivotValuesDocHref } from '@app-builder/services/documentation-href';
import { Trans, useTranslation } from 'react-i18next';

import { type AddToCaseIfPossibleAction } from '../models/nodes';
import {
  useWorkflowActions,
  useWorkflowData,
  useWorkflowDataFeatureAccess,
} from '../WorkflowProvider';
import { workflowI18n } from '../workflow-i18n';
import { CaseNameEditor } from './CaseNameEditor';
import { SelectInbox } from './SelectInbox';

export function AddToCaseIfPossibleNode({
  id,
  data,
}: {
  id: string;
  data: AddToCaseIfPossibleAction;
}) {
  const { t } = useTranslation(workflowI18n);
  const { inboxes, hasPivotValue } = useWorkflowData();
  const { isCreateInboxAvailable } = useWorkflowDataFeatureAccess();
  const { updateNode } = useWorkflowActions();

  if (!hasPivotValue) {
    return (
      <>
        <Callout>{t('workflows:detail_panel.add_to_case_if_possible.description')}</Callout>

        <Callout color="red">
          <span className="whitespace-pre-wrap">
            <Trans
              t={t}
              i18nKey="workflows:detail_panel.add_to_case_if_possible.no_pivot"
              components={{
                DocLink: <ExternalLink href={pivotValuesDocHref} />,
              }}
            />
          </span>
        </Callout>
      </>
    );
  }

  return (
    <>
      <Callout>{t('workflows:detail_panel.add_to_case_if_possible.description')}</Callout>
      <SelectInbox
        selectedInboxId={data.inboxId ?? undefined}
        onSelectedInboxIdChange={(inboxId) => {
          updateNode(id, { ...data, inboxId });
        }}
        inboxes={inboxes}
        isCreateInboxAvailable={isCreateInboxAvailable}
      />

      <CaseNameEditor
        label={t('workflows:detail_panel.add_to_case_if_possible.case_name.label')}
        value={data.caseName}
        onChange={(astNode) => {
          updateNode(id, { ...data, caseName: astNode });
        }}
      />
    </>
  );
}
