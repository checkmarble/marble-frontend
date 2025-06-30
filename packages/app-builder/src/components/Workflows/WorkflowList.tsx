import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { WorkflowRule } from './Rule';
import { useWorkflow } from './WorkflowProvider';

export function WorkflowList() {
  const { t } = useTranslation(['workflows']);
  const { rules, isDragging, setIsDragging, reorderRules, createRule } = useWorkflow();

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
              className="flex flex-col items-stretch gap-4 py-8 max-w-7xl mx-auto"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {rules.map((rule, index) => (
                <Draggable key={rule.id} draggableId={rule.id} index={index} isDragDisabled={false}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <WorkflowRule rule={rule} provided={provided} snapshot={snapshot} />
                      {/* Else arrow - appears after each rule except the last one */}
                      {index < rules.length - 1 && (
                        <div
                          className={`flex items-center w-full -mb-4 transition-opacity duration-200 ${
                            isDragging ? 'opacity-0' : 'opacity-100'
                          }`}
                        >
                          <div className="flex-[6] flex justify-center">
                            <div className="flex flex-col items-center relative">
                              <div className="w-0.5 h-16 bg-grey-90 relative">
                                <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-grey-50"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-grey-90 px-3 py-1 rounded z-10">
                                  <span className="text-sm font-bold text-white uppercase tracking-wide">
                                    Else
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Center spacer - aligned with "Then" arrow */}
                          <div className="flex items-center justify-center">
                            <div className="w-24 h-0"></div>
                          </div>

                          {/* Right side - aligned with actions box */}
                          <div className="flex-[2]"></div>
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

      {/* Create Rule Button - Positioned after the last rule */}
      <div className="flex items-center w-full mt-4 max-w-7xl mx-auto">
        <div className="flex-[6] flex justify-center mb-8">
          <Button variant="primary" onClick={createRule}>
            <Icon icon="plus" className="size-4" />
            {t('workflows:create_rule.label')}
          </Button>
        </div>
        {/* Center spacer - aligned with "Then" arrow */}
        <div className="flex items-center justify-center">
          <div className="w-24 h-0"></div>
        </div>
        {/* Right side - aligned with actions box */}
        <div className="flex-[2]"></div>
      </div>
    </>
  );
}
