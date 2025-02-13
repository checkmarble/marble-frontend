import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { nanoid } from 'nanoid';
import { useEffect, useMemo, useState } from 'react';
import { entries, omit, values } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchOperand } from './MatchOperand';

export function FieldNodeConcat({
  value,
  limit,
  onBlur,
  onChange,
  placeholder,
}: {
  value?: AstNode;
  limit?: number;
  placeholder?: string;
  onChange?: (nodes: AstNode) => void;
  onBlur?: () => void;
}) {
  const [nodes, setNodes] = useState<Record<string, AstNode>>(
    (value?.children?.length ? value.children : []).reduce(
      (acc, node) => {
        acc[nanoid()] = node;
        return acc;
      },
      {} as Record<string, AstNode>,
    ),
  );

  const matches = useMemo(() => entries(nodes), [nodes]);

  const defaultMatches: [string, AstNode][] = [['', NewUndefinedAstNode()]];

  useEffect(() => {
    if (matches.length !== 0) {
      onChange?.({
        name: 'StringConcat',
        children: values(nodes),
        namedChildren: {
          withSeparator: { constant: true, namedChildren: {}, children: [] },
        },
      });
    }
  }, [nodes, matches.length, onChange]);

  return (
    <div onBlur={onBlur} className="flex flex-wrap gap-2">
      {(matches.length === 0 ? defaultMatches : matches).map(
        ([id, match], i) => (
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
        ),
      )}
    </div>
  );
}
