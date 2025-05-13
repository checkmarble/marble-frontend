import { casesI18n } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { FormTextArea } from '@app-builder/components/Form/Tanstack/FormTextArea';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type FinalOutcome, finalOutcomes } from '@app-builder/models/cases';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({
  caseId: z.string(),
  outcome: z.union(
    finalOutcomes.map((o) => z.literal(o)) as [
      z.ZodLiteral<FinalOutcome>,
      z.ZodLiteral<FinalOutcome>,
      ...z.ZodLiteral<FinalOutcome>[],
    ],
  ),
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

  const { caseId, outcome, comment } = data;

  try {
    const promises = [
      cases.updateCase({
        caseId,
        body: { status: 'closed', outcome },
      }),
    ];

    if (data.comment !== '') {
      promises.push(
        cases.addComment({
          caseId,
          body: { comment },
        }),
      );
    }

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

export const CloseCase = ({ id }: { id: string }) => {
  const { t } = useTranslation(casesI18n);
  const fetcher = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);

  const form = useForm({
    onSubmit: ({ value }) => {
      setOpen(false);
      fetcher.submit(value, {
        method: 'POST',
        action: getRoute('/ressources/cases/close-case'),
        encType: 'application/json',
      });
    },
    defaultValues: { caseId: id, outcome: 'false-positive', comment: '' },
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
          {t('cases:case.close')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('cases:case.close')}</Modal.Title>
        <form onSubmit={handleSubmit(form)} className="flex flex-col gap-8 p-8">
          <form.Field name="outcome">
            {(field) => (
              <div className="flex flex-col gap-2">
                <FormLabel name={field.name}>Choose a status</FormLabel>
                <RadioGroup
                  name={field.name}
                  onValueChange={(v) => field.handleChange(v as FinalOutcome)}
                  onBlur={field.handleBlur}
                  className="flex items-center gap-1"
                >
                  {finalOutcomes.map((s) => {
                    return (
                      <RadioGroupItem
                        key={s}
                        value={s}
                        className="border-grey-90 data-[state=checked]:border-purple-60 flex items-center justify-center rounded-[20px] border bg-transparent p-1.5"
                      >
                        <span
                          className={cn('rounded-[20px] px-2 py-[3px] text-xs', {
                            'bg-red-95 text-red-47': s === 'confirmed_risk',
                            'bg-grey-95 text-grey-50': s === 'false_positive',
                            'bg-yellow-90 text-yellow-50': s === 'valuable_alert',
                          })}
                        >
                          {match(s)
                            .with('confirmed_risk', () => 'Confirmed risk')
                            .with('valuable_alert', () => 'Valuable alert')
                            .with('false_positive', () => 'False positive')
                            .exhaustive()}
                        </span>
                      </RadioGroupItem>
                    );
                  })}
                </RadioGroup>
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
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
              Close
            </Button>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};
