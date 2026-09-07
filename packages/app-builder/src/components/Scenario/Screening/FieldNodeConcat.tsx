import { type AstNode, isUndefinedAstNode, NewUndefinedAstNode } from '@app-builder/models';
import { isKnownOperandAstNode, type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { type ListAstNode, NewListAstNode } from '@app-builder/models/astNode/list';
import { NewStringConcatAstNode, type StringConcatAstNode } from '@app-builder/models/astNode/strings';
import { replace } from 'radash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { splice } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchOperand } from './MatchOperand';

type MultiReferenceAstNode = ListAstNode | StringConcatAstNode;

function nodeFromNodes(nodes: KnownOperandAstNode[], output: 'List' | 'StringConcat'): AstNode | null {
  const finalNodes = nodes.filter((n) => !isUndefinedAstNode(n));
  if (finalNodes.length === 0) return null;
  return output === 'List' ? NewListAstNode(finalNodes) : NewStringConcatAstNode(finalNodes, { withSeparator: true });
}

function FieldNodeReferences({
  value,
  output,
  limit,
  onBlur,
  onChange,
  viewOnly,
  placeholder,
  withDate,
}: {
  value?: MultiReferenceAstNode;
  output: 'List' | 'StringConcat';
  limit?: number;
  placeholder?: string;
  onChange?: (node: AstNode | null) => void;
  onBlur?: () => void;
  viewOnly?: boolean;
  withDate?: boolean;
}) {
  const { t } = useTranslation(['scenarios']);
  const [nodes, setNodes] = useState<KnownOperandAstNode[]>(() =>
    value?.children?.length ? value.children : [NewUndefinedAstNode()],
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const emitFromNodes = (nextNodes: KnownOperandAstNode[]) => {
    onChangeRef.current?.(nodeFromNodes(nextNodes, output));
  };

  const applyNodes = (nextNodes: KnownOperandAstNode[]) => {
    setNodes(nextNodes);
    emitFromNodes(nextNodes);
  };

  useEffect(() => {
    setNodes((prev) => {
      const filled = prev.filter((node) => !isUndefinedAstNode(node));

      if (value?.children?.length) {
        // `concatFromNodes` strips placeholders before emitting, so the parent echoes
        // back only the filled nodes. When that echo matches what we already hold
        // (same filled nodes, by id), keep local placeholders intact instead of
        // collapsing them. Only reconcile when the parent truly changed the data.
        const isOwnEcho =
          value.children.length === filled.length &&
          value.children.every((child, index) => child.id === filled[index]?.id);
        return isOwnEcho ? prev : value.children;
      }

      // Parent cleared the value: reset to a single placeholder only if we held content.
      return filled.length === 0 ? prev : [NewUndefinedAstNode()];
    });
  }, [value]);

  return (
    <div onBlur={onBlur} className="flex flex-col gap-sm">
      {nodes.map((node, index) => (
        <div key={node.id} className="flex items-center gap-2xs">
          {!viewOnly ? (
            <div className="flex flex-row">
              <Button
                mode="icon"
                variant="secondary"
                appearance="link"
                aria-label={t('scenarios:edit_sanction.remove_operand')}
                onClick={() => applyNodes(nodes.length === 1 ? [NewUndefinedAstNode()] : splice(nodes, index, 1, []))}
              >
                <Icon icon="cross" className="size-4" />
              </Button>
              {!limit || nodes.length < limit ? (
                <Button
                  mode="icon"
                  variant="secondary"
                  appearance="link"
                  aria-label={t('scenarios:edit_sanction.insert_operand')}
                  disabled={nodes.length === limit}
                  onClick={() =>
                    applyNodes(
                      splice(nodes, index, 1, [{ ...nodes[index]!, id: nodes[index]!.id }, NewUndefinedAstNode()]),
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
                applyNodes(replace(nodes, { ...savedNode, id: node.id }, (_, i) => i === index));
              }
            }}
            withDate={withDate}
          />
        </div>
      ))}
    </div>
  );
}

type FieldNodeReferencesProps = Omit<Parameters<typeof FieldNodeReferences>[0], 'output' | 'value'>;

export function FieldNodeConcat(props: FieldNodeReferencesProps & { value?: StringConcatAstNode }) {
  return <FieldNodeReferences {...props} value={props.value} output="StringConcat" />;
}

export function FieldNodeList(props: FieldNodeReferencesProps & { value?: ListAstNode }) {
  return <FieldNodeReferences {...props} value={props.value} output="List" />;
}
