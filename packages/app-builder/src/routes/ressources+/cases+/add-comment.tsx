import { casesI18n } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({
  caseId: z.string().nonempty(),
  comment: z.string().nonempty(),
  files: z.array(z.instanceof(File)),
});

type CaseCommentForm = z.infer<typeof schema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

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
    return { status: 'error', errors: error.flatten() };
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

export function AddComment({ caseId }: { caseId: string }) {
  const { t } = useTranslation(casesI18n);
  const fetcher = useFetcher<typeof action>();

  const form = useForm({
    defaultValues: { caseId, comment: '', files: [] } as CaseCommentForm,
    onSubmit: ({ value }) => {
      fetcher.submit(value, {
        method: 'POST',
        action: getRoute('/ressources/cases/add-comment'),
        encType: 'multipart/form-data',
      });
    },
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(form)}
      className="border-grey-90 flex grow items-end gap-4 border-t p-4"
    >
      <form.Field name="comment">
        {(field) => (
          <div className="flex grow flex-col items-start gap-2.5">
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onBlur={field.handleBlur}
              name={field.name}
              className="form-textarea text-s w-full resize-none border-none bg-transparent outline-none"
              placeholder={t('cases:case_detail.add_a_comment.placeholder')}
            />
            <Button type="button" variant="secondary" size="icon">
              <Icon icon="attachment" className="text-grey-50 size-5" />
            </Button>
          </div>
        )}
      </form.Field>
      <Button
        type="submit"
        variant="primary"
        size="medium"
        aria-label={t('cases:case_detail.add_a_comment.post')}
      >
        <Icon icon="send" className="size-5" />
      </Button>
    </form>
  );
}
