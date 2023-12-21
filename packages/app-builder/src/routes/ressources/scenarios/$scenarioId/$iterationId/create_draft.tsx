import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigate } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, HiddenInputs, Modal } from 'ui-design-system';
import { Plus } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

const createDraftIterationFormSchema = z.object({
  iterationId: z.string().uuid(),
});

export async function action({ request, params }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = await parseFormSafe(
    request,
    createDraftIterationFormSchema,
  );
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const scenarioId = fromParams(params, 'scenarioId');
  const { iterationId } = parsedForm.data;
  try {
    const draftIteration =
      await apiClient.createDraftFromScenarioIteration(iterationId);

    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(draftIteration.id),
      }),
    );
  } catch (error) {
    return json({
      success: false as const,
      values: parsedForm.data,
      error: error,
    });
  }
}

export function CreateDraftIteration({
  iterationId,
  scenarioId,
  draftId,
}: {
  iterationId: string;
  scenarioId: string;
  draftId: string | undefined;
}) {
  return (
    <>
      {draftId === undefined ? (
        <NewDraftButton iterationId={iterationId} scenarioId={scenarioId} />
      ) : null}
      {draftId ? (
        <ExistingDraftModal
          iterationId={iterationId}
          scenarioId={scenarioId}
          draftId={draftId}
        />
      ) : null}
    </>
  );
}

const NewDraftButton = ({
  iterationId,
  scenarioId,
}: {
  iterationId: string;
  scenarioId: string;
}) => {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form
      method="POST"
      action={`/ressources/scenarios/${fromUUID(scenarioId)}/${fromUUID(
        iterationId,
      )}/create_draft`}
    >
      <HiddenInputs iterationId={iterationId} />
      <Button type="submit">
        <Plus width={'24px'} height={'24px'} />
        {t('scenarios:create_iteration.title')}
      </Button>
    </fetcher.Form>
  );
};

const ExistingDraftModal = ({
  iterationId,
  scenarioId,
  draftId,
}: {
  iterationId: string;
  scenarioId: string;
  draftId: string;
}) => {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button>
          <Plus width={'24px'} height={'24px'} />
          {t('scenarios:create_iteration.title')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <fetcher.Form
          method="POST"
          action={`/ressources/scenarios/${fromUUID(scenarioId)}/${fromUUID(
            iterationId,
          )}/create_draft`}
        >
          <HiddenInputs iterationId={iterationId} />
          <Modal.Title>{t('scenarios:create_iteration.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="text-s flex flex-1 flex-col gap-4">
              <p className="text-center">
                {t('scenarios:create_rule.draft_already_exist')}
              </p>
              <p className="text-center">
                {t('scenarios:create_rule.draft_already_exist_possibility')}
              </p>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() =>
                    navigate(
                      location.pathname.replace(
                        fromUUID(iterationId),
                        fromUUID(draftId),
                      ),
                    )
                  }
                >
                  {t('scenarios:create_draft.keep_existing_draft')}
                </Button>
              </Modal.Close>
              <Button
                className="flex-1"
                variant="primary"
                type="submit"
                name="create"
              >
                {t('scenarios:create_draft.override_existing_draft')}
              </Button>
            </div>
          </div>
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
};
