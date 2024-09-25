import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { serverServices } from '@app-builder/services/init.server';
import { submitOnBlur } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
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
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  await cases.updateCase({
    caseId: submission.value.caseId,
    body: { name: submission.value.name },
  });

  return json(submission.reply());
}

export function EditCaseName(defaultValue: z.infer<typeof schema>) {
  const { t } = useTranslation(['cases']);
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    defaultValue,
    lastResult: fetcher.data,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        method="post"
        action={getRoute('/ressources/cases/edit-name')}
        {...getFormProps(form)}
      >
        <input
          {...getInputProps(fields.caseId, { type: 'hidden' })}
          key={fields.caseId.key}
        />
        <FormField name={fields.name.name} className="flex flex-col gap-2">
          <FormLabel className="text-grey-25 text-s first-letter:capitalize">
            {t('cases:case.name')}
          </FormLabel>
          <FormInput type="text" autoComplete="off" onBlur={submitOnBlur} />
        </FormField>
      </fetcher.Form>
    </FormProvider>
  );
}
