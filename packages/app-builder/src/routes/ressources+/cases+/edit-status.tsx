import {
  casesI18n,
  CaseStatus,
  caseStatusMapping,
  useCaseStatuses,
} from '@app-builder/components/Cases';
import { caseStatuses } from '@app-builder/models/cases';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal } from 'ui-design-system';
import { z } from 'zod';

export const handle = {
  i18n: [...casesI18n, 'common'] satisfies Namespace,
};

const schema = z.object({
  caseId: z.string(),
  status: z.enum(caseStatuses),
});

type Schema = z.infer<typeof schema>;

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { cases }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data, error } = schema.safeParse(raw);

  if (!success) return { success: false, errors: error.flatten() };

  await cases.updateCase({ caseId: data.caseId, body: { status: data.status } });

  return { success: true };
}

export function EditCaseStatus({
  status: initialStatus,
  caseId,
}: Pick<Schema, 'caseId' | 'status'>) {
  const { t } = useTranslation(handle.i18n);
  const { submit } = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);
  const [validate, shouldValidate] = useState({ status: initialStatus, require: false });
  const statuses = useCaseStatuses();

  const form = useForm({
    onSubmit: ({ value }) =>
      submit(value, {
        method: 'PATCH',
        action: getRoute('/ressources/cases/edit-status'),
        encType: 'application/json',
      }),
    defaultValues: {
      caseId,
      status: initialStatus,
    },
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  return (
    <form.Field name="status">
      {(field) => (
        <>
          <MenuCommand.Menu open={open} onOpenChange={setOpen}>
            <MenuCommand.Trigger>
              <Button className="w-fit" size="icon" variant="ghost">
                <div
                  className={clsx('size-5 rounded-full', {
                    'bg-red-47': caseStatusMapping[field.state.value].color === 'red',
                    'bg-blue-58': caseStatusMapping[field.state.value].color === 'blue',
                    'bg-grey-50': caseStatusMapping[field.state.value].color === 'grey',
                    'bg-green-38': caseStatusMapping[field.state.value].color === 'green',
                  })}
                />
                <span className="text-xs font-medium capitalize">
                  {t(caseStatusMapping[field.state.value].tKey)}
                </span>
                <MenuCommand.Arrow />
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content sameWidth className="mt-2" side="bottom">
              <MenuCommand.List>
                {statuses.map(({ value }) => (
                  <MenuCommand.Item
                    key={value}
                    value={value}
                    disabled={initialStatus === value}
                    onSelect={() => {
                      if (['open', 'investigating'].includes(value)) {
                        field.handleChange(value);
                        form.handleSubmit();
                        return;
                      }

                      shouldValidate({ status: value, require: true });
                    }}
                  >
                    <CaseStatus type="full" size="big" status={value} />
                  </MenuCommand.Item>
                ))}
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>

          <Modal.Root open={validate.require}>
            <Modal.Content>
              <Modal.Title>{t('cases:change_status_modal.title')}</Modal.Title>
              <div className="flex flex-col gap-6 p-6">
                <div className="text-grey-00 text-s flex flex-row items-center justify-center gap-6 font-medium capitalize">
                  <div className="flex w-full flex-1 flex-row items-center justify-end gap-2">
                    <Trans
                      t={t}
                      i18nKey="cases:change_status_modal.description.from"
                      components={{
                        Status: <CaseStatus type="full" size="big" status={initialStatus} />,
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-row items-center justify-start gap-2">
                    <Trans
                      t={t}
                      i18nKey="cases:change_status_modal.description.to"
                      components={{
                        Status: <CaseStatus type="full" size="big" status={validate.status} />,
                      }}
                    />
                  </div>
                </div>
                <div className="flex w-full flex-row gap-2">
                  <Button
                    variant="secondary"
                    type="button"
                    className="flex-1 first-letter:capitalize"
                    onClick={() => shouldValidate({ status: initialStatus, require: false })}
                  >
                    {t('common:close')}
                  </Button>

                  <Button
                    className="flex-1 first-letter:capitalize"
                    onClick={() => {
                      field.handleChange(validate.status);
                      form.handleSubmit();
                      shouldValidate((prev) => ({ ...prev, require: false }));
                    }}
                  >
                    {t('cases:change_status_modal.change_status')}
                  </Button>
                </div>
              </div>
            </Modal.Content>
          </Modal.Root>
        </>
      )}
    </form.Field>
  );
}
