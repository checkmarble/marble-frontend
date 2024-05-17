import { type Inbox } from '@app-builder/models/inbox';
import { Await } from '@remix-run/react';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { type CreateCaseAction } from '../models/node-data';
import { workflowI18n } from '../workflow-i18n';
import { useWorkflowData } from '../WorkflowData';

export function CreateCaseActionContent({ data }: { data: CreateCaseAction }) {
  const { t } = useTranslation(workflowI18n);
  const { inboxes } = useWorkflowData();

  return (
    <div className="flex flex-col gap-1">
      <React.Suspense fallback={t('common:loading')}>
        <Await resolve={inboxes}>
          {(inboxes) => (
            <CreateCaseActionContentImpl data={data} inboxes={inboxes} />
          )}
        </Await>
      </React.Suspense>
    </div>
  );
}

function CreateCaseActionContentImpl({
  data,
  inboxes,
}: {
  inboxes: Inbox[];
  data: CreateCaseAction;
}) {
  const { t } = useTranslation(workflowI18n);
  const selectedInbox = React.useMemo(() => {
    if (!data.inboxId || !inboxes) return undefined;
    return inboxes.find((inbox) => inbox.id === data.inboxId);
  }, [data.inboxId, inboxes]);

  if (!selectedInbox) {
    return (
      <p className="max-w-64 whitespace-pre-wrap">
        {t('workflows:action_node.create_case.empty_content')}
      </p>
    );
  }

  return (
    <p className="max-w-64 whitespace-pre-wrap">
      <Trans
        t={t}
        i18nKey="workflows:action_node.create_case.content"
        components={{
          Inbox: <span className="font-bold" />,
        }}
        values={{ inbox: selectedInbox.name }}
      />
    </p>
  );
}
