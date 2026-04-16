import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { WorkflowList } from '@app-builder/components/Workflows/WorkflowList';
import { useWorkflow, WorkflowProvider } from '@app-builder/components/Workflows/WorkflowProvider';
import { WorkflowScrollHandler } from '@app-builder/components/Workflows/WorkflowScrollHandler';
import { useDetectionScenarioData } from '@app-builder/hooks/routes-layout-data';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isCreateInboxAvailable, isWorkflowsAvailable } from '@app-builder/services/feature-access';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { ClientOnly, createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

const workflowLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function workflowLoader({ data, context }) {
    const { dataModelRepository, entitlements, user } = context.authInfo;

    if (!isWorkflowsAvailable(entitlements)) {
      throw redirect({
        to: '/detection/scenarios/$scenarioId/home',
        params: { scenarioId: fromUUIDtoSUUID(fromParams(data?.params ?? {}, 'scenarioId')) },
      });
    }

    const [dataModel] = await Promise.all([dataModelRepository.getDataModel()]);

    return {
      scenarioId: fromParams(data?.params ?? {}, 'scenarioId'),
      dataModel,
      workflowFeatureAccess: {
        isCreateInboxAvailable: isCreateInboxAvailable(user),
      },
    };
  });

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/workflow')({
  loader: ({ params }) => workflowLoader({ data: { params } }),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['scenarios']);
        const { currentScenario } = useDetectionScenarioData();

        return (
          <BreadCrumbLink
            isLast={isLast}
            to="/detection/scenarios/$scenarioId/workflow"
            params={{ scenarioId: fromUUIDtoSUUID(currentScenario.id) }}
          >
            {t('scenarios:home.workflow')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: WorkflowPage,
});

function WorkflowContent() {
  const { t } = useTranslation(['common']);
  const { isLoading, isError, error } = useWorkflow();

  return match({ isLoading, isError })
    .with({ isError: true }, () => {
      return <ErrorComponent error={error} />;
    })
    .with({ isLoading: true }, () => {
      return (
        <div className="flex items-center justify-center h-full w-full text-purple-hover gap-2">
          <Icon icon="spinner" className="size-10 animate-spin" />
          {t('common:loading')}
        </div>
      );
    })
    .otherwise(() => (
      <ClientOnly fallback={<></>}>
        <WorkflowClientContent />
      </ClientOnly>
    ));
}

function WorkflowClientContent() {
  const { t } = useTranslation(['common', 'workflows']);
  const { currentScenario } = useDetectionScenarioData();
  const { deleteModalOpen, ruleToDelete, confirmDeleteRule, cancelDeleteRule, setDeleteModalOpen } = useWorkflow();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scrollHandler = (element: HTMLElement) => {
      const scrollTop = element.scrollTop;
      setScrolled(scrollTop > 32);
    };

    const mainElement = document.querySelector('.h-screen.overflow-auto');
    if (mainElement) {
      mainElement.addEventListener('scroll', () => scrollHandler(mainElement as HTMLElement));
      return () => mainElement.removeEventListener('scroll', () => scrollHandler(mainElement as HTMLElement));
    }
  }, []);

  return (
    <>
      <WorkflowScrollHandler />
      <Page.Main className="h-screen overflow-auto">
        <Page.Header
          className={`gap-4 sticky top-0 z-20 shadow-xs transition-shadow duration-2000 ease-in-out ${scrolled ? 'shadow-md' : ''}`}
        >
          <BreadCrumbs />
        </Page.Header>
        <WorkflowList scenario={currentScenario} />
      </Page.Main>
      <Modal.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <Modal.Content>
          <Modal.Title>{t('workflows:delete_rule.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="text-s flex flex-1 flex-col gap-4">
              <p className="text-center">
                {t('workflows:delete_rule.confirm_delete', {
                  ruleName: ruleToDelete?.name,
                })}
              </p>
            </div>
          </div>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button variant="secondary" appearance="stroked" onClick={cancelDeleteRule}>
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button variant="destructive" onClick={confirmDeleteRule}>
              <Icon icon="delete" className="size-4" />
              {t('workflows:delete_rule.delete_button')}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}

function WorkflowPage() {
  const { scenarioId, dataModel, workflowFeatureAccess } = Route.useLoaderData();

  return (
    <WorkflowProvider scenarioId={scenarioId} dataModel={dataModel} workflowDataFeatureAccess={workflowFeatureAccess}>
      <WorkflowContent />
    </WorkflowProvider>
  );
}
