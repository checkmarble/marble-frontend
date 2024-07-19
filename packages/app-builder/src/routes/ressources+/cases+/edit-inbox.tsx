import { FormField } from '@app-builder/components/Form/FormField';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type InboxDto } from 'marble-api';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const schema = z.object({
  inboxId: z.string().min(1),
  caseId: z.string(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const inboxes = await inbox.listInboxes();

  return json({ inboxes });
}

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  await cases.updateCase({
    caseId: submission.value.caseId,
    body: { inbox_id: submission.value.inboxId },
  });

  return json(submission.reply());
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
  React.useEffect(() => {
    if (loadFetcher.state === 'idle' && !loadFetcher.data) {
      loadFetcher.load(getRoute('/ressources/cases/create-case'));
    }
  }, [loadFetcher]);
  const inboxes = loadFetcher.data?.inboxes || [defaultInbox];

  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    defaultValue: { inboxId: defaultInbox.id, caseId },
    lastResult: fetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
  });

  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        ref={formRef}
        method="post"
        className="w-full"
        action={getRoute('/ressources/cases/edit-inbox')}
        {...getFormProps(form)}
      >
        <input
          {...getInputProps(fields.caseId, { type: 'hidden' })}
          key={fields.caseId.key}
        />
        <FormField name={fields.inboxId.name}>
          <FormSelect.Default
            className="w-full"
            onOpenChange={(open) => {
              if (open && loadFetcher.state === 'idle' && !loadFetcher.data) {
                loadFetcher.load(getRoute('/ressources/cases/edit-inbox'));
              }
            }}
            onValueChange={() => {
              formRef.current?.requestSubmit();
            }}
            options={inboxes.map((inbox) => inbox.id)}
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
        </FormField>
      </fetcher.Form>
    </FormProvider>
  );
}
