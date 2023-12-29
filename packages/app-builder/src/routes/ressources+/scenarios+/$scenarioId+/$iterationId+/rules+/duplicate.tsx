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

const duplicateRuleFormSchema = z.object({
  ruleId: z.string().uuid(),
  scenarioId: z.string().uuid(),
  iterationId: z.string().uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService, i18nextService } = serverServices;
  const t = await i18nextService.getFixedT(request, 'scenarios');
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = await parseFormSafe(request, duplicateRuleFormSchema);
  if (!parsedForm.success) {
    return null;
  }
  const { ruleId, scenarioId, iterationId } = parsedForm.data;
  const {
    rule: { createdAt, name, ...rest },
  } = await apiClient.getScenarioIterationRule(ruleId);
  const newName = t('clone_rule.default_name', { name });
  await apiClient.createScenarioIterationRule({ name: newName, ...rest });
  return redirect(
    getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
      scenarioId: fromUUID(scenarioId),
      iterationId: fromUUID(iterationId),
    }),
  );
}

export function DuplicateRule({
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
        <Button variant="secondary" className="w-fit">
          <Icon icon="copy" className="h-6 w-6" />
          <p>{t('scenarios:clone_rule.button')}</p>
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <fetcher.Form
          method="POST"
          action={getRoute(
            '/ressources/scenarios/:scenarioId/:iterationId/rules/duplicate',
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
              <div className="bg-purple-10 mb-8 box-border rounded-[90px] p-4">
                <Icon icon="copy" className="h-16 w-16 text-purple-100" />
              </div>
              <h1 className="text-l font-semibold">
                {t('scenarios:clone_rule.title')}
              </h1>
              <p className="text-center">{t('scenarios:clone_rule.content')}</p>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button
                className="flex-1"
                variant="primary"
                type="submit"
                name="confirm"
              >
                <Icon icon="copy" className="h-6 w-6" />
                {t('scenarios:clone_rule.confirmation_button')}
              </Button>
            </div>
          </div>
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
