import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { conform, useForm } from '@conform-to/react';
import { parse } from '@conform-to/zod';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type InboxDto } from 'marble-api';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const schema = z.object({
  inboxId: z.string().min(1),
  caseId: z.string(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const inboxes = await apiClient.listInboxes({ withCaseCount: false });

  return json(inboxes);
}

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }
  await cases.updateCase({
    caseId: submission.value.caseId,
    body: { inbox_id: submission.value.inboxId },
  });

  return json(submission);
}

export function EditCaseInbox({
  defaultInbox,
  caseId,
}: {
  defaultInbox: InboxDto;
  caseId: string;
}) {
  const { t } = useTranslation(['common']);
  const loadFetcher = useFetcher<typeof loader>();
  const inboxes = loadFetcher.data?.inboxes || [defaultInbox];

  const fetcher = useFetcher<typeof action>();

  const formId = useId();
  const [form, fields] = useForm({
    id: formId,
    defaultValue: { inboxId: defaultInbox.id, caseId },
    lastSubmission: fetcher.data,
    onValidate({ formData }) {
      return parse(formData, {
        schema,
      });
    },
  });

  return (
    <fetcher.Form
      method="post"
      className="w-full"
      action={getRoute('/ressources/cases/edit-inbox')}
      {...form.props}
    >
      <input {...conform.input(fields.caseId, { type: 'hidden' })} />
      <FormSelect.Default
        config={fields.inboxId}
        className="w-full"
        onOpenChange={(open) => {
          if (open && loadFetcher.state === 'idle' && !loadFetcher.data) {
            loadFetcher.load(getRoute('/ressources/cases/edit-inbox'));
          }
        }}
        onValueChange={() => {
          form.ref.current?.requestSubmit();
        }}
      >
        {inboxes.map((inbox) => (
          <FormSelect.DefaultItem key={inbox.id} value={inbox.id}>
            {inbox.name}
          </FormSelect.DefaultItem>
        ))}
        {loadFetcher.state === 'loading' ? (
          <div className="text-grey-100 h-10 p-2 first-letter:capitalize">
            {t('common:loading')}
          </div>
        ) : null}
      </FormSelect.Default>
    </fetcher.Form>
  );
}
