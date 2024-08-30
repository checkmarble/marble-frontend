import { FormCheckbox } from '@app-builder/components/Form/FormCheckbox';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Spinner } from '@app-builder/components/Spinner';
import {
  IsDraftError,
  PreparationIsRequiredError,
  PreparationServiceOccupied,
  ValidationError,
} from '@app-builder/repositories/ScenarioRepository';
import { useCurrentScenarioIteration } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_layout';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { redirectBack } from 'remix-utils/redirect-back';
import { useSpinDelay } from 'spin-delay';
import { Button, CollapsibleV2, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const activateFormSchema = z.object({
  willBeLive: z.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.boolean().pipe(z.literal(true)),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const iterationId = fromParams(params, 'iterationId');

  try {
    const { ruleSnoozes } =
      await scenario.getScenarioIterationActiveSnoozes(iterationId);

    return json({
      success: true as const,
      ruleSnoozes,
    });
  } catch (error) {
    return json({ success: false as const });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService, csrfService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  await csrfService.validate(request);
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: activateFormSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await scenario.createScenarioPublication({
      publicationAction: 'publish',
      scenarioIterationId: iterationId,
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
    let formError: string;
    if (error instanceof ValidationError) {
      formError = t('scenarios:deployment_modal.activate.validation_error');
    } else if (error instanceof PreparationIsRequiredError) {
      formError = t(
        'scenarios:deployment_modal.activate.preparation_is_required_error',
      );
    } else if (error instanceof PreparationServiceOccupied) {
      formError = t(
        'scenarios:deployment_modal.activate.preparation_service_occupied_error',
      );
    } else if (error instanceof IsDraftError) {
      formError = t('scenarios:deployment_modal.activate.is_draft_error');
    } else {
      formError = t('common:errors.unknown');
    }

    setToastMessage(session, {
      type: 'error',
      message: formError,
    });

    return json(submission.reply({ formErrors: [formError] }), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function ActivateScenarioVersion({
  scenario,
  iteration,
}: {
  scenario: {
    id: string;
    isLive: boolean;
  };
  iteration: {
    id: string;
    isValid: boolean;
  };
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = React.useState(false);

  const navigation = useNavigation();
  React.useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  const button = (
    <Button className="flex-1" variant="primary" disabled={!iteration.isValid}>
      <Icon icon="pushtolive" className="size-6" />
      {t('scenarios:deployment_modal.activate.button')}
    </Button>
  );

  if (!iteration.isValid) {
    return (
      <Tooltip.Default
        className="text-xs"
        content={t('scenarios:deployment_modal.activate.validation_error')}
      >
        {button}
      </Tooltip.Default>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{button}</Modal.Trigger>
      <Modal.Content>
        <ActivateScenarioVersionContent
          scenario={scenario}
          iterationId={iteration.id}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

function ActivateScenarioVersionContent({
  scenario,
  iterationId,
}: {
  scenario: {
    id: string;
    isLive: boolean;
  };
  iterationId: string;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: {
      changeIsImmediate: false,
      willBeLive: false,
    },
    lastResult: fetcher.data,
    constraint: getZodConstraint(activateFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: activateFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        action={getRoute(
          '/ressources/scenarios/:scenarioId/:iterationId/activate',
          {
            scenarioId: fromUUID(scenario.id),
            iterationId: fromUUID(iterationId),
          },
        )}
        method="POST"
        {...getFormProps(form)}
      >
        <Modal.Title>
          {t('scenarios:deployment_modal.activate.title')}
        </Modal.Title>
        <div className="flex flex-col gap-6 p-6">
          <AuthenticityTokenInput />
          <div className="text-s flex flex-col gap-4 font-medium">
            <p className="font-semibold">
              {t('scenarios:deployment_modal.activate.confirm')}
            </p>
            <FormField
              name={fields.willBeLive.name}
              className="group flex flex-row items-center gap-2"
            >
              <FormCheckbox />
              <FormLabel>
                {scenario.isLive
                  ? t(
                      'scenarios:deployment_modal.activate.replace_current_live_version',
                    )
                  : t('scenarios:deployment_modal.activate.will_be_live')}
              </FormLabel>
              <Tooltip.Default
                content={
                  <p className="max-w-60">
                    {t(
                      'scenarios:deployment_modal.activate.live_version.tooltip',
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
                {t('scenarios:deployment_modal.activate.change_is_immediate')}
              </FormLabel>
            </FormField>
            <div className="min-h-6 w-full">
              <RuleSnoozeDetail />
            </div>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary" name="cancel">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button className="flex-1" variant="primary" type="submit">
              <Icon icon="play" className="size-6" />
              {t('scenarios:deployment_modal.activate.button')}
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}

function RuleSnoozeDetail() {
  const { t } = useTranslation(['common', 'scenarios']);
  const iteration = useCurrentScenarioIteration();
  const { state, data, load } = useFetcher<typeof loader>();
  React.useEffect(() => {
    if (state === 'idle' && !data) {
      load(
        getRoute('/ressources/scenarios/:scenarioId/:iterationId/activate', {
          scenarioId: fromUUID(iteration.scenarioId),
          iterationId: fromUUID(iteration.id),
        }),
      );
    }
  }, [iteration.id, iteration.scenarioId, state, data, load]);

  const isError = data?.success === false;
  const isLoading = state === 'loading' || !data;
  const showSpinner = useSpinDelay(isLoading);

  if (showSpinner) return <Spinner className="size-5 shrink-0" />;

  if (isError) {
    return (
      <div className="text-s text-red-100">{t('common:errors.unknown')}</div>
    );
  }

  const hasSnoozesActive = data?.ruleSnoozes.some(
    (snooze) => snooze.hasSnoozesActive,
  );

  if (hasSnoozesActive) {
    return (
      <p className="text-grey-50 text-s first-letter:capitalize">
        {t('scenarios:deployment_modal.activate.without_rule_snooze')}
      </p>
    );
  }

  return (
    <CollapsibleV2.Provider>
      <CollapsibleV2.Title className="text-grey-50 group flex flex-row items-center">
        <Icon
          icon="arrow-2-up"
          aria-hidden
          className="-ml-2 size-5 rotate-90 transition-transform duration-200 group-aria-expanded:rotate-180 group-data-[initial]:rotate-180"
        />
        <span className="text-s mr-1 first-letter:capitalize">
          {t('scenarios:deployment_modal.activate.with_rule_snooze')}
        </span>
      </CollapsibleV2.Title>
      <CollapsibleV2.Content>
        <div className="max-h-40 overflow-y-auto p-1">
          <ul className="list-none">
            {iteration.rules.map((rule) => {
              const hasSnoozesActive = data?.ruleSnoozes.find(
                (snooze) => snooze.ruleId === rule.id,
              )?.hasSnoozesActive;
              return (
                <li key={rule.id} className="flex flex-row">
                  <Icon
                    className={clsx(
                      'size-5 shrink-0',
                      hasSnoozesActive === true && 'text-green-100',
                      hasSnoozesActive === false && 'text-red-100',
                    )}
                    icon={hasSnoozesActive ? 'tick' : 'cross'}
                  />
                  <span className="text-s text-grey-100 font-normal">
                    {rule.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </CollapsibleV2.Content>
    </CollapsibleV2.Provider>
  );
}
