import { scenarioI18n } from '@app-builder/components';
import { type LabelledAst } from '@app-builder/models';
import { coerceToConstantsLabelledAst } from '@app-builder/services/editor';
import { matchSorter } from 'match-sorter';
import { useTranslation } from 'react-i18next';

import { Count, Group, GroupHeader, Label } from './Group';
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

  const availableOptions = matchSorter(options, searchText, {
    keys: ['name'],
  });

  return (
    <>
      <Group>
        {constantOptions.map((constant) => (
          <ConstantOption
            key={constant.name}
            constant={constant}
            onSelect={() => {
              onSelect(constant);
            }}
          />
        ))}
      </Group>
      <Group>
        <GroupHeader.Container>
          <GroupHeader.Title>
            <Label className="text-grey-100 text-m font-semibold">
              {t('scenarios:edit_operand.result', {
                count: availableOptions.length,
              })}
            </Label>
            <Count>{availableOptions.length}</Count>
          </GroupHeader.Title>
        </GroupHeader.Container>
        {availableOptions.map((option) => (
          <OperandOption
            key={option.name}
            searchText={searchText}
            option={option}
            onSelect={() => {
              onSelect(option);
            }}
          />
        ))}
      </Group>
    </>
  );
}
