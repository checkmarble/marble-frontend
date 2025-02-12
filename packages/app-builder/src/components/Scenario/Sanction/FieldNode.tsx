import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { type ChangeEvent, useEffect, useRef } from 'react';

import { MatchOperand } from './MatchOperand';

export const FieldNode = ({
  name,
  value,
  placeholder,
  onChange,
  onBlur,
}: {
  value?: AstNode;
  name?: string;
  onChange?: (value: AstNode) => void;
  onBlur?: () => void;
  placeholder?: string;
}) => {
  const ref = useRef<HTMLInputElement>(null);

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

  return (
    <>
      <input
        name={name}
        ref={ref}
        defaultValue={JSON.stringify(value)}
        className="sr-only"
        tabIndex={-1}
        onBlur={onBlur}
      />
      <MatchOperand
        node={value ?? NewUndefinedAstNode()}
        placeholder={placeholder}
        onSave={(node) => {
          if (ref.current) {
            ref.current.value = JSON.stringify(node);
            ref.current?.dispatchEvent(new Event('change'));
          }
        }}
      />
    </>
  );
};
