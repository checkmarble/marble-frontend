import { FormCheckbox } from '@app-builder/components/Form/FormCheckbox';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusBadRequestHttpError } from '@app-builder/models';
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
import { Button, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const commitFormSchema = z.object({
  draftIsReadOnly: z.boolean().pipe(z.literal(true)),
  activateToGoInProd: z.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.boolean().pipe(z.literal(true)),
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
  const submission = parseWithZod(formData, { schema: commitFormSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
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
    const formError = isStatusBadRequestHttpError(error)
      ? t('scenarios:deployment_modal.commit.validation_error')
      : t('common:errors.unknown');

    setToastMessage(session, {
      type: 'error',
      message: formError,
    });
    return json(submission.reply({ formErrors: [formError] }), {
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
  const [open, setOpen] = React.useState(false);

  const navigation = useNavigation();
  React.useEffect(() => {
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

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: {
      activateToGoInProd: false,
      draftIsReadOnly: false,
      changeIsImmediate: false,
    },
    lastResult: fetcher.data,
    constraint: getZodConstraint(commitFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: commitFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        action={getRoute(
          '/ressources/scenarios/:scenarioId/:iterationId/commit',
          {
            scenarioId: fromUUID(scenarioId),
            iterationId: fromUUID(iterationId),
          },
        )}
        method="POST"
        {...getFormProps(form)}
      >
        <Modal.Title>
          {t('scenarios:deployment_modal.commit.title')}
        </Modal.Title>
        <div className="flex flex-col gap-6 p-6">
          <AuthenticityTokenInput />
          <div className="text-s flex flex-col gap-4 font-medium">
            <p className="font-semibold">
              {t('scenarios:deployment_modal.commit.confirm')}
            </p>
            <FormField
              name={fields.draftIsReadOnly.name}
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
              name={fields.activateToGoInProd.name}
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
              name={fields.changeIsImmediate.name}
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
    </FormProvider>
  );
}
