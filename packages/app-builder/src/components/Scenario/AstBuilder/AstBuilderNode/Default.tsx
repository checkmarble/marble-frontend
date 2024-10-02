import { type AstNode } from '@app-builder/models';
import { useCustomLists } from '@app-builder/services/ast-node/options';
import { getAstNodeDisplayName } from '@app-builder/services/editor/getAstNodeDisplayName';
import { cva, type VariantProps } from 'class-variance-authority';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const defaultClassnames = cva(
  'bg-grey-02 flex size-fit min-h-[40px] min-w-[40px] items-center justify-between rounded px-2 outline-none',
  {
    variants: {
      validationStatus: {
        valid: 'border border-grey-02',
        error: 'border border-red-100',
        'light-error': 'border border-red-25',
      },
    },
    defaultVariants: {
      validationStatus: 'valid',
    },
  },
);

interface DefaultProps extends VariantProps<typeof defaultClassnames> {
  astNode: AstNode;
}

export function Default({ astNode, validationStatus }: DefaultProps) {
  const { t } = useTranslation(['common', 'scenarios']);

  const customLists = useCustomLists();

  const displayName = useMemo(() => {
    return getAstNodeDisplayName(astNode, {
      t,
      customLists: customLists,
    });
  }, [astNode, t, customLists]);

  return (
    <div className={defaultClassnames({ validationStatus })}>{displayName}</div>
  );
}
