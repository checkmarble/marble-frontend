import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { redirectBack } from 'remix-utils/redirect-back';
import { Button, Modal } from 'ui-design-system';
import { z } from 'zod';

const updateScenarioFormSchema = z.object({
  scenarioId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().default(null),
});

type UpdateScenarioForm = z.infer<typeof updateScenarioFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: updateScenarioFormSchema,
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await scenario.updateScenario(submission.value);
    return redirectBack(request, {
      fallback: getRoute('/scenarios/:scenarioId', {
        scenarioId: fromUUID(submission.value.scenarioId),
      }),
    });
  } catch (error) {
    const session = await getSession(request);
    const t = await getFixedT(request, ['common']);

    const formError = t('common:errors.unknown');

    setToastMessage(session, {
      type: 'error',
      message: formError,
    });

    return json(submission.reply({ formErrors: [formError] }), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function UpdateScenario({
  children,
  defaultValue,
}: {
  children: React.ReactNode;
  defaultValue: UpdateScenarioForm;
}) {
  const [open, setOpen] = React.useState(false);

  const navigation = useNavigation();
  React.useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <UpdateScenarioContent defaultValue={defaultValue} />
      </Modal.Content>
    </Modal.Root>
  );
}

function UpdateScenarioContent({
  defaultValue,
}: {
  defaultValue: UpdateScenarioForm;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue,
    lastResult: fetcher.data,
    constraint: getZodConstraint(updateScenarioFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: updateScenarioFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        method="PATCH"
        action={getRoute('/ressources/scenarios/update')}
        {...getFormProps(form)}
      >
        <Modal.Title>{t('scenarios:update_scenario.title')}</Modal.Title>
        <div className="flex flex-col gap-6 p-6">
          <input
            {...getInputProps(fields.scenarioId, { type: 'hidden' })}
            key={fields.scenarioId.key}
          />
          <FormField
            name={fields.name.name}
            className="group flex w-full flex-col gap-2"
          >
            <FormLabel>{t('scenarios:create_scenario.name')}</FormLabel>
            <FormInput
              type="text"
              placeholder={t('scenarios:create_scenario.name_placeholder')}
            />
            <FormErrorOrDescription />
          </FormField>
          <FormField
            name={fields.description.name}
            className="group flex w-full flex-col gap-2"
          >
            <FormLabel>{t('scenarios:create_scenario.description')}</FormLabel>
            <FormInput
              type="text"
              placeholder={t(
                'scenarios:create_scenario.description_placeholder',
              )}
            />
            <FormErrorOrDescription />
          </FormField>
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button className="flex-1" variant="primary" type="submit">
              {t('common:save')}
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}
