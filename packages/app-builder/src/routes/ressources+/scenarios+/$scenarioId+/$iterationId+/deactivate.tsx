import { FormCheckbox } from '@app-builder/components/Form/FormCheckbox';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { redirectBack } from 'remix-utils/redirect-back';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const deactivateFormSchema = z.object({
  stopOperating: z.boolean(),
  changeIsImmediate: z.boolean(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService, csrfService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  await csrfService.validate(request);
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const formData = await request.formData();
  const submission = parse(formData, { schema: deactivateFormSchema });
  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  try {
    await apiClient.createScenarioPublication({
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
    const { getSession, commitSession } = serverServices.toastSessionService;
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

export function DeactivateScenarioVersion({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(['scenarios']);
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button className="flex-1" variant="primary" type="submit" color="red">
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

  const formId = useId();
  const [form, { changeIsImmediate, stopOperating }] = useForm({
    id: formId,
    defaultValue: {
      changeIsImmediate: false,
      replaceCurrentLiveVersion: false,
    },
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(deactivateFormSchema),
    onValidate({ formData }) {
      return parse(formData, {
        schema: deactivateFormSchema,
      });
    },
  });

  return (
    <fetcher.Form
      action={getRoute(
        '/ressources/scenarios/:scenarioId/:iterationId/deactivate',
        {
          scenarioId: fromUUID(scenarioId),
          iterationId: fromUUID(iterationId),
        },
      )}
      method="POST"
      {...form.props}
    >
      <Modal.Title>
        {t('scenarios:deployment_modal.deactivate.title')}
      </Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <AuthenticityTokenInput />
        <div className="text-s flex flex-col gap-6 font-medium">
          <p className="font-semibold">
            {t('scenarios:deployment_modal.deactivate.confirm')}
          </p>
          <FormField
            config={stopOperating}
            className="group flex flex-row items-center gap-2"
          >
            <FormCheckbox />
            <FormLabel>
              {t('scenarios:deployment_modal.deactivate.stop_operating')}
            </FormLabel>
          </FormField>
          <FormField
            config={changeIsImmediate}
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
  );
}
