import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { WorkflowRule } from './Rule';
import { RuleProvider } from './RuleProvider';
import { useWorkflow } from './WorkflowProvider';

export function WorkflowList() {
  const { t } = useTranslation(['workflows']);
  const {
    rules,
    isLoading,
    isDragging,
    setIsDragging,
    reorderRules,
    createRule,
    editingRuleId,
    setEditingRuleId,
    scenarioId,
  } = useWorkflow();

  // Check if any rule is currently being modified - this will be handled by individual RuleProviders
  const hasModifiedRules = editingRuleId !== null;

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    await reorderRules(sourceIndex, destinationIndex);
  };

  return (
    <>
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="workflow-rules" direction="vertical">
          {(provided) => (
            <div
              className="gap-8 py-8 max-w-7xl ml-8"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {!isLoading && rules.length === 0 ? (
                <div className="w-[800px] text-center text-grey-60 italic py-8">
                  {t('workflows:empty_state.no_rule_yet')}
                </div>
              ) : null}
              {rules.map((rule, index) => {
                const isCurrentRuleEditing = editingRuleId === rule.id;
                const isOtherRuleEditing = editingRuleId !== null && editingRuleId !== rule.id;

                return (
                  <Draggable
                    key={rule.id}
                    draggableId={rule.id}
                    index={index}
                    isDragDisabled={false}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${
                          isOtherRuleEditing ? 'opacity-40 pointer-events-none blur-sm' : ''
                        }`}
                      >
                        <RuleProvider
                          rule={rule}
                          setEditingRuleId={setEditingRuleId}
                          scenarioId={scenarioId}
                        >
                          <WorkflowRule rule={rule} provided={provided} snapshot={snapshot} />
                        </RuleProvider>
                        {/* Else arrow - appears after each rule except the last one */}
                        {index < rules.length - 1 && (
                          <div
                            className={cn(
                              'items-center w-[800px] justify-center transition-all duration-300',
                              isDragging ? 'opacity-0' : 'opacity-100',
                              isCurrentRuleEditing ? 'opacity-40 pointer-events-none blur-sm' : '',
                            )}
                          >
                            <div className="w-[800px] flex justify-center items-center relative">
                              <div className="w-0.5 h-16 bg-grey-80 relative">
                                <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-grey-80"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-grey-90 px-3 py-1 rounded z-10">
                                  <span className="text-sm font-bold text-white uppercase tracking-wide">
                                    {t('workflows:else_arrow.label')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div
        className={`flex flex-col items-center w-[800px] ml-8 pb-8 transition-all duration-300 ${
          hasModifiedRules ? 'opacity-40 pointer-events-none blur-sm' : ''
        }`}
      >
        <Button variant="primary" onClick={createRule}>
          <Icon icon="plus" className="size-4" />
          {t('workflows:create_rule.label')}
        </Button>
      </div>
    </>
  );
}
