import { scenarioI18n } from '@app-builder/components';
import { type DataType, type LabelledAst } from '@app-builder/models';
import { useTranslation } from 'react-i18next';
import { MenuGroup, MenuGroupLabel } from 'ui-design-system';

import { ConstantOption, OperandOption } from './OperandMenuItem';

interface OperandEditorSearchResultsProps {
  constantOptions: {
    id: string;
    dataType: DataType;
    label: React.ReactNode;
    onSelect: () => void;
  }[];
  matchOptions: {
    id: string;
    label: React.ReactNode;
    dataType: DataType;
    option: LabelledAst;
    onSelect: () => void;
  }[];
}

export function OperandEditorSearchResults({
  constantOptions,
  matchOptions,
}: OperandEditorSearchResultsProps) {
  const { t } = useTranslation(scenarioI18n);

  return (
    <>
      {constantOptions.length > 0 ? (
        <MenuGroup className="flex w-full flex-col gap-1">
          <MenuGroupLabel className="sr-only">Constants</MenuGroupLabel>
          {constantOptions.map((constant) => (
            <ConstantOption
              key={constant.id}
              dataType={constant.dataType}
              label={constant.label}
              onSelect={constant.onSelect}
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
            key={option.id}
            dataType={option.dataType}
            label={option.label}
            option={option.option}
            onSelect={option.onSelect}
          />
        ))}
      </MenuGroup>
    </>
  );
}
