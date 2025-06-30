import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbLink, BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { workflowI18n } from '@app-builder/components/Scenario/Workflow/workflow-i18n';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRouteError, useSubmit } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: workflowI18n satisfies Namespace,
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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const workflowIdsJson = formData.get('workflowIds') as string;
  const workflowIds = JSON.parse(workflowIdsJson) as string[];

  await scenario.reorderWorkflows({
    scenarioId: fromParams(params, 'scenarioId'),
    workflowIds,
  });

  return null;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { authService } = initServerServices(request);
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const workflow = await scenario.listWorkflows({
    scenarioId: fromParams(params, 'scenarioId'),
  });

  console.log(JSON.stringify(workflow, null, 2));

  return { workflow };
};
export default function WorkflowPage() {
  const { workflow: initialWorkflow } = useLoaderData<typeof loader>();
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [isDragging, setIsDragging] = useState(false);
  const submit = useSubmit();

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);

    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    const newWorkflow = Array.from(workflow);
    const [reorderedItem] = newWorkflow.splice(sourceIndex, 1);
    if (reorderedItem) {
      newWorkflow.splice(destinationIndex, 0, reorderedItem);
      setWorkflow(newWorkflow);

      const workflowIds = newWorkflow.map((rule) => rule.id);
      const formData = new FormData();
      formData.append('workflowIds', JSON.stringify(workflowIds));
      submit(formData, { method: 'POST' });
    }
  };

  return (
    <Page.Main>
      <Page.Header className="gap-4">
        <BreadCrumbs />
      </Page.Header>

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="workflow-rules" direction="vertical">
          {(provided) => (
            <div
              className="flex flex-col items-center gap-4 py-8"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {workflow.map((rule, index) => (
                <Draggable key={rule.id} draggableId={rule.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex flex-col items-center gap-4"
                    >
                      {/* Rule Container */}
                      <div
                        className={`w-full max-w-7xl relative transition-all duration-200 ${
                          snapshot.isDragging ? 'rotate-1 scale-105 z-50' : ''
                        }`}
                        {...provided.dragHandleProps}
                      >
                        {/* Conditions and Actions Boxes */}
                        <div className="flex items-center w-full justify-center">
                          {/* Conditions Box */}
                          <div
                            className={`flex-1 max-w-lg rounded-lg border-2 bg-white p-6 shadow-lg transition-all duration-200 ${
                              snapshot.isDragging ? 'border-purple-60 shadow-xl' : 'border-grey-20'
                            }`}
                          >
                            {/* Rule Name inside conditions box */}
                            <div className="flex items-center gap-2 mb-4">
                              <Icon icon="rule-settings" className="size-4 text-purple-60" />
                              <h3 className="text-sm font-semibold text-grey-00">{rule.name}</h3>
                            </div>

                            <h4 className="text-lg font-medium text-grey-00 mb-4 flex items-center gap-2">
                              <Icon icon="filters" className="size-5 text-blue-60" />
                              Conditions
                            </h4>
                            <div className="bg-grey-05 rounded-md p-4">
                              {rule.conditions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {rule.conditions.map((condition) => (
                                    <span
                                      key={condition.id}
                                      className="bg-blue-95 text-blue-60 px-3 py-2 rounded-full text-sm font-medium"
                                    >
                                      {condition.function}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-grey-50 text-sm italic">
                                  No conditions defined
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Arrow with "Then" */}
                          <div className="flex items-center justify-center relative">
                            {/* Arrow Line */}
                            <div className="w-36 h-0.5 bg-grey-50 relative">
                              {/* Right Arrow Head */}
                              <div className="absolute -right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-grey-50"></div>
                              {/* "Then" Text */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-grey-50 px-3 py-1 rounded z-10">
                                <span className="text-sm font-bold text-white uppercase tracking-wide">
                                  Then
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions Box */}
                          <div
                            className={`flex-1 max-w-lg rounded-lg border-2 bg-white p-6 shadow-lg transition-all duration-200 ${
                              snapshot.isDragging ? 'border-purple-60 shadow-xl' : 'border-grey-20'
                            }`}
                          >
                            <h4 className="text-lg font-medium text-grey-00 mb-4 flex items-center gap-2">
                              <Icon icon="trigger" className="size-5 text-green-60" />
                              Actions
                            </h4>
                            <div className="bg-grey-05 rounded-md p-4">
                              {rule.actions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {rule.actions.map((action) => (
                                    <span
                                      key={action.id}
                                      className="bg-green-95 text-green-60 px-3 py-2 rounded-full text-sm font-medium"
                                    >
                                      {action.action}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-grey-50 text-sm italic">
                                  No actions defined
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Vertical Arrow with "ELSE" label - always reserve space, hide during drag */}
                      {index < workflow.length - 1 && (
                        <div
                          className={`flex items-center w-full max-w-7xl justify-center -mt-4 -mb-4 transition-opacity duration-200 ${
                            isDragging ? 'opacity-0' : 'opacity-100'
                          }`}
                        >
                          {/* Left side - aligned with conditions box */}
                          <div className="flex-1 max-w-lg flex justify-center">
                            <div className="flex flex-col items-center relative">
                              {/* Vertical Arrow Line */}
                              <div className="w-0.5 h-16 bg-grey-50 relative">
                                {/* Downward Arrow Head */}
                                <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-grey-50"></div>
                                {/* "ELSE" Text */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-grey-50 px-3 py-1 rounded z-10">
                                  <span className="text-sm font-bold text-white uppercase tracking-wide">
                                    Else
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Center spacer - aligned with "Then" arrow */}
                          <div className="flex items-center justify-center relative">
                            <div className="w-36 h-0"></div>
                          </div>

                          {/* Right side - aligned with actions box */}
                          <div className="flex-1 max-w-lg"></div>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
