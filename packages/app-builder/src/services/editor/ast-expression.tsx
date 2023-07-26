import { type AstNode, isAstNodeEmpty } from '@app-builder/models';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

function useWatchAstNode<
  TName extends `${string}.children.${number}` | `${string}.name`
>(
  name: TName
): TName extends `${string}.name`
  ? AstNode['name']
  : AstNode['children'][number] {
  return useWatch({ name });
}

function isAstNodeFieldEmpty(field: ReturnType<typeof useWatchAstNode>) {
  if (field === null) return true;

  if (typeof field === 'string') return !field;

  return isAstNodeEmpty(field);
}

/**
 * Used to determine if the field has been edited once.
 * It is initialized with the value of the field and should be updated when the field is edited.
 */
export function useIsEditedOnce(
  name: `${string}.children.${number}` | `${string}.name`
) {
  const field = useWatchAstNode(name);
  const [isEditedOnce, setIsEditedOnce] = useState(!isAstNodeFieldEmpty(field));
  useEffect(() => {
    if (!isEditedOnce && !isAstNodeFieldEmpty(field)) {
      setIsEditedOnce(true);
    }
  }, [field, isEditedOnce]);
  return isEditedOnce;
}
