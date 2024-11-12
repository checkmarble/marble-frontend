import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { type Inbox } from '@app-builder/models/inbox';
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
    body: submission.value,
  });

  return json(submission.reply());
}

export function EditCaseInbox({
  defaultInbox,
  caseId,
}: {
  defaultInbox: Inbox;
  caseId: string;
}) {
  const { t } = useTranslation(['common', 'cases']);
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
        className="col-span-2 grid grid-cols-subgrid"
        action={getRoute('/ressources/cases/edit-inbox')}
        {...getFormProps(form)}
      >
        <input
          {...getInputProps(fields.caseId, { type: 'hidden' })}
          key={fields.caseId.key}
        />
        <FormField
          name={fields.inboxId.name}
          className="col-span-2 grid grid-cols-subgrid items-center"
        >
          <FormLabel className="text-s font-semibold first-letter:capitalize">
            {t('cases:case.inbox')}
          </FormLabel>
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
