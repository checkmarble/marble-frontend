import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useId } from 'react';
import { Input } from 'ui-design-system';
import { z } from 'zod';

const schema = z.object({
  caseId: z.string(),
  name: z.string({ required_error: 'required' }),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  await cases.updateCase({
    caseId: submission.value.caseId,
    body: { name: submission.value.name },
  });

  return json(submission);
}

export function EditCaseName(defaultValue: z.infer<typeof schema>) {
  const fetcher = useFetcher<typeof action>();

  const formId = useId();
  const [form, { name, caseId }] = useForm({
    id: formId,
    defaultValue,
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(schema),
    onValidate({ formData }) {
      return parse(formData, {
        schema,
      });
    },
  });

  return (
    <fetcher.Form
      method="post"
      action={getRoute('/ressources/cases/edit-name')}
      {...form.props}
    >
      <input {...conform.input(caseId, { type: 'hidden' })} />
      <Input
        {...conform.input(name, { type: 'text' })}
        onBlur={(e) => {
          if (e.currentTarget.value !== e.currentTarget.defaultValue) {
            e.currentTarget.form?.requestSubmit();
          }
        }}
      />
    </fetcher.Form>
  );
}
