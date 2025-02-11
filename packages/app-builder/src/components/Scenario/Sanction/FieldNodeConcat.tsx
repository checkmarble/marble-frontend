import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { nanoid } from 'nanoid';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { entries, omit, values } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchOperand } from './MatchOperand';

export function FieldMatches({
  name,
  value,
  limit,
  onBlur,
  onChange,
  placeholder,
}: {
  value?: AstNode;
  limit?: number;
  placeholder?: string;
  name?: string;
  onChange?: (nodes: AstNode[]) => void;
  onBlur?: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

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
    if (ref.current && matches.length !== 0) {
      ref.current.value = JSON.stringify({
        name: 'StringConcat',
        children: values(nodes),
      });
      ref.current?.dispatchEvent(new Event('change'));
    }
  }, [nodes, matches.length]);

  return (
    <div className="flex flex-wrap gap-2">
      <input
        name={name}
        ref={ref}
        defaultValue={value ? JSON.stringify(value) : undefined}
        className="sr-only"
        tabIndex={-1}
        onBlur={onBlur}
      />
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
