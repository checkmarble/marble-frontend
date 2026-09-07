import { MatchOperand } from '@app-builder/components/Scenario/Screening/MatchOperand';
import { type AstNode, isUndefinedAstNode, NewUndefinedAstNode } from '@app-builder/models';
import { isKnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { isListAstNode, type ListAstNode, NewListAstNode } from '@app-builder/models/astNode/list';
import {
  isStringConcatAstNode,
  NewStringConcatAstNode,
  type StringConcatAstNode,
} from '@app-builder/models/astNode/strings';
import { reorder } from '@app-builder/utils/list';
import { DragDropContext, Draggable, Droppable, type OnDragEndResponder } from '@hello-pangea/dnd';
import { replace } from 'radash';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { splice } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type StringConcatListAstNode = ListAstNode<StringConcatAstNode>;

export function isStringConcatListAstNode(node: AstNode): node is StringConcatListAstNode {
  return isListAstNode(node) && node.children.every(isStringConcatAstNode);
}

function newEmptyConcat(): StringConcatAstNode {
  return NewStringConcatAstNode([NewUndefinedAstNode()], { withSeparator: true });
}

function withPlaceholder(concat: StringConcatAstNode): StringConcatAstNode {
  return concat.children.length > 0 ? concat : { ...concat, children: [NewUndefinedAstNode()] };
}

export function listFromConcats(concats: StringConcatAstNode[]): StringConcatListAstNode | null {
  const filledConcats = concats.flatMap((concat) => {
    const children = concat.children.filter((child) => !isUndefinedAstNode(child));
    return children.length > 0 ? [{ ...concat, children }] : [];
  });
  return filledConcats.length > 0 ? NewListAstNode(filledConcats) : null;
}

function sameAstNodeContents(left: AstNode, right: AstNode): boolean {
  if (
    left.id !== right.id ||
    left.name !== right.name ||
    JSON.stringify(left.constant) !== JSON.stringify(right.constant) ||
    left.children.length !== right.children.length
  ) {
    return false;
  }

  const leftNamedChildKeys = Object.keys(left.namedChildren).sort();
  const rightNamedChildKeys = Object.keys(right.namedChildren).sort();
  if (
    leftNamedChildKeys.length !== rightNamedChildKeys.length ||
    leftNamedChildKeys.some((key, index) => key !== rightNamedChildKeys[index])
  ) {
    return false;
  }

  return (
    left.children.every((child, index) => sameAstNodeContents(child, right.children[index]!)) &&
    leftNamedChildKeys.every((key) => sameAstNodeContents(left.namedChildren[key]!, right.namedChildren[key]!))
  );
}

export function sameConcatContents(left: StringConcatAstNode[], right: StringConcatAstNode[]): boolean {
  return left.length === right.length && left.every((concat, index) => sameAstNodeContents(concat, right[index]!));
}

interface FieldNodeConcatListProps {
  value?: StringConcatListAstNode;
  limit?: number;
  concatLimit?: number;
  placeholder?: string;
  onChange?: (node: AstNode | null) => void;
  onBlur?: () => void;
  viewOnly?: boolean;
}

export function FieldNodeConcatList({
  value,
  limit,
  concatLimit,
  placeholder,
  onChange,
  onBlur,
  viewOnly,
}: FieldNodeConcatListProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [concats, setConcats] = useState<StringConcatAstNode[]>(() =>
    value?.children.length ? value.children.map(withPlaceholder) : [newEmptyConcat()],
  );
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const applyConcats = (nextConcats: StringConcatAstNode[]) => {
    setConcats(nextConcats);
    onChangeRef.current?.(listFromConcats(nextConcats));
  };

  useEffect(() => {
    setConcats((previous) => {
      const filled = listFromConcats(previous)?.children ?? [];
      if (value?.children.length) {
        return sameConcatContents(value.children, filled) ? previous : value.children.map(withPlaceholder);
      }
      return filled.length === 0 ? previous : [newEmptyConcat()];
    });
  }, [value]);

  const onDragEnd: OnDragEndResponder<string> = (result): void => {
    if (
      !result.destination ||
      result.destination.droppableId !== result.source.droppableId ||
      result.destination.index === result.source.index
    ) {
      return;
    }
    const concatIndex = concats.findIndex((concat) => concat.id === result.source.droppableId);
    const concat = concats[concatIndex];
    if (!concat) return;
    updateConcat(concatIndex, {
      ...concat,
      children: reorder(concat.children, result.source.index, result.destination.index),
    });
  };

  const updateConcat = (index: number, concat: StringConcatAstNode) => {
    applyConcats(replace(concats, concat, (_, concatIndex) => concatIndex === index));
  };

  const clearOperand = (concatIndex: number, operandIndex: number) => {
    const concat = concats[concatIndex]!;
    updateConcat(concatIndex, {
      ...concat,
      children: concat.children.length === 1 ? [NewUndefinedAstNode()] : splice(concat.children, operandIndex, 1, []),
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} autoScrollerOptions={{ disabled: true }}>
      <div onBlur={onBlur} className="flex flex-col gap-sm">
        {concats.length === 0 && !viewOnly ? (
          <Button
            mode="icon"
            variant="secondary"
            appearance="link"
            aria-label={t('scenarios:edit_sanction.add_concatenation_row')}
            onClick={() => applyConcats([newEmptyConcat()])}
          >
            <Icon icon="plus" className="size-4" />
          </Button>
        ) : null}
        {concats.map((concat, concatIndex) => (
          <Fragment key={concat.id}>
            {concatIndex > 0 ? (
              <span className="text-grey-secondary text-xs font-medium uppercase">{t('common:or')}</span>
            ) : null}
            <div className="flex items-center gap-2xs">
              {!viewOnly ? (
                <div className="flex flex-row">
                  <Button
                    mode="icon"
                    variant="secondary"
                    appearance="link"
                    aria-label={t('scenarios:edit_sanction.remove_concatenation_row')}
                    onClick={() =>
                      applyConcats(
                        limit === 1 && concats.length === 1 ? [newEmptyConcat()] : splice(concats, concatIndex, 1, []),
                      )
                    }
                  >
                    <Icon icon="cross" className="size-4" />
                  </Button>
                  {!limit || concats.length < limit ? (
                    <Button
                      mode="icon"
                      variant="secondary"
                      appearance="link"
                      aria-label={t('scenarios:edit_sanction.insert_concatenation_row')}
                      onClick={() => applyConcats(splice(concats, concatIndex + 1, 0, [newEmptyConcat()]))}
                    >
                      <Icon icon="plus" className="size-4" />
                    </Button>
                  ) : null}
                </div>
              ) : null}
              <Droppable isDropDisabled={viewOnly} droppableId={concat.id} direction="horizontal" type={concat.id}>
                {(dropProvided) => (
                  <div
                    className="flex flex-1 flex-wrap items-center gap-xs"
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                  >
                    {concat.children.map((operand, operandIndex) => (
                      <Draggable
                        isDragDisabled={viewOnly}
                        key={operand.id}
                        draggableId={operand.id}
                        index={operandIndex}
                      >
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className="flex items-center gap-2xs"
                          >
                            <div className="flex items-stretch">
                              {!viewOnly ? (
                                <div
                                  className="border-grey-border hover:bg-grey-background flex w-6 shrink-0 items-center justify-center rounded-s-sm border border-e-0"
                                  {...dragProvided.dragHandleProps}
                                >
                                  <Icon icon="drag" className="text-grey-disabled size-3" />
                                </div>
                              ) : null}
                              <MatchOperand
                                node={operand}
                                placeholder={placeholder}
                                onSave={(savedNode) => {
                                  if (!isKnownOperandAstNode(savedNode)) return;
                                  updateConcat(concatIndex, {
                                    ...concat,
                                    children: replace(
                                      concat.children,
                                      { ...savedNode, id: operand.id },
                                      (_, index) => index === operandIndex,
                                    ),
                                  });
                                }}
                              />
                              {!viewOnly ? (
                                <Button
                                  mode="icon"
                                  variant="secondary"
                                  appearance="link"
                                  className="border-grey-border h-auto min-w-6 self-stretch rounded-e-sm rounded-s-none border border-s-0"
                                  aria-label={t('scenarios:edit_sanction.remove_operand')}
                                  onClick={() => clearOperand(concatIndex, operandIndex)}
                                >
                                  <Icon icon="cross" className="size-4" />
                                </Button>
                              ) : null}
                            </div>
                            {!viewOnly &&
                            operandIndex === concat.children.length - 1 &&
                            (!concatLimit || concat.children.length < concatLimit) ? (
                              <Button
                                mode="icon"
                                variant="secondary"
                                appearance="link"
                                aria-label={t('scenarios:edit_sanction.insert_operand')}
                                onClick={() =>
                                  updateConcat(concatIndex, {
                                    ...concat,
                                    children: splice(concat.children, operandIndex + 1, 0, [NewUndefinedAstNode()]),
                                  })
                                }
                              >
                                <Icon icon="link" className="size-4" />
                              </Button>
                            ) : null}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {dropProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </Fragment>
        ))}
      </div>
    </DragDropContext>
  );
}
