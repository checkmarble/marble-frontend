import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useCreateDraftIterationMutation } from '@app-builder/queries/scenarios/create-draft-iteration';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
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
  const revalidate = useLoaderRevalidator();

  const handleNewDraft = () => {
    createDraftIterationMutation.mutateAsync().then(() => {
      revalidate();
    });
  };

  return (
    <Button onClick={handleNewDraft}>
      <Icon icon="plus" className="size-6" />
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
  const navigate = useAgnosticNavigation();
  const revalidate = useLoaderRevalidator();

  const handleOverrideDraft = () => {
    createDraftIterationMutation.mutateAsync().then(() => {
      revalidate();
    });
  };

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button>
          <Icon icon="plus" className="size-6" />
          <span className="line-clamp-1 hidden shrink-0 lg:block">{t('scenarios:create_iteration.title')}</span>
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('scenarios:create_iteration.title')}</Modal.Title>
        <div className="flex flex-col gap-6 p-6">
          <div className="text-s flex flex-1 flex-col gap-4">
            <p className="text-center">{t('scenarios:create_rule.draft_already_exist')}</p>
            <p className="text-center">{t('scenarios:create_rule.draft_already_exist_possibility')}</p>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() =>
                  navigate(location.pathname.replace(fromUUIDtoSUUID(iterationId), fromUUIDtoSUUID(draftId)))
                }
              >
                {t('scenarios:create_draft.keep_existing_draft')}
              </Button>
            </Modal.Close>
            <Button className="flex-1" variant="primary" name="create" onClick={handleOverrideDraft}>
              {t('scenarios:create_draft.override_existing_draft')}
            </Button>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
