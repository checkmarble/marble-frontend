import { isUndefinedAstNode, type LabelledAst } from '@app-builder/models';
import { Tip } from '@ui-icons';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getDataTypeIcon,
  getDataTypeTKey,
  getOperatorTypeIcon,
  getOperatorTypeTKey,
} from './OperandEditor/OperandOption/Option';
import { OperandTooltip } from './OperandTooltip';

export const selectBorderColor = ['grey', 'green', 'red'] as const;

interface OperandViewerProps
  extends Omit<React.ComponentProps<'button'>, 'children'> {
  borderColor?: (typeof selectBorderColor)[number];
  operandLabelledAst: LabelledAst;
}

export const OperandViewer = forwardRef<HTMLButtonElement, OperandViewerProps>(
  ({ borderColor = 'grey', operandLabelledAst, ...props }, ref) => {
    const { t } = useTranslation('scenarios');

    const typeInfos = [
      {
        Icon: getOperatorTypeIcon(operandLabelledAst.operandType),
        tKey: getOperatorTypeTKey(operandLabelledAst.operandType),
      },
      {
        Icon: getDataTypeIcon(operandLabelledAst.dataType),
        tKey: getDataTypeTKey(operandLabelledAst.dataType),
      },
    ];

    return (
      <button
        ref={ref}
        data-border-color={borderColor}
        className={clsx(
          'group',
          'bg-grey-00 h-fit min-h-[40px] w-fit min-w-[40px] rounded border px-2 outline-none',
          'disabled:bg-grey-02 disabled:border-grey-02',
          'radix-state-open:border-purple-100 radix-state-open:bg-purple-05',
          // Border color variants
          'enabled:radix-state-closed:data-[border-color=grey]:border-grey-10 enabled:radix-state-closed:data-[border-color=grey]:focus:border-purple-100',
          'enabled:radix-state-closed:data-[border-color=red]:border-red-100 enabled:radix-state-closed:data-[border-color=red]:focus:border-purple-100',
          'enabled:radix-state-closed:data-[border-color=green]:border-green-100 enabled:radix-state-closed:data-[border-color=green]:focus:border-purple-100'
        )}
        {...props}
      >
        {operandLabelledAst.name ? (
          <div className="text-s text-grey-100 group-radix-state-open:text-purple-100 flex flex-row items-center justify-between gap-2 font-normal transition-colors">
            <TypeInfos typeInfos={typeInfos} />
            {operandLabelledAst.name}
            <OperandTooltip
              operand={{
                name: operandLabelledAst.name,
                operandType: operandLabelledAst.operandType,
                dataType: operandLabelledAst.dataType,
                description: operandLabelledAst.description,
              }}
              sideOffset={16}
              alignOffset={-16}
            >
              <Tip className="shrink-0 text-[21px] text-transparent transition-colors group-hover:text-purple-50 group-hover:hover:text-purple-100" />
            </OperandTooltip>
          </div>
        ) : (
          <span className="text-s text-grey-25 group-radix-state-open:text-purple-100 font-medium transition-colors">
            {t('edit_operand.placeholder')}
          </span>
        )}
      </button>
    );
  }
);
OperandViewer.displayName = 'OperandViewer';

function TypeInfos({
  typeInfos,
}: {
  typeInfos: {
    Icon: ReturnType<typeof getDataTypeIcon>;
    tKey: ReturnType<typeof getDataTypeTKey>;
  }[];
}) {
  const { t } = useTranslation('scenarios');

  if (typeInfos.filter(({ Icon }) => !!Icon).length === 0) return null;

  return (
    <div className="flex flex-row gap-1">
      {typeInfos.map(({ Icon, tKey }) => {
        if (!Icon) return null;
        return (
          <div
            key={tKey}
            className="bg-grey-02 group-radix-state-open:bg-purple-10 flex items-center justify-center rounded-sm p-1"
          >
            <Icon width="16px" height="16px" aria-label={tKey && t(tKey)} />
          </div>
        );
      })}
    </div>
  );
}
