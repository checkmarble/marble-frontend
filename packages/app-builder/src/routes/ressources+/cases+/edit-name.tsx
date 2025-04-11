import { casesI18n } from '@app-builder/components/Cases/cases-i18n';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({ name: z.string(), caseId: z.string() });

type EditNameForm = z.infer<typeof schema>;

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

  await cases.updateCase({
    caseId: data.caseId,
    body: { name: data.name },
  });

  return { success: true, errors: [] };
}

export const EditCaseName = ({ name, id }: { name: string; id: string }) => {
  const { t } = useTranslation(casesI18n);
  const { submit } = useFetcher<typeof action>();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    onSubmit: ({ value }) => {
      submit(value, {
        method: 'PATCH',
        action: getRoute('/ressources/cases/edit-name'),
        encType: 'application/json',
      });
      setIsEditing(false);
    },
    defaultValues: { name: name, caseId: id } as EditNameForm,
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)} className="w-full">
      <form.Field name="name">
        {(field) => (
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-fit p-0.5"
                  variant="secondary"
                  size="icon"
                >
                  <Icon icon="edit-square" className="text-grey-50 size-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="small"
                    disabled={form.state.isSubmitting}
                    variant="primary"
                  >
                    <Icon icon="save" className="size-4" />
                    <span className="text-xs">{t('common:save')}</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset({ name, caseId: id });
                    }}
                    variant="secondary"
                    size="icon"
                  >
                    <Icon icon="cross" className="text-grey-50 size-5" />
                  </Button>
                </div>
              )}
              <input
                type="text"
                name={field.name}
                disabled={!isEditing}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                className="text-grey-00 text-l w-full border-none bg-transparent font-normal outline-none"
                placeholder={t('cases:case.name')}
              />
            </div>
            <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          </div>
        )}
      </form.Field>
    </form>
  );
};
