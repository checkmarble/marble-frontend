import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const iterationId = fromParams(params, 'iterationId');
  const scenarioId = fromParams(params, 'scenarioId');
  const { scenarioIterationRuleRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  const data = await request.formData();

  await scenarioIterationRuleRepository.deleteRule({
    ruleId: data.get('ruleId') as string,
  });

  return redirect(
    getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
      scenarioId: fromUUID(scenarioId),
      iterationId: fromUUID(iterationId),
    }),
  );
}

export function DeleteRule({
  ruleId,
  scenarioId,
  iterationId,
  children,
}: {
  ruleId: string;
  scenarioId: string;
  iterationId: string;
  children: React.ReactElement;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  return (
    <ModalV2.Root>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="bg-red-95 mb-6 box-border rounded-[90px] p-4">
              <Icon icon="delete" className="text-red-47 size-16" />
            </div>
            <h1 className="text-l font-semibold">
              {t('scenarios:delete_rule.title')}
            </h1>
            <p className="text-center">{t('scenarios:delete_rule.content')}</p>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close
              render={<Button className="flex-1" variant="secondary" />}
            >
              {t('common:cancel')}
            </ModalV2.Close>
            <Button
              color="red"
              className="flex-1"
              variant="primary"
              type="button"
              onClick={() => {
                const data = new FormData();
                data.append('ruleId', ruleId);

                fetcher.submit(data, {
                  method: 'DELETE',
                  action: getRoute(
                    `/ressources/scenarios/:scenarioId/:iterationId/rules/delete`,
                    {
                      scenarioId: fromUUID(scenarioId),
                      iterationId: fromUUID(iterationId),
                    },
                  ),
                });
              }}
            >
              <Icon icon="delete" className="size-6" />
              {t('common:delete')}
            </Button>
          </div>
        </div>
      </ModalV2.Content>
    </ModalV2.Root>
  );
}
