import { scenarioI18n } from '@app-builder/components';
import {
  type AstNode,
  type ConstantAstNode,
  type DataType,
} from '@app-builder/models';
import { type OperandType } from '@app-builder/models/operand-type';
import { useTranslation } from 'react-i18next';
import { MenuGroup, MenuGroupLabel } from 'ui-design-system';

import { CoercedConstantOption, OperandOption } from './OperandMenuItem';

interface OperandEditorSearchResultsProps {
  constantOptions: {
    astNode: ConstantAstNode;
    displayName: string;
    dataType: DataType;
  }[];
  matchOptions: {
    astNode: AstNode;
    displayName: string;
    dataType: DataType;
    operandType: OperandType;
  }[];
  searchValue: string;
  onClick: (option: AstNode) => void;
}

export function OperandEditorSearchResults({
  constantOptions,
  matchOptions,
  searchValue,
  onClick,
}: OperandEditorSearchResultsProps) {
  const { t } = useTranslation(scenarioI18n);

  return (
    <>
      {constantOptions.length > 0 ? (
        <MenuGroup className="flex w-full flex-col gap-1">
          <MenuGroupLabel className="sr-only">Constants</MenuGroupLabel>
          {constantOptions.map((constant) => (
            <CoercedConstantOption
              key={constant.displayName}
              displayName={constant.displayName}
              dataType={constant.dataType}
              onClick={() => {
                onClick(constant.astNode);
              }}
            />
          ))}
        </MenuGroup>
      ) : null}
      <MenuGroup className="flex w-full flex-col gap-1">
        <div className="flex min-h-10 select-none flex-row items-center gap-1 p-2">
          <span className="flex w-full items-baseline gap-1">
            <MenuGroupLabel className="text-grey-100 text-m flex items-baseline whitespace-pre font-semibold">
              {t('scenarios:edit_operand.result', {
                count: matchOptions.length,
              })}
            </MenuGroupLabel>
            <span className="text-grey-25 text-xs font-medium">
              {matchOptions.length}
            </span>
          </span>
        </div>
        {matchOptions.map((option) => (
          <OperandOption
            key={option.displayName}
            searchValue={searchValue}
            astNode={option.astNode}
            dataType={option.dataType}
            operandType={option.operandType}
            displayName={option.displayName}
            onClick={() => {
              onClick(option.astNode);
            }}
          />
        ))}
      </MenuGroup>
    </>
  );
}
