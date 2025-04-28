import { Callout, casesI18n } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/Tanstack/FormTextArea';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({
  caseId: z.string(),
  comment: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { cases }] = await Promise.all([
    getFixedT(request, ['common', 'cases']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = schema.safeParse(rawData);

  if (!success) return Response.json({ sucess: false, errors: error.flatten() });

  try {
    const promises = [];

    if (data.comment !== '') {
      promises.push(
        cases.addComment({
          caseId: data.caseId,
          body: { comment: data.comment },
        }),
      );
    }

    promises.push(
      cases.updateCase({
        caseId: data.caseId,
        body: { status: 'investigating', outcome: 'unset' },
      }),
    );

    await Promise.allSettled(promises);

    return Response.json({ success: true, errors: [] });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export const OpenCase = ({ id }: { id: string }) => {
  const { t } = useTranslation(casesI18n);
  const fetcher = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);

  const form = useForm({
    onSubmit: ({ value }) => {
      setOpen(false);
      fetcher.submit(value, {
        method: 'POST',
        action: getRoute('/ressources/cases/open-case'),
        encType: 'application/json',
      });
    },
    defaultValues: { caseId: id, comment: '' },
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button variant="primary" size="medium" className="flex-1 first-letter:capitalize">
          <Icon icon="save" className="size-5" />
          Re-Open case
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>Re-Open case</Modal.Title>
        <form onSubmit={handleSubmit(form)} className="flex flex-col gap-8 p-8">
          <Callout>Are you sure you want to re-open the case ?</Callout>
          <form.Field name="comment">
            {(field) => (
              <div className="flex flex-col gap-2">
                <FormLabel name={field.name}>Add a comment</FormLabel>
                <FormTextArea
                  name={field.name}
                  defaultValue={field.state.value}
                  placeholder="Input your comment here"
                  valid={field.state.meta.errors.length === 0}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <div className="flex w-full flex-row gap-2">
            <Modal.Close asChild>
              <Button variant="secondary" type="button" className="flex-1 first-letter:capitalize">
                {t('common:cancel')}
              </Button>
            </Modal.Close>

            <Button type="submit" className="flex-1 first-letter:capitalize">
              Re-Open
            </Button>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};
