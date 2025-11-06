import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbLink, BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { WorkflowList } from '@app-builder/components/Workflows/WorkflowList';
import { useWorkflow, WorkflowProvider } from '@app-builder/components/Workflows/WorkflowProvider';
import { WorkflowScrollHandler } from '@app-builder/components/Workflows/WorkflowScrollHandler.client';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { isCreateInboxAvailable, isWorkflowsAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { match } from 'ts-pattern';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'workflows'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['scenarios']);
      const currentScenario = useCurrentScenario();

      return (
        <BreadCrumbLink
          isLast={isLast}
          to={getRoute('/scenarios/:scenarioId/workflow', {
            scenarioId: fromUUIDtoSUUID(currentScenario.id),
          })}
        >
          {t('scenarios:home.workflow')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { dataModelRepository, entitlements, user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (!isWorkflowsAvailable(entitlements)) {
    return redirect(
      getRoute('/scenarios/:scenarioId/home', {
        scenarioId: fromUUIDtoSUUID(fromParams(params, 'scenarioId')),
      }),
    );
  }

  const [dataModel] = await Promise.all([dataModelRepository.getDataModel()]);

  return {
    scenarioId: fromParams(params, 'scenarioId'),
    dataModel,
    workflowFeatureAccess: {
      isCreateInboxAvailable: isCreateInboxAvailable(user),
    },
  };
};

function WorkflowContent() {
  const { t } = useTranslation(['common', 'workflows']);
  const {
    isLoading,
    isError,
    error,
    deleteModalOpen,
    ruleToDelete,
    confirmDeleteRule,
    cancelDeleteRule,
    setDeleteModalOpen,
  } = useWorkflow();

  return match({ isLoading, isError })
    .with({ isError: true }, () => {
      return <ErrorComponent error={error} />;
    })
    .with({ isLoading: true }, () => {
      return (
        <div className="flex items-center justify-center h-full w-full text-purple-60 gap-2">
          <Icon icon="spinner" className="size-10 animate-spin" />
          {t('common:loading')}
        </div>
      );
    })
    .otherwise(() => (
      <ClientOnly fallback={<></>}>
        {() => {
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
                <WorkflowList />
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
                    <div className="flex flex-1 flex-row gap-2">
                      <Modal.Close asChild>
                        <Button className="flex-1" variant="secondary" onClick={cancelDeleteRule}>
                          {t('common:cancel')}
                        </Button>
                      </Modal.Close>
                      <Button color="red" className="flex-1" variant="primary" onClick={confirmDeleteRule}>
                        <Icon icon="delete" className="size-4" />
                        {t('workflows:delete_rule.delete_button')}
                      </Button>
                    </div>
                  </div>
                </Modal.Content>
              </Modal.Root>
            </>
          );
        }}
      </ClientOnly>
    ));
}

export default function WorkflowPage() {
  const { scenarioId, dataModel, workflowFeatureAccess } = useLoaderData<typeof loader>();

  return (
    <WorkflowProvider scenarioId={scenarioId} dataModel={dataModel} workflowDataFeatureAccess={workflowFeatureAccess}>
      <WorkflowContent />
    </WorkflowProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
