import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['cases']);
  const { submit } = useFetcher<typeof action>();

  const form = useForm({
    onSubmit: ({ value }) =>
      submit(value, {
        method: 'PATCH',
        action: getRoute('/ressources/cases/edit-name'),
        encType: 'application/json',
      }),
    defaultValues: { name: name, caseId: id } as EditNameForm,
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  return (
    <form>
      <form.Field name="name">
        {(field) => (
          <div className="flex w-full flex-col gap-1">
            <input
              type="text"
              name={field.name}
              defaultValue={field.state.value}
              onChange={(e) => {
                console.log('Value changed');
                field.handleChange(e.currentTarget.value);
                form.handleSubmit();
              }}
              onBlur={field.handleBlur}
              className="text-grey-00 text-l w-full border-none bg-transparent font-normal outline-none"
              placeholder={t('cases:case.name')}
            />
            <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
          </div>
        )}
      </form.Field>
    </form>
  );
};
