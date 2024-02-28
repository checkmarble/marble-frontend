import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useEffect, useId, useState } from 'react';
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
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const formData = await request.formData();
  const submission = parse(formData, { schema: updateScenarioFormSchema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
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
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });
    return json(submission, {
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
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
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
  const formId = useId();
  const [form, { name, description, scenarioId }] = useForm({
    id: formId,
    defaultValue,
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(updateScenarioFormSchema),
    // onValidate({ formData }) {
    //   return parse(formData, {
    //     schema: updateScenarioFormSchema,
    //   });
    // },
  });

  return (
    <fetcher.Form
      method="PATCH"
      action={getRoute('/ressources/scenarios/update')}
      {...form.props}
    >
      <Modal.Title>{t('scenarios:create_scenario.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <input {...conform.input(scenarioId, { type: 'hidden' })} />
        <FormField config={name} className="group flex w-full flex-col gap-2">
          <FormLabel>{t('scenarios:create_scenario.name')}</FormLabel>
          <FormInput
            type="text"
            placeholder={t('scenarios:create_scenario.name_placeholder')}
          />
          <FormError />
        </FormField>
        <FormField
          config={description}
          className="group flex w-full flex-col gap-2"
        >
          <FormLabel>{t('scenarios:create_scenario.description')}</FormLabel>
          <FormInput
            type="text"
            placeholder={t('scenarios:create_scenario.description_placeholder')}
          />
          <FormError />
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
  );
}
