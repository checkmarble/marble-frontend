import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  const iterationId = fromParams(params, 'iterationId');
  const scenarioId = fromParams(params, 'scenarioId');
  const sanctionId = fromParams(params, 'sanctionId');
  const { scenarioIterationSanctionRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  await scenarioIterationSanctionRepository.deleteSanctioncheckConfig({
    iterationId,
    sanctionId,
  });

  return redirect(
    getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
      scenarioId: fromUUIDtoSUUID(scenarioId),
      iterationId: fromUUIDtoSUUID(iterationId),
    }),
  );
}

export function DeleteSanction({
  scenarioId,
  iterationId,
  sanctionId,
  children,
}: {
  scenarioId: string;
  iterationId: string;
  sanctionId: string;
  children: React.ReactElement;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  return (
    <Modal.Root>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="bg-red-95 mb-6 box-border rounded-[90px] p-4">
              <Icon icon="delete" className="text-red-47 size-16" />
            </div>
            <h1 className="text-l font-semibold">{t('scenarios:delete_sanction.title')}</h1>
            <p className="text-center">{t('scenarios:delete_sanction.content')}</p>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button
              color="red"
              variant="primary"
              className="flex-1"
              type="button"
              name="delete"
              onClick={() =>
                fetcher.submit(new FormData(), {
                  method: 'DELETE',
                  action: getRoute(
                    `/ressources/scenarios/:scenarioId/:iterationId/sanctions/:sanctionId/delete`,
                    {
                      scenarioId: fromUUIDtoSUUID(scenarioId),
                      iterationId: fromUUIDtoSUUID(iterationId),
                      sanctionId: fromUUIDtoSUUID(sanctionId),
                    },
                  ),
                })
              }
            >
              <Icon icon="delete" className="size-6" />
              {t('common:delete')}
            </Button>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
