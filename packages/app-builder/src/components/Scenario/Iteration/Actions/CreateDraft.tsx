import { useCreateDraftIterationMutation } from '@app-builder/queries/scenarios/create-draft-iteration';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useNavigate, useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

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
      {draftId === undefined ? <NewDraftButton iterationId={iterationId} scenarioId={scenarioId} /> : null}
      {draftId ? <ExistingDraftModal iterationId={iterationId} scenarioId={scenarioId} draftId={draftId} /> : null}
    </>
  );
}

const NewDraftButton = ({ iterationId, scenarioId }: { iterationId: string; scenarioId: string }) => {
  const { t } = useTranslation(['common', 'scenarios']);
  const createDraftIterationMutation = useCreateDraftIterationMutation(scenarioId, iterationId);
  const router = useRouter();
  const navigate = useNavigate();

  const handleNewDraft = async () => {
    try {
      const newIteration = await createDraftIterationMutation.mutateAsync();
      await router.invalidate();
      navigate({
        to: '/detection/scenarios/$scenarioId/i/$iterationId/trigger',
        params: {
          scenarioId: fromUUIDtoSUUID(scenarioId),
          iterationId: fromUUIDtoSUUID(newIteration.id),
        },
      });
    } catch (error) {
      console.error('Failed to create draft iteration:', error);
      toast.error(t('common:errors.unknown'));
    }
  };

  return (
    <Button onClick={handleNewDraft} size="medium">
      <Icon icon="plus" className="size-5" />
      <span className="line-clamp-1 hidden shrink-0 lg:block">{t('scenarios:create_iteration.title')}</span>
    </Button>
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
  const { t } = useTranslation(['common', 'scenarios']);
  const createDraftIterationMutation = useCreateDraftIterationMutation(scenarioId, iterationId);
  const router = useRouter();
  const navigate = useNavigate();

  const handleOverrideDraft = async () => {
    try {
      const newIteration = await createDraftIterationMutation.mutateAsync();
      await router.invalidate();
      navigate({
        to: '/detection/scenarios/$scenarioId/i/$iterationId/trigger',
        params: {
          scenarioId: fromUUIDtoSUUID(scenarioId),
          iterationId: fromUUIDtoSUUID(newIteration.id),
        },
      });
    } catch (error) {
      console.error('Failed to override draft iteration:', error);
      toast.error(t('common:errors.unknown'));
    }
  };

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button size="medium">
          <Icon icon="plus" className="size-5" />
          <span className="line-clamp-1 hidden shrink-0 lg:block">{t('scenarios:create_iteration.title')}</span>
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('scenarios:create_iteration.title')}</Modal.Title>
        <div className="flex flex-col gap-lg p-lg">
          <div className="text-s flex flex-1 flex-col gap-md">
            <p className="text-center">{t('scenarios:create_rule.draft_already_exist')}</p>
            <p className="text-center">{t('scenarios:create_rule.draft_already_exist_possibility')}</p>
          </div>
        </div>
        <Modal.Footer>
          <Modal.FooterButton
            label={t('scenarios:create_draft.keep_existing_draft')}
            isCloseButton
            onClick={() =>
              navigate({
                to: '../$iterationId',
                from: '/detection/scenarios/$scenarioId/i/$iterationId',
                params: {
                  iterationId: fromUUIDtoSUUID(draftId),
                },
              })
            }
          />
          <Modal.FooterButton
            label={t('scenarios:create_draft.override_existing_draft')}
            onClick={handleOverrideDraft}
            isLoading={createDraftIterationMutation.isPending}
            name="create"
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
