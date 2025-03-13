import { casesI18n } from '@app-builder/components/Cases';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: [...casesI18n, 'common'] satisfies Namespace,
};

const editSnoozeSchema = z.object({
  caseId: z.string(),
  snoozeUntil: z.string().optional(),
});

type EditSnoozeForm = z.infer<typeof editSnoozeSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;

  const [raw, { cases }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data } = editSnoozeSchema.safeParse(raw);

  if (!success) return { success: 'false' };

  await (data.snoozeUntil !== undefined
    ? cases.snoozeCase({ caseId: data.caseId, snoozeUntil: data.snoozeUntil })
    : cases.unsnoozeCase(data));

  return { success: 'true' };
}

export function EditCaseSnooze({
  caseId,
  snoozeUntil,
}: Pick<EditSnoozeForm, 'caseId'> & { snoozeUntil?: string }) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const form = useForm<EditSnoozeForm>({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'PATCH',
          action: getRoute('/ressources/cases/edit-snooze'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: editSnoozeSchema,
      onBlurAsync: editSnoozeSchema,
      onSubmitAsync: editSnoozeSchema,
    },
    defaultValues: {
      snoozeUntil: snoozeUntil ?? new Date().toISOString(),
      caseId: caseId,
    },
  });

  return (
    <ModalV2.Root>
      <ModalV2.Trigger render={<Button variant="primary" />}>
        <Icon icon="snooze" className="size-5" aria-hidden />
        {t('rules.status.snoozed')}
      </ModalV2.Trigger>
      <ModalV2.Content>
        <ModalV2.Title>{t('cases:change_status_modal.title')}</ModalV2.Title>
        <form
          className="flex flex-col gap-6 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="snoozeUntil">
            {(field) => (
              <div className="flex flex-col gap-2">
                <FormLabel name={field.name}>Snooze Until</FormLabel>
                <Calendar
                  mode="single"
                  hidden={{ before: new Date() }}
                  selected={new Date(field.state.value as string)}
                  onSelect={(d) => d && field.handleChange(d.toISOString())}
                />
                <FormErrorOrDescription errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <div className="flex w-full flex-row gap-2">
            <ModalV2.Close
              render={
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 first-letter:capitalize"
                />
              }
            >
              {t('common:cancel')}
            </ModalV2.Close>

            <Button type="submit" className="flex-1 first-letter:capitalize">
              {t('cases:change_status_modal.change_status')}
            </Button>
          </div>
        </form>
      </ModalV2.Content>
    </ModalV2.Root>
  );
}
