import { useFieldName } from '@app-builder/components/Form/FormField';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  useGetAstNodeOperandProps,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import {
  type FieldMetadata,
  useField,
  useInputControl,
} from '@conform-to/react';
import { nanoid } from 'nanoid';
import { useEffect, useMemo, useState } from 'react';
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
  limit,
  placeholder,
}: {
  limit?: number;
  placeholder?: string;
}) {
  const { name } = useFieldName();
  const [meta] = useField<AstNode[]>(name);
  const controls = useInputControl(meta as unknown as FieldMetadata<string[]>);

  const [nodes, setNodes] = useState<Record<string, AstNode>>(
    (meta.initialValue as AstNode[]).reduce(
      (acc, node) => {
        acc[nanoid()] = node;
        return acc;
      },
      {} as Record<string, AstNode>,
    ),
  );

  const matches = useMemo(() => entries(nodes), [nodes]);

  useEffect(() => {
    controls.change(JSON.stringify(values(nodes)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  return (
    <div className="flex flex-wrap gap-2">
      <input
        name={meta.name}
        className="sr-only"
        tabIndex={-1}
        onFocus={controls.focus}
        onBlur={controls.blur}
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
              controls.blur();
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
