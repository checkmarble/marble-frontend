import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  isKnownOperandAstNode,
  type KnownOperandAstNode,
} from '@app-builder/models/astNode/builder-ast-node';
import {
  NewStringConcatAstNode,
  type StringConcatAstNode,
} from '@app-builder/models/astNode/strings';
import { reorder } from '@app-builder/utils/list';
import { DragDropContext, Draggable, Droppable, type OnDragEndResponder } from '@hello-pangea/dnd';
import { nanoid } from 'nanoid';
import { replace } from 'radash';
import { useEffect, useState } from 'react';
import { hasSubObject, omit, splice } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchOperand } from './MatchOperand';

export function FieldNodeConcat({
  value,
  limit,
  onBlur,
  onChange,
  viewOnly,
  placeholder,
}: {
  value?: StringConcatAstNode;
  limit?: number;
  placeholder?: string;
  onChange?: (node: AstNode | null) => void;
  onBlur?: () => void;
  viewOnly?: boolean;
}) {
  const [nodes, setNodes] = useState<KnownOperandAstNode[]>(
    value?.children?.length ? value.children : [NewUndefinedAstNode()],
  );

  useEffect(() => {
    const finalNodes = nodes.filter(
      (n) => !hasSubObject(NewUndefinedAstNode() as AstNode, omit(n, ['id'])),
    );

    const result =
      finalNodes.length !== 0 ? NewStringConcatAstNode(finalNodes, { withSeparator: true }) : null;

    onChange?.(result);
  }, [nodes, onChange]);

  const onDragEnd: OnDragEndResponder<string> = (result): void => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    setNodes((prev) => reorder(prev, result.source.index, result.destination!.index));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} autoScrollerOptions={{ disabled: true }}>
      <div onBlur={onBlur} className="flex flex-col gap-2">
        <Droppable isDropDisabled={viewOnly} droppableId="NODES" direction="vertical">
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
                          <div
                            key={node.id}
                            className="hover:bg-grey-95 flex size-6 items-center justify-center rounded"
                            {...dragProvided.dragHandleProps}
                          >
                            <Icon icon="drag" className="text-grey-80 size-3" />
                          </div>
                          {nodes.length > 1 ? (
                            <Button
                              size="icon"
                              variant="tertiary"
                              onClick={() => setNodes((prev) => splice(prev, index, 1, []))}
                            >
                              <Icon icon="cross" className="size-4" />
                            </Button>
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
                        key={`node-${index}`}
                        placeholder={placeholder}
                        onSave={(savedNode) => {
                          if (isKnownOperandAstNode(savedNode)) {
                            setNodes((prev) =>
                              replace(prev, { ...savedNode, id: node.id }, (_, i) => i === index),
                            );
                          }
                        }}
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
