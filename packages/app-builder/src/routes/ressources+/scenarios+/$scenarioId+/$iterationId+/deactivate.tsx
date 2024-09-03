import { FormCheckbox } from '@app-builder/components/Form/FormCheckbox';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { redirectBack } from 'remix-utils/redirect-back';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const deactivateFormSchema = z.object({
  stopOperating: z.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.boolean().pipe(z.literal(true)),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    csrfService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  await csrfService.validate(request);
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: deactivateFormSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await scenario.createScenarioPublication({
      publicationAction: 'unpublish',
      scenarioIterationId: iterationId,
    });

    return redirectBack(request, {
      fallback: getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(iterationId),
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

export function DeactivateScenarioVersion({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(['scenarios']);
  const [open, setOpen] = React.useState(false);

  const navigation = useNavigation();
  React.useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button className="flex-1" variant="primary" color="red">
          <Icon icon="stop" className="size-6" />
          {t('scenarios:deployment_modal.deactivate.button')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <DeactivateScenarioVersionContent
          scenarioId={scenarioId}
          iterationId={iterationId}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function DeactivateScenarioVersionContent({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: {
      stopOperating: 'off',
      changeIsImmediate: false,
    },
    lastResult: fetcher.data,
    constraint: getZodConstraint(deactivateFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: deactivateFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        action={getRoute(
          '/ressources/scenarios/:scenarioId/:iterationId/deactivate',
          {
            scenarioId: fromUUID(scenarioId),
            iterationId: fromUUID(iterationId),
          },
        )}
        method="POST"
        {...getFormProps(form)}
      >
        <Modal.Title>
          {t('scenarios:deployment_modal.deactivate.title')}
        </Modal.Title>
        <div className="flex flex-col gap-6 p-6">
          <AuthenticityTokenInput />
          <div className="text-s flex flex-col gap-4 font-medium">
            <p className="font-semibold">
              {t('scenarios:deployment_modal.deactivate.confirm')}
            </p>
            <FormField
              name={fields.stopOperating.name}
              className="group flex flex-row items-center gap-2"
            >
              <FormCheckbox />
              <FormLabel>
                {t('scenarios:deployment_modal.deactivate.stop_operating')}
              </FormLabel>
            </FormField>
            <FormField
              name={fields.changeIsImmediate.name}
              className="group flex flex-row items-center gap-2"
            >
              <FormCheckbox />
              <FormLabel>
                {t('scenarios:deployment_modal.deactivate.change_is_immediate')}
              </FormLabel>
            </FormField>
            <p className="text-grey-25 text-xs font-medium">
              {t('scenarios:deployment_modal.deactivate.helper')}
            </p>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary" name="cancel">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button
              className="flex-1"
              variant="primary"
              type="submit"
              color="red"
            >
              <Icon icon="stop" className="size-6" />
              {t('scenarios:deployment_modal.deactivate.button')}
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}
