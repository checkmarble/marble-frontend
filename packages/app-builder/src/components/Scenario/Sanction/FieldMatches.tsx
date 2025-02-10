import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  useGetAstNodeOperandProps,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import { nanoid } from 'nanoid';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { entries, omit, values } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { Operand } from '../AstBuilder/AstBuilderNode/Operand';

const MatchOperand = ({
  node,
  onSave,
  placeholder,
}: {
  node: AstNode;
  onSave?: (astNode: AstNode) => void;
  placeholder?: string;
}) => {
  const getOperandAstNodeOperandProps = useGetAstNodeOperandProps();
  const options = useOperandOptions();

  return (
    <Operand
      {...getOperandAstNodeOperandProps(node)}
      placeholder={placeholder}
      options={options.filter((o) => o.dataType === 'String')}
      validationStatus="valid"
      onSave={onSave}
    />
  );
};

export function FieldMatches({
  name,
  value,
  limit,
  onBlur,
  onChange,
  placeholder,
}: {
  value: AstNode[];
  limit?: number;
  placeholder?: string;
  name?: string;
  onChange?: (nodes: AstNode[]) => void;
  onBlur?: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const [nodes, setNodes] = useState<Record<string, AstNode>>(
    value.reduce(
      (acc, node) => {
        acc[nanoid()] = node;
        return acc;
      },
      {} as Record<string, AstNode>,
    ),
  );

  const matches = useMemo(() => entries(nodes), [nodes]);

  // Thx React... https://github.com/facebook/react/issues/27283
  useEffect(() => {
    if (ref.current) {
      ref.current.onchange = (e) => {
        onChange?.(
          JSON.parse(
            (e as unknown as ChangeEvent<HTMLInputElement>).currentTarget
              ?.value,
          ),
        );
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.value = JSON.stringify(values(nodes));
      ref.current?.dispatchEvent(new Event('change'));
    }
  }, [nodes]);

  return (
    <div className="flex flex-wrap gap-2">
      <input
        name={name}
        ref={ref}
        defaultValue={JSON.stringify(value)}
        className="sr-only"
        tabIndex={-1}
        onBlur={onBlur}
      />
      {matches.map(([id, match], i) => (
        <div key={id} className="flex gap-2">
          <MatchOperand
            node={match}
            placeholder={placeholder}
            onSave={(node) => {
              setNodes((nodes) =>
                node.name === 'Undefined' && matches.length > 1
                  ? omit(nodes, [id])
                  : { ...nodes, [id]: node },
              );
            }}
          />
          {match.name === 'Undefined' || (limit && i === limit - 1) ? null : (
            <Button
              variant="secondary"
              onClick={() =>
                setNodes((nodes) => ({
                  ...nodes,
                  [nanoid()]: NewUndefinedAstNode(),
                }))
              }
            >
              <Icon icon="plus" className="size-5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
