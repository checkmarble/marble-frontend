import { CalloutV2 } from '@app-builder/components';
import { casesI18n } from '@app-builder/components/Cases';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, ModalV2, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: [...casesI18n, 'common'] satisfies Namespace,
};

const editSnoozeSchema = z.object({
  caseId: z.string(),
  snoozeUntil: z.string().nullable(),
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

  await (data.snoozeUntil
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
  const [isSnoozing, shouldSnooze] = useState(true);

  const form = useForm<EditSnoozeForm>({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        const finalValue = {
          ...value,
          snoozeUntil: isSnoozing ? value.snoozeUntil : null,
        };

        fetcher.submit(finalValue, {
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
        {t('cases:snooze.title')}
      </ModalV2.Trigger>
      <ModalV2.Content>
        <ModalV2.Title>{t('cases:snooze.modal.heading')}</ModalV2.Title>
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
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-s font-semibold">{t('cases:unsnooze.title')}</span>
                  <Switch onCheckedChange={shouldSnooze} checked={isSnoozing} />
                  <span className="text-s font-semibold">{t('cases:snooze.title')}</span>
                </div>
                {isSnoozing ? (
                  <Calendar
                    className="border-grey-90 w-fit rounded border p-2 shadow"
                    mode="single"
                    selected={new Date(field.state.value as string)}
                    disabled={!isSnoozing}
                    hidden={{ before: new Date() }}
                    autoFocus
                    onSelect={(d) => d && field.handleChange(d.toISOString())}
                  />
                ) : (
                  <CalloutV2>{t('cases:unsnooze.callout')}</CalloutV2>
                )}
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

            <ModalV2.Close
              render={<Button type="submit" className="flex-1 first-letter:capitalize" />}
            >
              {t('cases:snooze.confirm')}
            </ModalV2.Close>
          </div>
        </form>
      </ModalV2.Content>
    </ModalV2.Root>
  );
}
