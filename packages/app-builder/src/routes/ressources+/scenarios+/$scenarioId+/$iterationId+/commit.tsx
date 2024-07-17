import { FormCheckbox } from '@app-builder/components/Form/FormCheckbox';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusBadRequestHttpError } from '@app-builder/models';
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
import { Button, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const commitFormSchema = z.object({
  draftIsReadOnly: z.coerce.boolean().pipe(z.literal(true)),
  activateToGoInProd: z.coerce.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.coerce.boolean().pipe(z.literal(true)),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService, csrfService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  await csrfService.validate(request);
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const formData = await request.formData();
  const submission = parse(formData, { schema: commitFormSchema });
  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  try {
    await scenario.commitScenarioIteration({
      iterationId,
    });

    return redirectBack(request, {
      fallback: getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(iterationId),
      }),
    });
  } catch (error) {
    const {
      i18nextService: { getFixedT },
      toastSessionService: { getSession, commitSession },
    } = serverServices;
    const t = await getFixedT(request, ['scenarios', 'common']);
    const session = await getSession(request);
    if (isStatusBadRequestHttpError(error)) {
      setToastMessage(session, {
        type: 'error',
        message: t('scenarios:deployment_modal.commit.validation_error'),
      });
    } else {
      setToastMessage(session, {
        type: 'error',
        message: t('common:errors.unknown'),
      });
    }
    return json(submission, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function CommitScenarioDraft({
  scenarioId,
  iteration,
}: {
  scenarioId: string;
  iteration: {
    id: string;
    isValid: boolean;
  };
}) {
  const { t } = useTranslation(['scenarios']);
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  const button = (
    <Button className="flex-1" variant="primary" disabled={!iteration.isValid}>
      <Icon icon="commit" className="size-6" />
      {t('scenarios:deployment_modal.commit.button')}
    </Button>
  );

  if (!iteration.isValid) {
    return (
      <Tooltip.Default
        className="text-xs"
        content={t('scenarios:deployment_modal.commit.validation_error')}
      >
        {button}
      </Tooltip.Default>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{button}</Modal.Trigger>
      <Modal.Content>
        <CommitScenarioDraftContent
          scenarioId={scenarioId}
          iterationId={iteration.id}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function CommitScenarioDraftContent({
  scenarioId,
  iterationId,
}: {
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const fetcher = useFetcher<typeof action>();

  const formId = useId();

  const [form, { draftIsReadOnly, activateToGoInProd, changeIsImmediate }] =
    useForm({
      id: formId,
      defaultValue: { draftIsCommited: false, changeIsImmediate: false },
      lastSubmission: fetcher.data,
      constraint: getFieldsetConstraint(commitFormSchema),
      onValidate({ formData }) {
        return parse(formData, {
          schema: commitFormSchema,
        });
      },
    });

  return (
    <fetcher.Form
      action={getRoute(
        '/ressources/scenarios/:scenarioId/:iterationId/commit',
        {
          scenarioId: fromUUID(scenarioId),
          iterationId: fromUUID(iterationId),
        },
      )}
      method="POST"
      {...form.props}
    >
      <Modal.Title>{t('scenarios:deployment_modal.commit.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <AuthenticityTokenInput />
        <div className="text-s flex flex-col gap-4 font-medium">
          <p className="font-semibold">
            {t('scenarios:deployment_modal.commit.confirm')}
          </p>
          <FormField
            config={draftIsReadOnly}
            className="group flex flex-row items-center gap-2"
          >
            <FormCheckbox />
            <FormLabel>
              {t('scenarios:deployment_modal.commit.draft_is_readonly')}
            </FormLabel>
            <Tooltip.Default
              content={
                <p className="max-w-60">
                  {t(
                    'scenarios:deployment_modal.commit.draft_is_readonly.tooltip',
                  )}
                </p>
              }
            >
              <Icon
                icon="tip"
                className="size-6 text-purple-50 hover:text-purple-100"
              />
            </Tooltip.Default>
          </FormField>
          <FormField
            config={activateToGoInProd}
            className="group flex flex-row items-center gap-2"
          >
            <FormCheckbox />
            <FormLabel>
              {t('scenarios:deployment_modal.commit.activate_to_go_in_prod')}
            </FormLabel>
            <Tooltip.Default
              content={
                <p className="max-w-60">
                  {t(
                    'scenarios:deployment_modal.commit.activate_to_go_in_prod.tooltip',
                  )}
                </p>
              }
            >
              <Icon
                icon="tip"
                className="size-6 text-purple-50 hover:text-purple-100"
              />
            </Tooltip.Default>
          </FormField>
          <FormField
            config={changeIsImmediate}
            className="group flex flex-row items-center gap-2"
          >
            <FormCheckbox />
            <FormLabel>
              {t('scenarios:deployment_modal.commit.change_is_immediate')}
            </FormLabel>
          </FormField>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit">
            <Icon icon="commit" className="size-6" />
            {t('scenarios:deployment_modal.commit.button')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
