import { Callout } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, ModalV2 } from 'ui-design-system';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const scenarioId = fromParams(params, 'scenarioId');
  const testRunId = fromParams(params, 'testRunId');
  const { testRun } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  try {
    await testRun.cancelTestRun({ testRunId });
    return redirect(
      getRoute('/scenarios/:scenarioId/test-run', {
        scenarioId: fromUUIDtoSUUID(scenarioId),
      }),
    );
  } catch (_error) {
    const { getSession, commitSession } = initServerServices(request).toastSessionService;

    const session = await getSession(request);

    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      { success: false as const },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export function CancelTestRun({
  children,
  testRunId,
}: {
  children: React.ReactElement;
  testRunId: string;
}) {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const navigation = useNavigation();
  const currentScenario = useCurrentScenario();
  const cancelTestRunFetcher = useFetcher<typeof action>();
  const { t } = useTranslation(['scenarios', 'common']);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} disabled={!hydrated} />
      <ModalV2.Content className="overflow-visible">
        <ModalV2.Title>{t('scenarios:testrun.cancel')}</ModalV2.Title>
        <cancelTestRunFetcher.Form
          className="flex flex-col gap-6 p-6"
          method="POST"
          action={getRoute('/ressources/scenarios/:scenarioId/testrun/:testRunId/cancel', {
            scenarioId: fromUUIDtoSUUID(currentScenario.id),
            testRunId: fromUUIDtoSUUID(testRunId),
          })}
        >
          <ModalV2.Description render={<Callout variant="outlined" />}>
            <p className="whitespace-pre-wrap">{t('scenarios:testrun.cancel.callout')}</p>
          </ModalV2.Description>
          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
              {t('common:cancel')}
            </ModalV2.Close>
            <Button className="flex-1" variant="primary" type="submit">
              {t('scenarios:testrun.cancel')}
            </Button>
          </div>
        </cancelTestRunFetcher.Form>
      </ModalV2.Content>
    </ModalV2.Root>
  );
}
