import { scenarioI18n } from '@app-builder/components';
import { useTranslation } from 'react-i18next';
import { MenuGroup, MenuGroupLabel } from 'ui-design-system';

import {
  useCoercedConstantOptions,
  useMatchOptions,
  useOperandEditorActions,
  useSearchValue,
} from './OperandEditorProvider';
import { CoercedConstantOption, OperandOption } from './OperandMenuItem';

export function OperandEditorSearchResults() {
  const { t } = useTranslation(scenarioI18n);
  const searchValue = useSearchValue();
  const constantOptions = useCoercedConstantOptions();
  const matchOptions = useMatchOptions();
  const { onOptionClick } = useOperandEditorActions();

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
                onOptionClick(constant.astNode);
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
              onOptionClick(option.astNode);
            }}
          />
        ))}
      </MenuGroup>
    </>
  );
}
