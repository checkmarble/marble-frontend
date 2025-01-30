import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, HiddenInputs, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

const duplicateSanctionFormSchema = z.object({
  sanctionId: z.string().uuid(),
  scenarioId: z.string().uuid(),
  iterationId: z.string().uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService, i18nextService } = serverServices;
  const t = await i18nextService.getFixedT(request, 'scenarios');
  const { scenarioIterationSanctionRepository } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const parsedForm = await parseFormSafe(request, duplicateSanctionFormSchema);
  if (!parsedForm.success) {
    return null;
  }
  const { sanctionId, scenarioId, iterationId } = parsedForm.data;
  const { createdAt, name, ...rest } =
    await scenarioIterationSanctionRepository.getSanction({ sanctionId });
  const newName = t('clone_rule.default_name', { name });
  await scenarioIterationSanctionRepository.createSanction({
    name: newName,
    ...rest,
  });
  return redirect(
    getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
      scenarioId: fromUUID(scenarioId),
      iterationId: fromUUID(iterationId),
    }),
  );
}

export function DuplicateSanction({
  sanctionId,
  scenarioId,
  iterationId,
  children,
}: {
  sanctionId: string;
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
        <fetcher.Form
          method="POST"
          action={getRoute(
            '/ressources/scenarios/:scenarioId/:iterationId/sanctions/duplicate',
            {
              scenarioId: fromUUID(scenarioId),
              iterationId: fromUUID(iterationId),
            },
          )}
        >
          <HiddenInputs
            sanctionId={sanctionId}
            scenarioId={scenarioId}
            iterationId={iterationId}
          />
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <div className="bg-purple-96 mb-8 box-border rounded-[90px] p-4">
                <Icon icon="copy" className="text-purple-65 size-16" />
              </div>
              <h1 className="text-l font-semibold">
                {t('scenarios:clone_rule.title')}
              </h1>
              <p className="text-center">{t('scenarios:clone_rule.content')}</p>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <ModalV2.Close
                render={<Button className="flex-1" variant="secondary" />}
              >
                {t('common:cancel')}
              </ModalV2.Close>
              <Button
                className="flex-1"
                variant="primary"
                type="submit"
                name="confirm"
              >
                <Icon icon="copy" className="size-6" />
                {t('scenarios:clone_rule.confirmation_button')}
              </Button>
            </div>
          </div>
        </fetcher.Form>
      </ModalV2.Content>
    </ModalV2.Root>
  );
}
