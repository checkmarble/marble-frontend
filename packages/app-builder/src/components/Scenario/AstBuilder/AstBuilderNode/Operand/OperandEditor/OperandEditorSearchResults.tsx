import { scenarioI18n } from '@app-builder/components';
import { type LabelledAst } from '@app-builder/models';
import { coerceToConstantsLabelledAst } from '@app-builder/services/editor';
import { matchSorter } from 'match-sorter';
import { useTranslation } from 'react-i18next';
import { MenuGroup, MenuGroupLabel } from 'ui-design-system';

import { ConstantOption, OperandOption } from './OperandMenuItem';

interface OperandEditorSearchResultsProps {
  searchText: string;
  options: LabelledAst[];
  onSelect: (option: LabelledAst) => void;
}

export function OperandEditorSearchResults({
  options,
  searchText,
  onSelect,
}: OperandEditorSearchResultsProps) {
  const { t } = useTranslation(scenarioI18n);

  const constantOptions = coerceToConstantsLabelledAst(searchText, {
    booleans: { true: [t('common:true')], false: [t('common:false')] },
  });

  const matchOptions = matchSorter(options, searchText, {
    keys: ['name'],
  });

  return (
    <>
      {constantOptions.length > 0 ? (
        <MenuGroup className="flex w-full flex-col gap-1">
          <MenuGroupLabel className="sr-only">Constants</MenuGroupLabel>
          {constantOptions.map((constant) => (
            <ConstantOption
              key={constant.name}
              constant={constant}
              onSelect={() => {
                onSelect(constant);
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
            key={option.name}
            searchText={searchText}
            option={option}
            onSelect={() => {
              onSelect(option);
            }}
          />
        ))}
      </MenuGroup>
    </>
  );
}
