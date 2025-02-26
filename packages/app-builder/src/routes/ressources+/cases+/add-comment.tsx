import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/FormTextArea';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { FormProvider, getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({
  caseId: z.string(),
  comment: z.string({ required_error: 'required' }),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const session = await getSession(request);

  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await cases.addComment({
      caseId: submission.value.caseId,
      body: { comment: submission.value.comment },
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(submission.reply({ resetForm: true }), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(submission, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function AddComment(defaultValue: Pick<z.infer<typeof schema>, 'caseId'>) {
  const { t } = useTranslation(['cases', 'common']);
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    defaultValue: { ...defaultValue, comment: '' },
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
        className="flex w-full flex-row items-center gap-4"
        method="post"
        action={getRoute('/ressources/cases/add-comment')}
        {...getFormProps(form)}
      >
        <input {...getInputProps(fields.caseId, { type: 'hidden' })} key={fields.caseId.key} />
        <FormField name={fields.comment.name} className="w-full">
          <FormLabel className="sr-only">{t('cases:case_detail.add_a_comment.label')}</FormLabel>
          <FormTextArea
            className="w-full"
            placeholder={t('cases:case_detail.add_a_comment.placeholder')}
          />
        </FormField>
        <Button
          type="submit"
          className="h-14"
          aria-label={t('cases:case_detail.add_a_comment.post')}
        >
          <Icon icon="send" className="size-4 shrink-0" />
        </Button>
      </fetcher.Form>
    </FormProvider>
  );
}
