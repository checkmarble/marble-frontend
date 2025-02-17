import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { NewStringConcatAstNode } from '@app-builder/models/astNode/strings';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type OnDragEndResponder,
} from '@hello-pangea/dnd';
import { nanoid } from 'nanoid';
import { replace } from 'radash';
import { useEffect, useState } from 'react';
import { omit, splice } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchOperand } from './MatchOperand';

function reorder<TItem>(
  list: TItem[],
  startIndex: number,
  endIndex: number,
): TItem[] {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  if (removed) result.splice(endIndex, 0, removed);
  return result;
}

export function FieldNodeConcat({
  value,
  limit,
  onBlur,
  onChange,
  viewOnly,
  placeholder,
}: {
  value?: AstNode;
  limit?: number;
  placeholder?: string;
  onChange?: (node: AstNode) => void;
  onBlur?: () => void;
  viewOnly?: boolean;
}) {
  const [nodes, setNodes] = useState<(AstNode & { id: string })[]>(
    (value?.children?.length ? value.children : [NewUndefinedAstNode()]).map(
      (n) => ({ ...n, id: nanoid() }),
    ),
  );

  useEffect(() => {
    if (nodes.length !== 0) {
      onChange?.(
        NewStringConcatAstNode(nodes.map(omit(['id'])), {
          withSeparator: true,
        }),
      );
    }
  }, [nodes, onChange]);

  const onDragEnd: OnDragEndResponder<string> = (result): void => {
    if (
      !result.destination ||
      result.destination.index === result.source.index
    ) {
      return;
    }

    setNodes((prev) =>
      reorder(prev, result.source.index, result.destination!.index),
    );
  };

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      autoScrollerOptions={{ disabled: true }}
    >
      <div onBlur={onBlur} className="flex flex-col gap-2">
        <Droppable
          isDropDisabled={viewOnly}
          droppableId="NODES"
          direction="vertical"
        >
          {(dropProvided) => (
            <div className="flex flex-col gap-2" ref={dropProvided.innerRef}>
              {nodes.map((node, index) => (
                <Draggable
                  isDragDisabled={viewOnly}
                  key={node.id}
                  draggableId={node.id}
                  index={index}
                >
                  {(dragProvided) => (
                    <div
                      key={node.id}
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className="flex items-center gap-0.5"
                    >
                      {!viewOnly ? (
                        <div className="flex flex-row">
                          {nodes.length > 1 ? (
                            <>
                              <div
                                className="hover:bg-grey-95 flex size-6 items-center justify-center rounded"
                                {...dragProvided.dragHandleProps}
                              >
                                <Icon
                                  icon="drag"
                                  className="text-grey-80 size-3"
                                />
                              </div>
                              <Button
                                size="icon"
                                variant="tertiary"
                                onClick={() =>
                                  setNodes((prev) => splice(prev, index, 1, []))
                                }
                              >
                                <Icon icon="cross" className="size-4" />
                              </Button>
                            </>
                          ) : null}
                          {!limit || nodes.length < limit ? (
                            <Button
                              size="icon"
                              variant="tertiary"
                              disabled={nodes.length === limit}
                              onClick={() =>
                                setNodes((prev) =>
                                  splice(prev, index, 1, [
                                    { ...prev[index]!, id: prev[index]!.id },
                                    { ...NewUndefinedAstNode(), id: nanoid() },
                                  ]),
                                )
                              }
                            >
                              <Icon icon="plus" className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                      <MatchOperand
                        node={node}
                        viewOnly={viewOnly}
                        key={`node-${index}`}
                        placeholder={placeholder}
                        onSave={(savedNode) =>
                          setNodes((prev) =>
                            replace(
                              prev,
                              { ...savedNode, id: node.id },
                              (_, i) => i === index,
                            ),
                          )
                        }
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
