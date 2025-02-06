import { useFieldName } from '@app-builder/components/Form/FormField';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  useGetAstNodeOperandProps,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import {
  unstable_useControl,
  useField,
  useInputControl,
} from '@conform-to/react';
import { nanoid } from 'nanoid';
import { useEffect, useMemo, useRef, useState } from 'react';
import { entries, omit, values } from 'remeda';
import { Button, HiddenInputs } from 'ui-design-system';
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
  initialValue,
  onChange = () => ({}),
  limit,
  placeholder,
}: {
  initialValue: AstNode[];
  onChange?: (nodes: AstNode[]) => void;
  limit?: number;
  placeholder?: string;
}) {
  // const inputRef = useRef<HTMLInputElement>(null);
  // const { name } = useFieldName();
  // const [meta] = useField<string[]>(name);
  // const controls = unstable_useControl(meta);

  const [nodes, setNodes] = useState<Record<string, AstNode>>(
    (initialValue ?? [NewUndefinedAstNode()]).reduce(
      (acc, node) => {
        acc[nanoid()] = node;
        return acc;
      },
      {} as Record<string, AstNode>,
    ),
  );

  const matches = useMemo(() => entries(nodes), [nodes]);

  useEffect(() => {
    onChange(values(nodes));
  }, [nodes, onChange]);

  return (
    <div className="flex flex-wrap gap-2">
      {/* <input
        className="sr-only"
        defaultValue={meta.initialValue as string}
        tabIndex={-1}
        onFocus={() => inputRef.current?.focus()}
      /> */}
      {matches.map(([id, match], i) => (
        <div key={id} className="flex gap-2">
          <MatchOperand
            node={match}
            placeholder={placeholder}
            onSave={(node) =>
              setNodes((nodes) =>
                node.name === 'Undefined' && matches.length > 1
                  ? omit(nodes, [id])
                  : { ...nodes, [id]: node },
              )
            }
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
