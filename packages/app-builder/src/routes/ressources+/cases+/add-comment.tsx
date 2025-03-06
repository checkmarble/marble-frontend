import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({
  caseId: z.string(),
  comment: z.string({ required_error: 'required' }),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const [t, session, rawData, { cases }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = schema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await cases.addComment({
      caseId: data.caseId,
      body: { comment: data.comment },
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: t('common:success.save'),
    });

    return json(
      { status: 'success', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function AddComment(defaultValue: Pick<z.infer<typeof schema>, 'caseId'>) {
  const { t } = useTranslation(['cases', 'common']);
  const fetcher = useFetcher<typeof action>();

  const form = useForm({
    defaultValues: { ...defaultValue, comment: '' },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/cases/add-comment'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: schema,
      onBlurAsync: schema,
      onSubmitAsync: schema,
    },
  });

  return (
    <form
      className="flex w-full flex-row items-center gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="comment">
        {(field) => (
          <div className="w-full">
            <FormLabel name={field.name} className="sr-only">
              {t('cases:case_detail.add_a_comment.label')}
            </FormLabel>
            <TextArea
              className="w-full"
              defaultValue={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onBlur={field.handleBlur}
              name={field.name}
              borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
              placeholder={t('cases:case_detail.add_a_comment.placeholder')}
            />
          </div>
        )}
      </form.Field>
      <Button type="submit" className="h-14" aria-label={t('cases:case_detail.add_a_comment.post')}>
        <Icon icon="send" className="size-4 shrink-0" />
      </Button>
    </form>
  );
}
