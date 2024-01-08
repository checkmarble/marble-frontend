import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, HiddenInputs, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

const deleteRuleFormSchema = z.object({
  ruleId: z.string().uuid(),
  scenarioId: z.string().uuid(),
  iterationId: z.string().uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = await parseFormSafe(request, deleteRuleFormSchema);
  if (!parsedForm.success) {
    // TODO check error
    return null;
  }
  const { ruleId, scenarioId, iterationId } = parsedForm.data;
  await apiClient.deleteScenarioIterationRule(ruleId);
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
}: {
  ruleId: string;
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button color="red" className="w-fit">
          <Icon icon="delete" className="size-6" />
          <p>{t('scenarios:delete_rule.button')}</p>
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <fetcher.Form
          method="DELETE"
          action={getRoute(
            `/ressources/scenarios/:scenarioId/:iterationId/rules/delete`,
            {
              scenarioId: fromUUID(scenarioId),
              iterationId: fromUUID(iterationId),
            },
          )}
        >
          <HiddenInputs
            ruleId={ruleId}
            scenarioId={scenarioId}
            iterationId={iterationId}
          />
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <div className="bg-red-10 mb-6 box-border rounded-[90px] p-4">
                <Icon icon="delete" className="size-16 text-red-100" />
              </div>
              <h1 className="text-l font-semibold">
                {t('scenarios:delete_rule.title')}
              </h1>
              <p className="text-center">
                {t('scenarios:delete_rule.content')}
              </p>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button
                color="red"
                className="flex-1"
                variant="primary"
                type="submit"
                name="delete"
              >
                <Icon icon="delete" className="size-6" />
                {t('common:delete')}
              </Button>
            </div>
          </div>
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
